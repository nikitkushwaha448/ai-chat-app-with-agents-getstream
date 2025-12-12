import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Channel, DefaultGenerics, Event, StreamChat } from "stream-chat";
import type { AIAgent } from "../types";

export class GeminiAgent implements AIAgent {
  private genAI?: GoogleGenerativeAI;
  private model?: any;
  private chat?: any;
  private lastInteractionTs = Date.now();

  constructor(
    readonly chatClient: StreamChat,
    readonly channel: Channel
  ) {}

  dispose = async () => {
    this.chatClient.off("message.new", this.handleMessage);
    await this.chatClient.disconnectUser();
  };

  get user() {
    return this.chatClient.user;
  }

  getLastInteraction = (): number => this.lastInteractionTs;

  init = async () => {
    const apiKey = process.env.GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-pro"
      });

      this.chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: this.getWritingAssistantPrompt() }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I'm ready to assist you with writing tasks. How can I help you today?" }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      this.chatClient.on("message.new", this.handleMessage);
    } catch (error: any) {
      console.error("Failed to initialize Gemini agent:", error);
      
      if (error?.status === 429) {
        throw new Error("Gemini API quota exceeded. Please check your API usage.");
      } else if (error?.status === 401 || error?.status === 403) {
        throw new Error("Invalid Gemini API key. Please verify your API key configuration.");
      }
      
      throw error;
    }
  };

  private getWritingAssistantPrompt = (): string => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    return `You are an expert AI Writing Assistant. Your primary purpose is to be a collaborative writing partner.

**Your Core Capabilities:**
- Content Creation, Improvement, Style Adaptation, Brainstorming, and Writing Coaching.
- **Current Date**: Today's date is ${currentDate}. Use this for time-sensitive queries.

**Response Format:**
- Be direct and production-ready.
- Use clear formatting with markdown.
- Never begin responses with phrases like "Here's the edit:", "Here are the changes:", or similar introductory statements.
- Provide responses directly and professionally without unnecessary preambles.

**Guidelines:**
- Help users create high-quality written content
- Adapt your writing style to match the user's needs
- Provide constructive feedback and suggestions
- Be helpful, creative, and accurate

Your goal is to provide accurate, helpful written content and be an excellent writing companion.`;
  };

  private handleMessage = async (e: Event<DefaultGenerics>) => {
    if (!this.chat || !this.model) {
      console.log("Gemini not initialized");
      return;
    }

    if (!e.message || e.message.ai_generated) {
      return;
    }

    const message = e.message.text;
    if (!message) return;

    this.lastInteractionTs = Date.now();

    try {
      // Send initial empty message
      const { message: channelMessage } = await this.channel.sendMessage({
        text: "",
        ai_generated: true,
      });

      // Send thinking indicator
      await this.channel.sendEvent({
        type: "ai_indicator.update",
        ai_state: "AI_STATE_THINKING",
        cid: channelMessage.cid,
        message_id: channelMessage.id,
      });

      // Get response from Gemini
      const result = await this.chat.sendMessageStream(message);
      
      let fullText = "";
      
      // Stream the response
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Update message with accumulated text using the client's updateMessage method
        await this.chatClient.updateMessage({
          id: channelMessage.id,
          text: fullText,
          ai_generated: true,
        });
      }

      // Send completion indicator
      await this.channel.sendEvent({
        type: "ai_indicator.clear",
        cid: channelMessage.cid,
        message_id: channelMessage.id,
      });

    } catch (error: any) {
      console.error("Error processing message:", error);
      
      let errorMessage = "I apologize, but I encountered an error while processing your request.";
      
      if (error?.status === 429) {
        errorMessage = "⚠️ **Gemini API Quota Exceeded**\n\n" +
          "The Gemini API has exceeded its usage quota. Please:\n" +
          "1. Check your Google Cloud account at https://console.cloud.google.com/\n" +
          "2. Verify your API key has sufficient quota\n" +
          "3. Consider upgrading your plan if needed";
      } else if (error?.status === 401 || error?.status === 403) {
        errorMessage = "⚠️ **Authentication Error**\n\n" +
          "The Gemini API key appears to be invalid or expired. Please check your API key configuration.";
      } else if (error?.status === 500 || error?.status === 503) {
        errorMessage = "⚠️ **Service Unavailable**\n\n" +
          "The Gemini service is temporarily unavailable. Please try again in a few moments.";
      }

      await this.channel.sendMessage({
        text: errorMessage,
        ai_generated: true,
      });
    }
  };
}
