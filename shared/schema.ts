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
