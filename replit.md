# SeamXY - AI-Powered Universal Clothing Marketplace

## Overview

SeamXY is a comprehensive AI-powered fashion marketplace platform that combines retail shopping with custom tailoring services. It leverages AI for fit matching and virtual fashion consultation, aiming to become a global fashion ecosystem connecting consumers, retailers, tailors, and designers. The platform supports multi-demographic shopping, offers a dual marketplace for quick retail purchases and custom tailor networks, and provides smart onboarding for personalized recommendations. The business vision is to reduce returns, increase customer loyalty, empower bespoke craftsmanship, and drive sustainable innovation within the fashion industry.

## User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

SeamXY's architecture is built on a modern web stack designed for scalability and rich user experiences.

### UI/UX Decisions
- **Typography**: Primary font is Inter, display font is Plus Jakarta Sans, with a clear hierarchy for readability.
- **Color Scheme**: Utilizes `shadcn/ui`'s default color system with semantic tokens, including elevation utilities for interactive elements.
- **Components**: Leverages `shadcn/ui` primitives, alongside custom components like `ProductCard` and a specialized persona chat interface.
- **Design Patterns**: Responsive grid patterns for product display, supporting various column layouts.

### Technical Implementations
- **Frontend**: React 18, Wouter for routing, TanStack Query for data fetching, Tailwind CSS for styling, and shadcn/ui for UI components.
- **Backend**: Express.js with TypeScript, connected to Neon Serverless PostgreSQL.
- **AI Integration**: OpenAI GPT-5 is used for AI-driven features like style analysis and virtual stylists, integrated via Replit AI Integrations.
- **Database Schema**: Core entities include `users`, `measurements`, `products`, `makers`, `custom_requests`, `quotes`, and `orders`. Admin functionalities are supported by `admin_users`, `pricing_configs`, `subscription_plans`, `subscriptions`, and `audit_logs`. The Supplier Portal introduces `supplier_accounts`, `supplier_profiles`, `retailer_products`, `designer_collections`, `portfolio_items`, `supplier_subscriptions`, `supplier_invoices`, `supplier_messages`, `message_threads`, `supplier_orders`, `integration_tokens`, and `analytics_snapshots`.
- **API Routes**:
    - **Marketplace**: `/api/v1/` for user profiles, style analysis, measurements, product search, maker listings, custom requests, quotes, and order creation.
    - **Admin**: `/api/v1/admin/` for authentication, user/maker management, pricing configuration, and audit logs.
    - **AI Stylist**: `/api/v1/` for listing AI personas and managing chat sessions and messages.
    - **Supplier Portal**: `/api/v1/supplier/` for authentication, profile management, retailer product catalog, tailor portfolios, designer collections, e-commerce integrations, messaging, order management, and analytics.
- **Scoring Algorithm**: Products are scored based on a weighted average: Fit Score (50%), Style Match (30%), and Budget Match (20%).
- **Monetization Model**: Includes affiliate commissions (4-10%), a bespoke platform fee (10%), tiered maker subscriptions ($0, $29/mo, $99/mo), and an AI Stylist Pro subscription ($9.99/mo).

### Feature Specifications
- **Multi-Demographic Support**: Caters to Men, Women, Young Adults, and Children.
- **AI-Powered Fit Matching**: Scores products based on user measurements, style, and budget.
- **Dual Marketplace**: Seamlessly integrates retail quick-buy options with a custom tailor network.
- **Smart Onboarding**: Guides users through measurement input, freehand style description (AI-analyzed), and budget selection.
- **AI Personality Stylists**: Features 8 diverse GPT-5 powered personas offering context-aware fashion advice.
- **Admin Panel**: Provides role-based access for staff, analytics, monetization controls, maker approval workflows, and audit logging.
- **Supplier Portal**: A B2B platform for retailers, tailors, and designers to manage products, receive custom requests, communicate with customers, and utilize AI fit integration.

## Supplier Portal Implementation (Latest)

### Security & Authentication
- **Password Hashing**: Bcrypt with configurable cost factor (min 10, default 12)
- **Token Encryption**: AES-256-CBC for integration tokens with IV
  - Development: Uses deterministic fallback key (warns in console)
  - Production: Requires INTEGRATION_TOKEN_KEY (64-char hex, 32 bytes)
- **RBAC Middleware**: Session-based supplier authentication with role guards (retailer/tailor/designer) and tier checks (basic/pro/enterprise)
- **Session Requirement**: Supplier authentication requires express-session middleware (returns 500 with clear error if not configured)

### API Endpoints (30+)
- **Authentication**: `/api/v1/supplier/register`, `/login`, `/me`
- **Profile**: `/api/v1/supplier/profile` (PATCH), `/complete-onboarding` (POST)
- **Retailer** (role-gated): `/api/v1/supplier/retailer/products` (GET, POST, PATCH, DELETE)
- **Tailor** (role-gated): `/api/v1/supplier/tailor/portfolio`, `/custom-requests`
- **Designer** (role-gated): `/api/v1/supplier/designer/collections`
- **Integrations** (tier-gated pro/enterprise): `/api/v1/supplier/integrations` (GET, POST, DELETE)
- **Messaging**: `/api/v1/supplier/messages` with thread management
- **Orders**: `/api/v1/supplier/orders` with milestone tracking
- **Analytics**: `/api/v1/supplier/analytics` with date range filtering

### E-Commerce Integrations
- **Shopify**: OAuth flow, product sync, webhook registration (orders/create, products/update)
- **WooCommerce**: Basic auth, product sync via REST API, webhook setup
- **BigCommerce**: OAuth flow, catalog sync via V3 API
- **Amazon SP-API**: Placeholder (explicitly throws error directing to other platforms)
  - Note: Full implementation requires amazon-sp-api SDK and complex AWS signing
  - Deferred to Phase 2 or manual CSV upload for MVP

### Deployment Requirements
1. **Session Middleware**: Must configure express-session before supplier portal testing
2. **Encryption Key**: Set INTEGRATION_TOKEN_KEY environment variable (64-char hex) for production
   - Generate with: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`
3. **Amazon Integration**: Communicate to frontend teams that Amazon is not yet available (use Shopify/WooCommerce/BigCommerce)

## External Dependencies

- **Database**: Neon Serverless PostgreSQL
- **AI**: OpenAI GPT-5 (via Replit AI Integrations)
- **E-commerce Platforms (for Supplier Portal)**: Shopify ✅, WooCommerce ✅, BigCommerce ✅, Amazon Seller Central ⏳ (deferred)
- **Payment Processing (Future)**: Stripe
- **AI Video/Voice (Future)**: Synthesia/HeyGen, ElevenLabs