import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, Trash2 } from "lucide-react";
import { chatApi, type ChatSession } from "@/lib/chat-api";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ChatHistoryProps {
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatHistory({ currentSessionId, onSessionSelect, open, onOpenChange }: ChatHistoryProps) {
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['/api/chat/sessions'],
    refetchInterval: false,
    staleTime: 10000
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-surface border border-dark-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-anime-orange" />
            <span>Chat History</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No chat sessions yet</p>
                <p className="text-sm">Start chatting to see your history</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-dark-muted group",
                    currentSessionId === session.id
                      ? "border-anime-orange bg-anime-orange/10"
                      : "border-dark-border hover:border-anime-orange/50"
                  )}
                  onClick={() => {
                    onSessionSelect?.(session.id);
                    onOpenChange(false);
                  }}
                  data-testid={`session-${session.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-white truncate">
                        {session.title || "New Chat"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                    <MessageSquare className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}