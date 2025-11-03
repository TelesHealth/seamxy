// Blueprint reference: javascript_database
import {
  users, measurements, products, makers, customRequests, quotes, orders,
  adminUsers, pricingConfigs, subscriptionPlans, subscriptions, auditLogs,
  aiPersonas, aiChatSessions,
  supplierAccounts, supplierProfiles, retailerProducts, designerCollections,
  portfolioItems, supplierSubscriptions, supplierInvoices, messageThreads,
  supplierMessages, supplierOrders, integrationTokens, analyticsSnapshots,
  retailerConfigs, externalProducts, priceHistory, priceAlerts, affiliateClicks, affiliateConversions,
  stylistApplications, stylistProfiles, stylistPortfolioItems, stylistRfqs, stylistFollowers, stylistReviews,
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
  type SupplierAccount, type InsertSupplierAccount,
  type SupplierProfile, type InsertSupplierProfile,
  type RetailerProduct, type InsertRetailerProduct,
  type DesignerCollection, type InsertDesignerCollection,
  type PortfolioItem, type InsertPortfolioItem,
  type SupplierSubscription, type InsertSupplierSubscription,
  type SupplierInvoice, type InsertSupplierInvoice,
  type MessageThread, type InsertMessageThread,
  type SupplierMessage, type InsertSupplierMessage,
  type SupplierOrder, type InsertSupplierOrder,
  type IntegrationToken, type InsertIntegrationToken,
  type AnalyticsSnapshot, type InsertAnalyticsSnapshot,
  type RetailerConfig, type InsertRetailerConfig,
  type ExternalProduct, type InsertExternalProduct,
  type PriceHistory, type InsertPriceHistory,
  type PriceAlert, type InsertPriceAlert,
  type AffiliateClick, type InsertAffiliateClick,
  type AffiliateConversion, type InsertAffiliateConversion,
  type StylistApplication, type InsertStylistApplication,
  type StylistProfile, type InsertStylistProfile,
  type StylistPortfolioItem, type InsertStylistPortfolioItem,
  type StylistRfq, type InsertStylistRfq,
  type StylistReview, type InsertStylistReview,
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
  
  // Supplier Accounts
  getSupplierAccount(id: string): Promise<SupplierAccount | undefined>;
  getSupplierAccountByEmail(email: string): Promise<SupplierAccount | undefined>;
  createSupplierAccount(account: InsertSupplierAccount): Promise<SupplierAccount>;
  updateSupplierAccount(id: string, updates: Partial<InsertSupplierAccount>): Promise<SupplierAccount | undefined>;
  getSuppliersByRole(role: string): Promise<SupplierAccount[]>;
  getSuppliersByTier(tier: string): Promise<SupplierAccount[]>;
  
  // Supplier Profiles
  getSupplierProfile(supplierId: string): Promise<SupplierProfile | undefined>;
  createSupplierProfile(profile: InsertSupplierProfile): Promise<SupplierProfile>;
  updateSupplierProfile(supplierId: string, updates: Partial<InsertSupplierProfile>): Promise<SupplierProfile | undefined>;
  
  // Retailer Products
  getRetailerProducts(supplierId: string): Promise<RetailerProduct[]>;
  getRetailerProduct(id: string): Promise<RetailerProduct | undefined>;
  createRetailerProduct(product: InsertRetailerProduct): Promise<RetailerProduct>;
  updateRetailerProduct(id: string, updates: Partial<InsertRetailerProduct>): Promise<RetailerProduct | undefined>;
  deleteRetailerProduct(id: string): Promise<void>;
  
  // Designer Collections
  getDesignerCollections(supplierId: string): Promise<DesignerCollection[]>;
  getDesignerCollection(id: string): Promise<DesignerCollection | undefined>;
  createDesignerCollection(collection: InsertDesignerCollection): Promise<DesignerCollection>;
  updateDesignerCollection(id: string, updates: Partial<InsertDesignerCollection>): Promise<DesignerCollection | undefined>;
  deleteDesignerCollection(id: string): Promise<void>;
  
  // Portfolio Items
  getPortfolioItems(supplierId: string): Promise<PortfolioItem[]>;
  getPortfolioItem(id: string): Promise<PortfolioItem | undefined>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  updatePortfolioItem(id: string, updates: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined>;
  deletePortfolioItem(id: string): Promise<void>;
  
  // Supplier Subscriptions
  getSupplierSubscription(supplierId: string): Promise<SupplierSubscription | undefined>;
  createSupplierSubscription(subscription: InsertSupplierSubscription): Promise<SupplierSubscription>;
  updateSupplierSubscription(supplierId: string, updates: Partial<InsertSupplierSubscription>): Promise<SupplierSubscription | undefined>;
  
  // Supplier Invoices
  getSupplierInvoices(supplierId: string): Promise<SupplierInvoice[]>;
  getSupplierInvoice(id: string): Promise<SupplierInvoice | undefined>;
  createSupplierInvoice(invoice: InsertSupplierInvoice): Promise<SupplierInvoice>;
  
  // Message Threads & Messages
  getMessageThreads(supplierId: string): Promise<MessageThread[]>;
  getMessageThread(id: string): Promise<MessageThread | undefined>;
  createMessageThread(thread: InsertMessageThread): Promise<MessageThread>;
  updateMessageThread(id: string, updates: Partial<MessageThread>): Promise<MessageThread | undefined>;
  getMessagesInThread(threadId: string): Promise<SupplierMessage[]>;
  createSupplierMessage(message: InsertSupplierMessage): Promise<SupplierMessage>;
  
  // Supplier Orders
  getSupplierOrders(supplierId: string): Promise<SupplierOrder[]>;
  getSupplierOrder(id: string): Promise<SupplierOrder | undefined>;
  createSupplierOrder(order: InsertSupplierOrder): Promise<SupplierOrder>;
  updateSupplierOrder(id: string, updates: Partial<InsertSupplierOrder>): Promise<SupplierOrder | undefined>;
  
  // Integration Tokens
  getIntegrationTokens(supplierId: string): Promise<IntegrationToken[]>;
  getIntegrationToken(id: string): Promise<IntegrationToken | undefined>;
  getIntegrationTokenByPlatform(supplierId: string, platform: string): Promise<IntegrationToken | undefined>;
  createIntegrationToken(token: InsertIntegrationToken): Promise<IntegrationToken>;
  updateIntegrationToken(id: string, updates: Partial<InsertIntegrationToken>): Promise<IntegrationToken | undefined>;
  deleteIntegrationToken(id: string): Promise<void>;
  
  // Analytics Snapshots
  getAnalyticsSnapshots(supplierId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsSnapshot[]>;
  createAnalyticsSnapshot(snapshot: InsertAnalyticsSnapshot): Promise<AnalyticsSnapshot>;
  
  // Price Comparison
  getRetailerConfigs(): Promise<RetailerConfig[]>;
  getExternalProductsByInternalId(internalProductId: string): Promise<ExternalProduct[]>;
  createExternalProduct(product: InsertExternalProduct): Promise<ExternalProduct>;
  updateExternalProduct(id: string, updates: Partial<InsertExternalProduct>): Promise<ExternalProduct | undefined>;
  createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
  getPriceHistory(externalProductId: string, limit?: number): Promise<PriceHistory[]>;
  getUserPriceAlerts(userId: string): Promise<PriceAlert[]>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updatePriceAlert(id: string, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined>;
  createAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick>;
  createAffiliateConversion(conversion: InsertAffiliateConversion): Promise<AffiliateConversion>;
  
  // Stylist Applications
  getStylistApplicationById(id: string): Promise<StylistApplication | undefined>;
  getStylistApplicationByUserId(userId: string): Promise<StylistApplication | undefined>;
  getAllStylistApplications(status?: 'pending' | 'approved' | 'rejected'): Promise<StylistApplication[]>;
  createStylistApplication(application: InsertStylistApplication): Promise<StylistApplication>;
  updateStylistApplication(id: string, updates: Partial<StylistApplication>): Promise<StylistApplication | undefined>;
  
  // Stylist Profiles
  getStylistProfileById(id: string): Promise<StylistProfile | undefined>;
  getStylistProfileByUserId(userId: string): Promise<StylistProfile | undefined>;
  getStylistProfileByHandle(handle: string): Promise<StylistProfile | undefined>;
  browseStylistProfiles(filters: { specialty?: string; tags?: string[]; location?: string; search?: string }): Promise<StylistProfile[]>;
  createStylistProfile(profile: InsertStylistProfile): Promise<StylistProfile>;
  updateStylistProfile(id: string, updates: Partial<InsertStylistProfile>): Promise<StylistProfile | undefined>;
  
  // Stylist Portfolio Items
  getStylistPortfolioItemById(id: string): Promise<StylistPortfolioItem | undefined>;
  getStylistPortfolioItems(stylistId: string): Promise<StylistPortfolioItem[]>;
  createStylistPortfolioItem(item: InsertStylistPortfolioItem): Promise<StylistPortfolioItem>;
  updateStylistPortfolioItem(id: string, updates: Partial<InsertStylistPortfolioItem>): Promise<StylistPortfolioItem | undefined>;
  deleteStylistPortfolioItem(id: string): Promise<void>;
  
  // Stylist RFQs
  getStylistRfqById(id: string): Promise<StylistRfq | undefined>;
  getStylistRfqs(stylistId: string): Promise<StylistRfq[]>;
  createStylistRfq(rfq: InsertStylistRfq): Promise<StylistRfq>;
  updateStylistRfq(id: string, updates: Partial<StylistRfq>): Promise<StylistRfq | undefined>;
  
  // Stylist Followers
  followStylist(userId: string, stylistId: string): Promise<void>;
  unfollowStylist(userId: string, stylistId: string): Promise<void>;
  
  // Stylist Reviews
  getStylistReviews(stylistId: string): Promise<StylistReview[]>;
  createStylistReview(review: InsertStylistReview): Promise<StylistReview>;
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

  // Supplier Accounts
  async getSupplierAccount(id: string): Promise<SupplierAccount | undefined> {
    const [account] = await db.select().from(supplierAccounts).where(eq(supplierAccounts.id, id));
    return account || undefined;
  }

  async getSupplierAccountByEmail(email: string): Promise<SupplierAccount | undefined> {
    const [account] = await db.select().from(supplierAccounts).where(eq(supplierAccounts.email, email));
    return account || undefined;
  }

  async createSupplierAccount(account: InsertSupplierAccount): Promise<SupplierAccount> {
    const [created] = await db.insert(supplierAccounts).values(account).returning();
    return created;
  }

  async updateSupplierAccount(id: string, updates: Partial<InsertSupplierAccount>): Promise<SupplierAccount | undefined> {
    const [updated] = await db.update(supplierAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supplierAccounts.id, id))
      .returning();
    return updated || undefined;
  }

  async getSuppliersByRole(role: string): Promise<SupplierAccount[]> {
    return db.select().from(supplierAccounts).where(eq(supplierAccounts.role, role as any));
  }

  async getSuppliersByTier(tier: string): Promise<SupplierAccount[]> {
    return db.select().from(supplierAccounts).where(eq(supplierAccounts.tier, tier as any));
  }

  // Supplier Profiles
  async getSupplierProfile(supplierId: string): Promise<SupplierProfile | undefined> {
    const [profile] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.supplierId, supplierId));
    return profile || undefined;
  }

  async createSupplierProfile(profile: InsertSupplierProfile): Promise<SupplierProfile> {
    const [created] = await db.insert(supplierProfiles).values(profile).returning();
    return created;
  }

  async updateSupplierProfile(supplierId: string, updates: Partial<InsertSupplierProfile>): Promise<SupplierProfile | undefined> {
    const [updated] = await db.update(supplierProfiles)
      .set(updates)
      .where(eq(supplierProfiles.supplierId, supplierId))
      .returning();
    return updated || undefined;
  }

  // Retailer Products
  async getRetailerProducts(supplierId: string): Promise<RetailerProduct[]> {
    return db.select().from(retailerProducts)
      .where(eq(retailerProducts.supplierId, supplierId))
      .orderBy(desc(retailerProducts.createdAt));
  }

  async getRetailerProduct(id: string): Promise<RetailerProduct | undefined> {
    const [product] = await db.select().from(retailerProducts).where(eq(retailerProducts.id, id));
    return product || undefined;
  }

  async createRetailerProduct(product: InsertRetailerProduct): Promise<RetailerProduct> {
    const [created] = await db.insert(retailerProducts).values(product).returning();
    return created;
  }

  async updateRetailerProduct(id: string, updates: Partial<InsertRetailerProduct>): Promise<RetailerProduct | undefined> {
    const [updated] = await db.update(retailerProducts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(retailerProducts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRetailerProduct(id: string): Promise<void> {
    await db.delete(retailerProducts).where(eq(retailerProducts.id, id));
  }

  // Designer Collections
  async getDesignerCollections(supplierId: string): Promise<DesignerCollection[]> {
    return db.select().from(designerCollections)
      .where(eq(designerCollections.supplierId, supplierId))
      .orderBy(desc(designerCollections.createdAt));
  }

  async getDesignerCollection(id: string): Promise<DesignerCollection | undefined> {
    const [collection] = await db.select().from(designerCollections).where(eq(designerCollections.id, id));
    return collection || undefined;
  }

  async createDesignerCollection(collection: InsertDesignerCollection): Promise<DesignerCollection> {
    const [created] = await db.insert(designerCollections).values(collection).returning();
    return created;
  }

  async updateDesignerCollection(id: string, updates: Partial<InsertDesignerCollection>): Promise<DesignerCollection | undefined> {
    const [updated] = await db.update(designerCollections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(designerCollections.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDesignerCollection(id: string): Promise<void> {
    await db.delete(designerCollections).where(eq(designerCollections.id, id));
  }

  // Portfolio Items
  async getPortfolioItems(supplierId: string): Promise<PortfolioItem[]> {
    return db.select().from(portfolioItems)
      .where(eq(portfolioItems.supplierId, supplierId))
      .orderBy(desc(portfolioItems.createdAt));
  }

  async getPortfolioItem(id: string): Promise<PortfolioItem | undefined> {
    const [item] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id));
    return item || undefined;
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [created] = await db.insert(portfolioItems).values(item).returning();
    return created;
  }

  async updatePortfolioItem(id: string, updates: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const [updated] = await db.update(portfolioItems)
      .set(updates)
      .where(eq(portfolioItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePortfolioItem(id: string): Promise<void> {
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
  }

  // Supplier Subscriptions
  async getSupplierSubscription(supplierId: string): Promise<SupplierSubscription | undefined> {
    const [subscription] = await db.select().from(supplierSubscriptions).where(eq(supplierSubscriptions.supplierId, supplierId));
    return subscription || undefined;
  }

  async createSupplierSubscription(subscription: InsertSupplierSubscription): Promise<SupplierSubscription> {
    const [created] = await db.insert(supplierSubscriptions).values(subscription).returning();
    return created;
  }

  async updateSupplierSubscription(supplierId: string, updates: Partial<InsertSupplierSubscription>): Promise<SupplierSubscription | undefined> {
    const [updated] = await db.update(supplierSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supplierSubscriptions.supplierId, supplierId))
      .returning();
    return updated || undefined;
  }

  // Supplier Invoices
  async getSupplierInvoices(supplierId: string): Promise<SupplierInvoice[]> {
    return db.select().from(supplierInvoices)
      .where(eq(supplierInvoices.supplierId, supplierId))
      .orderBy(desc(supplierInvoices.createdAt));
  }

  async getSupplierInvoice(id: string): Promise<SupplierInvoice | undefined> {
    const [invoice] = await db.select().from(supplierInvoices).where(eq(supplierInvoices.id, id));
    return invoice || undefined;
  }

  async createSupplierInvoice(invoice: InsertSupplierInvoice): Promise<SupplierInvoice> {
    const [created] = await db.insert(supplierInvoices).values(invoice).returning();
    return created;
  }

  // Message Threads & Messages
  async getMessageThreads(supplierId: string): Promise<MessageThread[]> {
    return db.select().from(messageThreads)
      .where(eq(messageThreads.supplierId, supplierId))
      .orderBy(desc(messageThreads.updatedAt));
  }

  async getMessageThread(id: string): Promise<MessageThread | undefined> {
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, id));
    return thread || undefined;
  }

  async createMessageThread(thread: InsertMessageThread): Promise<MessageThread> {
    const [created] = await db.insert(messageThreads).values(thread).returning();
    return created;
  }

  async updateMessageThread(id: string, updates: Partial<MessageThread>): Promise<MessageThread | undefined> {
    const [updated] = await db.update(messageThreads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(messageThreads.id, id))
      .returning();
    return updated || undefined;
  }

  async getMessagesInThread(threadId: string): Promise<SupplierMessage[]> {
    return db.select().from(supplierMessages)
      .where(eq(supplierMessages.threadId, threadId))
      .orderBy(supplierMessages.createdAt);
  }

  async createSupplierMessage(message: InsertSupplierMessage): Promise<SupplierMessage> {
    const [created] = await db.insert(supplierMessages).values(message).returning();
    return created;
  }

  // Supplier Orders
  async getSupplierOrders(supplierId: string): Promise<SupplierOrder[]> {
    return db.select().from(supplierOrders)
      .where(eq(supplierOrders.supplierId, supplierId))
      .orderBy(desc(supplierOrders.createdAt));
  }

  async getSupplierOrder(id: string): Promise<SupplierOrder | undefined> {
    const [order] = await db.select().from(supplierOrders).where(eq(supplierOrders.id, id));
    return order || undefined;
  }

  async createSupplierOrder(order: InsertSupplierOrder): Promise<SupplierOrder> {
    const [created] = await db.insert(supplierOrders).values(order).returning();
    return created;
  }

  async updateSupplierOrder(id: string, updates: Partial<InsertSupplierOrder>): Promise<SupplierOrder | undefined> {
    const [updated] = await db.update(supplierOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supplierOrders.id, id))
      .returning();
    return updated || undefined;
  }

  // Integration Tokens
  async getIntegrationTokens(supplierId: string): Promise<IntegrationToken[]> {
    return db.select().from(integrationTokens).where(eq(integrationTokens.supplierId, supplierId));
  }

  async getIntegrationToken(id: string): Promise<IntegrationToken | undefined> {
    const [token] = await db.select().from(integrationTokens).where(eq(integrationTokens.id, id));
    return token || undefined;
  }

  async getIntegrationTokenByPlatform(supplierId: string, platform: string): Promise<IntegrationToken | undefined> {
    const [token] = await db.select().from(integrationTokens)
      .where(and(eq(integrationTokens.supplierId, supplierId), eq(integrationTokens.platform, platform)));
    return token || undefined;
  }

  async createIntegrationToken(token: InsertIntegrationToken): Promise<IntegrationToken> {
    const [created] = await db.insert(integrationTokens).values(token).returning();
    return created;
  }

  async updateIntegrationToken(id: string, updates: Partial<InsertIntegrationToken>): Promise<IntegrationToken | undefined> {
    const [updated] = await db.update(integrationTokens)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrationTokens.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteIntegrationToken(id: string): Promise<void> {
    await db.delete(integrationTokens).where(eq(integrationTokens.id, id));
  }

  // Analytics Snapshots
  async getAnalyticsSnapshots(supplierId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsSnapshot[]> {
    const conditions = [eq(analyticsSnapshots.supplierId, supplierId)];
    if (startDate) conditions.push(gte(analyticsSnapshots.snapshotDate, startDate));
    if (endDate) conditions.push(lte(analyticsSnapshots.snapshotDate, endDate));
    
    return db.select().from(analyticsSnapshots)
      .where(and(...conditions))
      .orderBy(desc(analyticsSnapshots.snapshotDate));
  }

  async createAnalyticsSnapshot(snapshot: InsertAnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    const [created] = await db.insert(analyticsSnapshots).values(snapshot).returning();
    return created;
  }

  // Price Comparison
  async getRetailerConfigs(): Promise<RetailerConfig[]> {
    return db.select().from(retailerConfigs).where(eq(retailerConfigs.isActive, true));
  }

  async getExternalProductsByInternalId(internalProductId: string): Promise<ExternalProduct[]> {
    return db.select().from(externalProducts)
      .where(eq(externalProducts.internalProductId, internalProductId))
      .orderBy(desc(externalProducts.currentPrice));
  }

  async createExternalProduct(product: InsertExternalProduct): Promise<ExternalProduct> {
    const [created] = await db.insert(externalProducts).values(product).returning();
    return created;
  }

  async updateExternalProduct(id: string, updates: Partial<InsertExternalProduct>): Promise<ExternalProduct | undefined> {
    const [updated] = await db.update(externalProducts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(externalProducts.id, id))
      .returning();
    return updated || undefined;
  }

  async createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory> {
    const [created] = await db.insert(priceHistory).values(history).returning();
    return created;
  }

  async getPriceHistory(externalProductId: string, limit = 30): Promise<PriceHistory[]> {
    return db.select().from(priceHistory)
      .where(eq(priceHistory.externalProductId, externalProductId))
      .orderBy(desc(priceHistory.checkedAt))
      .limit(limit);
  }

  async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return db.select().from(priceAlerts)
      .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.status, 'active')))
      .orderBy(desc(priceAlerts.createdAt));
  }

  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [created] = await db.insert(priceAlerts).values(alert).returning();
    return created;
  }

  async updatePriceAlert(id: string, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined> {
    const [updated] = await db.update(priceAlerts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(priceAlerts.id, id))
      .returning();
    return updated || undefined;
  }

  async createAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick> {
    const [created] = await db.insert(affiliateClicks).values(click).returning();
    return created;
  }

  async createAffiliateConversion(conversion: InsertAffiliateConversion): Promise<AffiliateConversion> {
    const [created] = await db.insert(affiliateConversions).values(conversion).returning();
    return created;
  }

  // Stylist Applications
  async getStylistApplicationById(id: string): Promise<StylistApplication | undefined> {
    const [application] = await db.select().from(stylistApplications).where(eq(stylistApplications.id, id));
    return application || undefined;
  }

  async getStylistApplicationByUserId(userId: string): Promise<StylistApplication | undefined> {
    const [application] = await db.select().from(stylistApplications).where(eq(stylistApplications.userId, userId));
    return application || undefined;
  }

  async getAllStylistApplications(status?: 'pending' | 'approved' | 'rejected'): Promise<StylistApplication[]> {
    if (status) {
      return db.select().from(stylistApplications)
        .where(eq(stylistApplications.status, status))
        .orderBy(desc(stylistApplications.submittedAt));
    }
    return db.select().from(stylistApplications).orderBy(desc(stylistApplications.submittedAt));
  }

  async createStylistApplication(application: InsertStylistApplication): Promise<StylistApplication> {
    const [created] = await db.insert(stylistApplications).values(application).returning();
    return created;
  }

  async updateStylistApplication(id: string, updates: Partial<StylistApplication>): Promise<StylistApplication | undefined> {
    const [updated] = await db.update(stylistApplications)
      .set(updates)
      .where(eq(stylistApplications.id, id))
      .returning();
    return updated || undefined;
  }

  // Stylist Profiles
  async getStylistProfileById(id: string): Promise<StylistProfile | undefined> {
    const [profile] = await db.select().from(stylistProfiles).where(eq(stylistProfiles.id, id));
    return profile || undefined;
  }

  async getStylistProfileByUserId(userId: string): Promise<StylistProfile | undefined> {
    const [profile] = await db.select().from(stylistProfiles).where(eq(stylistProfiles.userId, userId));
    return profile || undefined;
  }

  async getStylistProfileByHandle(handle: string): Promise<StylistProfile | undefined> {
    const [profile] = await db.select().from(stylistProfiles).where(eq(stylistProfiles.handle, handle));
    return profile || undefined;
  }

  async browseStylistProfiles(filters: { specialty?: string; tags?: string[]; location?: string; search?: string }): Promise<StylistProfile[]> {
    let query = db.select().from(stylistProfiles).where(eq(stylistProfiles.isActive, true));
    
    if (filters.location) {
      query = query.where(eq(stylistProfiles.location, filters.location)) as any;
    }
    
    if (filters.search) {
      query = query.where(
        sql`${stylistProfiles.displayName} ILIKE ${'%' + filters.search + '%'} OR ${stylistProfiles.handle} ILIKE ${'%' + filters.search + '%'}`
      ) as any;
    }
    
    return query.orderBy(desc(stylistProfiles.totalFollowers));
  }

  async createStylistProfile(profile: InsertStylistProfile): Promise<StylistProfile> {
    const [created] = await db.insert(stylistProfiles).values(profile).returning();
    return created;
  }

  async updateStylistProfile(id: string, updates: Partial<InsertStylistProfile>): Promise<StylistProfile | undefined> {
    const [updated] = await db.update(stylistProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(stylistProfiles.id, id))
      .returning();
    return updated || undefined;
  }

  // Stylist Portfolio Items
  async getStylistPortfolioItemById(id: string): Promise<StylistPortfolioItem | undefined> {
    const [item] = await db.select().from(stylistPortfolioItems).where(eq(stylistPortfolioItems.id, id));
    return item || undefined;
  }

  async getStylistPortfolioItems(stylistId: string): Promise<StylistPortfolioItem[]> {
    return db.select().from(stylistPortfolioItems)
      .where(eq(stylistPortfolioItems.stylistId, stylistId))
      .orderBy(desc(stylistPortfolioItems.uploadedAt));
  }

  async createStylistPortfolioItem(item: InsertStylistPortfolioItem): Promise<StylistPortfolioItem> {
    const [created] = await db.insert(stylistPortfolioItems).values(item).returning();
    return created;
  }

  async updateStylistPortfolioItem(id: string, updates: Partial<InsertStylistPortfolioItem>): Promise<StylistPortfolioItem | undefined> {
    const [updated] = await db.update(stylistPortfolioItems)
      .set(updates)
      .where(eq(stylistPortfolioItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStylistPortfolioItem(id: string): Promise<void> {
    await db.delete(stylistPortfolioItems).where(eq(stylistPortfolioItems.id, id));
  }

  // Stylist RFQs
  async getStylistRfqById(id: string): Promise<StylistRfq | undefined> {
    const [rfq] = await db.select().from(stylistRfqs).where(eq(stylistRfqs.id, id));
    return rfq || undefined;
  }

  async getStylistRfqs(stylistId: string): Promise<StylistRfq[]> {
    return db.select().from(stylistRfqs)
      .where(eq(stylistRfqs.stylistId, stylistId))
      .orderBy(desc(stylistRfqs.createdAt));
  }

  async createStylistRfq(rfq: InsertStylistRfq): Promise<StylistRfq> {
    const [created] = await db.insert(stylistRfqs).values(rfq).returning();
    return created;
  }

  async updateStylistRfq(id: string, updates: Partial<StylistRfq>): Promise<StylistRfq | undefined> {
    const [updated] = await db.update(stylistRfqs)
      .set(updates)
      .where(eq(stylistRfqs.id, id))
      .returning();
    return updated || undefined;
  }

  // Stylist Followers
  async followStylist(userId: string, stylistId: string): Promise<void> {
    await db.insert(stylistFollowers).values({ userId, stylistId }).onConflictDoNothing();
  }

  async unfollowStylist(userId: string, stylistId: string): Promise<void> {
    await db.delete(stylistFollowers)
      .where(and(eq(stylistFollowers.userId, userId), eq(stylistFollowers.stylistId, stylistId)));
  }

  // Stylist Reviews
  async getStylistReviews(stylistId: string): Promise<StylistReview[]> {
    return db.select().from(stylistReviews)
      .where(eq(stylistReviews.stylistId, stylistId))
      .orderBy(desc(stylistReviews.createdAt));
  }

  async createStylistReview(review: InsertStylistReview): Promise<StylistReview> {
    const [created] = await db.insert(stylistReviews).values(review).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
