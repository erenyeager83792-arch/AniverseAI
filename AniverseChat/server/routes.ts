import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertMessageSchema, chatMessageSchema, type ChatResponse } from "@shared/schema";
import { setupSession, getSessionUserId } from "./replitAuth";

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

  // Session middleware
  setupSession(app);

  // User routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: `user_${userId.slice(0, 8)}@aniverse.ai`,
          firstName: 'AniVerse',
          lastName: 'User',
          profileImageUrl: '',
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create a new chat session
  app.post("/api/chat/sessions", async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      
      await ensureUserExists(userId);
      
      const sessionData = { 
        title: req.body.title || "New Chat",
        userId 
      };
      const session = await storage.createChatSession(sessionData);
      res.status(200).json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Helper function to ensure user exists
  const ensureUserExists = async (userId: string) => {
    let user = await storage.getUser(userId);
    if (!user) {
      user = await storage.upsertUser({
        id: userId,
        email: `user_${userId.slice(0, 8)}@aniverse.ai`,
        firstName: 'AniVerse',
        lastName: 'User',
        profileImageUrl: '',
      });
    }
    return user;
  };

  // Get all chat sessions for user
  app.get("/api/chat/sessions", async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      await ensureUserExists(userId);
      const sessions = await storage.getAllChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  // Get messages for a session
  app.get("/api/chat/sessions/:sessionId/messages", async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = getSessionUserId(req);
      await ensureUserExists(userId);
      
      // Check if session exists
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const messages = await storage.getMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message to Perplexity API
  app.post("/api/chat/sessions/:sessionId/messages", async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { content } = chatMessageSchema.parse(req.body);
      const userId = getSessionUserId(req);
      await ensureUserExists(userId);

      // Check if session exists (simplified validation - no strict user ownership in no-auth mode)
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      console.log(`[CHAT] User ${userId} sending message to session ${sessionId}: "${content.substring(0, 50)}..."`);

      // Save user message first
      const userMessage = await storage.createMessage({
        sessionId,
        role: "user",
        content,
      });

      console.log(`[CHAT] User message saved with ID: ${userMessage.id}`);

      // Get conversation history for context
      const messages = await storage.getMessagesBySessionId(sessionId);
      
      // Prepare messages for Perplexity API - limit to last 10 messages for better performance
      const recentMessages = messages.slice(-10);
      const perplexityMessages: PerplexityMessage[] = [
        {
          role: "system",
          content: "You are AniVerse AI, an intelligent assistant specialized in anime and manga. You have deep knowledge about anime series, manga titles, characters, storylines, recommendations, and the broader anime/manga culture. Provide detailed, accurate, and engaging responses about anime and manga topics. Be enthusiastic and knowledgeable while maintaining a friendly tone. Always respond to greetings like 'hi', 'hello', 'hey' in a friendly manner."
        },
        ...recentMessages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))
      ];

      if (!PERPLEXITY_API_KEY) {
        console.error("[CHAT] Perplexity API key not configured");
        return res.status(500).json({ error: "AI service not configured" });
      }

      console.log(`[CHAT] Calling Perplexity API with ${perplexityMessages.length} messages`);

      // Call Perplexity API with timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: perplexityMessages,
            temperature: 0.3,
            top_p: 0.9,
            return_images: false,
            return_related_questions: false,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 0.1
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!perplexityResponse.ok) {
          const errorText = await perplexityResponse.text();
          console.error(`[CHAT] Perplexity API error ${perplexityResponse.status}:`, errorText);
          return res.status(500).json({ error: "AI service temporarily unavailable" });
        }

        const perplexityData: PerplexityResponse = await perplexityResponse.json();
        const aiMessage = perplexityData.choices[0]?.message?.content;

        if (!aiMessage) {
          console.error("[CHAT] Invalid response from Perplexity API - no message content");
          return res.status(500).json({ error: "Invalid response from AI service" });
        }

        console.log(`[CHAT] AI response received, length: ${aiMessage.length} characters`);

        // Save AI response
        const assistantMessage = await storage.createMessage({
          sessionId,
          role: "assistant",
          content: aiMessage,
        });

        console.log(`[CHAT] AI message saved with ID: ${assistantMessage.id}`);

        const response: ChatResponse = {
          message: aiMessage,
          sessionId,
        };

        res.json(response);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error("[CHAT] Request timeout");
          return res.status(408).json({ error: "Request timeout - please try again" });
        }
        console.error("[CHAT] Network error:", fetchError);
        return res.status(500).json({ error: "Network error - please check your connection" });
      }

    } catch (error) {
      console.error("[CHAT] Error in message processing:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Delete a chat session
  app.delete("/api/chat/sessions/:sessionId", async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = getSessionUserId(req);
      await ensureUserExists(userId);
      
      // Check if session exists
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      await storage.deleteChatSession(sessionId);
      res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat session:", error);
      res.status(500).json({ error: "Failed to delete chat session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}