# SeamXY - AI-Powered Universal Clothing Marketplace

## Overview

SeamXY is an AI-powered fashion marketplace platform integrating retail shopping with custom tailoring. It leverages AI for fit matching and virtual fashion consultation, aiming to build a global fashion ecosystem. The platform supports multi-demographic shopping, offers both retail and custom tailor networks, and provides smart onboarding for personalized recommendations. Its core vision is to reduce returns, enhance customer loyalty, empower bespoke craftsmanship, and foster sustainable innovation in the fashion industry. The platform also includes a "Creator Studio" for fashion stylists to monetize their expertise through subscriptions, exclusive content, and custom requests, operating on an 80/20 revenue split model.

## User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## Recent Changes (February 2026)

### CRO Audit Documentation & Alignment Review Preparation
- **CRO + UX/UI Audit**: Received professional Conversion Rate Optimization audit (attached at `attached_assets/SeamXY_CRO_UX_UI_Audit_1770912442922.pdf`) identifying 4 Tier-1 pre-launch friction points:
  1. Homepage audience ambiguity — users can't immediately identify "Is this for me?"
  2. AI introduced too early — cognitive load before trust is earned
  3. "Fit" framed as probability — triggers sizing anxiety
  4. Insufficient reassurance before data input — measurements feel high-stakes
- **Current UX/UI State Document**: Created comprehensive document at `docs/seamxy-current-ux-state.md` mapping all user-facing flows, copy, CTAs, navigation, AI introduction points, and data submission moments against the audit findings
- **Follow-On Alignment Review**: Prepared for CRO alignment review with auditor to validate UX/UI execution against original strategy before implementing Tier-1 fixes
- **Tier-1 Fix Status**: None of the Tier-1 recommendations have been implemented yet — awaiting alignment review confirmation before development

### Navigation Status Notes
- **Not yet linked from main navigation**: `/style-quiz`, `/dashboard`, `/closet` pages are fully implemented but disconnected from the header navigation and main user journey
- **Planned**: These pages will be integrated into the primary user flow as part of the Tier-1 CRO fix implementation

## Previous Changes (November 2025)

### Virtual Try-On Integration (TryFit)
- **Database Schema**: Added try-on tables (try_on_models, user_try_on_photos, try_on_sessions, try_on_closet, try_on_feedback)
- **Virtual Try-On Modal**: New component at `client/src/components/virtual-try-on.tsx`
  - Photo upload with drag-and-drop
  - Model selection gallery (4 pre-seeded models: Emma, James, Sofia, Michael)
  - Canvas-based try-on studio with position, scale, rotation controls
  - Size recommendation integration using user measurements
  - Save & share functionality
