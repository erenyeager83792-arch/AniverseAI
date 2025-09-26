import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, History, Settings, MessageSquare } from "lucide-react";
import aniverseLogoPath from "@assets/file_00000000b8ac61f5b513d34bcf737fce_1755966573663.png";

interface NavbarProps {
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
}

export function Navbar({ onHistoryClick, onSettingsClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 glass-surface border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-r from-anime-orange to-anime-red p-0.5">
              <div className="w-full h-full bg-dark-bg rounded-md flex items-center justify-center">
                <img 
                  src={aniverseLogoPath} 
                  alt="AniVerse AI Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold bg-gradient-to-r from-anime-orange to-anime-red bg-clip-text text-transparent">
                AniVerse AI
              </h1>
              <p className="text-xs text-gray-400 font-mono">Manga & Anime Intelligence</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHistoryClick}
              className="text-gray-300 hover:text-white hover:bg-dark-surface transition-colors duration-200 flex items-center space-x-2"
              data-testid="button-history"
            >
              <History className="w-4 h-4" />
              <span className="text-sm">History</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="text-gray-300 hover:text-white hover:bg-dark-surface transition-colors duration-200 flex items-center space-x-2"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden text-gray-300 hover:text-white"
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-dark-surface border-dark-border">
              <div className="flex flex-col space-y-4 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onHistoryClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white justify-start"
                  data-testid="button-mobile-history"
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onSettingsClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white justify-start"
                  data-testid="button-mobile-settings"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
