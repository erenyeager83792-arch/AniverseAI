import session from "express-session";
import type { Express, Request } from "express";
import connectPg from "connect-pg-simple";
import crypto from "crypto";

// Extend session interface to include userId
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Generate a secure session secret if not provided
  const sessionSecret = process.env.SESSION_SECRET || 'replit-fallback-secret-' + Date.now() + '-' + Math.random().toString(36);
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}


export function setupSession(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Simple logout endpoint that clears session
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
      res.redirect("/");
    });
  });
}

export function getSessionUserId(req: Request): string {
  // Generate or retrieve a unique user ID for this session
  if (!req.session.userId) {
    req.session.userId = crypto.randomUUID();
  }
  return req.session.userId;
}