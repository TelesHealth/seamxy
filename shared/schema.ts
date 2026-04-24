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
export const supplierRoleEnum = pgEnum("supplier_role", ["retailer", "tailor", "designer"]);
export const supplierTierEnum = pgEnum("supplier_tier", ["basic", "pro", "enterprise"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);
export const retailerEnum = pgEnum("retailer", ["amazon", "ebay", "rakuten", "shopify", "internal"]);
export const priceAlertStatusEnum = pgEnum("price_alert_status", ["active", "triggered", "expired", "cancelled"]);
export const stylistApplicationStatusEnum = pgEnum("stylist_application_status", ["pending", "approved", "rejected"]);
export const rfqStatusEnum = pgEnum("rfq_status", ["open", "responded", "accepted", "declined", "completed"]);
export const creatorSubscriptionStatusEnum = pgEnum("creator_subscription_status", ["active", "cancelled", "past_due", "expired"]);
export const creatorPostContentTypeEnum = pgEnum("creator_post_content_type", ["text", "image", "video", "portfolio"]);
export const moderationStatusEnum = pgEnum("moderation_status", ["pending", "approved", "rejected", "flagged"]);
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "processing", "completed", "failed"]);
export const creatorRfqStatusEnum = pgEnum("creator_rfq_status", ["pending", "quoted", "accepted", "in_progress", "completed", "cancelled"]);

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
  stripeCustomerId: text("stripe_customer_id"),
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
// SUPPLIER PORTAL - ACCOUNTS & PROFILES
// ============================================

