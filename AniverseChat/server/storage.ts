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

// In-memory storage implementation
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private messages: Map<string, Message> = new Map();
  private sessionsByUser: Map<string, string[]> = new Map();
  private messagesBySession: Map<string, string[]> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      ...userData,
      createdAt: this.users.has(userData.id) ? this.users.get(userData.id)!.createdAt : now,
      updatedAt: now,
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Chat operations
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const session: ChatSession = {
      id,
      ...insertSession,
      createdAt: now,
      updatedAt: now,
    };
    
    this.chatSessions.set(id, session);
    
    // Track sessions by user
    const userSessions = this.sessionsByUser.get(insertSession.userId) || [];
    userSessions.push(id);
    this.sessionsByUser.set(insertSession.userId, userSessions);
    
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getAllChatSessions(userId: string): Promise<ChatSession[]> {
    const sessionIds = this.sessionsByUser.get(userId) || [];
    const sessions = sessionIds
      .map(id => this.chatSessions.get(id))
      .filter((session): session is ChatSession => session !== undefined)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
    return sessions;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const message: Message = {
      id,
      ...insertMessage,
      timestamp: now,
    };
    
    this.messages.set(id, message);
    
    // Track messages by session
    const sessionMessages = this.messagesBySession.get(insertMessage.sessionId) || [];
    sessionMessages.push(id);
    this.messagesBySession.set(insertMessage.sessionId, sessionMessages);
    
    // Update session timestamp
    const session = this.chatSessions.get(insertMessage.sessionId);
    if (session) {
      session.updatedAt = now;
      this.chatSessions.set(insertMessage.sessionId, session);
    }
    
    return message;
  }

  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    const messageIds = this.messagesBySession.get(sessionId) || [];
    const messages = messageIds
      .map(id => this.messages.get(id))
      .filter((msg): msg is Message => msg !== undefined)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
    return messages;
  }

  async deleteMessage(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      this.messages.delete(id);
      
      // Remove from session tracking
      const sessionMessages = this.messagesBySession.get(message.sessionId) || [];
      const index = sessionMessages.indexOf(id);
      if (index > -1) {
        sessionMessages.splice(index, 1);
        this.messagesBySession.set(message.sessionId, sessionMessages);
      }
    }
  }

  async deleteChatSession(id: string): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      // Delete all messages first
      const messageIds = this.messagesBySession.get(id) || [];
      messageIds.forEach(msgId => this.messages.delete(msgId));
      this.messagesBySession.delete(id);
      
      // Remove session
      this.chatSessions.delete(id);
      
      // Remove from user tracking
      const userSessions = this.sessionsByUser.get(session.userId) || [];
      const index = userSessions.indexOf(id);
      if (index > -1) {
        userSessions.splice(index, 1);
        this.sessionsByUser.set(session.userId, userSessions);
      }
    }
  }
}

export const storage = new MemoryStorage();