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
- **Database Schema**: Core entities include `users`, `measurements`, `products`, `makers`, `custom_requests`, `quotes`, and `orders`. Admin functionalities leverage `admin_users`, `pricing_configs`, `subscription_plans`, `subscriptions`, and `audit_logs`. Supplier Portal adds `supplier_accounts`, `retailer_products`, `designer_collections`, `portfolio_items`, `supplier_subscriptions`, and `supplier_orders`. New features introduce `retailer_configs`, `external_products`, `price_history`, `price_alerts`, `affiliate_clicks`, `affiliate_conversions`, `events`, `event_image_references`, `event_custom_requests`, `voice_logs`, `ai_training_responses`, `ai_stylist_prompts`, `conversation_credits`, and `ai_subscriptions`.
- **API Routes**:
    - **Marketplace**: User profiles, style analysis, product search, maker listings, custom requests.
    - **Admin**: Authentication, user/maker management, pricing, audit logs.
    - **AI Stylist**: AI personas, chat sessions.
    - **Supplier Portal**: Authentication, profile management, product catalogs, portfolios, e-commerce integrations, messaging, orders, analytics.
    - **Price Comparison**: `/api/v1/products/:id/compare-prices`, `/api/v1/price-alerts`, `/api/v1/affiliate-click`, `/api/v1/affiliate-conversion`.
    - **AI Stylist Onboarding**: `/api/v1/supplier/:stylistId/training-responses`, `/api/v1/supplier/:stylistId/generate-prompt`, `/api/v1/stylist/:handle/chat`, `/api/v1/subscribe/:stylistId`.
- **Scoring Algorithm**: Products are scored based on Fit (50%), Style (30%), and Budget (20%).
- **Monetization Model**: Affiliate commissions (4-10%), bespoke platform fee (10%), tiered maker subscriptions, and AI Stylist Pro subscriptions.
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

## External Dependencies

- **Database**: Neon Serverless PostgreSQL.
- **AI**: OpenAI GPT-5/GPT-4o.
- **Retailer APIs**: Etsy Open API v3, Amazon Product Advertising API, eBay Browse API, Rakuten API.
- **E-commerce Platforms (for Supplier Portal)**: Shopify, WooCommerce, BigCommerce.