import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, pgEnum, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const demographicEnum = pgEnum("demographic", ["men", "women", "young_adults", "children"]);
export const budgetTierEnum = pgEnum("budget_tier", ["affordable", "mid_range", "premium", "luxury"]);
export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "monetization_manager", "support_admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]);
export const requestStatusEnum = pgEnum("request_status", ["open", "quoted", "accepted", "in_progress", "completed", "cancelled"]);

// ============================================
// CORE MARKETPLACE - USERS
// ============================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  demographic: demographicEnum("demographic").notNull(),
  age: integer("age"),
  lifestyle: text("lifestyle"), // e.g., "professional", "student", "traveler"
  styleTags: text("style_tags").array(), // e.g., ["minimalist", "smart-casual"]
  budgetMin: integer("budget_min").default(0),
  budgetMax: integer("budget_max").default(500),
  budgetTier: budgetTierEnum("budget_tier"),
  preferredBrands: text("preferred_brands").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Upper body
  chest: decimal("chest", { precision: 5, scale: 2 }),
  waist: decimal("waist", { precision: 5, scale: 2 }),
  hips: decimal("hips", { precision: 5, scale: 2 }),
  shoulders: decimal("shoulders", { precision: 5, scale: 2 }),
  sleeve: decimal("sleeve", { precision: 5, scale: 2 }),
  neck: decimal("neck", { precision: 5, scale: 2 }),
  // Lower body  
  inseam: decimal("inseam", { precision: 5, scale: 2 }),
  outseam: decimal("outseam", { precision: 5, scale: 2 }),
  thigh: decimal("thigh", { precision: 5, scale: 2 }),
  // Footwear
  shoeSize: decimal("shoe_size", { precision: 4, scale: 1 }), // US size (e.g., 10.5)
  shoeWidth: text("shoe_width"), // "N" (narrow), "M" (medium), "W" (wide)
  // General
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  unit: text("unit").default("inches"), // "inches" or "cm"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CORE MARKETPLACE - PRODUCTS
// ============================================

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(), // "shirt", "pants", "jacket", "dress", etc.
  demographic: demographicEnum("demographic").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  budgetTier: budgetTierEnum("budget_tier").notNull(),
  styleTags: text("style_tags").array(),
  imageUrl: text("image_url"),
  description: text("description"),
  sizes: text("sizes").array(), // ["XS", "S", "M", "L", "XL"]
  sizeChart: jsonb("size_chart"), // Brand-specific size chart data
  affiliateUrl: text("affiliate_url"), // Quick Buy link
  isSponsored: boolean("is_sponsored").default(false),
  sponsorPriority: integer("sponsor_priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CORE MARKETPLACE - MAKERS/TAILORS
// ============================================

export const makers = pgTable("makers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  description: text("description"),
  specialties: text("specialties").array(), // ["Suits", "Dresses", "Alterations"]
  styleTags: text("style_tags").array(), // ["classic", "modern", "streetwear"]
  budgetMin: integer("budget_min").notNull(),
  budgetMax: integer("budget_max").notNull(),
  location: text("location").notNull(),
  deliveryZones: text("delivery_zones").array(),
  leadTimeDays: integer("lead_time_days").default(14),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  portfolioImages: text("portfolio_images").array(),
  stripeAccountId: text("stripe_account_id"), // For payment splits
  subscriptionTier: text("subscription_tier").default("basic"), // "basic", "pro", "elite"
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CORE MARKETPLACE - CUSTOM REQUESTS & QUOTES
// ============================================

export const customRequests = pgTable("custom_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // "suit", "dress", "jacket"
  description: text("description"),
  styleTags: text("style_tags").array(),
  budgetMin: integer("budget_min").notNull(),
  budgetMax: integer("budget_max").notNull(),
  measurements: jsonb("measurements").notNull(), // Copy of user measurements at time of request
  status: requestStatusEnum("status").default("open").notNull(),
  selectedQuoteId: varchar("selected_quote_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => customRequests.id, { onDelete: "cascade" }),
  makerId: varchar("maker_id").notNull().references(() => makers.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  materials: text("materials"),
  message: text("message"),
  matchScore: decimal("match_score", { precision: 5, scale: 3 }), // 0-1 calculated by algorithm
  isAccepted: boolean("is_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CORE MARKETPLACE - ORDERS
// ============================================

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderType: text("order_type").notNull(), // "retail" or "bespoke"
  // For retail orders
  productId: varchar("product_id").references(() => products.id),
  affiliateCommission: decimal("affiliate_commission", { precision: 10, scale: 2 }),
  // For bespoke orders
  quoteId: varchar("quote_id").references(() => quotes.id),
  makerId: varchar("maker_id").references(() => makers.id),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }), // 10% default
  // Common fields
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  trackingNumber: text("tracking_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// ADMIN PANEL - USERS & ROLES
// ============================================

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: adminRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// ADMIN PANEL - MONETIZATION SETTINGS
// ============================================

export const pricingConfigs = pgTable("pricing_configs", {
  id: serial("id").primaryKey(),
  configKey: text("config_key").notNull().unique(), // "affiliate_rate", "bespoke_commission", etc.
  configValue: text("config_value").notNull(), // JSON string for flexibility
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => adminUsers.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planType: text("plan_type").notNull(), // "maker" or "user"
  name: text("name").notNull(), // "Basic", "Pro", "Elite"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").default("monthly"), // "monthly" or "yearly"
  features: text("features").array(),
  isActive: boolean("is_active").default(true),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriberId: varchar("subscriber_id").notNull(), // userId or makerId
  subscriberType: text("subscriber_type").notNull(), // "user" or "maker"
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").default("active"), // "active", "cancelled", "past_due"
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAt: timestamp("cancel_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// ADMIN PANEL - AUDIT LOGS
// ============================================

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => adminUsers.id),
  action: text("action").notNull(), // "update_pricing", "approve_maker", "suspend_user"
  targetType: text("target_type"), // "user", "maker", "pricing"
  targetId: text("target_id"),
  changes: jsonb("changes"), // Before/after values
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// AI PERSONALITY - CHAT SESSIONS
// ============================================

export const aiPersonas = pgTable("ai_personas", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tone: text("tone").notNull(),
  specialty: text("specialty"),
  systemPrompt: text("system_prompt").notNull(),
  avatarUrl: text("avatar_url"),
  voiceId: text("voice_id"), // For ElevenLabs or similar
  isActive: boolean("is_active").default(true),
});

export const aiChatSessions = pgTable("ai_chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  personaId: varchar("persona_id").notNull().references(() => aiPersonas.id),
  messages: jsonb("messages").notNull(), // Array of {role, content, timestamp}
  userContext: jsonb("user_context"), // Snapshot of user profile for this session
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  measurements: one(measurements),
  customRequests: many(customRequests),
  orders: many(orders),
  chatSessions: many(aiChatSessions),
}));

export const measurementsRelations = relations(measurements, ({ one }) => ({
  user: one(users, {
    fields: [measurements.userId],
    references: [users.id],
  }),
}));

export const makersRelations = relations(makers, ({ many }) => ({
  quotes: many(quotes),
  orders: many(orders),
}));

export const customRequestsRelations = relations(customRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [customRequests.userId],
    references: [users.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  request: one(customRequests, {
    fields: [quotes.requestId],
    references: [customRequests.id],
  }),
  maker: one(makers, {
    fields: [quotes.makerId],
    references: [makers.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  maker: one(makers, {
    fields: [orders.makerId],
    references: [makers.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const aiChatSessionsRelations = relations(aiChatSessions, ({ one }) => ({
  user: one(users, {
    fields: [aiChatSessions.userId],
    references: [users.id],
  }),
  persona: one(aiPersonas, {
    fields: [aiChatSessions.personaId],
    references: [aiPersonas.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [auditLogs.adminId],
    references: [adminUsers.id],
  }),
}));

// ============================================
// INSERT SCHEMAS & TYPES
// ============================================

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeasurementSchema = createInsertSchema(measurements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertMakerSchema = createInsertSchema(makers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomRequestSchema = createInsertSchema(customRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  isAccepted: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertPricingConfigSchema = createInsertSchema(pricingConfigs).omit({
  id: true,
  updatedAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertAiPersonaSchema = createInsertSchema(aiPersonas);

export const insertAiChatSessionSchema = createInsertSchema(aiChatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// TYPES
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Maker = typeof makers.$inferSelect;
export type InsertMaker = z.infer<typeof insertMakerSchema>;

export type CustomRequest = typeof customRequests.$inferSelect;
export type InsertCustomRequest = z.infer<typeof insertCustomRequestSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type PricingConfig = typeof pricingConfigs.$inferSelect;
export type InsertPricingConfig = z.infer<typeof insertPricingConfigSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;

export type AuditLog = typeof auditLogs.$inferSelect;

export type AiPersona = typeof aiPersonas.$inferSelect;
export type InsertAiPersona = z.infer<typeof insertAiPersonaSchema>;

export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type InsertAiChatSession = z.infer<typeof insertAiChatSessionSchema>;