export const supplierAccounts = pgTable("supplier_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // SECURITY: Hash with bcrypt/argon2 before storage
  role: supplierRoleEnum("role").notNull(), // "retailer", "tailor", "designer"
  tier: supplierTierEnum("tier").default("basic").notNull(), // "basic", "pro", "enterprise"
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  phoneNumber: text("phone_number"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  stripeAccountId: text("stripe_account_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supplierProfiles = pgTable("supplier_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().unique().references(() => supplierAccounts.id, { onDelete: "cascade" }), // One profile per supplier
  description: text("description"),
  location: text("location"),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  // For tailors and designers
  specialties: text("specialties").array(),
  styleTags: text("style_tags").array(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  deliveryZones: text("delivery_zones").array(),
  leadTimeDays: integer("lead_time_days").default(14),
  portfolioImages: text("portfolio_images").array(),
  // For retailers
  ecommercePlatform: text("ecommerce_platform"), // "shopify", "woocommerce", "amazon", "manual"
  catalogSyncEnabled: boolean("catalog_sync_enabled").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  // Ratings and reviews
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  totalOrders: integer("total_orders").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SUPPLIER PORTAL - PRODUCTS & COLLECTIONS
// ============================================

export const retailerProducts = pgTable("retailer_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id), // Link to main products table if synced
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  demographic: demographicEnum("demographic").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  budgetTier: budgetTierEnum("budget_tier").notNull(),
  styleTags: text("style_tags").array(),
  imageUrl: text("image_url"),
  description: text("description"),
  sizes: text("sizes").array(),
  sizeChart: jsonb("size_chart"),
  stockQuantity: integer("stock_quantity").default(0),
  sku: text("sku"),
  // E-commerce integration fields
  externalId: text("external_id"), // Shopify/WooCommerce/Amazon product ID
  externalUrl: text("external_url"),
  channelSource: text("channel_source"), // "shopify", "woocommerce", "amazon", "manual"
  syncStatus: text("sync_status").default("active"), // "active", "syncing", "error", "disabled"
  lastSyncAt: timestamp("last_sync_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const designerCollections = pgTable("designer_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  styleTags: text("style_tags").array(),
  coverImageUrl: text("cover_image_url"),
  isMadeToMeasure: boolean("is_made_to_measure").default(false),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }),
  leadTimeDays: integer("lead_time_days").default(21),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  collectionId: varchar("collection_id").references(() => designerCollections.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  styleTags: text("style_tags").array(),
  itemType: text("item_type"), // "dress", "suit", "jacket", etc.
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SUPPLIER PORTAL - SUBSCRIPTIONS & BILLING
// ============================================

export const supplierSubscriptions = pgTable("supplier_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  tier: supplierTierEnum("tier").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").default("active"), // "active", "cancelled", "past_due", "trial"
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAt: timestamp("cancel_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supplierInvoices = pgTable("supplier_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  orderId: varchar("order_id").references(() => orders.id),
  invoiceType: text("invoice_type").notNull(), // "subscription", "transaction_fee", "payout"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // "pending", "paid", "failed", "refunded"
  stripeInvoiceId: text("stripe_invoice_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  description: text("description"),
  paidAt: timestamp("paid_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SUPPLIER PORTAL - MESSAGING
// ============================================

export const messageThreads = pgTable("message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: varchar("order_id").references(() => orders.id),
  requestId: varchar("request_id").references(() => customRequests.id),
  subject: text("subject"),
  status: text("status").default("active"), // "active", "closed", "archived"
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supplierMessages = pgTable("supplier_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => messageThreads.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull(), // supplierId or userId
  senderType: text("sender_type").notNull(), // "supplier" or "customer"
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  status: messageStatusEnum("status").default("sent"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SUPPLIER PORTAL - ORDERS & TRACKING
// ============================================

export const supplierOrders = pgTable("supplier_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().unique().references(() => orders.id, { onDelete: "cascade" }), // One tracking row per order
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  milestones: jsonb("milestones"), // [{name, status, completedAt, notes}]
  internalNotes: text("internal_notes"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  qualityCheckStatus: text("quality_check_status"), // "pending", "passed", "failed"
  returnRequested: boolean("return_requested").default(false),
  returnReason: text("return_reason"),
  returnStatus: text("return_status"), // "pending", "approved", "rejected", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SUPPLIER PORTAL - INTEGRATIONS
// ============================================

export const integrationTokens = pgTable("integration_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // "shopify", "woocommerce", "amazon", "bigcommerce"
  accessToken: text("access_token").notNull(), // SECURITY: Encrypt at-rest using AES-256 before storage
  refreshToken: text("refresh_token"), // SECURITY: Encrypt at-rest using AES-256 before storage
  tokenType: text("token_type").default("Bearer"),
  expiresAt: timestamp("expires_at"),
  shopDomain: text("shop_domain"), // For Shopify
  storeUrl: text("store_url"),
  scopes: text("scopes").array(),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SUPPLIER PORTAL - ANALYTICS
// ============================================

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: serial("id").primaryKey(),
  supplierId: varchar("supplier_id").notNull().references(() => supplierAccounts.id, { onDelete: "cascade" }),
  snapshotDate: timestamp("snapshot_date").notNull(),
  // Order metrics
  totalOrders: integer("total_orders").default(0),
  completedOrders: integer("completed_orders").default(0),
  cancelledOrders: integer("cancelled_orders").default(0),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }),
  // Customer metrics
  newCustomers: integer("new_customers").default(0),
  returningCustomers: integer("returning_customers").default(0),
  // Fit metrics
  fitMatchRate: decimal("fit_match_rate", { precision: 5, scale: 2 }), // Percentage
  averageFitScore: decimal("average_fit_score", { precision: 5, scale: 3 }),
  // Product metrics
  topSellingProducts: jsonb("top_selling_products"), // [{productId, name, sales}]
  sizingDistribution: jsonb("sizing_distribution"), // {S: 10, M: 25, L: 30, ...}
  // Conversion metrics
  viewsToOrders: decimal("views_to_orders", { precision: 5, scale: 2 }), // Conversion rate
  quotesToOrders: decimal("quotes_to_orders", { precision: 5, scale: 2 }), // For tailors/designers
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// PRICE COMPARISON - SMART PRICE COMPARE
// ============================================

export const retailerConfigs = pgTable("retailer_configs", {
  id: serial("id").primaryKey(),
  retailer: retailerEnum("retailer").notNull().unique(),
  apiKey: text("api_key"), // Encrypted at-rest
  apiSecret: text("api_secret"), // Encrypted at-rest
  accessToken: text("access_token"), // Encrypted at-rest
  partnerTag: text("partner_tag"), // Affiliate/Partner ID
  isActive: boolean("is_active").default(true),
  rateLimit: integer("rate_limit").default(1000), // Requests per hour
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const externalProducts = pgTable("external_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  internalProductId: varchar("internal_product_id").references(() => products.id, { onDelete: "set null" }), // Link to our catalog
  retailer: retailerEnum("retailer").notNull(),
  externalId: text("external_id").notNull(), // ASIN, eBay item ID, etc.
  title: text("title").notNull(),
  brand: text("brand"),
  category: text("category"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  imageUrl: text("image_url"),
  productUrl: text("product_url").notNull(),
  affiliateUrl: text("affiliate_url"), // Tracked affiliate link
  availableSizes: text("available_sizes").array(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  deliveryDays: integer("delivery_days"),
  isSustainable: boolean("is_sustainable").default(false),
  sustainabilityCertifications: text("sustainability_certifications").array(),
  matchConfidence: decimal("match_confidence", { precision: 5, scale: 2 }), // AI confidence 0-100
  fitConfidence: decimal("fit_confidence", { precision: 5, scale: 2 }), // Fit match score 0-100
  lastCheckedAt: timestamp("last_checked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  externalProductId: varchar("external_product_id").notNull().references(() => externalProducts.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  isAvailable: boolean("is_available").default(true),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  internalProductId: varchar("internal_product_id").references(() => products.id, { onDelete: "cascade" }),
  externalProductId: varchar("external_product_id").references(() => externalProducts.id, { onDelete: "cascade" }),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  status: priceAlertStatusEnum("status").default("active"),
  notificationEmail: text("notification_email"),
  triggeredAt: timestamp("triggered_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  stylistId: varchar("stylist_id").references(() => stylistProfiles.id, { onDelete: "set null" }), // Track which AI stylist recommended this product
  externalProductId: varchar("external_product_id").notNull().references(() => externalProducts.id, { onDelete: "cascade" }),
  retailer: retailerEnum("retailer").notNull(),
  clickedUrl: text("clicked_url").notNull(),
  referrerPage: text("referrer_page"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

export const affiliateConversions = pgTable("affiliate_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: varchar("click_id").references(() => affiliateClicks.id, { onDelete: "set null" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  externalProductId: varchar("external_product_id").references(() => externalProducts.id, { onDelete: "cascade" }),
  retailer: retailerEnum("retailer").notNull(),
  orderId: text("order_id"), // External retailer order ID
  orderValue: decimal("order_value", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // Percentage
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  convertedAt: timestamp("converted_at").defaultNow().notNull(),
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
  personaId: varchar("persona_id").references(() => aiPersonas.id),
  stylistId: varchar("stylist_id").references(() => stylistProfiles.id), // For stylist AI clones
  messages: jsonb("messages").notNull(), // Array of {role, content, timestamp}
  userContext: jsonb("user_context"), // Snapshot of user profile for this session
  messageCount: integer("message_count").default(0), // Track messages for credit system
  isFreeTier: boolean("is_free_tier").default(true), // Free vs Premium chat
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

export const supplierAccountsRelations = relations(supplierAccounts, ({ one, many }) => ({
  profile: one(supplierProfiles),
  retailerProducts: many(retailerProducts),
  collections: many(designerCollections),
  portfolioItems: many(portfolioItems),
  subscriptions: many(supplierSubscriptions),
  invoices: many(supplierInvoices),
  messageThreads: many(messageThreads),
  orders: many(supplierOrders),
  integrationTokens: many(integrationTokens),
  analyticsSnapshots: many(analyticsSnapshots),
}));

export const supplierProfilesRelations = relations(supplierProfiles, ({ one }) => ({
  supplier: one(supplierAccounts, {
    fields: [supplierProfiles.supplierId],
    references: [supplierAccounts.id],
  }),
}));

export const retailerProductsRelations = relations(retailerProducts, ({ one }) => ({
  supplier: one(supplierAccounts, {
    fields: [retailerProducts.supplierId],
    references: [supplierAccounts.id],
  }),
  product: one(products, {
    fields: [retailerProducts.productId],
    references: [products.id],
  }),
}));

export const designerCollectionsRelations = relations(designerCollections, ({ one, many }) => ({
  supplier: one(supplierAccounts, {
    fields: [designerCollections.supplierId],
    references: [supplierAccounts.id],
  }),
  portfolioItems: many(portfolioItems),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  supplier: one(supplierAccounts, {
    fields: [portfolioItems.supplierId],
    references: [supplierAccounts.id],
  }),
  collection: one(designerCollections, {
    fields: [portfolioItems.collectionId],
    references: [designerCollections.id],
  }),
}));

export const messageThreadsRelations = relations(messageThreads, ({ one, many }) => ({
  supplier: one(supplierAccounts, {
    fields: [messageThreads.supplierId],
    references: [supplierAccounts.id],
  }),
  customer: one(users, {
    fields: [messageThreads.customerId],
    references: [users.id],
  }),
  messages: many(supplierMessages),
}));

export const supplierMessagesRelations = relations(supplierMessages, ({ one }) => ({
  thread: one(messageThreads, {
    fields: [supplierMessages.threadId],
    references: [messageThreads.id],
  }),
}));

export const supplierOrdersRelations = relations(supplierOrders, ({ one }) => ({
  order: one(orders, {
    fields: [supplierOrders.orderId],
    references: [orders.id],
  }),
  supplier: one(supplierAccounts, {
    fields: [supplierOrders.supplierId],
    references: [supplierAccounts.id],
  }),
}));

export const externalProductsRelations = relations(externalProducts, ({ one, many }) => ({
  internalProduct: one(products, {
    fields: [externalProducts.internalProductId],
    references: [products.id],
  }),
  priceHistory: many(priceHistory),
  priceAlerts: many(priceAlerts),
  affiliateClicks: many(affiliateClicks),
  affiliateConversions: many(affiliateConversions),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  externalProduct: one(externalProducts, {
    fields: [priceHistory.externalProductId],
    references: [externalProducts.id],
  }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, {
    fields: [priceAlerts.userId],
    references: [users.id],
  }),
  internalProduct: one(products, {
    fields: [priceAlerts.internalProductId],
    references: [products.id],
  }),
  externalProduct: one(externalProducts, {
    fields: [priceAlerts.externalProductId],
    references: [externalProducts.id],
  }),
}));

export const affiliateClicksRelations = relations(affiliateClicks, ({ one }) => ({
  user: one(users, {
    fields: [affiliateClicks.userId],
    references: [users.id],
  }),
  externalProduct: one(externalProducts, {
    fields: [affiliateClicks.externalProductId],
    references: [externalProducts.id],
  }),
}));

export const affiliateConversionsRelations = relations(affiliateConversions, ({ one }) => ({
  click: one(affiliateClicks, {
    fields: [affiliateConversions.clickId],
    references: [affiliateClicks.id],
  }),
  user: one(users, {
    fields: [affiliateConversions.userId],
    references: [users.id],
  }),
  externalProduct: one(externalProducts, {
    fields: [affiliateConversions.externalProductId],
    references: [externalProducts.id],
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

// Admin-specific schema for updating users - only allows safe fields to be edited
export const adminUpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  demographic: z.enum(["men", "women", "young_adults", "children"]).optional(),
  age: z.number().int().positive().optional(),
  lifestyle: z.string().optional(),
  styleTags: z.array(z.string()).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  budgetTier: z.enum(["affordable", "mid_range", "premium", "luxury"]).optional(),
  preferredBrands: z.array(z.string()).optional(),
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

// Supplier Portal Insert Schemas
export const insertSupplierAccountSchema = createInsertSchema(supplierAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierProfileSchema = createInsertSchema(supplierProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRetailerProductSchema = createInsertSchema(retailerProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDesignerCollectionSchema = createInsertSchema(designerCollections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSubscriptionSchema = createInsertSchema(supplierSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierInvoiceSchema = createInsertSchema(supplierInvoices).omit({
  id: true,
  createdAt: true,
});

export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierMessageSchema = createInsertSchema(supplierMessages).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierOrderSchema = createInsertSchema(supplierOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationTokenSchema = createInsertSchema(integrationTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSnapshotSchema = createInsertSchema(analyticsSnapshots).omit({
  id: true,
  createdAt: true,
});

// Price Comparison Insert Schemas
export const insertRetailerConfigSchema = createInsertSchema(retailerConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExternalProductSchema = createInsertSchema(externalProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertAffiliateConversionSchema = createInsertSchema(affiliateConversions).omit({
  id: true,
  convertedAt: true,
  createdAt: true,
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

// Supplier Portal Types
export type SupplierAccount = typeof supplierAccounts.$inferSelect;
export type InsertSupplierAccount = z.infer<typeof insertSupplierAccountSchema>;

export type SupplierProfile = typeof supplierProfiles.$inferSelect;
export type InsertSupplierProfile = z.infer<typeof insertSupplierProfileSchema>;

export type RetailerProduct = typeof retailerProducts.$inferSelect;
export type InsertRetailerProduct = z.infer<typeof insertRetailerProductSchema>;

export type DesignerCollection = typeof designerCollections.$inferSelect;
export type InsertDesignerCollection = z.infer<typeof insertDesignerCollectionSchema>;

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;

export type SupplierSubscription = typeof supplierSubscriptions.$inferSelect;
export type InsertSupplierSubscription = z.infer<typeof insertSupplierSubscriptionSchema>;

export type SupplierInvoice = typeof supplierInvoices.$inferSelect;
export type InsertSupplierInvoice = z.infer<typeof insertSupplierInvoiceSchema>;

export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;

export type SupplierMessage = typeof supplierMessages.$inferSelect;
export type InsertSupplierMessage = z.infer<typeof insertSupplierMessageSchema>;

export type SupplierOrder = typeof supplierOrders.$inferSelect;
export type InsertSupplierOrder = z.infer<typeof insertSupplierOrderSchema>;

export type IntegrationToken = typeof integrationTokens.$inferSelect;
export type InsertIntegrationToken = z.infer<typeof insertIntegrationTokenSchema>;

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type InsertAnalyticsSnapshot = z.infer<typeof insertAnalyticsSnapshotSchema>;

// Price Comparison Types
export type RetailerConfig = typeof retailerConfigs.$inferSelect;
export type InsertRetailerConfig = z.infer<typeof insertRetailerConfigSchema>;

export type ExternalProduct = typeof externalProducts.$inferSelect;
export type InsertExternalProduct = z.infer<typeof insertExternalProductSchema>;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;

export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;
export type InsertAffiliateConversion = z.infer<typeof insertAffiliateConversionSchema>;

// ============================================
// WEDDING & PROM CONCIERGE FEATURE
// ============================================

export const eventTypeEnum = pgEnum("event_type", ["wedding", "prom", "formal", "other"]);
export const eventRoleEnum = pgEnum("event_role", ["bride", "groom", "guest", "attendee", "parent"]);

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  eventRole: eventRoleEnum("event_role").notNull(),
  eventDate: timestamp("event_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  stylePreferences: text("style_preferences").array(),
  colorScheme: text("color_scheme").array(),
  venue: text("venue"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventImageReferences = pgTable("event_image_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imageType: text("image_type").notNull(), // "inspiration", "venue", "color_swatch", "design"
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const eventCustomRequests = pgTable("event_custom_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // "dress", "suit", "tuxedo", "accessories"
  description: text("description"),
  budgetMin: integer("budget_min").notNull(),
  budgetMax: integer("budget_max").notNull(),
  measurements: jsonb("measurements").notNull(),
  status: requestStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const voiceLogs = pgTable("voice_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventImageReferenceSchema = createInsertSchema(eventImageReferences).omit({
  id: true,
  uploadedAt: true,
});

export const insertEventCustomRequestSchema = createInsertSchema(eventCustomRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVoiceLogSchema = createInsertSchema(voiceLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventImageReference = typeof eventImageReferences.$inferSelect;
export type InsertEventImageReference = z.infer<typeof insertEventImageReferenceSchema>;

export type EventCustomRequest = typeof eventCustomRequests.$inferSelect;
export type InsertEventCustomRequest = z.infer<typeof insertEventCustomRequestSchema>;

export type VoiceLog = typeof voiceLogs.$inferSelect;
export type InsertVoiceLog = z.infer<typeof insertVoiceLogSchema>;

// ============================================
// STYLIST PORTFOLIOS & PERSONAL AI PAGES
// ============================================

export const stylistApplications = pgTable("stylist_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  personalStatement: text("personal_statement").notNull(),
  experience: text("experience").notNull(), // "beginner", "intermediate", "professional", "expert"
  styleSpecialties: text("style_specialties").array().notNull(), // ["minimalist", "streetwear", "formal"]
  portfolioLinks: text("portfolio_links").array(), // External portfolio URLs
  instagramHandle: text("instagram_handle"),
  tiktokHandle: text("tiktok_handle"),
  websiteUrl: text("website_url"),
  status: stylistApplicationStatusEnum("status").default("pending").notNull(),
  reviewedBy: varchar("reviewed_by").references(() => adminUsers.id),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const stylistProfiles = pgTable("stylist_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  applicationId: varchar("application_id").references(() => stylistApplications.id),
  supplierId: varchar("supplier_id").references(() => supplierAccounts.id, { onDelete: "set null" }), // Link to Creator Studio
  handle: text("handle").notNull().unique(), // Unique URL slug: /stylists/[handle]
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  location: text("location"),
  styleSpecialties: text("style_specialties").array(), // Inherited from application
  instagramHandle: text("instagram_handle"),
  tiktokHandle: text("tiktok_handle"),
  websiteUrl: text("website_url"),
  linkedPersonaId: text("linked_persona_id").references(() => aiPersonas.id), // Connected AI stylist
  requiresSubscription: boolean("requires_subscription").default(false), // Requires Creator Studio subscription
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  totalFollowers: integer("total_followers").default(0),
  totalReviews: integer("total_reviews").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  profileViews: integer("profile_views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stylistPortfolioItems = pgTable("stylist_portfolio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(), // Public S3 URL
  s3Key: text("s3_key").notNull(), // For deletion
  title: text("title"),
  description: text("description"),
  tags: text("tags").array(), // ["streetwear", "minimalist", "sustainable"]
  collectionName: text("collection_name"),
  season: text("season"), // "Spring 2025", "Fall/Winter 2024"
  occasion: text("occasion"), // "Wedding", "Casual", "Business"
  clientType: text("client_type"), // For AI training: "bride", "business professional", "casual client"
  priceRange: text("price_range"), // For AI training: "$500-1000", "$1000-2000", "$2000+"
  styleNotes: text("style_notes"), // Detailed notes for AI training
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const stylistRfqs = pgTable("stylist_rfqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // "wedding", "prom", "business", "custom"
  description: text("description").notNull(),
  budgetMin: integer("budget_min").notNull(),
  budgetMax: integer("budget_max").notNull(),
  deadline: timestamp("deadline"),
  status: rfqStatusEnum("status").default("open").notNull(),
  stylistResponse: text("stylist_response"),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  estimatedTimeline: text("estimated_timeline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const stylistFollowers = pgTable("stylist_followers", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  followedAt: timestamp("followed_at").defaultNow().notNull(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.userId}, ${table.stylistId})`,
}));

export const stylistReviews = pgTable("stylist_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false), // Did they work together via RFQ?
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// AI STYLIST ONBOARDING - TRAINING & PROMPTS
// ============================================

export const aiTrainingResponses = pgTable("ai_training_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  questionId: varchar("question_id").notNull(), // e.g., "PHIL_01", "CLIENT_05"
  questionText: text("question_text").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(), // "philosophy", "client_approach", "expertise", "personality"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiStylistPrompts = pgTable("ai_stylist_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stylistId: varchar("stylist_id").notNull().unique().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  systemPrompt: text("system_prompt").notNull(), // Full OpenAI system prompt
  promptVersion: integer("prompt_version").default(1).notNull(),
  trainingCompletedAt: timestamp("training_completed_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationCredits = pgTable("conversation_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  creditsRemaining: integer("credits_remaining").default(5).notNull(), // 5 free messages per month
  periodStart: timestamp("period_start").defaultNow().notNull(),
  periodEnd: timestamp("period_end").notNull(), // Reset monthly
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiSubscriptions = pgTable("ai_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // "active", "cancelled", "expired"
  plan: text("plan").notNull().default("premium"), // "premium" ($9.99/mo)
  pricePerMonth: decimal("price_per_month", { precision: 10, scale: 2 }).default("9.99").notNull(),
  stylistShare: decimal("stylist_share", { precision: 10, scale: 2 }).default("7.99").notNull(), // 80%
  platformShare: decimal("platform_share", { precision: 10, scale: 2 }).default("2.00").notNull(), // 20%
  stripeSubscriptionId: text("stripe_subscription_id"), // Stripe subscription ID (stub for now)
  stripeCustomerId: text("stripe_customer_id"), // Stripe customer ID (stub for now)
  currentPeriodStart: timestamp("current_period_start").defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CREATOR STUDIO - SUBSCRIPTION TIERS
// ============================================

export const creatorTiers = pgTable("creator_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Free", "Basic", "Premium"
  description: text("description"),
  priceCents: integer("price_cents").notNull().default(0), // $4.99 = 499, $9.99 = 999
  perks: jsonb("perks").$type<string[] | null>(), // ["Exclusive posts", "AI chat access", "Custom requests"]
  isPublic: boolean("is_public").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  stripePriceId: text("stripe_price_id"), // Stripe Price ID for recurring billing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CREATOR STUDIO - POSTS
// ============================================

export const creatorPosts = pgTable("creator_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  tierId: varchar("tier_id").references(() => creatorTiers.id, { onDelete: "set null" }), // null = public post
  contentType: creatorPostContentTypeEnum("content_type").notNull().default("text"),
  title: text("title"),
  content: text("content"),
  mediaUrls: text("media_urls").array(), // S3 URLs for images/videos
  tags: text("tags").array(), // ["streetwear", "summer", "lookbook"]
  isPublic: boolean("is_public").default(false).notNull(), // true = everyone, false = subscribers only
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CREATOR STUDIO - SUBSCRIPTIONS
// ============================================

export const creatorSubscriptions = pgTable("creator_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  tierId: varchar("tier_id").notNull().references(() => creatorTiers.id, { onDelete: "cascade" }),
  status: creatorSubscriptionStatusEnum("status").default("active").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start").defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CREATOR STUDIO - TIPS/DONATIONS
// ============================================

export const creatorTips = pgTable("creator_tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(), // $5.00 = 500
  message: text("message"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CREATOR STUDIO - CUSTOM REQUESTS (RFQ)
// ============================================

export const creatorCustomRequests = pgTable("creator_custom_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  brief: text("brief").notNull(), // Detailed description of what they want
  eventType: text("event_type"), // "wedding", "prom", "photoshoot", "everyday"
  budgetMinCents: integer("budget_min_cents").notNull(),
  budgetMaxCents: integer("budget_max_cents").notNull(),
  dueDate: timestamp("due_date"),
  status: creatorRfqStatusEnum("status").default("pending").notNull(),
  quotePriceCents: integer("quote_price_cents"), // Creator's quote
  quoteMessage: text("quote_message"), // Creator's response
  quoteLeadTimeDays: integer("quote_lead_time_days"),
  quotedAt: timestamp("quoted_at"),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CREATOR STUDIO - MODERATION
// ============================================

export const moderationFlags = pgTable("moderation_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  objectType: text("object_type").notNull(), // "post", "profile", "comment"
  objectId: varchar("object_id").notNull(), // ID of the flagged content
  reason: text("reason").notNull(), // "inappropriate", "spam", "copyright"
  details: text("details"),
  status: moderationStatusEnum("status").default("pending").notNull(),
  reviewerId: varchar("reviewer_id").references(() => adminUsers.id), // Admin who reviewed
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CREATOR STUDIO - PAYOUTS
// ============================================

export const creatorPayouts = pgTable("creator_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stylistId: varchar("stylist_id").notNull().references(() => stylistProfiles.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(), // Total payout amount
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),
  stripeTransferId: text("stripe_transfer_id"), // Stripe Connect transfer ID
  breakdown: jsonb("breakdown"), // { subscriptions: 5000, tips: 500, rfqs: 1000 }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertStylistApplicationSchema = createInsertSchema(stylistApplications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export const insertStylistProfileSchema = createInsertSchema(stylistProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStylistPortfolioItemSchema = createInsertSchema(stylistPortfolioItems).omit({
  id: true,
  uploadedAt: true,
});

export const insertStylistRfqSchema = createInsertSchema(stylistRfqs).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertStylistFollowerSchema = createInsertSchema(stylistFollowers).omit({
  followedAt: true,
});

export const insertStylistReviewSchema = createInsertSchema(stylistReviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type StylistApplication = typeof stylistApplications.$inferSelect;
export type InsertStylistApplication = z.infer<typeof insertStylistApplicationSchema>;

export type StylistProfile = typeof stylistProfiles.$inferSelect;
export type InsertStylistProfile = z.infer<typeof insertStylistProfileSchema>;

export type StylistPortfolioItem = typeof stylistPortfolioItems.$inferSelect;
export type InsertStylistPortfolioItem = z.infer<typeof insertStylistPortfolioItemSchema>;

export type StylistRfq = typeof stylistRfqs.$inferSelect;
export type InsertStylistRfq = z.infer<typeof insertStylistRfqSchema>;

export type StylistFollower = typeof stylistFollowers.$inferSelect;
export type InsertStylistFollower = z.infer<typeof insertStylistFollowerSchema>;

export type StylistReview = typeof stylistReviews.$inferSelect;
export type InsertStylistReview = z.infer<typeof insertStylistReviewSchema>;

// AI Stylist Onboarding insert schemas
export const insertAiTrainingResponseSchema = createInsertSchema(aiTrainingResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiStylistPromptSchema = createInsertSchema(aiStylistPrompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationCreditSchema = createInsertSchema(conversationCredits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiSubscriptionSchema = createInsertSchema(aiSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI Stylist Onboarding types
export type AiTrainingResponse = typeof aiTrainingResponses.$inferSelect;
export type InsertAiTrainingResponse = z.infer<typeof insertAiTrainingResponseSchema>;

export type AiStylistPrompt = typeof aiStylistPrompts.$inferSelect;
export type InsertAiStylistPrompt = z.infer<typeof insertAiStylistPromptSchema>;

export type ConversationCredit = typeof conversationCredits.$inferSelect;
export type InsertConversationCredit = z.infer<typeof insertConversationCreditSchema>;

export type AiSubscription = typeof aiSubscriptions.$inferSelect;
export type InsertAiSubscription = z.infer<typeof insertAiSubscriptionSchema>;

// Creator Studio insert schemas
export const insertCreatorTierSchema = createInsertSchema(creatorTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatorPostSchema = createInsertSchema(creatorPosts).omit({
  id: true,
  viewCount: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatorSubscriptionSchema = createInsertSchema(creatorSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatorTipSchema = createInsertSchema(creatorTips).omit({
  id: true,
  createdAt: true,
});

export const insertCreatorCustomRequestSchema = createInsertSchema(creatorCustomRequests).omit({
  id: true,
  quotePriceCents: true,
  quoteMessage: true,
  quoteLeadTimeDays: true,
  quotedAt: true,
  acceptedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModerationFlagSchema = createInsertSchema(moderationFlags).omit({
  id: true,
  createdAt: true,
});

export const insertCreatorPayoutSchema = createInsertSchema(creatorPayouts).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Creator Studio types
export type CreatorTier = typeof creatorTiers.$inferSelect & { perks?: string[] | null };
export type InsertCreatorTier = z.infer<typeof insertCreatorTierSchema>;

export type CreatorPost = typeof creatorPosts.$inferSelect & { title?: string | null; mediaUrls?: string[] | null };
export type InsertCreatorPost = z.infer<typeof insertCreatorPostSchema>;

export type CreatorSubscription = typeof creatorSubscriptions.$inferSelect;
export type InsertCreatorSubscription = z.infer<typeof insertCreatorSubscriptionSchema>;

export type CreatorTip = typeof creatorTips.$inferSelect;
export type InsertCreatorTip = z.infer<typeof insertCreatorTipSchema>;

export type CreatorCustomRequest = typeof creatorCustomRequests.$inferSelect;
export type InsertCreatorCustomRequest = z.infer<typeof insertCreatorCustomRequestSchema>;

export type ModerationFlag = typeof moderationFlags.$inferSelect;
export type InsertModerationFlag = z.infer<typeof insertModerationFlagSchema>;

export type CreatorPayout = typeof creatorPayouts.$inferSelect;
export type InsertCreatorPayout = z.infer<typeof insertCreatorPayoutSchema>;

// ============================================
// VIRTUAL TRY-ON (TryFit Integration)
// ============================================

export const tryOnPhotoTypeEnum = pgEnum("try_on_photo_type", ["user_upload", "model"]);
export const tryOnSessionStatusEnum = pgEnum("try_on_session_status", ["pending", "processing", "completed", "failed"]);
export const tryOnGarmentCategoryEnum = pgEnum("try_on_garment_category", ["tops", "bottoms", "dresses", "outerwear", "accessories"]);
export const fitRatingEnum = pgEnum("fit_rating", ["too_small", "slightly_small", "perfect", "slightly_large", "too_large"]);

// Garments available for try-on (linked to stylist portfolios)
export const tryonGarments = pgTable('tryon_garments', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  stylistId: varchar('stylist_id').references(() => stylistProfiles.id, { onDelete: "set null" }),
  portfolioImageId: varchar('portfolio_image_id').references(() => stylistPortfolioItems.id, { onDelete: "set null" }),
  name: text('name').notNull(),
  category: tryOnGarmentCategoryEnum('category').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  overlayConfig: jsonb('overlay_config').$type<{
    category: 'top' | 'bottom' | 'dress' | 'outerwear';
    anchorPoints: {
      type: 'shoulders' | 'hips' | 'full';
      offsetY: number;
    };
    scale: {
      baseWidth: number;
      aspectRatio: number;
    };
    controlPoints?: Array<{ x: number; y: number }>;
    zIndex: number;
  }>(),
  sizesAvailable: text('sizes_available').array(),
  price: decimal('price', { precision: 10, scale: 2 }),
  externalPurchaseUrl: text('external_purchase_url'),
  isActive: boolean('is_active').default(true),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Track try-on usage for rate limiting (Free: 3/day, Premium: unlimited)
export const tryonUsage = pgTable('tryon_usage', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text('date').notNull(), // YYYY-MM-DD format
  count: integer('count').default(0),
});

// Individual try-on results within a session
export const tryonResults = pgTable('tryon_results', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar('session_id').notNull().references(() => tryOnSessions.id, { onDelete: "cascade" }),
  garmentIds: text('garment_ids').array().notNull(),
  resultImageUrl: text('result_image_url'),
  resultThumbnailUrl: text('result_thumbnail_url'),
  sizeRecommendation: jsonb('size_recommendation').$type<{
    recommendedSize: string;
    confidence: number;
    fitDescription: string;
    alternativeSize?: string;
    measurements?: {
      chest?: number;
      waist?: number;
      hips?: number;
    };
  }>(),
  savedToCloset: boolean('saved_to_closet').default(false),
  sharedPublicly: boolean('shared_publicly').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Social sharing and voting (public try-on results)
export const tryonShares = pgTable('tryon_shares', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  resultId: varchar('result_id').notNull().references(() => tryonResults.id, { onDelete: "cascade" }),
  shareCode: text('share_code').notNull().unique(),
  title: text('title'),
  voteCount: jsonb('vote_count').$type<{
    love: number;
    like: number;
    meh: number;
  }>().default({ love: 0, like: 0, meh: 0 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tryonVotes = pgTable('tryon_votes', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  shareId: varchar('share_id').notNull().references(() => tryonShares.id, { onDelete: "cascade" }),
  voterId: varchar('voter_id').references(() => users.id, { onDelete: "set null" }),
  voterIp: text('voter_ip'),
  vote: text('vote', { enum: ['love', 'like', 'meh'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Fit feedback for brand learning
export const fitFeedback = pgTable('fit_feedback', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: "cascade" }),
  garmentId: varchar('garment_id').references(() => tryonGarments.id, { onDelete: "set null" }),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  sizePurchased: text('size_purchased').notNull(),
  sizeRecommended: text('size_recommended'),
  fitRating: fitRatingEnum('fit_rating').notNull(),
  wouldBuyAgain: boolean('would_buy_again'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User brand preferences (learned from feedback)
export const userBrandPreferences = pgTable('user_brand_preferences', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: "cascade" }),
  brand: text('brand').notNull(),
  sizeAdjustment: decimal('size_adjustment', { precision: 3, scale: 1 }), // -2 to +2
  avgFitRating: decimal('avg_fit_rating', { precision: 3, scale: 2 }),
  totalPurchases: integer('total_purchases').default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// STYLE QUIZ & USER PROFILES (Enhanced UX)
// ============================================

export const riskToleranceEnum = pgEnum("risk_tolerance", ["classic", "balanced", "experimental", "trendy"]);
export const subscriptionTierTypeEnum = pgEnum("subscription_tier_type", ["free", "premium", "pro"]);

// Complete user style profile from onboarding quiz
export const userStyleProfiles = pgTable("user_style_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Style Identity
  aestheticPreferences: text("aesthetic_preferences").array(), // ["minimalist", "bohemian", "edgy"]
  silhouettePreferences: text("silhouette_preferences").array(), // ["oversized", "tailored", "flowy"]
  vibeWords: text("vibe_words").array(), // ["sophisticated", "relaxed", "bold"]
  colorPreferences: text("color_preferences").array(), // ["neutrals", "earth tones", "bold colors"]
  riskTolerance: riskToleranceEnum("risk_tolerance").default("balanced"),
  confidenceGoals: text("confidence_goals").array(), // ["professional", "approachable", "powerful"]
  
  // Lifestyle Blueprint
  lifestyleNeeds: text("lifestyle_needs").array(), // ["workwear", "weekend", "athleisure", "nightlife", "events"]
  primaryLifestyle: text("primary_lifestyle"), // Main focus area
  budgetOverallMin: integer("budget_overall_min").default(50),
  budgetOverallMax: integer("budget_overall_max").default(500),
  budgetPerItemMax: integer("budget_per_item_max").default(150),
  
  // Fit & Form Profile
  bodyType: text("body_type"), // "hourglass", "apple", "pear", "rectangle", "athletic"
  fitChallenges: text("fit_challenges").array(), // ["tight arms", "short torso", "long legs"]
  heightCategory: text("height_category"), // "petite", "average", "tall"
  proportions: text("proportions"), // "balanced", "long_torso", "long_legs"
  
  // Style Boundaries & Dealbreakers
  clothingDislikes: text("clothing_dislikes").array(), // ["crop tops", "high waisted", "skinny jeans"]
  fabricsToAvoid: text("fabrics_to_avoid").array(), // ["polyester", "wool", "leather"]
  silhouettesToAvoid: text("silhouettes_to_avoid").array(), // ["bodycon", "oversized"]
  
  // Photo References (optional)
  mirrorSelfieUrl: text("mirror_selfie_url"),
  pinterestBoardUrl: text("pinterest_board_url"),
  closetPhotosUrls: text("closet_photos_urls").array(),
  
  // Onboarding Status
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: integer("onboarding_step").default(1), // 1-4
  
  // AI Generated Profile
  styleIdentitySummary: text("style_identity_summary"), // AI-generated summary
  recommendedStylistId: varchar("recommended_stylist_id"), // AI persona recommendation
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User closet items (uploaded wardrobe)
export const userClosetItems = pgTable("user_closet_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"
  subcategory: text("subcategory"), // "t-shirt", "blouse", "jeans", "sneakers"
  color: text("color"),
  brand: text("brand"),
  styleTags: text("style_tags").array(),
  season: text("season"), // "spring", "summer", "fall", "winter", "all"
  aiDetectedAttributes: jsonb("ai_detected_attributes"), // AI-analyzed attributes
  timesWorn: integer("times_worn").default(0),
  lastWorn: timestamp("last_worn"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI-generated outfit recommendations
export const outfitRecommendations = pgTable("outfit_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recommendationType: text("recommendation_type").notNull(), // "daily", "weekly", "event", "weather", "capsule"
  title: text("title").notNull(),
  description: text("description"),
  occasion: text("occasion"), // "work", "date_night", "brunch", "casual"
  weather: text("weather"), // "sunny", "rainy", "cold", "hot"
  
  // Items in the outfit
  items: jsonb("items").notNull().$type<{
    productId?: string; // Marketplace item
    closetItemId?: string; // User's own item
    name: string;
    imageUrl: string;
    price?: number;
    affiliateUrl?: string;
    isFromCloset: boolean;
  }[]>(),
  
  // Styling notes
  stylistNotes: text("stylist_notes"), // AI or human notes
  voiceNoteUrl: text("voice_note_url"), // Human stylist voice note
  
  // Metadata
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  isLocked: boolean("is_locked").default(false), // Premium content
  isSaved: boolean("is_saved").default(false),
  isViewed: boolean("is_viewed").default(false),
  
  // Date context
  recommendedFor: timestamp("recommended_for"), // Target date for the outfit
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Outfit interaction tracking (for personalization)
export const outfitInteractions = pgTable("outfit_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  outfitId: varchar("outfit_id").notNull().references(() => outfitRecommendations.id, { onDelete: "cascade" }),
  interactionType: text("interaction_type").notNull(), // "view", "save", "share", "shop", "swap_request", "dislike"
  swappedItemIndex: integer("swapped_item_index"), // For swap requests
  swapReason: text("swap_reason"), // "different_color", "different_style", "too_expensive"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User subscription tier (for closet limits, outfit caps)
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  tier: subscriptionTierTypeEnum("tier").default("free").notNull(),
  
  // Usage limits
  closetUploadLimit: integer("closet_upload_limit").default(20), // Free: 20, Premium: unlimited
  weeklyOutfitLimit: integer("weekly_outfit_limit").default(5), // Free: 5, Premium: 20, Pro: unlimited
  outfitsUsedThisWeek: integer("outfits_used_this_week").default(0),
  weekStartDate: timestamp("week_start_date").defaultNow(),
  
  // Stripe info
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  
  // Features
  hasHumanStylist: boolean("has_human_stylist").default(false),
  hasCapsulePlanning: boolean("has_capsule_planning").default(false),
  hasUnlimitedTryOn: boolean("has_unlimited_try_on").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User saved items (lookbook)
export const userSavedItems = pgTable("user_saved_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // "product", "outfit", "outfit_item"
  productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }),
  outfitId: varchar("outfit_id").references(() => outfitRecommendations.id, { onDelete: "cascade" }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wardrobe gap analysis
export const wardrobeGapAnalysis = pgTable("wardrobe_gap_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  analysisDate: timestamp("analysis_date").defaultNow().notNull(),
  gaps: jsonb("gaps").$type<{
    category: string;
    description: string;
    priority: "high" | "medium" | "low";
    recommendedProducts: string[]; // Product IDs
  }[]>(),
  capsuleSuggestions: jsonb("capsule_suggestions").$type<{
    name: string;
    pieces: string[];
    versatilityScore: number;
  }[]>(),
  overallScore: integer("overall_score"), // Wardrobe completeness 0-100
  aiNotes: text("ai_notes"),
});

// Pre-photographed models for users who prefer not to upload their own photos
export const tryOnModels = pgTable("try_on_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  photoUrl: text("photo_url").notNull(),
  bodyType: text("body_type"), // "petite", "average", "athletic", "curvy", "plus_size"
  height: text("height"), // e.g., "5'4", "170cm"
  skinTone: text("skin_tone"), // "fair", "light", "medium", "tan", "dark"
  gender: text("gender").notNull(), // "male", "female", "unisex"
  // Pre-computed pose landmarks for faster try-on
  poseLandmarks: jsonb("pose_landmarks"), // MediaPipe 33 landmark coordinates
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User photos uploaded for virtual try-on
export const userTryOnPhotos = pgTable("user_try_on_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  photoUrl: text("photo_url").notNull(),
  poseLandmarks: jsonb("pose_landmarks"), // MediaPipe detected landmarks
  bodyMeasurements: jsonb("body_measurements"), // Calculated from landmarks
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Virtual try-on sessions
export const tryOnSessions = pgTable("try_on_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  // Photo source (either user upload or pre-photographed model)
  photoType: tryOnPhotoTypeEnum("photo_type").notNull(),
  userPhotoId: varchar("user_photo_id").references(() => userTryOnPhotos.id),
  modelId: varchar("model_id").references(() => tryOnModels.id),
  // Try-on items (array of product IDs with positions)
  tryOnItems: jsonb("try_on_items").notNull(), // [{productId, position, scale, rotation, layer}]
  status: tryOnSessionStatusEnum("status").default("pending").notNull(),
  // Result
  resultImageUrl: text("result_image_url"),
  sizeRecommendations: jsonb("size_recommendations"), // {productId: {size: "M", confidence: 0.85, fit: "standard"}}
  // Sharing
  shareToken: text("share_token").unique(),
  isPublic: boolean("is_public").default(false),
  // Analytics
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Social feedback on shared try-on results
export const tryOnVoteEnum = pgEnum("try_on_vote", ["love", "like", "meh", "not_for_me"]);

export const tryOnFeedback = pgTable("try_on_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => tryOnSessions.id, { onDelete: "cascade" }),
  vote: tryOnVoteEnum("vote"),
  comment: text("comment"),
  voterName: text("voter_name"), // Optional name for anonymous feedback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User closet (saved favorite items for try-on)
export const tryOnCloset = pgTable("try_on_closet", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Virtual Try-On insert schemas
export const insertTryOnModelSchema = createInsertSchema(tryOnModels).omit({
  id: true,
  createdAt: true,
});

export const insertUserTryOnPhotoSchema = createInsertSchema(userTryOnPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertTryOnSessionSchema = createInsertSchema(tryOnSessions).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTryOnFeedbackSchema = createInsertSchema(tryOnFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertTryOnClosetSchema = createInsertSchema(tryOnCloset).omit({
  id: true,
  addedAt: true,
});

// Additional insert schemas for enhanced try-on tables
export const insertTryonGarmentSchema = createInsertSchema(tryonGarments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTryonUsageSchema = createInsertSchema(tryonUsage).omit({
  id: true,
});

export const insertTryonResultSchema = createInsertSchema(tryonResults).omit({
  id: true,
  createdAt: true,
});

export const insertTryonShareSchema = createInsertSchema(tryonShares).omit({
  id: true,
  createdAt: true,
});

export const insertTryonVoteSchema = createInsertSchema(tryonVotes).omit({
  id: true,
  createdAt: true,
});

export const insertFitFeedbackSchema = createInsertSchema(fitFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertUserBrandPreferenceSchema = createInsertSchema(userBrandPreferences).omit({
  id: true,
  updatedAt: true,
});

// Virtual Try-On types
export type TryOnModel = typeof tryOnModels.$inferSelect;
export type InsertTryOnModel = z.infer<typeof insertTryOnModelSchema>;

export type UserTryOnPhoto = typeof userTryOnPhotos.$inferSelect;
export type InsertUserTryOnPhoto = z.infer<typeof insertUserTryOnPhotoSchema>;

export type TryOnSession = typeof tryOnSessions.$inferSelect;
export type InsertTryOnSession = z.infer<typeof insertTryOnSessionSchema>;

export type TryOnFeedback = typeof tryOnFeedback.$inferSelect;
export type InsertTryOnFeedback = z.infer<typeof insertTryOnFeedbackSchema>;

export type TryOnClosetItem = typeof tryOnCloset.$inferSelect;
export type InsertTryOnClosetItem = z.infer<typeof insertTryOnClosetSchema>;

// Enhanced try-on types
export type TryonGarment = typeof tryonGarments.$inferSelect;
export type InsertTryonGarment = z.infer<typeof insertTryonGarmentSchema>;

export type TryonUsage = typeof tryonUsage.$inferSelect;
export type InsertTryonUsage = z.infer<typeof insertTryonUsageSchema>;

export type TryonResult = typeof tryonResults.$inferSelect;
export type InsertTryonResult = z.infer<typeof insertTryonResultSchema>;

export type TryonShare = typeof tryonShares.$inferSelect;
export type InsertTryonShare = z.infer<typeof insertTryonShareSchema>;

export type TryonVote = typeof tryonVotes.$inferSelect;
export type InsertTryonVote = z.infer<typeof insertTryonVoteSchema>;

export type FitFeedback = typeof fitFeedback.$inferSelect;
export type InsertFitFeedback = z.infer<typeof insertFitFeedbackSchema>;

export type UserBrandPreference = typeof userBrandPreferences.$inferSelect;
export type InsertUserBrandPreference = z.infer<typeof insertUserBrandPreferenceSchema>;

// ============================================
// STYLE QUIZ & DASHBOARD - Insert Schemas and Types
// ============================================

export const insertUserStyleProfileSchema = createInsertSchema(userStyleProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserClosetItemSchema = createInsertSchema(userClosetItems).omit({
  id: true,
  createdAt: true,
});

export const insertOutfitRecommendationSchema = createInsertSchema(outfitRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertOutfitInteractionSchema = createInsertSchema(outfitInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSavedItemSchema = createInsertSchema(userSavedItems).omit({
  id: true,
  createdAt: true,
});

export const insertWardrobeGapAnalysisSchema = createInsertSchema(wardrobeGapAnalysis).omit({
  id: true,
});

// ==========================================
// SITUATIONAL STYLING ENGINE (Stage 0)
// ==========================================

export const anonymousSessions = pgTable("anonymous_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fingerprint: varchar("fingerprint"),
  category: varchar("category"),
  situation: varchar("situation"),
  vibe: varchar("vibe"),
  userId: varchar("user_id"),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

export const sessionOutfits = pgTable("session_outfits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  outfitData: jsonb("outfit_data").notNull(),
  hearted: boolean("hearted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  sessionId: varchar("session_id"),
  source: varchar("source").default("send_looks"),
  convertedToUserId: varchar("converted_to_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const engagementEvents = pgTable("engagement_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"),
  userId: varchar("user_id"),
  eventType: varchar("event_type").notNull(),
  eventData: jsonb("event_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contextualPrompts = pgTable("contextual_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  triggerCondition: varchar("trigger_condition").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  ctaLabel: varchar("cta_label").notNull(),
  ctaHref: varchar("cta_href").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// GIG ECONOMY — LOCAL ALTERATION SPECIALISTS
// ============================================

export const gigServiceTypeEnum = pgEnum("gig_service_type", [
  "hemming",
  "taking_in",
  "letting_out",
  "zipper_repair",
  "zipper_replacement",
  "button_repair",
  "lining_repair",
  "dress_fitting",
  "suit_alterations",
  "trouser_alterations",
  "sleeve_alterations",
  "general_alterations",
  "custom_embroidery",
  "patch_work",
  "clothing_repair",
  "other",
]);

export const gigProviders = pgTable("gig_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull().default("US"),
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  serviceRadiusMiles: integer("service_radius_miles").notNull().default(10),
  offersHomeVisits: boolean("offers_home_visits").notNull().default(false),
  offersDropOff: boolean("offers_drop_off").notNull().default(true),
  offersShipping: boolean("offers_shipping").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").notNull().default(0),
  completedJobs: integer("completed_jobs").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gigServices = pgTable("gig_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),
  serviceType: gigServiceTypeEnum("service_type").notNull(),
  customName: varchar("custom_name", { length: 100 }),
  description: text("description"),
  priceMin: integer("price_min").notNull(),
  priceMax: integer("price_max").notNull(),
  priceUnit: varchar("price_unit", { length: 20 }).notNull().default("per_item"),
  turnaroundDaysMin: integer("turnaround_days_min").notNull().default(1),
  turnaroundDaysMax: integer("turnaround_days_max").notNull().default(5),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gigAvailability = pgTable("gig_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  timeStart: varchar("time_start", { length: 5 }).default("09:00"),
  timeEnd: varchar("time_end", { length: 5 }).default("17:00"),
});

export const gigJobs = pgTable("gig_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").references(() => gigProviders.id, { onDelete: "set null" }),
  serviceType: gigServiceTypeEnum("service_type").notNull(),
  garmentDescription: text("garment_description").notNull(),
  alterationDetails: text("alteration_details").notNull(),
  garmentImageUrl: varchar("garment_image_url"),
  productId: integer("product_id"),
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull().default("drop_off"),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  neededBy: timestamp("needed_by"),
  scheduledAt: timestamp("scheduled_at"),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  agreedPrice: integer("agreed_price"),
  platformFee: integer("platform_fee"),
  customerCity: varchar("customer_city", { length: 100 }),
  customerLat: decimal("customer_lat", { precision: 10, scale: 7 }),
  customerLng: decimal("customer_lng", { precision: 10, scale: 7 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gigQuotes = pgTable("gig_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => gigJobs.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),
  price: integer("price").notNull(),
  turnaroundDays: integer("turnaround_days").notNull(),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gigMessages = pgTable("gig_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => gigJobs.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gigReviews = pgTable("gig_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => gigJobs.id, { onDelete: "cascade" }).unique(),
  customerId: varchar("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  qualityRating: integer("quality_rating"),
  speedRating: integer("speed_rating"),
  communicationRating: integer("communication_rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGigProviderSchema = createInsertSchema(gigProviders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGigServiceSchema = createInsertSchema(gigServices).omit({ id: true, createdAt: true });
export const insertGigJobSchema = createInsertSchema(gigJobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGigQuoteSchema = createInsertSchema(gigQuotes).omit({ id: true, createdAt: true });
export const insertGigMessageSchema = createInsertSchema(gigMessages).omit({ id: true, createdAt: true });
export const insertGigReviewSchema = createInsertSchema(gigReviews).omit({ id: true, createdAt: true });

export type GigProvider = typeof gigProviders.$inferSelect;
export type InsertGigProvider = z.infer<typeof insertGigProviderSchema>;
export type GigService = typeof gigServices.$inferSelect;
export type InsertGigService = z.infer<typeof insertGigServiceSchema>;
export type GigJob = typeof gigJobs.$inferSelect;
export type InsertGigJob = z.infer<typeof insertGigJobSchema>;
export type GigQuote = typeof gigQuotes.$inferSelect;
export type InsertGigQuote = z.infer<typeof insertGigQuoteSchema>;
export type GigMessage = typeof gigMessages.$inferSelect;
export type InsertGigMessage = z.infer<typeof insertGigMessageSchema>;
export type GigReview = typeof gigReviews.$inferSelect;
export type InsertGigReview = z.infer<typeof insertGigReviewSchema>;

export const insertAnonymousSessionSchema = createInsertSchema(anonymousSessions).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});
export const insertSessionOutfitSchema = createInsertSchema(sessionOutfits).omit({
  id: true,
  createdAt: true,
});
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});
export const insertEngagementEventSchema = createInsertSchema(engagementEvents).omit({
  id: true,
  createdAt: true,
});
export const insertContextualPromptSchema = createInsertSchema(contextualPrompts).omit({
  id: true,
  createdAt: true,
});

export type AnonymousSession = typeof anonymousSessions.$inferSelect;
export type InsertAnonymousSession = z.infer<typeof insertAnonymousSessionSchema>;
export type SessionOutfit = typeof sessionOutfits.$inferSelect;
export type InsertSessionOutfit = z.infer<typeof insertSessionOutfitSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type EngagementEvent = typeof engagementEvents.$inferSelect;
export type InsertEngagementEvent = z.infer<typeof insertEngagementEventSchema>;
export type ContextualPrompt = typeof contextualPrompts.$inferSelect;
export type InsertContextualPrompt = z.infer<typeof insertContextualPromptSchema>;

// Style Quiz & Dashboard Types
export type UserStyleProfile = typeof userStyleProfiles.$inferSelect;
export type InsertUserStyleProfile = z.infer<typeof insertUserStyleProfileSchema>;

export type UserClosetItem = typeof userClosetItems.$inferSelect;
export type InsertUserClosetItem = z.infer<typeof insertUserClosetItemSchema>;

export type OutfitRecommendation = typeof outfitRecommendations.$inferSelect;
export type InsertOutfitRecommendation = z.infer<typeof insertOutfitRecommendationSchema>;

export type OutfitInteraction = typeof outfitInteractions.$inferSelect;
export type InsertOutfitInteraction = z.infer<typeof insertOutfitInteractionSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type UserSavedItem = typeof userSavedItems.$inferSelect;
export type InsertUserSavedItem = z.infer<typeof insertUserSavedItemSchema>;

export type WardrobeGapAnalysis = typeof wardrobeGapAnalysis.$inferSelect;
export type InsertWardrobeGapAnalysis = z.infer<typeof insertWardrobeGapAnalysisSchema>;

// ── Virtual Try-On Types ──────────────────────────────────────────
export interface BodyLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
