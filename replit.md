# SeamXY - AI-Powered Universal Clothing Marketplace

## Overview

SeamXY is an AI-powered fashion marketplace platform that integrates retail shopping with custom tailoring. It utilizes AI for fit matching and virtual fashion consultation, aiming to create a global fashion ecosystem. The platform supports multi-demographic shopping, offers both retail and custom tailor networks, and provides smart onboarding for personalized recommendations. Its vision is to reduce returns, enhance customer loyalty, empower bespoke craftsmanship, and foster sustainable innovation in fashion.

## User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

SeamXY's architecture is built on a modern web stack for scalability and rich user experiences.

### UI/UX Decisions
- **Typography**: Inter (primary), Plus Jakarta Sans (display) for clear hierarchy.
- **Color Scheme**: `shadcn/ui`'s default system with semantic tokens and elevation utilities.
- **Components**: `shadcn/ui` primitives, custom `ProductCard`, and a persona chat interface.
- **Design Patterns**: Responsive grid layouts for product display.

### Technical Implementations
- **Frontend**: React 18, Wouter, TanStack Query, Tailwind CSS, `shadcn/ui`.
- **Backend**: Express.js with TypeScript, connected to Neon Serverless PostgreSQL.
- **AI Integration**: OpenAI GPT-5/GPT-4o for style analysis, virtual stylists, and product matching, integrated via Replit AI Integrations.
- **Database Schema**: Core entities include `users` (with `stripeCustomerId` for Creator subscriptions), `measurements`, `products`, `makers`, `custom_requests`, `quotes`, and `orders`. Admin functionalities leverage `admin_users`, `pricing_configs`, `subscription_plans`, `subscriptions`, and `audit_logs`. Supplier Portal adds `supplier_accounts`, `retailer_products`, `designer_collections`, `portfolio_items`, `supplier_subscriptions`, and `supplier_orders`. New features introduce `retailer_configs`, `external_products`, `price_history`, `price_alerts`, `affiliate_clicks`, `affiliate_conversions`, `events`, `event_image_references`, `event_custom_requests`, `voice_logs`, `ai_training_responses`, `ai_stylist_prompts`, `conversation_credits`, and `ai_subscriptions`. **Creator Studio** adds `creator_tiers`, `creator_posts`, `creator_subscriptions`, `creator_tips`, `creator_custom_requests`, `moderation_flags`, and `creator_payouts` for content monetization.
- **API Routes**:
    - **Marketplace**: User profiles, style analysis, product search, maker listings, custom requests.
    - **Admin**: Authentication, user/maker management, pricing, audit logs.
    - **AI Stylist**: AI personas, chat sessions.
    - **Supplier Portal**: Authentication, profile management, product catalogs, portfolios, e-commerce integrations, messaging, orders, analytics.
    - **Price Comparison**: `/api/v1/products/:id/compare-prices`, `/api/v1/price-alerts`, `/api/v1/affiliate-click`, `/api/v1/affiliate-conversion`.
    - **AI Stylist Onboarding**: `/api/v1/supplier/:stylistId/training-responses`, `/api/v1/supplier/:stylistId/generate-prompt`, `/api/v1/stylist/:handle/chat`, `/api/v1/subscribe/:stylistId`.
    - **Creator Studio**: 
      - Tiers: `GET/POST/PATCH/DELETE /api/v1/creators/:stylistId/tiers`
      - Posts: `GET/POST/PATCH/DELETE /api/v1/creators/:stylistId/posts`
      - Subscriptions: `POST /api/v1/creators/:stylistId/subscribe`, `GET /api/v1/my-subscriptions`, `POST /api/v1/subscriptions/:id/cancel`
      - Tips: `POST /api/v1/creators/:stylistId/tip`, `GET /api/v1/creators/:stylistId/tips`
      - Custom Requests: `POST /api/v1/creators/:stylistId/request`, `GET /api/v1/creators/:stylistId/requests`, `GET/PATCH /api/v1/requests/:id`
      - Moderation: `POST /api/v1/moderation/flag`, `GET/PATCH /api/v1/admin/moderation/flags`
      - Directory: `GET /api/v1/creators/directory` (search, category filters, sorting)
      - Webhooks: `POST /api/v1/webhooks/stripe` (subscription lifecycle automation)
- **Scoring Algorithm**: Products are scored based on Fit (50%), Style (30%), and Budget (20%).
- **Monetization Model**: Affiliate commissions (4-10%), bespoke platform fee (10%), tiered maker subscriptions, AI Stylist Pro subscriptions, and **Creator Studio** (80/20 revenue split - 80% to creator, 20% to platform) via subscription tiers ($4.99-$14.99/mo), tips, and custom requests.
- **Security**: Bcrypt for password hashing, AES-256-CBC for token encryption, RBAC middleware for supplier authentication.

