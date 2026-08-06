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
  aiTrainingResponses, aiStylistPrompts, conversationCredits, aiSubscriptions,
  type AiTrainingResponse, type InsertAiTrainingResponse,
  type AiStylistPrompt, type InsertAiStylistPrompt,
  type ConversationCredit, type InsertConversationCredit,
  type AiSubscription, type InsertAiSubscription,
  creatorTiers, creatorPosts, creatorSubscriptions, creatorTips, creatorCustomRequests, moderationFlags, creatorPayouts,
  type CreatorTier, type InsertCreatorTier,
  type CreatorPost, type InsertCreatorPost,
  type CreatorSubscription, type InsertCreatorSubscription,
  type CreatorTip, type InsertCreatorTip,
  type CreatorCustomRequest, type InsertCreatorCustomRequest,
  type ModerationFlag, type InsertModerationFlag,
  type CreatorPayout, type InsertCreatorPayout,
  // Virtual Try-On (TryFit Integration)
  tryOnModels, userTryOnPhotos, tryOnSessions, tryOnFeedback, tryOnCloset,
  type TryOnModel, type InsertTryOnModel,
  type UserTryOnPhoto, type InsertUserTryOnPhoto,
  type TryOnSession, type InsertTryOnSession,
  type TryOnFeedback, type InsertTryOnFeedback,
  type TryOnClosetItem, type InsertTryOnClosetItem,
  // Enhanced Try-On Tables
  tryonGarments, tryonUsage, tryonResults, tryonShares, tryonVotes, fitFeedback, userBrandPreferences,
  type TryonGarment, type InsertTryonGarment,
  type TryonUsage, type InsertTryonUsage,
  type TryonResult, type InsertTryonResult,
  type TryonShare, type InsertTryonShare,
  type TryonVote, type InsertTryonVote,
  type FitFeedback, type InsertFitFeedback,
  type UserBrandPreference, type InsertUserBrandPreference,
  // Style Quiz & Dashboard Tables
  userStyleProfiles, userClosetItems, outfitRecommendations, userSubscriptions,
  type UserStyleProfile, type InsertUserStyleProfile,
  type UserClosetItem, type InsertUserClosetItem,
  type OutfitRecommendation, type InsertOutfitRecommendation,
  type UserSubscription, type InsertUserSubscription,
  // Situational Styling Engine
  anonymousSessions, sessionOutfits, leads, engagementEvents,
  type AnonymousSession, type InsertAnonymousSession,
  type SessionOutfit, type InsertSessionOutfit,
  type Lead, type InsertLead,
  type EngagementEvent, type InsertEngagementEvent,
  // Gig Economy
  gigProviders, gigServices, gigAvailability, gigJobs, gigQuotes, gigMessages, gigReviews,
  type GigProvider, type InsertGigProvider,
  type GigService, type InsertGigService,
  type GigJob, type InsertGigJob,
  type GigQuote, type InsertGigQuote,
  type GigMessage, type InsertGigMessage,
  type GigReview, type InsertGigReview,
  // Social Closet
  styleGroups, styleGroupMembers, borrowRequests, haulPosts, haulPostReactions,
  outfitPolls, outfitPollVotes, closetSales, closetSaleInterests,
  donationLogs, closetIdleAlerts,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, ne, isNull, sql, inArray, or, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
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
  
  // AI Training Responses
  getTrainingResponses(stylistId: string): Promise<AiTrainingResponse[]>;
  getTrainingResponsesByCategory(stylistId: string, category: string): Promise<AiTrainingResponse[]>;
  saveTrainingResponse(response: InsertAiTrainingResponse): Promise<AiTrainingResponse>;
  updateTrainingResponse(id: string, answer: string): Promise<AiTrainingResponse | undefined>;
  deleteTrainingResponse(id: string): Promise<void>;
  
  // AI Stylist Prompts
  getStylistPrompt(stylistId: string): Promise<AiStylistPrompt | undefined>;
  createStylistPrompt(prompt: InsertAiStylistPrompt): Promise<AiStylistPrompt>;
  updateStylistPrompt(stylistId: string, updates: Partial<InsertAiStylistPrompt>): Promise<AiStylistPrompt | undefined>;
  
  // Conversation Credits
  getConversationCredit(userId: string, stylistId: string): Promise<ConversationCredit | undefined>;
  createConversationCredit(credit: InsertConversationCredit): Promise<ConversationCredit>;
  updateConversationCredit(id: string, updates: Partial<ConversationCredit>): Promise<ConversationCredit | undefined>;
  
  // AI Subscriptions
  getAiSubscription(userId: string, stylistId: string): Promise<AiSubscription | undefined>;
  getUserAiSubscriptions(userId: string): Promise<AiSubscription[]>;
  getStylistAiSubscriptions(stylistId: string): Promise<AiSubscription[]>;
  createAiSubscription(subscription: InsertAiSubscription): Promise<AiSubscription>;
  updateAiSubscription(id: string, updates: Partial<AiSubscription>): Promise<AiSubscription | undefined>;
  cancelAiSubscription(id: string): Promise<AiSubscription | undefined>;
  
  // Creator Studio - Tiers
  getCreatorTiers(stylistId: string): Promise<CreatorTier[]>;
  getCreatorTier(id: string): Promise<CreatorTier | undefined>;
  createCreatorTier(tier: InsertCreatorTier): Promise<CreatorTier>;
  updateCreatorTier(id: string, updates: Partial<InsertCreatorTier>): Promise<CreatorTier | undefined>;
  deleteCreatorTier(id: string): Promise<void>;
  
  // Creator Studio - Posts
  getCreatorPosts(stylistId: string, isPublic?: boolean): Promise<CreatorPost[]>;
  getCreatorPost(id: string): Promise<CreatorPost | undefined>;
  createCreatorPost(post: InsertCreatorPost): Promise<CreatorPost>;
  updateCreatorPost(id: string, updates: Partial<InsertCreatorPost>): Promise<CreatorPost | undefined>;
  deleteCreatorPost(id: string): Promise<void>;
  incrementPostView(id: string): Promise<void>;
  
  // Creator Studio - Subscriptions
  getCreatorSubscription(userId: string, stylistId: string): Promise<CreatorSubscription | undefined>;
  getUserCreatorSubscriptions(userId: string): Promise<CreatorSubscription[]>;
  getStylistCreatorSubscriptions(stylistId: string): Promise<CreatorSubscription[]>;
  createCreatorSubscription(subscription: InsertCreatorSubscription): Promise<CreatorSubscription>;
  updateCreatorSubscription(id: string, updates: Partial<CreatorSubscription>): Promise<CreatorSubscription | undefined>;
  cancelCreatorSubscription(id: string): Promise<CreatorSubscription | undefined>;
  
  // Creator Studio - Tips
  getCreatorTips(stylistId: string): Promise<CreatorTip[]>;
  createCreatorTip(tip: InsertCreatorTip): Promise<CreatorTip>;
  
  // Creator Studio - Custom Requests (RFQ)
  getCreatorCustomRequests(stylistId: string): Promise<CreatorCustomRequest[]>;
  getUserCustomRequestsCreator(userId: string): Promise<CreatorCustomRequest[]>;
  getCreatorCustomRequest(id: string): Promise<CreatorCustomRequest | undefined>;
  createCreatorCustomRequest(request: InsertCreatorCustomRequest): Promise<CreatorCustomRequest>;
  updateCreatorCustomRequest(id: string, updates: Partial<CreatorCustomRequest>): Promise<CreatorCustomRequest | undefined>;
  
  // Creator Studio - Moderation
  getModerationFlags(status?: string): Promise<ModerationFlag[]>;
  getModerationFlag(id: string): Promise<ModerationFlag | undefined>;
  createModerationFlag(flag: InsertModerationFlag): Promise<ModerationFlag>;
  updateModerationFlag(id: string, updates: Partial<ModerationFlag>): Promise<ModerationFlag | undefined>;
  
  // Creator Studio - Payouts
  getCreatorPayouts(stylistId: string): Promise<CreatorPayout[]>;
  getCreatorPayout(id: string): Promise<CreatorPayout | undefined>;
  createCreatorPayout(payout: InsertCreatorPayout): Promise<CreatorPayout>;
  updateCreatorPayout(id: string, updates: Partial<CreatorPayout>): Promise<CreatorPayout | undefined>;
  
  // Virtual Try-On (TryFit Integration)
  // Models
  getTryOnModels(filters?: { gender?: string; bodyType?: string }): Promise<TryOnModel[]>;
  getTryOnModel(id: string): Promise<TryOnModel | undefined>;
  createTryOnModel(model: InsertTryOnModel): Promise<TryOnModel>;
  updateTryOnModel(id: string, updates: Partial<InsertTryOnModel>): Promise<TryOnModel | undefined>;
  
  // User Photos
  getUserTryOnPhotos(userId: string): Promise<UserTryOnPhoto[]>;
  getUserTryOnPhoto(id: string): Promise<UserTryOnPhoto | undefined>;
  createUserTryOnPhoto(photo: InsertUserTryOnPhoto): Promise<UserTryOnPhoto>;
  updateUserTryOnPhoto(id: string, updates: Partial<InsertUserTryOnPhoto>): Promise<UserTryOnPhoto | undefined>;
  deleteUserTryOnPhoto(id: string): Promise<void>;
  
  // Try-On Sessions
  getTryOnSession(id: string): Promise<TryOnSession | undefined>;
  getTryOnSessionByShareToken(shareToken: string): Promise<TryOnSession | undefined>;
  getUserTryOnSessions(userId: string): Promise<TryOnSession[]>;
  createTryOnSession(session: InsertTryOnSession): Promise<TryOnSession>;
  updateTryOnSession(id: string, updates: Partial<TryOnSession>): Promise<TryOnSession | undefined>;
  incrementTryOnSessionViews(id: string): Promise<void>;
  
  // Try-On Feedback
  getTryOnFeedback(sessionId: string): Promise<TryOnFeedback[]>;
  createTryOnFeedback(feedback: InsertTryOnFeedback): Promise<TryOnFeedback>;
  
  // Try-On Closet
  getUserTryOnCloset(userId: string): Promise<TryOnClosetItem[]>;
  addToTryOnCloset(item: InsertTryOnClosetItem): Promise<TryOnClosetItem>;
  removeFromTryOnCloset(userId: string, productId: string): Promise<void>;
  isInTryOnCloset(userId: string, productId: string): Promise<boolean>;
  
  // Enhanced Try-On - Garments
  getTryonGarments(filters?: { category?: string; stylistId?: string; isPublic?: boolean }): Promise<TryonGarment[]>;
  getTryonGarment(id: string): Promise<TryonGarment | undefined>;
  createTryonGarment(garment: InsertTryonGarment): Promise<TryonGarment>;
  updateTryonGarment(id: string, updates: Partial<InsertTryonGarment>): Promise<TryonGarment | undefined>;
  deleteTryonGarment(id: string): Promise<void>;
  
  // Enhanced Try-On - Usage (Rate Limiting)
  getTryonUsage(userId: string, date: string): Promise<TryonUsage | undefined>;
  incrementTryonUsage(userId: string, date: string): Promise<TryonUsage>;
  
  // Enhanced Try-On - Results
  getTryonResult(id: string): Promise<TryonResult | undefined>;
  getTryonResultsBySession(sessionId: string): Promise<TryonResult[]>;
  createTryonResult(result: InsertTryonResult): Promise<TryonResult>;
  updateTryonResult(id: string, updates: Partial<InsertTryonResult>): Promise<TryonResult | undefined>;
  
  // Enhanced Try-On - Shares
  getTryonShare(id: string): Promise<TryonShare | undefined>;
  getTryonShareByCode(shareCode: string): Promise<TryonShare | undefined>;
  createTryonShare(share: InsertTryonShare): Promise<TryonShare>;
  updateTryonShare(id: string, updates: Partial<TryonShare>): Promise<TryonShare | undefined>;
  
  // Enhanced Try-On - Votes
  getTryonVotesByShare(shareId: string): Promise<TryonVote[]>;
  getUserVoteOnShare(shareId: string, voterId?: string, voterIp?: string): Promise<TryonVote | undefined>;
  createTryonVote(vote: InsertTryonVote): Promise<TryonVote>;
  
  // Enhanced Try-On - Fit Feedback
  getUserFitFeedback(userId: string): Promise<FitFeedback[]>;
  createFitFeedback(feedback: InsertFitFeedback): Promise<FitFeedback>;
  
  // Enhanced Try-On - Brand Preferences
  getUserBrandPreference(userId: string, brand: string): Promise<UserBrandPreference | undefined>;
  getUserBrandPreferences(userId: string): Promise<UserBrandPreference[]>;
  upsertUserBrandPreference(preference: InsertUserBrandPreference): Promise<UserBrandPreference>;

  // Situational Styling Engine
  createAnonymousSession(data: InsertAnonymousSession): Promise<AnonymousSession>;
  createSessionOutfit(data: InsertSessionOutfit): Promise<SessionOutfit>;
  createLead(data: InsertLead): Promise<Lead>;
  createEngagementEvent(data: InsertEngagementEvent): Promise<EngagementEvent>;
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

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
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

  async getCreatorsWithStats(): Promise<any[]> {
    // Fetch all stylist profiles with their associated users
    const stylistProfilesData = await db
      .select()
      .from(stylistProfiles);

    // For each stylist profile, fetch the associated user and stats
    const creatorStats = await Promise.all(
      stylistProfilesData.map(async (profile: any) => {
        // Get the user account
        let userAccount = null;
        if (profile.userId) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, profile.userId));
          userAccount = user;
        } else if (profile.supplierId) {
          const [supplier] = await db
            .select()
            .from(supplierAccounts)
            .where(eq(supplierAccounts.id, profile.supplierId));
          userAccount = supplier;
        }

        if (!userAccount) {
          return null;
        }

        // Count active subscriptions
        const [subResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(creatorSubscriptions)
          .where(
            and(
              eq(creatorSubscriptions.stylistId, profile.id),
              eq(creatorSubscriptions.status, 'active')
            )
          );
        const subscriptionCount = subResult?.count || 0;

        // Sum total tips revenue
        const [tipsResult] = await db
          .select({ sum: sql<number>`COALESCE(SUM(amount_cents), 0)::int` })
          .from(creatorTips)
          .where(eq(creatorTips.stylistId, profile.id));
        const totalTips = tipsResult?.sum || 0;

        // Count total posts
        const [postsResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(creatorPosts)
          .where(eq(creatorPosts.stylistId, profile.id));
        const postCount = postsResult?.count || 0;

        // Count total views across all posts
        const [viewsResult] = await db
          .select({ sum: sql<number>`COALESCE(SUM(view_count), 0)::int` })
          .from(creatorPosts)
          .where(eq(creatorPosts.stylistId, profile.id));
        const totalViews = viewsResult?.sum || 0;

        return {
          id: userAccount.id,
          email: userAccount.email,
          name: userAccount.name,
          isVerified: profile.isVerified,
          isActive: profile.isActive,
          stylistProfile: profile,
          stats: {
            subscribers: subscriptionCount,
            totalRevenue: totalTips,
            posts: postCount,
            totalViews: totalViews,
          },
        };
      })
    );

    // Filter out nulls
    return creatorStats.filter(c => c !== null);
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
  
  // AI Training Responses
  async getTrainingResponses(stylistId: string): Promise<AiTrainingResponse[]> {
    return await db.select().from(aiTrainingResponses).where(eq(aiTrainingResponses.stylistId, stylistId));
  }
  
  async getTrainingResponsesByCategory(stylistId: string, category: string): Promise<AiTrainingResponse[]> {
    return await db.select().from(aiTrainingResponses).where(
      and(
        eq(aiTrainingResponses.stylistId, stylistId),
        eq(aiTrainingResponses.category, category)
      )
    );
  }
  
  async saveTrainingResponse(response: InsertAiTrainingResponse): Promise<AiTrainingResponse> {
    const [created] = await db.insert(aiTrainingResponses).values(response).returning();
    return created;
  }
  
  async updateTrainingResponse(id: string, answer: string): Promise<AiTrainingResponse | undefined> {
    const [updated] = await db.update(aiTrainingResponses)
      .set({ answer, updatedAt: new Date() })
      .where(eq(aiTrainingResponses.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteTrainingResponse(id: string): Promise<void> {
    await db.delete(aiTrainingResponses).where(eq(aiTrainingResponses.id, id));
  }
  
  // AI Stylist Prompts
  async getStylistPrompt(stylistId: string): Promise<AiStylistPrompt | undefined> {
    const [prompt] = await db.select().from(aiStylistPrompts).where(eq(aiStylistPrompts.stylistId, stylistId));
    return prompt || undefined;
  }
  
  async createStylistPrompt(prompt: InsertAiStylistPrompt): Promise<AiStylistPrompt> {
    const [created] = await db.insert(aiStylistPrompts).values(prompt).returning();
    return created;
  }
  
  async updateStylistPrompt(stylistId: string, updates: Partial<InsertAiStylistPrompt>): Promise<AiStylistPrompt | undefined> {
    const [updated] = await db.update(aiStylistPrompts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiStylistPrompts.stylistId, stylistId))
      .returning();
    return updated || undefined;
  }
  
  // Conversation Credits
  async getConversationCredit(userId: string, stylistId: string): Promise<ConversationCredit | undefined> {
    const [credit] = await db.select().from(conversationCredits).where(
      and(
        eq(conversationCredits.userId, userId),
        eq(conversationCredits.stylistId, stylistId)
      )
    );
    return credit || undefined;
  }
  
  async createConversationCredit(credit: InsertConversationCredit): Promise<ConversationCredit> {
    const [created] = await db.insert(conversationCredits).values(credit).returning();
    return created;
  }
  
  async updateConversationCredit(id: string, updates: Partial<ConversationCredit>): Promise<ConversationCredit | undefined> {
    const [updated] = await db.update(conversationCredits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversationCredits.id, id))
      .returning();
    return updated || undefined;
  }
  
  // AI Subscriptions
  async getAiSubscription(userId: string, stylistId: string): Promise<AiSubscription | undefined> {
    const [subscription] = await db.select().from(aiSubscriptions).where(
      and(
        eq(aiSubscriptions.userId, userId),
        eq(aiSubscriptions.stylistId, stylistId),
        eq(aiSubscriptions.status, "active")
      )
    );
    return subscription || undefined;
  }
  
  async getUserAiSubscriptions(userId: string): Promise<AiSubscription[]> {
    return await db.select().from(aiSubscriptions).where(eq(aiSubscriptions.userId, userId));
  }
  
  async getStylistAiSubscriptions(stylistId: string): Promise<AiSubscription[]> {
    return await db.select().from(aiSubscriptions).where(
      and(
        eq(aiSubscriptions.stylistId, stylistId),
        eq(aiSubscriptions.status, "active")
      )
    );
  }
  
  async createAiSubscription(subscription: InsertAiSubscription): Promise<AiSubscription> {
    const [created] = await db.insert(aiSubscriptions).values(subscription).returning();
    return created;
  }
  
  async updateAiSubscription(id: string, updates: Partial<AiSubscription>): Promise<AiSubscription | undefined> {
    const [updated] = await db.update(aiSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiSubscriptions.id, id))
      .returning();
    return updated || undefined;
  }
  
  async cancelAiSubscription(id: string): Promise<AiSubscription | undefined> {
    const [cancelled] = await db.update(aiSubscriptions)
      .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
      .where(eq(aiSubscriptions.id, id))
      .returning();
    return cancelled || undefined;
  }
  
  // Creator Studio - Tiers
  async getCreatorTiers(stylistId: string): Promise<CreatorTier[]> {
    return await db.select().from(creatorTiers).where(eq(creatorTiers.stylistId, stylistId));
  }
  
  async getCreatorTier(id: string): Promise<CreatorTier | undefined> {
    const [tier] = await db.select().from(creatorTiers).where(eq(creatorTiers.id, id));
    return tier || undefined;
  }
  
  async createCreatorTier(tier: InsertCreatorTier): Promise<CreatorTier> {
    const [created] = await db.insert(creatorTiers).values(tier).returning();
    return created;
  }
  
  async updateCreatorTier(id: string, updates: Partial<InsertCreatorTier>): Promise<CreatorTier | undefined> {
    const [updated] = await db.update(creatorTiers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(creatorTiers.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteCreatorTier(id: string): Promise<void> {
    await db.delete(creatorTiers).where(eq(creatorTiers.id, id));
  }
  
  // Creator Studio - Posts
  async getCreatorPosts(stylistId: string, isPublic?: boolean): Promise<CreatorPost[]> {
    if (isPublic !== undefined) {
      return await db.select().from(creatorPosts).where(
        and(
          eq(creatorPosts.stylistId, stylistId),
          eq(creatorPosts.isPublic, isPublic)
        )
      ).orderBy(desc(creatorPosts.createdAt));
    }
    return await db.select().from(creatorPosts)
      .where(eq(creatorPosts.stylistId, stylistId))
      .orderBy(desc(creatorPosts.createdAt));
  }
  
  async getCreatorPost(id: string): Promise<CreatorPost | undefined> {
    const [post] = await db.select().from(creatorPosts).where(eq(creatorPosts.id, id));
    return post || undefined;
  }
  
  async createCreatorPost(post: InsertCreatorPost): Promise<CreatorPost> {
    const [created] = await db.insert(creatorPosts).values(post).returning();
    return created;
  }
  
  async updateCreatorPost(id: string, updates: Partial<InsertCreatorPost>): Promise<CreatorPost | undefined> {
    const [updated] = await db.update(creatorPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(creatorPosts.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteCreatorPost(id: string): Promise<void> {
    await db.delete(creatorPosts).where(eq(creatorPosts.id, id));
  }
  
  async incrementPostView(id: string): Promise<void> {
    await db.update(creatorPosts)
      .set({ viewCount: sql`${creatorPosts.viewCount} + 1` })
      .where(eq(creatorPosts.id, id));
  }
  
  // Creator Studio - Subscriptions
  async getCreatorSubscription(userId: string, stylistId: string): Promise<CreatorSubscription | undefined> {
    const [subscription] = await db.select().from(creatorSubscriptions).where(
      and(
        eq(creatorSubscriptions.userId, userId),
        eq(creatorSubscriptions.stylistId, stylistId),
        eq(creatorSubscriptions.status, "active")
      )
    );
    return subscription || undefined;
  }
  
  async getUserCreatorSubscriptions(userId: string): Promise<CreatorSubscription[]> {
    return await db.select().from(creatorSubscriptions).where(eq(creatorSubscriptions.userId, userId));
  }
  
  async getStylistCreatorSubscriptions(stylistId: string): Promise<CreatorSubscription[]> {
    return await db.select().from(creatorSubscriptions).where(
      and(
        eq(creatorSubscriptions.stylistId, stylistId),
        eq(creatorSubscriptions.status, "active")
      )
    );
  }
  
  async createCreatorSubscription(subscription: InsertCreatorSubscription): Promise<CreatorSubscription> {
    const [created] = await db.insert(creatorSubscriptions).values(subscription).returning();
    return created;
  }
  
  async updateCreatorSubscription(id: string, updates: Partial<CreatorSubscription>): Promise<CreatorSubscription | undefined> {
    const [updated] = await db.update(creatorSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(creatorSubscriptions.id, id))
      .returning();
    return updated || undefined;
  }
  
  async cancelCreatorSubscription(id: string): Promise<CreatorSubscription | undefined> {
    const [cancelled] = await db.update(creatorSubscriptions)
      .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
      .where(eq(creatorSubscriptions.id, id))
      .returning();
    return cancelled || undefined;
  }
  
  // Creator Studio - Tips
  async getCreatorTips(stylistId: string): Promise<CreatorTip[]> {
    return await db.select().from(creatorTips)
      .where(eq(creatorTips.stylistId, stylistId))
      .orderBy(desc(creatorTips.createdAt));
  }
  
  async createCreatorTip(tip: InsertCreatorTip): Promise<CreatorTip> {
    const [created] = await db.insert(creatorTips).values(tip).returning();
    return created;
  }
  
  // Creator Studio - Custom Requests (RFQ)
  async getCreatorCustomRequests(stylistId: string): Promise<CreatorCustomRequest[]> {
    return await db.select().from(creatorCustomRequests)
      .where(eq(creatorCustomRequests.stylistId, stylistId))
      .orderBy(desc(creatorCustomRequests.createdAt));
  }
  
  async getUserCustomRequestsCreator(userId: string): Promise<CreatorCustomRequest[]> {
    return await db.select().from(creatorCustomRequests)
      .where(eq(creatorCustomRequests.userId, userId))
      .orderBy(desc(creatorCustomRequests.createdAt));
  }
  
  async getCreatorCustomRequest(id: string): Promise<CreatorCustomRequest | undefined> {
    const [request] = await db.select().from(creatorCustomRequests).where(eq(creatorCustomRequests.id, id));
    return request || undefined;
  }
  
  async createCreatorCustomRequest(request: InsertCreatorCustomRequest): Promise<CreatorCustomRequest> {
    const [created] = await db.insert(creatorCustomRequests).values(request).returning();
    return created;
  }
  
  async updateCreatorCustomRequest(id: string, updates: Partial<CreatorCustomRequest>): Promise<CreatorCustomRequest | undefined> {
    const [updated] = await db.update(creatorCustomRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(creatorCustomRequests.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Creator Studio - Moderation
  async getModerationFlags(status?: string): Promise<ModerationFlag[]> {
    if (status) {
      return await db.select().from(moderationFlags)
        .where(eq(moderationFlags.status, status as any))
        .orderBy(desc(moderationFlags.createdAt));
    }
    return await db.select().from(moderationFlags).orderBy(desc(moderationFlags.createdAt));
  }
  
  async getModerationFlag(id: string): Promise<ModerationFlag | undefined> {
    const [flag] = await db.select().from(moderationFlags).where(eq(moderationFlags.id, id));
    return flag || undefined;
  }
  
  async createModerationFlag(flag: InsertModerationFlag): Promise<ModerationFlag> {
    const [created] = await db.insert(moderationFlags).values(flag).returning();
    return created;
  }
  
  async updateModerationFlag(id: string, updates: Partial<ModerationFlag>): Promise<ModerationFlag | undefined> {
    const [updated] = await db.update(moderationFlags)
      .set(updates)
      .where(eq(moderationFlags.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Creator Studio - Payouts
  async getCreatorPayouts(stylistId: string): Promise<CreatorPayout[]> {
    return await db.select().from(creatorPayouts)
      .where(eq(creatorPayouts.stylistId, stylistId))
      .orderBy(desc(creatorPayouts.createdAt));
  }
  
  async getCreatorPayout(id: string): Promise<CreatorPayout | undefined> {
    const [payout] = await db.select().from(creatorPayouts).where(eq(creatorPayouts.id, id));
    return payout || undefined;
  }
  
  async createCreatorPayout(payout: InsertCreatorPayout): Promise<CreatorPayout> {
    const [created] = await db.insert(creatorPayouts).values(payout).returning();
    return created;
  }
  
  async updateCreatorPayout(id: string, updates: Partial<CreatorPayout>): Promise<CreatorPayout | undefined> {
    const [updated] = await db.update(creatorPayouts)
      .set(updates)
      .where(eq(creatorPayouts.id, id))
      .returning();
    return updated || undefined;
  }
  
  // ============================================
  // VIRTUAL TRY-ON (TryFit Integration)
  // ============================================
  
  // Try-On Models
  async getTryOnModels(filters?: { gender?: string; bodyType?: string }): Promise<TryOnModel[]> {
    let query = db.select().from(tryOnModels).where(eq(tryOnModels.isActive, true));
    
    if (filters?.gender) {
      query = db.select().from(tryOnModels)
        .where(and(
          eq(tryOnModels.isActive, true),
          eq(tryOnModels.gender, filters.gender)
        ));
    }
    if (filters?.bodyType) {
      query = db.select().from(tryOnModels)
        .where(and(
          eq(tryOnModels.isActive, true),
          eq(tryOnModels.bodyType, filters.bodyType)
        ));
    }
    
    return await query;
  }
  
  async getTryOnModel(id: string): Promise<TryOnModel | undefined> {
    const [model] = await db.select().from(tryOnModels).where(eq(tryOnModels.id, id));
    return model || undefined;
  }
  
  async createTryOnModel(model: InsertTryOnModel): Promise<TryOnModel> {
    const [created] = await db.insert(tryOnModels).values(model).returning();
    return created;
  }
  
  async updateTryOnModel(id: string, updates: Partial<InsertTryOnModel>): Promise<TryOnModel | undefined> {
    const [updated] = await db.update(tryOnModels)
      .set(updates)
      .where(eq(tryOnModels.id, id))
      .returning();
    return updated || undefined;
  }
  
  // User Try-On Photos
  async getUserTryOnPhotos(userId: string): Promise<UserTryOnPhoto[]> {
    return await db.select().from(userTryOnPhotos)
      .where(eq(userTryOnPhotos.userId, userId))
      .orderBy(desc(userTryOnPhotos.createdAt));
  }
  
  async getUserTryOnPhoto(id: string): Promise<UserTryOnPhoto | undefined> {
    const [photo] = await db.select().from(userTryOnPhotos).where(eq(userTryOnPhotos.id, id));
    return photo || undefined;
  }
  
  async createUserTryOnPhoto(photo: InsertUserTryOnPhoto): Promise<UserTryOnPhoto> {
    const [created] = await db.insert(userTryOnPhotos).values(photo).returning();
    return created;
  }
  
  async updateUserTryOnPhoto(id: string, updates: Partial<InsertUserTryOnPhoto>): Promise<UserTryOnPhoto | undefined> {
    const [updated] = await db.update(userTryOnPhotos)
      .set(updates)
      .where(eq(userTryOnPhotos.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteUserTryOnPhoto(id: string): Promise<void> {
    await db.delete(userTryOnPhotos).where(eq(userTryOnPhotos.id, id));
  }
  
  // Try-On Sessions
  async getTryOnSession(id: string): Promise<TryOnSession | undefined> {
    const [session] = await db.select().from(tryOnSessions).where(eq(tryOnSessions.id, id));
    return session || undefined;
  }
  
  async getTryOnSessionByShareToken(shareToken: string): Promise<TryOnSession | undefined> {
    const [session] = await db.select().from(tryOnSessions).where(eq(tryOnSessions.shareToken, shareToken));
    return session || undefined;
  }
  
  async getUserTryOnSessions(userId: string): Promise<TryOnSession[]> {
    return await db.select().from(tryOnSessions)
      .where(eq(tryOnSessions.userId, userId))
      .orderBy(desc(tryOnSessions.createdAt));
  }
  
  async createTryOnSession(session: InsertTryOnSession): Promise<TryOnSession> {
    const [created] = await db.insert(tryOnSessions).values(session).returning();
    return created;
  }
  
  async updateTryOnSession(id: string, updates: Partial<TryOnSession>): Promise<TryOnSession | undefined> {
    const [updated] = await db.update(tryOnSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tryOnSessions.id, id))
      .returning();
    return updated || undefined;
  }
  
  async incrementTryOnSessionViews(id: string): Promise<void> {
    await db.update(tryOnSessions)
      .set({ viewCount: sql`${tryOnSessions.viewCount} + 1` })
      .where(eq(tryOnSessions.id, id));
  }
  
  // Try-On Feedback
  async getTryOnFeedback(sessionId: string): Promise<TryOnFeedback[]> {
    return await db.select().from(tryOnFeedback)
      .where(eq(tryOnFeedback.sessionId, sessionId))
      .orderBy(desc(tryOnFeedback.createdAt));
  }
  
  async createTryOnFeedback(feedback: InsertTryOnFeedback): Promise<TryOnFeedback> {
    const [created] = await db.insert(tryOnFeedback).values(feedback).returning();
    return created;
  }
  
  // Try-On Closet
  async getUserTryOnCloset(userId: string): Promise<TryOnClosetItem[]> {
    return await db.select().from(tryOnCloset)
      .where(eq(tryOnCloset.userId, userId))
      .orderBy(desc(tryOnCloset.addedAt));
  }
  
  async addToTryOnCloset(item: InsertTryOnClosetItem): Promise<TryOnClosetItem> {
    const [created] = await db.insert(tryOnCloset).values(item).returning();
    return created;
  }
  
  async removeFromTryOnCloset(userId: string, productId: string): Promise<void> {
    await db.delete(tryOnCloset)
      .where(and(
        eq(tryOnCloset.userId, userId),
        eq(tryOnCloset.productId, productId)
      ));
  }
  
  async isInTryOnCloset(userId: string, productId: string): Promise<boolean> {
    const [item] = await db.select().from(tryOnCloset)
      .where(and(
        eq(tryOnCloset.userId, userId),
        eq(tryOnCloset.productId, productId)
      ));
    return !!item;
  }
  
  // Enhanced Try-On - Garments
  async getTryonGarments(filters?: { category?: string; stylistId?: string; isPublic?: boolean }): Promise<TryonGarment[]> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(tryonGarments.category, filters.category as any));
    if (filters?.stylistId) conditions.push(eq(tryonGarments.stylistId, filters.stylistId));
    if (filters?.isPublic !== undefined) conditions.push(eq(tryonGarments.isPublic, filters.isPublic));
    conditions.push(eq(tryonGarments.isActive, true));
    
    return await db.select().from(tryonGarments)
      .where(and(...conditions))
      .orderBy(desc(tryonGarments.createdAt));
  }
  
  async getTryonGarment(id: string): Promise<TryonGarment | undefined> {
    const [garment] = await db.select().from(tryonGarments).where(eq(tryonGarments.id, id));
    return garment || undefined;
  }
  
  async createTryonGarment(garment: InsertTryonGarment): Promise<TryonGarment> {
    const [created] = await db.insert(tryonGarments).values(garment).returning();
    return created;
  }
  
  async updateTryonGarment(id: string, updates: Partial<InsertTryonGarment>): Promise<TryonGarment | undefined> {
    const [updated] = await db.update(tryonGarments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tryonGarments.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteTryonGarment(id: string): Promise<void> {
    await db.update(tryonGarments)
      .set({ isActive: false })
      .where(eq(tryonGarments.id, id));
  }
  
  // Enhanced Try-On - Usage (Rate Limiting)
  async getTryonUsage(userId: string, date: string): Promise<TryonUsage | undefined> {
    const [usage] = await db.select().from(tryonUsage)
      .where(and(
        eq(tryonUsage.userId, userId),
        eq(tryonUsage.date, date)
      ));
    return usage || undefined;
  }
  
  async incrementTryonUsage(userId: string, date: string): Promise<TryonUsage> {
    const existing = await this.getTryonUsage(userId, date);
    if (existing) {
      const [updated] = await db.update(tryonUsage)
        .set({ count: (existing.count || 0) + 1 })
        .where(eq(tryonUsage.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(tryonUsage).values({ userId, date, count: 1 }).returning();
    return created;
  }
  
  // Enhanced Try-On - Results
  async getTryonResult(id: string): Promise<TryonResult | undefined> {
    const [result] = await db.select().from(tryonResults).where(eq(tryonResults.id, id));
    return result || undefined;
  }
  
  async getTryonResultsBySession(sessionId: string): Promise<TryonResult[]> {
    return await db.select().from(tryonResults)
      .where(eq(tryonResults.sessionId, sessionId))
      .orderBy(desc(tryonResults.createdAt));
  }
  
  async createTryonResult(result: InsertTryonResult): Promise<TryonResult> {
    const [created] = await db.insert(tryonResults).values(result).returning();
    return created;
  }
  
  async updateTryonResult(id: string, updates: Partial<InsertTryonResult>): Promise<TryonResult | undefined> {
    const [updated] = await db.update(tryonResults)
      .set(updates)
      .where(eq(tryonResults.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Enhanced Try-On - Shares
  async getTryonShare(id: string): Promise<TryonShare | undefined> {
    const [share] = await db.select().from(tryonShares).where(eq(tryonShares.id, id));
    return share || undefined;
  }
  
  async getTryonShareByCode(shareCode: string): Promise<TryonShare | undefined> {
    const [share] = await db.select().from(tryonShares).where(eq(tryonShares.shareCode, shareCode));
    return share || undefined;
  }
  
  async createTryonShare(share: InsertTryonShare): Promise<TryonShare> {
    const [created] = await db.insert(tryonShares).values(share).returning();
    return created;
  }
  
  async updateTryonShare(id: string, updates: Partial<TryonShare>): Promise<TryonShare | undefined> {
    const [updated] = await db.update(tryonShares)
      .set(updates)
      .where(eq(tryonShares.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Enhanced Try-On - Votes
  async getTryonVotesByShare(shareId: string): Promise<TryonVote[]> {
    return await db.select().from(tryonVotes)
      .where(eq(tryonVotes.shareId, shareId))
      .orderBy(desc(tryonVotes.createdAt));
  }
  
  async getUserVoteOnShare(shareId: string, voterId?: string, voterIp?: string): Promise<TryonVote | undefined> {
    const conditions = [eq(tryonVotes.shareId, shareId)];
    if (voterId) {
      conditions.push(eq(tryonVotes.voterId, voterId));
    } else if (voterIp) {
      conditions.push(eq(tryonVotes.voterIp, voterIp));
    } else {
      return undefined;
    }
    const [vote] = await db.select().from(tryonVotes).where(and(...conditions));
    return vote || undefined;
  }
  
  async createTryonVote(vote: InsertTryonVote): Promise<TryonVote> {
    const [created] = await db.insert(tryonVotes).values(vote).returning();
    return created;
  }
  
  // Enhanced Try-On - Fit Feedback
  async getUserFitFeedback(userId: string): Promise<FitFeedback[]> {
    return await db.select().from(fitFeedback)
      .where(eq(fitFeedback.userId, userId))
      .orderBy(desc(fitFeedback.createdAt));
  }
  
  async createFitFeedback(feedback: InsertFitFeedback): Promise<FitFeedback> {
    const [created] = await db.insert(fitFeedback).values(feedback).returning();
    return created;
  }
  
  // Enhanced Try-On - Brand Preferences
  async getUserBrandPreference(userId: string, brand: string): Promise<UserBrandPreference | undefined> {
    const [pref] = await db.select().from(userBrandPreferences)
      .where(and(
        eq(userBrandPreferences.userId, userId),
        eq(userBrandPreferences.brand, brand)
      ));
    return pref || undefined;
  }
  
  async getUserBrandPreferences(userId: string): Promise<UserBrandPreference[]> {
    return await db.select().from(userBrandPreferences)
      .where(eq(userBrandPreferences.userId, userId))
      .orderBy(desc(userBrandPreferences.totalPurchases));
  }
  
  async upsertUserBrandPreference(preference: InsertUserBrandPreference): Promise<UserBrandPreference> {
    const existing = await this.getUserBrandPreference(preference.userId, preference.brand);
    if (existing) {
      const [updated] = await db.update(userBrandPreferences)
        .set({ ...preference, updatedAt: new Date() })
        .where(eq(userBrandPreferences.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userBrandPreferences).values(preference).returning();
    return created;
  }
  
  // ============================================
  // STYLE QUIZ & PROFILE
  // ============================================
  
  async getUserStyleProfile(userId: string): Promise<UserStyleProfile | undefined> {
    const [profile] = await db.select().from(userStyleProfiles)
      .where(eq(userStyleProfiles.userId, userId));
    return profile || undefined;
  }
  
  async createUserStyleProfile(profile: InsertUserStyleProfile): Promise<UserStyleProfile> {
    const [created] = await db.insert(userStyleProfiles).values(profile).returning();
    return created;
  }
  
  async updateUserStyleProfile(userId: string, updates: Partial<InsertUserStyleProfile>): Promise<UserStyleProfile | undefined> {
    const [updated] = await db.update(userStyleProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStyleProfiles.userId, userId))
      .returning();
    return updated || undefined;
  }
  
  // ============================================
  // USER SUBSCRIPTIONS
  // ============================================
  
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [sub] = await db.select().from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));
    return sub || undefined;
  }
  
  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [created] = await db.insert(userSubscriptions).values(subscription).returning();
    return created;
  }
  
  async updateUserSubscription(userId: string, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [updated] = await db.update(userSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userSubscriptions.userId, userId))
      .returning();
    return updated || undefined;
  }
  
  // ============================================
  // CLOSET MANAGEMENT
  // ============================================
  
  async getUserClosetItems(userId: string): Promise<UserClosetItem[]> {
    return await db.select().from(userClosetItems)
      .where(eq(userClosetItems.userId, userId))
      .orderBy(desc(userClosetItems.createdAt));
  }
  
  async createClosetItem(item: InsertUserClosetItem): Promise<UserClosetItem> {
    const [created] = await db.insert(userClosetItems).values(item).returning();
    return created;
  }
  
  async deleteClosetItem(id: string, userId: string): Promise<boolean> {
    const [deleted] = await db.delete(userClosetItems)
      .where(and(
        eq(userClosetItems.id, id),
        eq(userClosetItems.userId, userId)
      ))
      .returning();
    return !!deleted;
  }
  
  async toggleClosetItemFavorite(id: string, userId: string): Promise<UserClosetItem | undefined> {
    const [item] = await db.select().from(userClosetItems)
      .where(and(
        eq(userClosetItems.id, id),
        eq(userClosetItems.userId, userId)
      ));
    
    if (!item) return undefined;
    
    const [updated] = await db.update(userClosetItems)
      .set({ isFavorite: !item.isFavorite })
      .where(eq(userClosetItems.id, id))
      .returning();
    return updated || undefined;
  }
  
  // ============================================
  // OUTFIT RECOMMENDATIONS
  // ============================================
  
  async getOutfitRecommendations(userId: string, type: string): Promise<OutfitRecommendation[]> {
    return await db.select().from(outfitRecommendations)
      .where(and(
        eq(outfitRecommendations.userId, userId),
        eq(outfitRecommendations.recommendationType, type)
      ))
      .orderBy(desc(outfitRecommendations.createdAt));
  }
  
  async createOutfitRecommendation(outfit: InsertOutfitRecommendation): Promise<OutfitRecommendation> {
    const [created] = await db.insert(outfitRecommendations).values(outfit).returning();
    return created;
  }
  
  async saveOutfit(outfitId: string, userId: string): Promise<OutfitRecommendation | undefined> {
    const [updated] = await db.update(outfitRecommendations)
      .set({ isSaved: true })
      .where(and(
        eq(outfitRecommendations.id, outfitId),
        eq(outfitRecommendations.userId, userId)
      ))
      .returning();
    return updated || undefined;
  }
  
  // ============================================
  // SAVED ITEMS
  // ============================================
  
  async getUserSavedItems(userId: string): Promise<any[]> {
    // Return saved outfit recommendations as saved items for now
    return await db.select().from(outfitRecommendations)
      .where(and(
        eq(outfitRecommendations.userId, userId),
        eq(outfitRecommendations.isSaved, true)
      ))
      .orderBy(desc(outfitRecommendations.createdAt));
  }
  
  // ============================================
  // WARDROBE GAP ANALYSIS
  // ============================================
  
  async getWardrobeGapAnalysis(userId: string): Promise<any> {
    const items = await this.getUserClosetItems(userId);
    
    // Calculate category breakdown
    const categoryCount: Record<string, number> = {};
    items.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    
    // Identify gaps based on common wardrobe needs
    const essentialCategories = ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'];
    const gaps: string[] = [];
    essentialCategories.forEach(cat => {
      if (!categoryCount[cat] || categoryCount[cat] < 3) {
        gaps.push(cat);
      }
    });
    
    return {
      categoryBreakdown: categoryCount,
      gaps,
      suggestions: gaps.map(gap => ({
        category: gap,
        suggestion: `Add more ${gap} to complete your wardrobe`
      }))
    };
  }

  // Situational Styling Engine
  async createAnonymousSession(data: InsertAnonymousSession): Promise<AnonymousSession> {
    const [session] = await db.insert(anonymousSessions).values(data).returning();
    return session;
  }

  async createSessionOutfit(data: InsertSessionOutfit): Promise<SessionOutfit> {
    const [outfit] = await db.insert(sessionOutfits).values(data).returning();
    return outfit;
  }

  async createLead(data: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(data).returning();
    return lead;
  }

  async createEngagementEvent(data: InsertEngagementEvent): Promise<EngagementEvent> {
    const [event] = await db.insert(engagementEvents).values(data).returning();
    return event;
  }

  // ── Gig Providers ─────────────────────────────────────────────────

  async createGigProvider(data: {
    userId: string;
    displayName: string;
    bio?: string;
    city: string;
    state?: string;
    country?: string;
    locationLat?: string;
    locationLng?: string;
    serviceRadiusMiles?: number;
    offersHomeVisits?: boolean;
    offersDropOff?: boolean;
    offersShipping?: boolean;
  }) {
    const [provider] = await db.insert(gigProviders).values(data).returning();
    return provider;
  }

  async getGigProviderByUserId(userId: string) {
    const [provider] = await db
      .select()
      .from(gigProviders)
      .where(eq(gigProviders.userId, userId));
    return provider || null;
  }

  async getGigProviderById(id: string) {
    const [provider] = await db
      .select()
      .from(gigProviders)
      .where(eq(gigProviders.id, id));
    return provider || null;
  }

  async updateGigProvider(id: string, userId: string, data: Partial<typeof gigProviders.$inferInsert>) {
    const [updated] = await db
      .update(gigProviders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(gigProviders.id, id), eq(gigProviders.userId, userId)))
      .returning();
    return updated;
  }

  async searchGigProviders(filters: {
    city?: string;
    serviceType?: string;
    offersHomeVisits?: boolean;
    offersShipping?: boolean;
  }) {
    const results = await db
      .select({
        provider: gigProviders,
        services: sql<any[]>`
          array_agg(
            json_build_object(
              'id', ${gigServices.id},
              'serviceType', ${gigServices.serviceType},
              'customName', ${gigServices.customName},
              'priceMin', ${gigServices.priceMin},
              'priceMax', ${gigServices.priceMax},
              'turnaroundDaysMin', ${gigServices.turnaroundDaysMin},
              'turnaroundDaysMax', ${gigServices.turnaroundDaysMax}
            )
          ) filter (where ${gigServices.id} is not null)
        `,
      })
      .from(gigProviders)
      .leftJoin(gigServices, and(
        eq(gigServices.providerId, gigProviders.id),
        eq(gigServices.isActive, true)
      ))
      .where(eq(gigProviders.isActive, true))
      .groupBy(gigProviders.id);

    if (filters.city) {
      return results.filter((r: any) =>
        r.provider.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    return results;
  }

  // ── Gig Services ──────────────────────────────────────────────────

  async addGigService(providerId: string, data: {
    serviceType: string;
    customName?: string;
    description?: string;
    priceMin: number;
    priceMax: number;
    priceUnit?: string;
    turnaroundDaysMin: number;
    turnaroundDaysMax: number;
  }) {
    const [service] = await db.insert(gigServices).values({
      providerId,
      ...data,
    } as any).returning();
    return service;
  }

  async updateGigService(id: string, providerId: string, data: any) {
    const [updated] = await db
      .update(gigServices)
      .set(data)
      .where(and(eq(gigServices.id, id), eq(gigServices.providerId, providerId)))
      .returning();
    return updated;
  }

  async deleteGigService(id: string, providerId: string) {
    await db
      .update(gigServices)
      .set({ isActive: false })
      .where(and(eq(gigServices.id, id), eq(gigServices.providerId, providerId)));
  }

  async getProviderServices(providerId: string) {
    return db
      .select()
      .from(gigServices)
      .where(and(
        eq(gigServices.providerId, providerId),
        eq(gigServices.isActive, true)
      ));
  }

  // ── Gig Jobs ──────────────────────────────────────────────────────

  async createGigJob(data: {
    customerId: string;
    serviceType: string;
    garmentDescription: string;
    alterationDetails: string;
    garmentImageUrl?: string;
    productId?: number;
    deliveryMethod?: string;
    budgetMin?: number;
    budgetMax?: number;
    neededBy?: Date;
    customerCity?: string;
    customerLat?: string;
    customerLng?: string;
  }) {
    const [job] = await db.insert(gigJobs).values(data as any).returning();
    return job;
  }

  async getGigJob(id: string) {
    const [job] = await db.select().from(gigJobs).where(eq(gigJobs.id, id));
    return job || null;
  }

  async getCustomerGigJobs(customerId: string) {
    return db
      .select()
      .from(gigJobs)
      .where(eq(gigJobs.customerId, customerId))
      .orderBy(desc(gigJobs.createdAt));
  }

  async getProviderGigJobs(providerId: string) {
    return db
      .select()
      .from(gigJobs)
      .where(eq(gigJobs.providerId, providerId))
      .orderBy(desc(gigJobs.createdAt));
  }

  async getOpenGigJobs(city?: string) {
    const jobs = await db
      .select()
      .from(gigJobs)
      .where(eq(gigJobs.status, "open"))
      .orderBy(desc(gigJobs.createdAt));

    if (city) {
      return jobs.filter((j: any) =>
        j.customerCity?.toLowerCase().includes(city.toLowerCase())
      );
    }
    return jobs;
  }

  async updateGigJobStatus(id: string, status: string, additionalData?: any) {
    const [updated] = await db
      .update(gigJobs)
      .set({ status, ...additionalData, updatedAt: new Date() })
      .where(eq(gigJobs.id, id))
      .returning();
    return updated;
  }

  // ── Gig Quotes ────────────────────────────────────────────────────

  async createGigQuote(data: {
    jobId: string;
    providerId: string;
    price: number;
    turnaroundDays: number;
    message?: string;
  }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const [quote] = await db.insert(gigQuotes).values({
      ...data,
      expiresAt,
    }).returning();
    return quote;
  }

  async getQuotesForJob(jobId: string) {
    return db
      .select()
      .from(gigQuotes)
      .where(eq(gigQuotes.jobId, jobId))
      .orderBy(asc(gigQuotes.createdAt));
  }

  async acceptGigQuote(quoteId: string, customerId: string) {
    const [quote] = await db
      .select()
      .from(gigQuotes)
      .where(eq(gigQuotes.id, quoteId));

    if (!quote) throw new Error("Quote not found");

    await db
      .update(gigQuotes)
      .set({ status: "rejected" })
      .where(and(
        eq(gigQuotes.jobId, quote.jobId),
        ne(gigQuotes.id, quoteId)
      ));

    await db
      .update(gigQuotes)
      .set({ status: "accepted" })
      .where(eq(gigQuotes.id, quoteId));

    const platformFee = Math.round(quote.price * 0.12);
    const [updatedJob] = await db
      .update(gigJobs)
      .set({
        providerId: quote.providerId,
        status: "accepted",
        agreedPrice: quote.price,
        platformFee,
        updatedAt: new Date(),
      })
      .where(eq(gigJobs.id, quote.jobId))
      .returning();

    return updatedJob;
  }

  // ── Gig Messages ──────────────────────────────────────────────────

  async sendGigMessage(data: {
    jobId: string;
    senderId: string;
    content: string;
    imageUrl?: string;
  }) {
    const [message] = await db.insert(gigMessages).values(data).returning();
    return message;
  }

  async getGigMessages(jobId: string) {
    return db
      .select()
      .from(gigMessages)
      .where(eq(gigMessages.jobId, jobId))
      .orderBy(asc(gigMessages.createdAt));
  }

  async markMessagesRead(jobId: string, userId: string) {
    await db
      .update(gigMessages)
      .set({ readAt: new Date() })
      .where(and(
        eq(gigMessages.jobId, jobId),
        ne(gigMessages.senderId, userId),
        isNull(gigMessages.readAt)
      ));
  }

  // ── Gig Reviews ───────────────────────────────────────────────────

  async createGigReview(data: {
    jobId: string;
    customerId: string;
    providerId: string;
    rating: number;
    reviewText?: string;
    qualityRating?: number;
    speedRating?: number;
    communicationRating?: number;
  }) {
    const [review] = await db.insert(gigReviews).values(data).returning();

    const allReviews = await db
      .select({ rating: gigReviews.rating })
      .from(gigReviews)
      .where(eq(gigReviews.providerId, data.providerId));

    const avg = allReviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / allReviews.length;

    await db
      .update(gigProviders)
      .set({
        averageRating: avg.toFixed(2),
        totalReviews: allReviews.length,
        updatedAt: new Date(),
      })
      .where(eq(gigProviders.id, data.providerId));

    return review;
  }

  async getProviderReviews(providerId: string) {
    return db
      .select()
      .from(gigReviews)
      .where(eq(gigReviews.providerId, providerId))
      .orderBy(desc(gigReviews.createdAt));
  }

  // ── Style Groups ────────────────────────────────────────────────

  async createStyleGroup(data: { name: string; description?: string; ownerId: string }) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [group] = await db.insert(styleGroups).values({ ...data, inviteCode }).returning();
    await db.insert(styleGroupMembers).values({ groupId: group.id, userId: data.ownerId, role: "owner" });
    return group;
  }

  async getStyleGroup(id: string) {
    const [group] = await db.select().from(styleGroups).where(eq(styleGroups.id, id));
    return group || null;
  }

  async getStyleGroupByInviteCode(code: string) {
    const [group] = await db.select().from(styleGroups).where(eq(styleGroups.inviteCode, code.toUpperCase()));
    return group || null;
  }

  async getUserStyleGroups(userId: string) {
    return db
      .select({ group: styleGroups, role: styleGroupMembers.role })
      .from(styleGroupMembers)
      .innerJoin(styleGroups, eq(styleGroupMembers.groupId, styleGroups.id))
      .where(and(eq(styleGroupMembers.userId, userId), eq(styleGroups.isActive, true)));
  }

  async joinStyleGroup(groupId: string, userId: string) {
    const [existing] = await db.select().from(styleGroupMembers)
      .where(and(eq(styleGroupMembers.groupId, groupId), eq(styleGroupMembers.userId, userId)));
    if (existing) return existing;
    const [member] = await db.insert(styleGroupMembers).values({ groupId, userId, role: "member" }).returning();
    return member;
  }

  async getGroupMembers(groupId: string) {
    return db
      .select({ member: styleGroupMembers, user: users })
      .from(styleGroupMembers)
      .innerJoin(users, eq(styleGroupMembers.userId, users.id))
      .where(eq(styleGroupMembers.groupId, groupId));
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const [member] = await db.select().from(styleGroupMembers)
      .where(and(eq(styleGroupMembers.groupId, groupId), eq(styleGroupMembers.userId, userId)));
    return !!member;
  }

  async leaveStyleGroup(groupId: string, userId: string) {
    await db.delete(styleGroupMembers)
      .where(and(eq(styleGroupMembers.groupId, groupId), eq(styleGroupMembers.userId, userId)));
  }

  // ── Borrow Requests ─────────────────────────────────────────────

  async createBorrowRequest(data: {
    closetItemId: string; borrowerId: string; lenderId: string; groupId?: string;
    occasion?: string; message?: string; requestedFrom: Date; requestedUntil: Date;
  }) {
    const [request] = await db.insert(borrowRequests).values(data).returning();
    return request;
  }

  async getBorrowRequest(id: string) {
    const [request] = await db.select().from(borrowRequests).where(eq(borrowRequests.id, id));
    return request || null;
  }

  async getUserBorrowRequests(userId: string) {
    return db.select().from(borrowRequests)
      .where(or(eq(borrowRequests.borrowerId, userId), eq(borrowRequests.lenderId, userId)))
      .orderBy(desc(borrowRequests.createdAt));
  }

  async updateBorrowRequestStatus(id: string, status: string, additionalData?: any) {
    const [updated] = await db.update(borrowRequests)
      .set({ status: status as any, ...additionalData, updatedAt: new Date() })
      .where(eq(borrowRequests.id, id)).returning();
    return updated;
  }

  async confirmReturn(requestId: string, userId: string, isLender: boolean) {
    const now = new Date();
    const updateData = isLender ? { returnedConfirmedByLender: now } : { returnedConfirmedByBorrower: now };
    const request = await this.getBorrowRequest(requestId);
    if (!request) throw new Error("Request not found");
    await db.update(borrowRequests).set(updateData).where(eq(borrowRequests.id, requestId));
    const updated = await this.getBorrowRequest(requestId);
    if (updated?.returnedConfirmedByBorrower && updated?.returnedConfirmedByLender) {
      await db.update(borrowRequests).set({ status: "returned" }).where(eq(borrowRequests.id, requestId));
    }
    return updated;
  }

  // ── Haul Posts ──────────────────────────────────────────────────

  async createHaulPost(data: {
    userId: string; groupId: string; title?: string; caption?: string;
    closetItemIds: string[]; imageUrls?: string[]; videoUrl?: string;
  }) {
    const [post] = await db.insert(haulPosts).values(data).returning();
    return post;
  }

  async getGroupHaulPosts(groupId: string, limit: number = 20) {
    return db.select().from(haulPosts)
      .where(and(eq(haulPosts.groupId, groupId), eq(haulPosts.isActive, true)))
      .orderBy(desc(haulPosts.createdAt)).limit(limit);
  }

  async addHaulReaction(data: {
    haulPostId: string; userId: string; reaction: string; comment?: string; suggestedProductId?: number;
  }) {
    await db.delete(haulPostReactions)
      .where(and(eq(haulPostReactions.haulPostId, data.haulPostId), eq(haulPostReactions.userId, data.userId)));
    const [reaction] = await db.insert(haulPostReactions).values(data as any).returning();
    return reaction;
  }

  // ── Outfit Polls ────────────────────────────────────────────────

  async createOutfitPoll(data: {
    userId: string; groupId: string; question: string; occasion?: string; options: any[]; closesAt: Date;
  }) {
    const [poll] = await db.insert(outfitPolls).values(data).returning();
    return poll;
  }

  async getGroupPolls(groupId: string) {
    return db.select().from(outfitPolls)
      .where(and(eq(outfitPolls.groupId, groupId), eq(outfitPolls.isActive, true)))
      .orderBy(desc(outfitPolls.createdAt));
  }

  async voteOnPoll(data: { pollId: string; userId: string; optionIndex: number; comment?: string }) {
    await db.delete(outfitPollVotes)
      .where(and(eq(outfitPollVotes.pollId, data.pollId), eq(outfitPollVotes.userId, data.userId)));
    const [vote] = await db.insert(outfitPollVotes).values(data).returning();
    return vote;
  }

  async getPollResults(pollId: string) {
    const votes = await db.select().from(outfitPollVotes).where(eq(outfitPollVotes.pollId, pollId));
    const results: Record<number, number> = {};
    votes.forEach((v: any) => { results[(v as any).optionIndex] = (results[(v as any).optionIndex] || 0) + 1; });
    return { votes, results, total: votes.length };
  }

  // ── Closet Sales ────────────────────────────────────────────────

  async createClosetSale(data: {
    userId: string; groupId?: string; title: string; description?: string; closetItemIds: string[];
  }) {
    const [sale] = await db.insert(closetSales).values(data).returning();
    return sale;
  }

  async getClosetSale(id: string) {
    const [sale] = await db.select().from(closetSales).where(eq(closetSales.id, id));
    return sale || null;
  }

  async getUserClosetSales(userId: string) {
    return db.select().from(closetSales).where(eq(closetSales.userId, userId)).orderBy(desc(closetSales.createdAt));
  }

  async updateClosetSaleStatus(id: string, status: string) {
    const [updated] = await db.update(closetSales)
      .set({ status: status as any, updatedAt: new Date() }).where(eq(closetSales.id, id)).returning();
    return updated;
  }

  async expressInterestInSaleItem(data: {
    saleId: string; closetItemId: string; interestedUserId: string; message?: string;
  }) {
    const [interest] = await db.insert(closetSaleInterests).values(data).returning();
    return interest;
  }

  // ── Donation Logs ───────────────────────────────────────────────

  async createDonationLog(data: {
    userId: string; closetItemIds: string[]; itemDescriptions: any; destination: string;
    destinationName?: string; destinationAddress?: string; donatedAt: Date;
    estimatedTotalValue?: number; taxYear: number;
  }) {
    const [log] = await db.insert(donationLogs).values(data as any).returning();
    return log;
  }

  async getUserDonationLogs(userId: string) {
    return db.select().from(donationLogs).where(eq(donationLogs.userId, userId))
      .orderBy(desc(donationLogs.donatedAt));
  }

  async getUserDonationTotal(userId: string, taxYear: number) {
    const logs = await db.select({ value: donationLogs.estimatedTotalValue })
      .from(donationLogs)
      .where(and(eq(donationLogs.userId, userId), eq(donationLogs.taxYear, taxYear)));
    return logs.reduce((sum: number, log: any) => sum + (log.value || 0), 0);
  }

  // ── Idle Alerts ─────────────────────────────────────────────────

  async getIdleClosetItems(userId: string, idleMonths: number = 6) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - idleMonths);
    return db.select().from(userClosetItems)
      .where(and(
        eq(userClosetItems.userId, userId),
        or(isNull(userClosetItems.lastWorn), lt(userClosetItems.lastWorn, cutoff))
      ));
  }

  async createIdleAlert(data: { userId: string; closetItemId: string; idleMonths: number }) {
    const [alert] = await db.insert(closetIdleAlerts).values(data).returning();
    return alert;
  }

  async resolveIdleAlert(id: string, action: string) {
    const [updated] = await db.update(closetIdleAlerts)
      .set({ action, actionTakenAt: new Date() }).where(eq(closetIdleAlerts.id, id)).returning();
    return updated;
  }

  async markClosetItemWorn(closetItemId: string, userId: string) {
    await db.update(userClosetItems)
      .set({ lastWorn: new Date(), timesWorn: sql`times_worn + 1` })
      .where(and(eq(userClosetItems.id, closetItemId), eq(userClosetItems.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
