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
- **Design Patterns**: Responsive grid layouts for product display.

### Technical Implementations
- **Frontend**: React 18, Wouter, TanStack Query, Tailwind CSS, `shadcn/ui`.
- **Backend**: Express.js with TypeScript.
- **AI Integration**: OpenAI GPT-5/GPT-4o for style analysis, virtual stylists, and product matching, integrated via Replit AI Integrations.
- **Database Schema**: Core entities include `users`, `measurements`, `products`, `makers`, `custom_requests`, `quotes`, `orders`, along with tables for admin, supplier, and creator functionalities (`admin_users`, `subscription_plans`, `audit_logs`, `supplier_accounts`, `creator_tiers`, `creator_posts`, `ai_stylist_prompts`, `affiliate_conversions`). Recent additions include tables for an anonymous-first situational styling engine (`anonymous_sessions`, `session_outfits`, `leads`, `engagement_events`, `contextual_prompts`) and a gig economy layer (`gigProviders`, `gigServices`, `gigAvailability`, `gigJobs`, `gigQuotes`, `gigMessages`, `gigReviews`).
- **API Routes**: Comprehensive APIs cover Marketplace (user profiles, product search), Admin (user/maker management), AI Stylist (chat sessions, onboarding), Supplier Portal (product catalogs, e-commerce integrations), Price Comparison, Creator Studio (tiers, posts, subscriptions, tips, custom requests, moderation, directory), and a Gig Economy layer for local services.
- **Scoring Algorithm**: Products are scored based on Fit (50%), Style (30%), and Budget (20%).
- **Monetization Model**: Affiliate commissions (4-10%), bespoke platform fee (10%), tiered maker subscriptions, AI Stylist Pro subscriptions, and Creator Studio (80/20 revenue split) via subscription tiers, tips, and custom requests. A 12% platform fee applies to completed gig economy jobs.
- **Security**: Bcrypt for password hashing, AES-256-CBC for token encryption, RBAC middleware for authentication.

### Feature Specifications
- **Multi-Demographic Support**: Caters to Men, Women, Young Adults, and Children.
- **AI-Powered Fit Matching**: Scores products based on user input.
- **Dual Marketplace**: Integrates retail quick-buy with a custom tailor network.
- **Smart Onboarding**: Guides users through measurement, style description, and budget.
- **AI Personality Stylists**: 8 GPT-5 powered personas for fashion advice.
- **Admin Panel**: Role-based access, analytics, monetization controls, maker/creator approval, VIP user creation.
- **Supplier Portal**: B2B platform for retailers, tailors, designers to manage products, custom requests, and communications.
- **Smart Price Compare**: Real-time comparison across major e-commerce platforms with AI product matching.
- **Wedding & Prom Concierge**: AI-powered conversational stylist for event shopping.
- **AI Stylist Onboarding System**: Allows stylists to create personalized AI clones.
- **AI-Powered Affiliate Product Recommendations**: AI stylists recommend shoppable products using OpenAI Function Calling and multi-retailer search.
- **Affiliate Marketing Analytics Dashboard**: Provides creators with metrics.
- **Creator Studio**: Enables stylists to create subscription tiers, post exclusive content, receive tips, accept custom requests, and view analytics. Includes a public creator directory and automated Stripe webhook integration.
- **Situational Styling Engine**: An anonymous-first front door for outfit recommendations based on category, situation, and vibe, designed to reduce friction and capture leads.
- **Gig Economy Layer**: Allows local seamstresses/tailors to list services and match with nearby customers for alterations, including provider registration, job posting, quoting, and messaging.
- **Virtual Try-On**: Features photo upload, model selection, canvas-based studio with controls, and size recommendation integration.
- **Style Quiz & Dashboard**: A comprehensive quiz to build user style profiles, feeding into a personalized dashboard with outfit recommendations and a closet management system.

## External Dependencies

- **Database**: Neon Serverless PostgreSQL.
- **AI**: OpenAI GPT-5/GPT-4o.
- **File Storage**: AWS S3.
- **Payment Processing**: Stripe.
- **Retailer APIs**: Etsy Open API v3, Amazon Product Advertising API, eBay Browse API, Rakuten API.
- **E-commerce Platforms (for Supplier Portal)**: Shopify, WooCommerce, BigCommerce.