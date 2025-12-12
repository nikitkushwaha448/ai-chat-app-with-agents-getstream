import { sha256 } from "js-sha256";
import { Bot } from "lucide-react";
import React, { useState } from "react";
import { User } from "stream-chat";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginProps {
  onLogin: (user: User) => void;
}

// Function to create a deterministic user ID from username using SHA-256
const createUserIdFromUsername = (username: string): string => {
  // Use SHA-256 hash for secure, deterministic ID generation
  const hash = sha256(username.toLowerCase().trim());

  // Take first 12 characters and add prefix for readability
  return `user_${hash.substring(0, 12)}`;
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const user = {
        id: createUserIdFromUsername(username.trim().toLowerCase()),
        name: username.trim(),
      };
      onLogin(user);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 dark:bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <Card className="relative w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="relative mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground px-4">
              Your AI-powered writing assistant is ready to help you create amazing content
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-base border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                autoFocus
              />
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="px-6 pb-8">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            disabled={!username.trim()}
          >
            Start Chatting
          </Button>
        </CardFooter>

        {/* Decorative footer */}
        <div className="text-center pb-6 px-6">
          <p className="text-xs text-muted-foreground">
            Powered by OpenAI & Stream Chat
          </p>
        </div>
      </Card>
    </div>
  );
};
