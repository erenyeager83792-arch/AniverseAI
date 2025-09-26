import {
  users,
  chatSessions,
  messages,
  type User,
  type UpsertUser,
  type ChatSession,
  type Message,
  type InsertChatSession,
  type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT) - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getAllChatSessions(userId: string): Promise<ChatSession[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  deleteMessage(id: string): Promise<void>;
  deleteChatSession(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Chat operations
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session;
  }

  async getAllChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    // Update session timestamp
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, insertMessage.sessionId));
    
    return message;
  }

  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.timestamp);
  }

  async deleteMessage(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  async deleteChatSession(id: string): Promise<void> {
    // Delete all messages first (foreign key constraint)
    await db.delete(messages).where(eq(messages.sessionId, id));
    // Then delete the session
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
  }
}

export const storage = new DatabaseStorage();