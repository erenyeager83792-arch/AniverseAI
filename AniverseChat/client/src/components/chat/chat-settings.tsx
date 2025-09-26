import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Download, Github, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ChatSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatSettings({ open, onOpenChange }: ChatSettingsProps) {
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [language, setLanguage] = useState("english");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('aniverse-language') || 'english';
    setLanguage(savedLanguage);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('aniverse-language', newLanguage);
    
    // Show confirmation toast based on selected language
    const messages = {
      english: "Language changed to English",
      japanese: "言語が日本語に変更されました",
      spanish: "Idioma cambiado a Español",
      french: "Langue changée en Français"
    };
    
    toast({
      title: messages[newLanguage as keyof typeof messages] || messages.english,
      duration: 2000,
    });
  };

  const installPWA = async () => {
    if (deferredPrompt) {
      // Show the PWA install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "AniVerse AI installed successfully!",
          description: "You can now access the app from your home screen.",
          duration: 3000,
        });
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions for different browsers
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = "";
      
      if (userAgent.includes('chrome') || userAgent.includes('edge')) {
        instructions = "Click the install icon (⬇️) in your browser's address bar to install AniVerse AI as an app.";
      } else if (userAgent.includes('safari')) {
        instructions = "Tap the Share button and select 'Add to Home Screen' to install AniVerse AI.";
      } else if (userAgent.includes('firefox')) {
        instructions = "Look for the 'Install' option in your browser menu to add AniVerse AI to your device.";
      } else {
        instructions = "Your browser supports app installation. Look for an install option in your browser menu.";
      }
      
      toast({
        title: "Install AniVerse AI",
        description: instructions,
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-surface border border-dark-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-anime-orange" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-sm font-medium">
              Enable Notifications
            </Label>
            <Switch
              id="notifications"
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
              data-testid="switch-notifications"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Language</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="bg-dark-muted border-dark-border" data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-surface border-dark-border">
                <SelectItem value="english">🇺🇸 English</SelectItem>
                <SelectItem value="japanese">🇯🇵 日本語</SelectItem>
                <SelectItem value="spanish">🇪🇸 Español</SelectItem>
                <SelectItem value="french">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Install PWA */}
          <div className="pt-4 border-t border-dark-border">
            <Button
              onClick={installPWA}
              variant="outline"
              className="w-full border-anime-orange text-anime-orange hover:bg-anime-orange hover:text-white transition-colors"
              data-testid="button-install-pwa"
            >
              <Download className="w-4 h-4 mr-2" />
              {deferredPrompt ? "Install as App" : "Add to Home Screen"}
            </Button>
          </div>

          {/* About */}
          <div className="pt-4 border-t border-dark-border space-y-3">
            <h3 className="text-sm font-medium">About AniVerse AI</h3>
            <p className="text-xs text-gray-400">
              Your intelligent companion for everything Manga & Anime. Powered by advanced AI technology.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
                onClick={() => window.open('https://github.com', '_blank')}
                data-testid="button-github"
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
                onClick={() => window.open('https://aniverse-ai.replit.app', '_blank')}
                data-testid="button-website"
              >
                <Globe className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Copyright */}
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500">© Yeagerist</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}