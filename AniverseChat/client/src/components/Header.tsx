import { Button } from "@/components/ui/button";
import { Clock, Settings, RotateCcw } from "lucide-react";
import animeAvatar from "@assets/a3922c432494e8836b1e11e9722c7115_1756026201520.jpg";
import aniVerseLogo from "@assets/file_00000000b8ac61f5b513d34bcf737fce_1756026201376.png";

interface HeaderProps {
  onHistoryClick: () => void;
  onSettingsClick: () => void;
}

export function Header({ onHistoryClick, onSettingsClick }: HeaderProps) {
  const handleNewSession = () => {
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-dark-surface/80 border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src={aniVerseLogo} alt="AniVerse AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">AniVerse AI</h1>
              <p className="text-xs text-gray-400">Manga & Anime Intelligence</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            
            <Button
              variant="outline"
              size="sm"
              onClick={onHistoryClick}
              className="hidden sm:flex items-center space-x-2 bg-dark-surface hover:bg-dark-border border-dark-border text-gray-300 hover:text-white"
              data-testid="button-history"
            >
              <Clock className="w-4 h-4" />
              <span>History</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSettingsClick}
              className="hidden sm:flex items-center space-x-2 bg-dark-surface hover:bg-dark-border border-dark-border text-gray-300 hover:text-white"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              className="flex items-center space-x-2 bg-dark-surface hover:bg-dark-border border-dark-border text-gray-300 hover:text-white"
              data-testid="button-new-session"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New Session</span>
            </Button>

            {/* Mobile menu buttons */}
            <div className="flex sm:hidden space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onHistoryClick}
                className="p-2 bg-dark-surface hover:bg-dark-border border-dark-border text-gray-300 hover:text-white"
                data-testid="button-history-mobile"
              >
                <Clock className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSettingsClick}
                className="p-2 bg-dark-surface hover:bg-dark-border border-dark-border text-gray-300 hover:text-white"
                data-testid="button-settings-mobile"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}