- **ProductCard Integration**: "Try On" button added to all product cards on shop page
- **API Endpoints**: /api/v1/try-on/* for models, sessions, photos, closet, feedback
- **Tech Stack**: MediaPipe Pose detection (simulated for MVP), canvas overlay rendering

### Creator Studio Content Population
- **Luxe Design Studio Profile**: Enhanced with professional content for demonstration
  - Bio: Luxury fashion atelier specializing in couture eveningwear, bespoke bridal, and executive tailoring
  - Location: New York, NY
  - Specialties: Haute Couture, Bridal Couture, Evening Wear, Executive Tailoring, Custom Design
  - Social: Instagram (@luxedesignstudio), TikTok (@luxe_design), Website
- **Subscription Tiers**: 2 professional tiers created
  - Luxe Insider: $14.99/month (5 perks including lookbooks, BTS content, Q&A sessions)
  - Elite Collection: $79.99/month (6 premium perks including 1-on-1 consultations, 20% discount)
- **Portfolio Posts**: 5 posts with AI-generated professional fashion images
  - "Introducing: The Enchanted Bride Collection" (2,847 views, 156 likes)
  - "Executive Excellence: Bespoke Tailoring" (1,923 views, 98 likes)
  - "Velvet Dreams: Fall Evening Collection" (3,214 views, 187 likes)
  - "Inside the Atelier: Where Magic Happens" (subscriber-only, 456 views, 67 likes)
  - "The Trinity Collection: Evening Couture Unveiled" (4,892 views, 234 likes)
- **Frontend Fixes**: Resolved data mapping issues in creator profile rendering
  - Fixed tier.features → tier.perks mapping
  - Fixed post.caption → post.title + post.content + post.mediaUrls
  - Added defensive null checks for undefined totalLikes/totalFollowers

### Style Quiz & Dashboard System
- **Routes Added**: /style-quiz, /dashboard, /closet pages in App.tsx
- **Style Quiz Component**: client/src/components/style-quiz/style-quiz.tsx
  - Swipe card interface for style preferences
  - Sections: Style Identity, Lifestyle Blueprint, Fit Profile, Dealbreakers
  - **14 question categories with 94+ answer options** (see `docs/style-quiz-questions.md` for full list)
- **Quiz Data**: client/src/components/style-quiz/quiz-data.ts
  - Aesthetic options (8): Minimalist, Bohemian, Classic, Edgy, Romantic, Streetwear, Preppy, Athleisure
  - Color palettes (6): Neutrals, Earth Tones, Pastels, Bold Colors, Monochrome, Jewel Tones
  - Silhouettes (6): Tailored, Oversized, Flowy, Body-Conscious, Boxy, A-Line
  - Vibe words (12): Sophisticated, Relaxed, Bold, Approachable, Powerful, Creative, etc.
  - Risk tolerance (4): Classic, Balanced, Experimental, Trendy
  - Confidence goals (6): Professional, Approachable, Powerful, Creative, Elegant, Youthful
  - Lifestyle options (6): Workwear, Weekend, Athleisure, Nightlife, Events, Travel
  - Budget ranges (5): Budget-Friendly to Luxury ($0-$5000/month)
  - Body types (6): Hourglass, Pear, Apple, Rectangle, Inverted Triangle, Athletic
  - Height categories (3): Petite, Average, Tall
  - Fit challenges (12): Arms, torso, legs, shoulders, bust, hips, thighs
  - Clothing dislikes (12): Crop tops, high-waisted, skinny jeans, turtlenecks, etc.
  - Fabric dislikes (8): Polyester, Wool, Leather, Silk, Denim, Linen, Velvet, Synthetics
  - Photo uploads (3): Mirror selfie, Pinterest board URL, Closet photos
- **Dashboard Page**: client/src/pages/style-dashboard.tsx
  - Pinterest-style outfit feed with daily/weekly recommendations
  - Closet preview widget, stylist messages, goals tracking
  - Subscription tier indicators (free/premium)
- **Closet Page**: client/src/pages/closet.tsx
  - Free tier: 20 items limit, basic AI categorization
  - Paid tier: Unlimited uploads, stylist audits, capsule planning
- **API Endpoints**:
  - POST/GET /api/v1/style-profile - Style profile CRUD with Zod validation
  - POST /api/v1/style-profile/generate-preview - AI-generated style preview
  - GET /api/v1/dashboard - Dashboard data aggregation
  - GET /api/v1/closet - Closet items with subscription limits
  - POST/DELETE /api/v1/closet/items - Closet item CRUD
- **Storage Methods**: getUserStyleProfile, getUserSubscription, getUserClosetItems, getOutfitRecommendations, getWardrobeGapAnalysis
- **Documentation**:
  - `docs/style-quiz-questions.md` - Complete list of all quiz questions and answer options
  - `docs/seamxy-current-ux-state.md` - Comprehensive current UX/UI state document for CRO alignment review (21 sections covering all pages, flows, copy, CTAs, AI introduction points, data submission moments, and mapping to audit findings)

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
- **Admin Panel**: Role-based access, analytics, monetization controls, maker approval, VIP user creation workflow, Create Maker accounts, and Create Creator accounts directly from dashboard.
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