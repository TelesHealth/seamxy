# SeamXY - AI-Powered Universal Clothing Marketplace

## Overview

SeamXY is an AI-powered fashion marketplace platform that integrates retail shopping with custom tailoring. Its core purpose is to leverage AI for fit matching and virtual fashion consultation to build a global fashion ecosystem. The platform supports multi-demographic shopping, offers both retail and custom tailor networks, and provides smart onboarding for personalized recommendations. Key ambitions include reducing returns, enhancing customer loyalty, empowering bespoke craftsmanship, and fostering sustainable innovation in the fashion industry. It also includes a "Creator Studio" for fashion stylists to monetize their expertise through subscriptions, exclusive content, and custom requests on an 80/20 revenue split model.

## User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

SeamXY's architecture is built on a modern web stack for scalability and rich user experiences, emphasizing core architectural patterns, design decisions, and technology choices.

### UI/UX Decisions
- **Typography**: Inter (primary), Plus Jakarta Sans (display).
- **Color Scheme**: `shadcn/ui`'s default system with semantic tokens and elevation utilities.
- **Components**: `shadcn/ui` primitives, custom `ProductCard`, and a persona chat interface.
- **Design Patterns**: Responsive grid layouts for product display; dark overlay washes on hero images for text legibility.
- **Homepage Strategy**: Anonymous-first hero with "Know exactly what to wear for any moment" — drives users straight into the situational styling flow without requiring sign-up.
- **Navigation**: Streamlined public nav — "Get Outfit Ideas", "How It Works", "Find Local Help", "Sign In" — with a "For Makers & Creators" secondary link. All advanced features (marketplace, admin, supplier, creator studio) accessible post sign-in.

### Technical Implementations
- **Frontend**: React 18, Wouter, TanStack Query, Tailwind CSS, `shadcn/ui`. Zustand for virtual try-on global state.
- **Backend**: Express.js with TypeScript.
- **AI Integration**: Anthropic Claude (`claude-opus-4-5`) for style analysis, virtual stylists, product matching, situational outfit generation, and affiliate product recommendations via `@anthropic-ai/sdk`. Replaced OpenAI entirely. Tool use API used for structured recommendations.
- **Database Schema**: Core entities include `users` (with `height_cm` and `body_measurements` fields), `measurements`, `products`, `makers`, `custom_requests`, `quotes`, `orders`, along with tables for admin, supplier, and creator functionalities (`admin_users`, `subscription_plans`, `audit_logs`, `supplier_accounts`, `creator_tiers`, `creator_posts`, `ai_stylist_prompts`, `affiliate_conversions`). Situational styling tables: `anonymous_sessions`, `session_outfits`, `leads`, `engagement_events`, `contextual_prompts`. Gig economy tables: `gigProviders`, `gigServices`, `gigAvailability`, `gigJobs`, `gigQuotes`, `gigMessages`, `gigReviews`. Virtual try-on tables: `tryOnModels`, `userTryOnPhotos`, `tryOnSessions` (with shareToken), `tryOnCloset`, `tryOnFeedback`, `fitFeedback`, `userBrandPreferences`.
- **API Routes**: Comprehensive APIs cover Marketplace (user profiles, product search), Admin (user/maker management), AI Stylist (chat sessions, onboarding), Supplier Portal (product catalogs, e-commerce integrations), Price Comparison, Creator Studio (tiers, posts, subscriptions, tips, custom requests, moderation, directory), Gig Economy (local services), Situational Styling (anonymous sessions, outfit generation, email capture/leads, engagement tracking), and Virtual Try-On.
- **Scoring Algorithm**: Products are scored based on Fit (50%), Style (30%), and Budget (20%).
- **Monetization Model**: Affiliate commissions (4-10%), bespoke platform fee (10%), tiered maker subscriptions, AI Stylist Pro subscriptions, and Creator Studio (80/20 revenue split) via subscription tiers, tips, and custom requests. A 12% platform fee applies to completed gig economy jobs.
- **Security**: Bcrypt for password hashing, AES-256-CBC for token encryption, RBAC middleware (`requireUser`, `requireAdmin`, `requireRole`) for authentication.
- **State Management**: Zustand (`client/src/store/tryOnStore.ts`) for virtual try-on canvas state (clothing layers, pose landmarks, session state).

