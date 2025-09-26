import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatHistory } from "@/components/chat/chat-history";
import { ChatSettings } from "@/components/chat/chat-settings";
import { chatApi } from "@/lib/chat-api";

export default function Chat() {
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Get or create a session
  const { data: sessions } = useQuery({
    queryKey: ["/api/chat/sessions"],
    queryFn: () => chatApi.getSessions(),
  });

  useEffect(() => {
    const initializeSession = async () => {
      if (sessions && sessions.length > 0) {
        // Use the most recent session
        setCurrentSessionId(sessions[0].id);
      } else {
        // Create a new session
        try {
          const newSession = await chatApi.createSession();
          setCurrentSessionId(newSession.id);
        } catch (error) {
          console.error("Failed to create session:", error);
        }
      }
    };

    initializeSession();
  }, [sessions]);

  const handleHistoryClick = () => {
    setShowHistory(true);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  if (!currentSessionId) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-anime-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white font-body overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 manga-bg opacity-5"></div>
      
      {/* Background Image Overlay */}
      <div className="fixed inset-0 opacity-10 manga-character-bg"></div>
      
      <Navbar 
        onHistoryClick={handleHistoryClick}
        onSettingsClick={handleSettingsClick}
      />
      
      <ChatInterface sessionId={currentSessionId} />
      
      <ChatHistory
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        open={showHistory}
        onOpenChange={setShowHistory}
      />
      
      <ChatSettings
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
