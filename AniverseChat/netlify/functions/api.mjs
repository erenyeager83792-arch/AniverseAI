import express from 'express';
import serverless from 'serverless-http';
import crypto from 'crypto';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || "";

console.log('[NETLIFY] Starting function...');
console.log('[NETLIFY] Environment check:');
console.log('[NETLIFY] Has PERPLEXITY_API_KEY:', !!PERPLEXITY_API_KEY);
console.log('[NETLIFY] API Key length:', PERPLEXITY_API_KEY ? PERPLEXITY_API_KEY.length : 0);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Temporary simple authentication routes (for testing)
app.get("/api/auth/google", (req, res) => {
  res.json({ 
    message: "Google OAuth setup in progress", 
    redirectTo: "/",
    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  });
});

app.get("/api/auth/google/callback", (req, res) => {
  res.redirect("/");
});

app.get("/api/logout", (req, res) => {
  res.redirect("/");
});

app.get('/api/auth/user', (req, res) => {
  // For now, return a demo user for testing
  res.json({
    id: 'demo-user',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    profileImageUrl: ''
  });
});

// For serverless functions, we use URL parameters to pass conversation context
// Each session maintains conversation through API calls
const conversations = new Map(); // Temporary storage per function instance

// Chat session routes
app.post("/api/chat/sessions", async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const session = {
      id,
      title: req.body.title || "New Chat",
      userId: "demo-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log(`[NETLIFY] Created session: ${id}`);
    res.json(session);
  } catch (error) {
    console.error("Error creating chat session:", error);
    res.status(500).json({ error: "Failed to create chat session" });
  }
});

app.get("/api/chat/sessions", async (req, res) => {
  try {
    // For serverless, return empty array - frontend will create session as needed
    console.log('[NETLIFY] Fetching sessions');
    res.json([]);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

app.get("/api/chat/sessions/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`[NETLIFY] Fetching messages for session: ${sessionId}`);
    
    // Get conversation from temporary storage or start fresh
    const sessionMessages = conversations.get(sessionId) || [];
    
    // Add greeting if no messages exist
    if (sessionMessages.length === 0) {
      const greetingMessage = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'assistant',
        content: 'Hello! I\'m AniVerse AI, your anime and manga companion. What would you like to discuss today?',
        timestamp: new Date().toISOString()
      };
      sessionMessages.push(greetingMessage);
      conversations.set(sessionId, sessionMessages);
    }
    
    res.json(sessionMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/api/chat/sessions/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    console.log(`[NETLIFY] Processing message for session ${sessionId}: "${content.substring(0, 50)}..."`); 

    // Get existing conversation
    const sessionMessages = conversations.get(sessionId) || [];
    
    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: "user",
      content: content,
      timestamp: new Date().toISOString()
    };
    sessionMessages.push(userMessage);

    let aiResponse = "I'm currently in demo mode. Please configure your PERPLEXITY_API_KEY environment variable for full AI functionality.";

    // Call Perplexity API if available
    console.log('[NETLIFY] Checking API key availability:', !!PERPLEXITY_API_KEY);
    if (PERPLEXITY_API_KEY && PERPLEXITY_API_KEY.length > 10) {
      try {
        console.log('[NETLIFY] Calling Perplexity API with sonar model');
        
        // Use conversation context (last 8 messages)
        const recentMessages = sessionMessages.slice(-8);
        const perplexityMessages = [
          {
            role: "system",
            content: "You are AniVerse AI, an intelligent assistant specialized in anime and manga. You have deep knowledge about anime series, manga titles, characters, storylines, recommendations, and the broader anime/manga culture. Provide detailed, accurate, and engaging responses about anime and manga topics. Be enthusiastic and knowledgeable while maintaining a friendly tone. Always respond to greetings like 'hi', 'hello', 'hey' in a friendly manner."
          },
          ...recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ];
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
        
        const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json"
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

        if (perplexityResponse.ok) {
          const data = await perplexityResponse.json();
          aiResponse = data.choices?.[0]?.message?.content || aiResponse;
          console.log(`[NETLIFY] AI response received, length: ${aiResponse.length} characters`);
        } else {
          console.error(`[NETLIFY] Perplexity API error: ${perplexityResponse.status}`);
          try {
            const errorText = await perplexityResponse.text();
            console.error(`[NETLIFY] API Error details:`, errorText);
          } catch (e) {
            console.error(`[NETLIFY] Could not read error response:`, e);
          }
          aiResponse = "Sorry, I'm having trouble accessing my knowledge base right now. Please try again in a moment.";
        }
      } catch (apiError) {
        console.error("[NETLIFY] Perplexity API error:", apiError);
        if (apiError.name === 'AbortError') {
          aiResponse = "Sorry, that request took too long. Please try asking again.";
        } else {
          aiResponse = "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
        }
      }
    }
    
    // Add AI response message
    const aiMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    sessionMessages.push(aiMessage);
    
    // Store updated conversation
    conversations.set(sessionId, sessionMessages);

    res.json({
      message: aiResponse,
      sessionId: sessionId,
    });

  } catch (error) {
    console.error("[NETLIFY] Error processing message:", error);
    res.status(500).json({ 
      error: "Failed to process message"
    });
  }
});

app.delete("/api/chat/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`[NETLIFY] Session ${sessionId} deletion requested`);
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    res.status(500).json({ error: "Failed to delete chat session" });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasPerplexityKey: !!PERPLEXITY_API_KEY,
    mode: 'serverless',
    features: {
      aiResponses: !!PERPLEXITY_API_KEY,
      conversationMemory: true,
      noAuthRequired: true
    }
  });
});

// Catch all for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export const handler = serverless(app);