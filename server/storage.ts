// Blueprint reference: javascript_database
import {
  users, measurements, products, makers, customRequests, quotes, orders,
  adminUsers, pricingConfigs, subscriptionPlans, subscriptions, auditLogs,
  aiPersonas, aiChatSessions,
  type User, type InsertUser,
  type Measurement, type InsertMeasurement,
  type Product, type InsertProduct,
  type Maker, type InsertMaker,
  type CustomRequest, type InsertCustomRequest,
  type Quote, type InsertQuote,
  type Order, type InsertOrder,
  type AdminUser, type InsertAdminUser,
  type PricingConfig, type InsertPricingConfig,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type Subscription,
  type AuditLog,
  type AiPersona, type InsertAiPersona,
  type AiChatSession, type InsertAiChatSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Measurements
  getUserMeasurements(userId: string): Promise<Measurement | undefined>;
  upsertMeasurements(measurements: InsertMeasurement): Promise<Measurement>;
  
  // Products
  getProducts(filters?: { demographic?: string; category?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Makers
  getMakers(filters?: { specialty?: string; verified?: boolean }): Promise<Maker[]>;
  getMaker(id: string): Promise<Maker | undefined>;
  getMakerByEmail(email: string): Promise<Maker | undefined>;
  createMaker(maker: InsertMaker): Promise<Maker>;
  updateMaker(id: string, updates: Partial<InsertMaker>): Promise<Maker | undefined>;
  
  // Custom Requests & Quotes
  getCustomRequest(id: string): Promise<CustomRequest | undefined>;
  getUserCustomRequests(userId: string): Promise<CustomRequest[]>;
  getOpenCustomRequests(): Promise<CustomRequest[]>;
  createCustomRequest(request: InsertCustomRequest): Promise<CustomRequest>;
  updateCustomRequest(id: string, updates: Partial<CustomRequest>): Promise<CustomRequest | undefined>;
  
  getQuotesForRequest(requestId: string): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  acceptQuote(quoteId: string): Promise<Quote | undefined>;
  
  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  
  // Pricing Configs
  getPricingConfig(key: string): Promise<PricingConfig | undefined>;
  getAllPricingConfigs(): Promise<PricingConfig[]>;
  upsertPricingConfig(config: InsertPricingConfig): Promise<PricingConfig>;
  
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  
  // Audit Logs
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // AI Personas
  getAiPersonas(): Promise<AiPersona[]>;
  getAiPersona(id: string): Promise<AiPersona | undefined>;
  
  // AI Chat Sessions
  getAiChatSession(id: string): Promise<AiChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<AiChatSession[]>;
  createAiChatSession(session: InsertAiChatSession): Promise<AiChatSession>;
  updateAiChatSession(id: string, messages: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Measurements
  async getUserMeasurements(userId: string): Promise<Measurement | undefined> {
    const [measurement] = await db.select().from(measurements).where(eq(measurements.userId, userId));
    return measurement || undefined;
  }

  async upsertMeasurements(insertMeasurement: InsertMeasurement): Promise<Measurement> {
    const existing = await this.getUserMeasurements(insertMeasurement.userId);
    if (existing) {
      const [updated] = await db.update(measurements)
        .set({ ...insertMeasurement, updatedAt: new Date() })
        .where(eq(measurements.userId, insertMeasurement.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(measurements).values(insertMeasurement).returning();
    return created;
  }

  // Products
  async getProducts(filters?: { demographic?: string; category?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions = [];
    
    if (filters?.demographic) conditions.push(eq(products.demographic, filters.demographic as any));
    if (filters?.category) conditions.push(eq(products.category, filters.category));
    if (filters?.minPrice !== undefined) conditions.push(gte(products.price, filters.minPrice.toString()));
    if (filters?.maxPrice !== undefined) conditions.push(lte(products.price, filters.maxPrice.toString()));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return query;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  // Makers
  async getAllMakers(): Promise<Maker[]> {
    return db.select().from(makers);
  }

  async getMakers(filters?: { specialty?: string; verified?: boolean }): Promise<Maker[]> {
    let query = db.select().from(makers);
    const conditions = [];
    
    if (filters?.verified !== undefined) conditions.push(eq(makers.isVerified, filters.verified));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return query;
  }

  async getMaker(id: string): Promise<Maker | undefined> {
    const [maker] = await db.select().from(makers).where(eq(makers.id, id));
    return maker || undefined;
  }

  async getMakerByEmail(email: string): Promise<Maker | undefined> {
    const [maker] = await db.select().from(makers).where(eq(makers.email, email));
    return maker || undefined;
  }

  async createMaker(insertMaker: InsertMaker): Promise<Maker> {
    const [maker] = await db.insert(makers).values(insertMaker).returning();
    return maker;
  }

  async updateMaker(id: string, updates: Partial<InsertMaker>): Promise<Maker | undefined> {
    const [maker] = await db.update(makers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(makers.id, id))
      .returning();
    return maker || undefined;
  }

  // Custom Requests & Quotes
  async getCustomRequest(id: string): Promise<CustomRequest | undefined> {
    const [request] = await db.select().from(customRequests).where(eq(customRequests.id, id));
    return request || undefined;
  }

  async getUserCustomRequests(userId: string): Promise<CustomRequest[]> {
    return db.select().from(customRequests)
      .where(eq(customRequests.userId, userId))
      .orderBy(desc(customRequests.createdAt));
  }

  async getOpenCustomRequests(): Promise<CustomRequest[]> {
    return db.select().from(customRequests)
      .where(eq(customRequests.status, 'open'))
      .orderBy(desc(customRequests.createdAt));
  }

  async createCustomRequest(request: InsertCustomRequest): Promise<CustomRequest> {
    const [created] = await db.insert(customRequests).values(request).returning();
    return created;
  }

  async updateCustomRequest(id: string, updates: Partial<CustomRequest>): Promise<CustomRequest | undefined> {
    const [updated] = await db.update(customRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customRequests.id, id))
      .returning();
    return updated || undefined;
  }

  async getQuotesForRequest(requestId: string): Promise<Quote[]> {
    return db.select().from(quotes)
      .where(eq(quotes.requestId, requestId))
      .orderBy(desc(quotes.matchScore));
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [created] = await db.insert(quotes).values(quote).returning();
    return created;
  }

  async acceptQuote(quoteId: string): Promise<Quote | undefined> {
    const [updated] = await db.update(quotes)
      .set({ isAccepted: true })
      .where(eq(quotes.id, quoteId))
      .returning();
    return updated || undefined;
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const [created] = await db.insert(adminUsers).values(admin).returning();
    return created;
  }

  // Pricing Configs
  async getPricingConfig(key: string): Promise<PricingConfig | undefined> {
    const [config] = await db.select().from(pricingConfigs).where(eq(pricingConfigs.configKey, key));
    return config || undefined;
  }

  async getAllPricingConfigs(): Promise<PricingConfig[]> {
    return db.select().from(pricingConfigs);
  }

  async upsertPricingConfig(config: InsertPricingConfig): Promise<PricingConfig> {
    const existing = await this.getPricingConfig(config.configKey);
    if (existing) {
      const [updated] = await db.update(pricingConfigs)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(pricingConfigs.configKey, config.configKey))
        .returning();
      return updated;
    }
    const [created] = await db.insert(pricingConfigs).values(config).returning();
    return created;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  // Audit Logs
  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    await db.insert(auditLogs).values(log);
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // AI Personas
  async getAiPersonas(): Promise<AiPersona[]> {
    return db.select().from(aiPersonas).where(eq(aiPersonas.isActive, true));
  }

  async getAiPersona(id: string): Promise<AiPersona | undefined> {
    const [persona] = await db.select().from(aiPersonas).where(eq(aiPersonas.id, id));
    return persona || undefined;
  }

  // AI Chat Sessions
  async getAiChatSession(id: string): Promise<AiChatSession | undefined> {
    const [session] = await db.select().from(aiChatSessions).where(eq(aiChatSessions.id, id));
    return session || undefined;
  }

  async getUserChatSessions(userId: string): Promise<AiChatSession[]> {
    return db.select().from(aiChatSessions)
      .where(eq(aiChatSessions.userId, userId))
      .orderBy(desc(aiChatSessions.updatedAt));
  }

  async createAiChatSession(session: InsertAiChatSession): Promise<AiChatSession> {
    const [created] = await db.insert(aiChatSessions).values(session).returning();
    return created;
  }

  async updateAiChatSession(id: string, messages: any): Promise<void> {
    await db.update(aiChatSessions)
      .set({ messages, updatedAt: new Date() })
      .where(eq(aiChatSessions.id, id));
  }
}

export const storage = new DatabaseStorage();
