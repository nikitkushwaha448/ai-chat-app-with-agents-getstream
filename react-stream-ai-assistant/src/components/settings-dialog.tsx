import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Volume2, VolumeX, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("sound-enabled") !== "false";
  });
  const [aiModel, setAiModel] = useState(() => {
    return localStorage.getItem("ai-model") || "gpt-4";
  });
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    return localStorage.getItem("animations-enabled") !== "false";
  });
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem("font-size") || "16");
  });

  useEffect(() => {
    localStorage.setItem("sound-enabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("ai-model", aiModel);
  }, [aiModel]);

  useEffect(() => {
    localStorage.setItem("animations-enabled", animationsEnabled.toString());
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem("font-size", fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const handleReset = () => {
    setTheme("system");
    setSoundEnabled(true);
    setAiModel("gpt-4");
    setAnimationsEnabled(true);
    setFontSize(16);
    localStorage.clear();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your AI chat experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Settings */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Appearance</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Theme</span>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Font Size</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-12">
                {fontSize}px
              </span>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={20}
                step={1}
                className="flex-1"
              />
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">AI Model</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Model</span>
              </div>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Notifications</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Sound effects</span>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </div>

          {/* Animations */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Performance</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Animations</span>
              </div>
              <Switch
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset to Default
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