### Feature Specifications
- **Multi-Demographic Support**: Caters to Men, Women, Young Adults, and Children.
- **AI-Powered Fit Matching**: Scores products based on user input.
- **Dual Marketplace**: Integrates retail quick-buy with a custom tailor network.
- **Smart Onboarding**: Guides users through measurement, style description, and budget.
- **AI Personality Stylists**: 8 GPT-5 powered personas for fashion advice.
- **Admin Panel**: Role-based access, analytics, monetization controls, maker approval.
- **Supplier Portal**: B2B platform for retailers, tailors, designers to manage products, custom requests, and communications.
- **Smart Price Compare**: Real-time comparison across Amazon, eBay, Rakuten with AI product matching.
- **Wedding & Prom Concierge**: AI-powered conversational stylist for event shopping, combining retail with custom tailor quotes.
- **AI Stylist Onboarding System**: Allows stylists to create personalized AI clones via training questions, generating custom OpenAI prompts reflecting their style and expertise. Offers free and premium tiers with revenue sharing.
- **AI-Powered Affiliate Product Recommendations**: AI stylists now recommend shoppable products during conversations:
  - **OpenAI Function Calling**: AI autonomously decides when to search for products based on user requests
  - **Multi-Retailer Search**: Searches mock product databases for Amazon, eBay, and Rakuten
  - **Smart Product Matching**: AI calls `search_products` function with query, category, price range based on user budget
  - **Inline Shopping**: Product cards display below AI messages with images, prices, retailer badges, and "Shop Now" buttons
  - **Affiliate Tracking**: Clicks tracked via `POST /api/v1/affiliate-click` for commission attribution
  - **Revenue Stream**: 4-10% commission on purchases through affiliate links
  - **Components**: `AffiliateProductCard` with retailer color-coding, discount badges, shipping info
  - **Mock Data**: 15+ realistic products across blazers, shirts, pants, shoes, dresses, accessories for testing
  - **Implementation**: `server/services/ai-stylist-with-products.ts`, `client/src/components/affiliate-product-card.tsx`
- **Affiliate Marketing Analytics Dashboard**: Creator Studio dashboard now includes comprehensive affiliate performance tracking for designers:
  - **API Endpoint**: `GET /api/v1/supplier/affiliate-analytics` (designer-only access with role-based authentication)
  - **Key Metrics Display**:
    - Total Clicks: Product recommendations clicked by users
    - Conversions: Purchases completed through affiliate links
    - Commission Revenue: Total earnings from affiliate sales (4-10% commission)
    - Conversion Rate: Click-to-purchase conversion percentage
  - **Product Performance Table**: Shows top recommended products with individual metrics (clicks, conversions, CVR)
  - **Access Control**: Backend enforces designer-only access via `requireSupplierRole('designer')` middleware
  - **UI Location**: `/supplier/dashboard` - visible only to suppliers with role="designer"
  - **Data Flow**: React Query fetches analytics → shadcn Card components render metrics → conditional display based on supplier role
  - **Implementation**: `server/routes.ts` (API), `client/src/pages/supplier/dashboard.tsx` (UI)
- **Creator Studio** ("OnlyFans for Fashion"): Transforms platform into a creator monetization ecosystem where stylists can:
  - Create subscription tiers ($4.99-$14.99/mo) with custom features and benefits
  - Post exclusive content (text, images, videos, portfolio items) for subscribers
  - Receive tips/donations from supporters
  - Accept custom styling requests with personalized quotes
  - View analytics (subscribers, revenue, views, engagement)
  - Access via `/supplier/studio` dashboard and public profile at `/creator/:handle`
  - 80/20 revenue split favoring creators
  - **AI Stylist Subscription Gating**: Creators can require active subscriptions for AI chat access (stylist_profiles.requiresSubscription + supplierId)
  - **Public Creator Directory**: Browse all designers at `/creators` with search, category filters, and sorting
  - **Automated Subscription Management**: Stripe webhooks handle subscription lifecycle events (renewals, cancellations, payment success/failure)

## External Dependencies

- **Database**: Neon Serverless PostgreSQL.
- **AI**: OpenAI GPT-5/GPT-4o.
- **File Storage**: AWS S3 for portfolio images and media uploads.
- **Payment Processing**: Stripe for Creator Studio subscriptions, tips, and custom request payments (API version: 2024-11-20.acacia).
- **Retailer APIs**: Etsy Open API v3, Amazon Product Advertising API, eBay Browse API, Rakuten API.
- **E-commerce Platforms (for Supplier Portal)**: Shopify, WooCommerce, BigCommerce.

## Integration Testing

### Test Credentials
For integration testing and development, use these seeded test accounts:

- **Supplier Account**: `supplier@example.com` / `password123`
- **Designer Account**: `designer@seamxy.test` / `password123` (Pro tier, AI Stylist Onboarding enabled)
- **Stylist Profile**: `isabella-luxe` at `/stylists/isabella-luxe` (Isabella Rodriguez, luxury fashion consultant with AI training and product recommendations)
- **Customer Account**: `customer@example.com` / `password123`
- **Admin Account**: `admin@example.com` / `password123`

These accounts are automatically created by the seed script (`server/seed.ts`) on first run. The `isabella-luxe` stylist profile was created for testing AI chat with product recommendations.

### AI Stylist Onboarding Flow
The complete supplier onboarding flow has been tested end-to-end:

1. **Supplier Login** → Access supplier dashboard
2. **AI Training** (`/supplier/ai-training`) → Answer 66 training questions across 4 sections (Style Philosophy, Client Approach, Expertise & Specialties, Personality & Voice)
3. **AI Portfolio** (`/supplier/ai-portfolio`) → Upload portfolio items with context (images, descriptions, style notes, tags)
4. **AI Preview** (`/supplier/ai-preview`) → Generate personalized AI clone and test chat responses
5. **Customer Experience** → Customers can chat with AI stylist clones on `/ai-stylist` page

### Known Technical Details

**TanStack Query Key Format**: All query keys must use singular string URLs for the default queryFn to work correctly:
```typescript
// ✅ CORRECT
const { data } = useQuery({ 
  queryKey: [`/api/v1/supplier/${supplierId}/stylist-profile`] 
});

// ❌ INCORRECT (causes malformed URLs)
const { data } = useQuery({ 
  queryKey: ["/api/v1/supplier/:supplierId/stylist-profile", supplierId] 
});
```

**Loading State Handling**: All supplier AI pages (training, portfolio, preview) check `isLoadingProfile` before showing "Profile Required" errors to prevent race conditions.

**Auto-Creation**: Stylist profiles are automatically created on first access via the API endpoints.