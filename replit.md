# SeamXY - AI-Powered Universal Clothing Marketplace

## Overview

SeamXY is an AI-powered fashion marketplace platform integrating retail shopping with custom tailoring. It leverages AI for fit matching and virtual fashion consultation, aiming to build a global fashion ecosystem. The platform supports multi-demographic shopping, offers both retail and custom tailor networks, and provides smart onboarding for personalized recommendations. Its core vision is to reduce returns, enhance customer loyalty, empower bespoke craftsmanship, and foster sustainable innovation in the fashion industry. The platform also includes a "Creator Studio" for fashion stylists to monetize their expertise through subscriptions, exclusive content, and custom requests, operating on an 80/20 revenue split model.

## User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

SeamXY's architecture is built on a modern web stack for scalability and rich user experiences.

### UI/UX Decisions
- **Typography**: Inter (primary), Plus Jakarta Sans (display).
- **Color Scheme**: `shadcn/ui`'s default system with semantic tokens and elevation utilities.
- **Components**: `shadcn/ui` primitives, custom `ProductCard`, and a persona chat interface.
- **Design Patterns**: Responsive grid layouts for product display.

### Technical Implementations
- **Frontend**: React 18, Wouter, TanStack Query, Tailwind CSS, `shadcn/ui`.
- **Backend**: Express.js with TypeScript, connected to Neon Serverless PostgreSQL.
- **AI Integration**: OpenAI GPT-5/GPT-4o for style analysis, virtual stylists, and product matching, integrated via Replit AI Integrations.
- **Database Schema**: Core entities include `users`, `measurements`, `products`, `makers`, `custom_requests`, `quotes`, `orders`, and extensive tables for admin, supplier, and creator functionalities including `admin_users`, `subscription_plans`, `audit_logs`, `supplier_accounts`, `creator_tiers`, `creator_posts`, `ai_stylist_prompts`, and `affiliate_conversions`.
- **API Routes**: Comprehensive API for Marketplace (user profiles, product search), Admin (user/maker management), AI Stylist (chat sessions, onboarding), Supplier Portal (product catalogs, e-commerce integrations), Price Comparison, and Creator Studio (tiers, posts, subscriptions, tips, custom requests, moderation, directory).
- **Scoring Algorithm**: Products are scored based on Fit (50%), Style (30%), and Budget (20%).
- **Monetization Model**: Affiliate commissions (4-10%), bespoke platform fee (10%), tiered maker subscriptions, AI Stylist Pro subscriptions, and Creator Studio (80/20 revenue split) via subscription tiers, tips, and custom requests.
- **Security**: Bcrypt for password hashing, AES-256-CBC for token encryption, RBAC middleware for authentication.

### Feature Specifications
- **Multi-Demographic Support**: Caters to Men, Women, Young Adults, and Children.
- **AI-Powered Fit Matching**: Scores products based on user input.
- **Dual Marketplace**: Integrates retail quick-buy with a custom tailor network.
- **Smart Onboarding**: Guides users through measurement, style description, and budget.
- **AI Personality Stylists**: 8 GPT-5 powered personas for fashion advice.
- **Admin Panel**: Role-based access, analytics, monetization controls, maker approval, and VIP user creation workflow.
- **Supplier Portal**: B2B platform for retailers, tailors, designers to manage products, custom requests, and communications.
- **Smart Price Compare**: Real-time comparison across major e-commerce platforms with AI product matching.
- **Wedding & Prom Concierge**: AI-powered conversational stylist for event shopping.
- **AI Stylist Onboarding System**: Allows stylists to create personalized AI clones via training questions, generating custom OpenAI prompts.
- **AI-Powered Affiliate Product Recommendations**: AI stylists recommend shoppable products during conversations using OpenAI Function Calling, multi-retailer search, and smart product matching.
- **Affiliate Marketing Analytics Dashboard**: Provides creators with metrics like total clicks, conversions, commission revenue, and conversion rates.
- **Creator Studio**: Enables stylists to create subscription tiers, post exclusive content, receive tips, accept custom requests, and view analytics. Includes a public creator directory and automated Stripe webhook integration for subscription management.

## External Dependencies

- **Database**: Neon Serverless PostgreSQL.
- **AI**: OpenAI GPT-5/GPT-4o.
- **File Storage**: AWS S3.
- **Payment Processing**: Stripe (API version: 2024-11-20.acacia).
- **Retailer APIs**: Etsy Open API v3, Amazon Product Advertising API, eBay Browse API, Rakuten API.
- **E-commerce Platforms (for Supplier Portal)**: Shopify, WooCommerce, BigCommerce.