### Feature Specifications
- **Multi-Demographic Support**: Caters to Men, Women, Young Adults, and Children.
- **AI-Powered Fit Matching**: Scores products based on user input.
- **Dual Marketplace**: Integrates retail quick-buy with a custom tailor network.
- **Smart Onboarding**: Guides users through measurement, style description, and budget.
- **AI Personality Stylists**: 8 Anthropic Claude-powered personas for fashion advice.
- **Admin Panel**: Role-based access, analytics, monetization controls, maker/creator approval, VIP user creation.
- **Supplier Portal**: B2B platform for retailers, tailors, designers to manage products, custom requests, and communications.
- **Smart Price Compare**: Real-time comparison across major e-commerce platforms with AI product matching.
- **Wedding & Prom Concierge**: AI-powered conversational stylist for event shopping.
- **AI Stylist Onboarding System**: Allows stylists to create personalized AI clones.
- **AI-Powered Affiliate Product Recommendations**: AI stylists recommend shoppable products using Anthropic tool use API and multi-retailer search.
- **Affiliate Marketing Analytics Dashboard**: Provides creators with metrics.
- **Creator Studio**: Enables stylists to create subscription tiers, post exclusive content, receive tips, accept custom requests, and view analytics. Includes a public creator directory and automated Stripe webhook integration.
- **Situational Styling Engine**: Full anonymous-first multi-step flow — category selection → situation description → vibe → AI outfit generation → results with "Shop the Look" and "Send me these looks" email capture. Includes lead generation, engagement event tracking, and signed-in users get continuity to their style dashboard. Routes: `/get-outfit-ideas`, `/how-it-works`.
- **Conversion Funnel**: Post-outfit sign-up prompts, email capture ("Send me these looks"), "Your Picks" saved outfit feature, and progressive feature discovery for registered users.
- **Gig Economy Layer**: Allows local seamstresses/tailors to list services and match with nearby customers for alterations, including provider registration, job posting, quoting, and messaging.
- **Virtual Try-On**: Canvas-based studio with clothing layer system, MediaPipe pose detection (`usePoseDetection.ts`), TPS warping (`tpsWarp.ts`), AR camera mode (`useARCamera.ts`), image compression, shadow generation, size recommendations, and shareable session links.
- **Style Quiz & Dashboard**: A comprehensive quiz to build user style profiles, feeding into a personalized dashboard with outfit recommendations and a closet management system.
- **Event Tracking**: `engagement_events` table records key user actions (outfit views, saves, email captures, sign-up prompts shown/accepted) for success metrics analysis.

## Key File Locations

- **Homepage**: `client/src/pages/home.tsx`
- **Situational Styling**: `client/src/pages/get-outfit-ideas.tsx` (multi-step: category → situation → vibe → results)
- **How It Works**: `client/src/pages/how-it-works.tsx`
- **Style Dashboard**: `client/src/pages/style-dashboard.tsx`
- **Virtual Try-On Store**: `client/src/store/tryOnStore.ts` (Zustand)
- **TPS Warp Library**: `client/src/lib/tpsWarp.ts`
- **AI Services**: `server/services/anthropic.ts`
- **Routes**: `server/routes.ts` (~4700 lines)
- **Storage**: `server/storage.ts` (~2475 lines, DatabaseStorage class)
- **Schema**: `shared/schema.ts` (~2452 lines)
- **Auth Middleware**: `server/middleware/auth.ts` — uses `requireUser`, `requireAdmin`, `requireRole`

## External Dependencies

- **Database**: Neon Serverless PostgreSQL. Run `npm run db:push` (with interactive prompts) or apply SQL directly to sync schema.
- **AI**: Anthropic Claude (`claude-opus-4-5`) via `@anthropic-ai/sdk`. Requires `ANTHROPIC_API_KEY` secret.
- **File Storage**: AWS S3.
- **Payment Processing**: Stripe.
- **Retailer APIs**: Etsy Open API v3, Amazon Product Advertising API, eBay Browse API, Rakuten API.
- **E-commerce Platforms (for Supplier Portal)**: Shopify, WooCommerce, BigCommerce.
- **MediaPipe**: Pose detection for virtual try-on.
- **Zustand**: Client-side global state for virtual try-on canvas.
- **react-dropzone**: Photo upload for virtual try-on.

## Known Issues / Gotchas

- `npm run db:push` may ask interactive questions about column renames (e.g., `ai_subscriptions.plan` vs `plan_type` in DB). Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for targeted SQL fixes when drizzle's interactive prompt blocks CI.
- `products.id` is `varchar` (UUID), not `integer`. All foreign keys referencing products must use `varchar("product_id")`.
- Auth middleware is `requireUser` (not `requireAuth`). Use `requireUser as any` pattern where TypeScript inference fails.
- The `ai_subscriptions` table has a schema/DB mismatch: schema uses `plan` field, DB has `plan_type` column. Seeding gracefully handles this.
