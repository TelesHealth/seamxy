CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'monetization_manager', 'support_admin');--> statement-breakpoint
CREATE TYPE "public"."budget_tier" AS ENUM('affordable', 'mid_range', 'premium', 'luxury');--> statement-breakpoint
CREATE TYPE "public"."demographic" AS ENUM('men', 'women', 'young_adults', 'children');--> statement-breakpoint
CREATE TYPE "public"."event_role" AS ENUM('bride', 'groom', 'guest', 'attendee', 'parent');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('wedding', 'prom', 'formal', 'other');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."price_alert_status" AS ENUM('active', 'triggered', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."retailer" AS ENUM('amazon', 'ebay', 'rakuten', 'shopify', 'internal');--> statement-breakpoint
CREATE TYPE "public"."rfq_status" AS ENUM('open', 'responded', 'accepted', 'declined', 'completed');--> statement-breakpoint
CREATE TYPE "public"."stylist_application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."supplier_role" AS ENUM('retailer', 'tailor', 'designer');--> statement-breakpoint
CREATE TYPE "public"."supplier_tier" AS ENUM('basic', 'pro', 'enterprise');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" "admin_role" NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "affiliate_clicks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"external_product_id" varchar NOT NULL,
	"retailer" "retailer" NOT NULL,
	"clicked_url" text NOT NULL,
	"referrer_page" text,
	"user_agent" text,
	"ip_address" text,
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_conversions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"click_id" varchar,
	"user_id" varchar,
	"external_product_id" varchar,
	"retailer" "retailer" NOT NULL,
	"order_id" text,
	"order_value" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2),
	"commission_amount" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"is_paid" boolean DEFAULT false,
	"paid_at" timestamp,
	"converted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"persona_id" varchar NOT NULL,
	"messages" jsonb NOT NULL,
	"user_context" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_personas" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"tone" text NOT NULL,
	"specialty" text,
	"system_prompt" text NOT NULL,
	"avatar_url" text,
	"voice_id" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar NOT NULL,
	"snapshot_date" timestamp NOT NULL,
	"total_orders" integer DEFAULT 0,
	"completed_orders" integer DEFAULT 0,
	"cancelled_orders" integer DEFAULT 0,
	"average_order_value" numeric(10, 2),
	"total_revenue" numeric(10, 2),
	"new_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"fit_match_rate" numeric(5, 2),
	"average_fit_score" numeric(5, 3),
	"top_selling_products" jsonb,
	"sizing_distribution" jsonb,
	"views_to_orders" numeric(5, 2),
	"quotes_to_orders" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" varchar NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"changes" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"item_type" text NOT NULL,
	"description" text,
	"style_tags" text[],
	"budget_min" integer NOT NULL,
	"budget_max" integer NOT NULL,
	"measurements" jsonb NOT NULL,
	"status" "request_status" DEFAULT 'open' NOT NULL,
	"selected_quote_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "designer_collections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"style_tags" text[],
	"cover_image_url" text,
	"is_made_to_measure" boolean DEFAULT false,
	"price_min" numeric(10, 2),
	"price_max" numeric(10, 2),
	"lead_time_days" integer DEFAULT 21,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_custom_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"item_type" text NOT NULL,
	"description" text,
	"budget_min" integer NOT NULL,
	"budget_max" integer NOT NULL,
	"measurements" jsonb NOT NULL,
	"status" "request_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_image_references" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar NOT NULL,
	"image_url" text NOT NULL,
	"image_type" text NOT NULL,
	"description" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"event_type" "event_type" NOT NULL,
	"event_role" "event_role" NOT NULL,
	"event_date" timestamp,
	"budget" numeric(10, 2),
	"style_preferences" text[],
	"color_scheme" text[],
	"venue" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internal_product_id" varchar,
	"retailer" "retailer" NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"brand" text,
	"category" text,
	"current_price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"image_url" text,
	"product_url" text NOT NULL,
	"affiliate_url" text,
	"available_sizes" text[],
	"shipping_cost" numeric(10, 2),
	"delivery_days" integer,
	"is_sustainable" boolean DEFAULT false,
	"sustainability_certifications" text[],
	"match_confidence" numeric(5, 2),
	"fit_confidence" numeric(5, 2),
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_type" text DEFAULT 'Bearer',
	"expires_at" timestamp,
	"shop_domain" text,
	"store_url" text,
	"scopes" text[],
	"is_active" boolean DEFAULT true,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "makers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"business_name" text NOT NULL,
	"owner_name" text NOT NULL,
	"description" text,
	"specialties" text[],
	"style_tags" text[],
	"budget_min" integer NOT NULL,
	"budget_max" integer NOT NULL,
	"location" text NOT NULL,
	"delivery_zones" text[],
	"lead_time_days" integer DEFAULT 14,
	"rating" numeric(3, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"portfolio_images" text[],
	"stripe_account_id" text,
	"subscription_tier" text DEFAULT 'basic',
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "makers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"chest" numeric(5, 2),
	"waist" numeric(5, 2),
	"hips" numeric(5, 2),
	"shoulders" numeric(5, 2),
	"sleeve" numeric(5, 2),
	"neck" numeric(5, 2),
	"inseam" numeric(5, 2),
	"outseam" numeric(5, 2),
	"thigh" numeric(5, 2),
	"shoe_size" numeric(4, 1),
	"shoe_width" text,
	"height" numeric(5, 2),
	"weight" numeric(5, 2),
	"unit" text DEFAULT 'inches',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_threads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"order_id" varchar,
	"request_id" varchar,
	"subject" text,
	"status" text DEFAULT 'active',
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"order_type" text NOT NULL,
	"product_id" varchar,
	"affiliate_commission" numeric(10, 2),
	"quote_id" varchar,
	"maker_id" varchar,
	"platform_fee" numeric(10, 2),
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"stripe_payment_id" text,
	"tracking_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"collection_id" varchar,
	"title" text NOT NULL,
	"description" text,
	"image_url" text NOT NULL,
	"style_tags" text[],
	"item_type" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"internal_product_id" varchar,
	"external_product_id" varchar,
	"target_price" numeric(10, 2) NOT NULL,
	"current_price" numeric(10, 2),
	"status" "price_alert_status" DEFAULT 'active',
	"notification_email" text,
	"triggered_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_product_id" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"is_available" boolean DEFAULT true,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_key" text NOT NULL,
	"config_value" text NOT NULL,
	"description" text,
	"updated_by" varchar,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_configs_config_key_unique" UNIQUE("config_key")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"category" text NOT NULL,
	"demographic" "demographic" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"budget_tier" "budget_tier" NOT NULL,
	"style_tags" text[],
	"image_url" text,
	"description" text,
	"sizes" text[],
	"size_chart" jsonb,
	"affiliate_url" text,
	"is_sponsored" boolean DEFAULT false,
	"sponsor_priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" varchar NOT NULL,
	"maker_id" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"lead_time_days" integer NOT NULL,
	"materials" text,
	"message" text,
	"match_score" numeric(5, 3),
	"is_accepted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retailer_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer" "retailer" NOT NULL,
	"api_key" text,
	"api_secret" text,
	"access_token" text,
	"partner_tag" text,
	"is_active" boolean DEFAULT true,
	"rate_limit" integer DEFAULT 1000,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retailer_configs_retailer_unique" UNIQUE("retailer")
);
--> statement-breakpoint
CREATE TABLE "retailer_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"product_id" varchar,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"category" text NOT NULL,
	"demographic" "demographic" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"budget_tier" "budget_tier" NOT NULL,
	"style_tags" text[],
	"image_url" text,
	"description" text,
	"sizes" text[],
	"size_chart" jsonb,
	"stock_quantity" integer DEFAULT 0,
	"sku" text,
	"external_id" text,
	"external_url" text,
	"channel_source" text,
	"sync_status" text DEFAULT 'active',
	"last_sync_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stylist_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"personal_statement" text NOT NULL,
	"experience" text NOT NULL,
	"style_specialties" text[] NOT NULL,
	"portfolio_links" text[],
	"instagram_handle" text,
	"tiktok_handle" text,
	"website_url" text,
	"status" "stylist_application_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"review_notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "stylist_followers" (
	"user_id" varchar NOT NULL,
	"stylist_id" varchar NOT NULL,
	"followed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stylist_portfolio_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stylist_id" varchar NOT NULL,
	"image_url" text NOT NULL,
	"s3_key" text NOT NULL,
	"title" text,
	"description" text,
	"tags" text[],
	"collection_name" text,
	"season" text,
	"occasion" text,
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stylist_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"application_id" varchar,
	"handle" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"cover_image_url" text,
	"location" text,
	"style_specialties" text[],
	"instagram_handle" text,
	"tiktok_handle" text,
	"website_url" text,
	"linked_persona_id" text,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"total_followers" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"profile_views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stylist_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "stylist_profiles_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "stylist_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"stylist_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stylist_rfqs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"stylist_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"description" text NOT NULL,
	"budget_min" integer NOT NULL,
	"budget_max" integer NOT NULL,
	"deadline" timestamp,
	"status" "rfq_status" DEFAULT 'open' NOT NULL,
	"stylist_response" text,
	"estimated_price" numeric(10, 2),
	"estimated_timeline" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_type" text NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"billing_cycle" text DEFAULT 'monthly',
	"features" text[],
	"is_active" boolean DEFAULT true,
	"stripe_price_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" varchar NOT NULL,
	"subscriber_type" text NOT NULL,
	"plan_id" varchar NOT NULL,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'active',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "supplier_role" NOT NULL,
	"tier" "supplier_tier" DEFAULT 'basic' NOT NULL,
	"business_name" text NOT NULL,
	"owner_name" text NOT NULL,
	"phone_number" text,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"onboarding_completed" boolean DEFAULT false,
	"stripe_account_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supplier_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "supplier_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"order_id" varchar,
	"invoice_type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"stripe_invoice_id" text,
	"stripe_payment_intent_id" text,
	"description" text,
	"paid_at" timestamp,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"sender_type" text NOT NULL,
	"content" text NOT NULL,
	"attachments" text[],
	"status" "message_status" DEFAULT 'sent',
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"supplier_id" varchar NOT NULL,
	"milestones" jsonb,
	"internal_notes" text,
	"estimated_completion_date" timestamp,
	"actual_completion_date" timestamp,
	"quality_check_status" text,
	"return_requested" boolean DEFAULT false,
	"return_reason" text,
	"return_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supplier_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "supplier_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"description" text,
	"location" text,
	"website_url" text,
	"logo_url" text,
	"specialties" text[],
	"style_tags" text[],
	"budget_min" integer,
	"budget_max" integer,
	"delivery_zones" text[],
	"lead_time_days" integer DEFAULT 14,
	"portfolio_images" text[],
	"ecommerce_platform" text,
	"catalog_sync_enabled" boolean DEFAULT false,
	"last_sync_at" timestamp,
	"rating" numeric(3, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"total_orders" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supplier_profiles_supplier_id_unique" UNIQUE("supplier_id")
);
--> statement-breakpoint
CREATE TABLE "supplier_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"tier" "supplier_tier" NOT NULL,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'active',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at" timestamp,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"demographic" "demographic" NOT NULL,
	"age" integer,
	"lifestyle" text,
	"style_tags" text[],
	"budget_min" integer DEFAULT 0,
	"budget_max" integer DEFAULT 500,
	"budget_tier" "budget_tier",
	"preferred_brands" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "voice_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar,
	"user_id" varchar NOT NULL,
	"audio_url" text,
	"transcription" text,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_external_product_id_external_products_id_fk" FOREIGN KEY ("external_product_id") REFERENCES "public"."external_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_click_id_affiliate_clicks_id_fk" FOREIGN KEY ("click_id") REFERENCES "public"."affiliate_clicks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_external_product_id_external_products_id_fk" FOREIGN KEY ("external_product_id") REFERENCES "public"."external_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_persona_id_ai_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."ai_personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_requests" ADD CONSTRAINT "custom_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designer_collections" ADD CONSTRAINT "designer_collections_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_custom_requests" ADD CONSTRAINT "event_custom_requests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_custom_requests" ADD CONSTRAINT "event_custom_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_image_references" ADD CONSTRAINT "event_image_references_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_products" ADD CONSTRAINT "external_products_internal_product_id_products_id_fk" FOREIGN KEY ("internal_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_tokens" ADD CONSTRAINT "integration_tokens_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_request_id_custom_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."custom_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_maker_id_makers_id_fk" FOREIGN KEY ("maker_id") REFERENCES "public"."makers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_collection_id_designer_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."designer_collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_internal_product_id_products_id_fk" FOREIGN KEY ("internal_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_external_product_id_external_products_id_fk" FOREIGN KEY ("external_product_id") REFERENCES "public"."external_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_external_product_id_external_products_id_fk" FOREIGN KEY ("external_product_id") REFERENCES "public"."external_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_configs" ADD CONSTRAINT "pricing_configs_updated_by_admin_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_request_id_custom_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."custom_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_maker_id_makers_id_fk" FOREIGN KEY ("maker_id") REFERENCES "public"."makers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_products" ADD CONSTRAINT "retailer_products_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_products" ADD CONSTRAINT "retailer_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_applications" ADD CONSTRAINT "stylist_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_applications" ADD CONSTRAINT "stylist_applications_reviewed_by_admin_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_followers" ADD CONSTRAINT "stylist_followers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_followers" ADD CONSTRAINT "stylist_followers_stylist_id_stylist_profiles_id_fk" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_portfolio_items" ADD CONSTRAINT "stylist_portfolio_items_stylist_id_stylist_profiles_id_fk" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_profiles" ADD CONSTRAINT "stylist_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_profiles" ADD CONSTRAINT "stylist_profiles_application_id_stylist_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."stylist_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_profiles" ADD CONSTRAINT "stylist_profiles_linked_persona_id_ai_personas_id_fk" FOREIGN KEY ("linked_persona_id") REFERENCES "public"."ai_personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_reviews" ADD CONSTRAINT "stylist_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_reviews" ADD CONSTRAINT "stylist_reviews_stylist_id_stylist_profiles_id_fk" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_rfqs" ADD CONSTRAINT "stylist_rfqs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stylist_rfqs" ADD CONSTRAINT "stylist_rfqs_stylist_id_stylist_profiles_id_fk" FOREIGN KEY ("stylist_id") REFERENCES "public"."stylist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_messages" ADD CONSTRAINT "supplier_messages_thread_id_message_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."message_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_orders" ADD CONSTRAINT "supplier_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_orders" ADD CONSTRAINT "supplier_orders_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_subscriptions" ADD CONSTRAINT "supplier_subscriptions_supplier_id_supplier_accounts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_logs" ADD CONSTRAINT "voice_logs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_logs" ADD CONSTRAINT "voice_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;