# PerfectFit - AI-Powered Universal Clothing Marketplace

**Last Updated**: October 27, 2025
**Status**: Custom Fit Marketplace Phase 1 Complete - End-to-End RFQ Flow Verified

## Project Overview

PerfectFit is a comprehensive fashion marketplace platform combining retail shopping with custom tailoring services, powered by AI-driven fit matching and virtual fashion consultants. Built with React, Express, PostgreSQL, and GPT-5.

## Core Features

### 1. Marketplace (User-Facing)
- **Multi-Demographic Support**: Men, Women, Young Adults, Children
- **AI-Powered Fit Matching**: Products scored on Fit (50%), Style (30%), Budget (20%)
- **Dual Marketplace**: Retail Quick Buy + Custom Tailor Network
- **Smart Onboarding**: Measurements, freehand style description (AI-analyzed), budget selection
- **Product Discovery**: Search, filters, AI-scored recommendations

### 2. Admin Panel (Staff Management)
- **Role-Based Access**: Super Admin, Monetization Manager, Support Admin
- **Analytics Dashboard**: Revenue tracking, user/maker metrics, transaction monitoring
- **Monetization Controls**: Affiliate commission rates, bespoke fees, subscription pricing
- **Maker Approval**: Verify and manage custom clothiers
- **Audit Logging**: Track all admin actions

### 3. AI Personality Stylists
- **8 Diverse Personas**:
  - **Aiden**: Modern minimalist stylist (smart-casual, professional)
  - **Luca**: Trendy streetwear expert (energetic, urban)
  - **Evelyn**: Luxury fashion guide (elegant, sophisticated)
  - **Kai**: Budget-conscious coach (friendly, practical)
  - **Mei Chen**: East-meets-West fusion expert (thoughtful, cultural aesthetics)
  - **Marcus Thompson**: Bold contemporary innovator (pattern mixing, cultural expression)
  - **Sofia Rodriguez**: Vibrant Latin fashion specialist (colorful, passionate)
  - **Eduardo Morales**: Distinguished classic style expert (refined, timeless elegance)
- **Diversity Representation**: Asian, Black, Hispanic, and multiple age ranges
- **Context-Aware Chat**: Uses user measurements, style tags, budget in conversations
- **GPT-5 Powered**: Natural language fashion advice
- **Professional AI Portraits**: Photorealistic generated images for all personas
- **Subscription Model**: Free text chat, $9.99/mo Pro (video/voice - future)

## Technical Architecture

### Stack
- **Frontend**: React 18, Wouter (routing), TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express, TypeScript, Neon Serverless PostgreSQL
- **AI**: OpenAI GPT-5 (via Replit AI Integrations)
- **Fonts**: Inter (body), Plus Jakarta Sans (display)

### Database Schema

**Core Entities**:
- `users` - User profiles with demographics, measurements, style preferences
- `measurements` - Detailed body measurements per user
- `products` - Retail catalog with categories, pricing, style tags
- `makers` - Custom tailors/clothiers with portfolios, ratings
- `custom_requests` - Bespoke clothing RFQs from users
- `quotes` - Maker proposals for custom requests
- `orders` - Both retail and bespoke orders

**Admin Entities**:
- `admin_users` - Staff accounts with RBAC
- `pricing_configs` - Affiliate rates, platform fees
- `subscription_plans` - Maker tiers ($0/$29/$99) + AI Stylist Pro ($9.99)
- `subscriptions` - Active subscriptions
- `audit_logs` - Admin action tracking

**AI Entities**:
- `ai_personas` - Stylist character definitions
- `ai_chat_sessions` - Conversation history with context

### API Routes

**Marketplace** (`/api/v1/`):
- `POST /users` - Create user profile
- `POST /users/:id/analyze-style` - GPT-5 style analysis from freehand text
- `POST /measurements` - Save body measurements
- `GET /products` - Search products with AI scoring (if userId provided)
- `GET /makers` - List verified tailors
- `POST /custom-requests` - Submit RFQ
- `POST /quotes` - Maker submits quote
- `POST /orders` - Create order

**Admin** (`/api/v1/admin/`):
- `POST /login` - Admin authentication
- `GET /users` - User management
- `PATCH /makers/:id/verify` - Approve maker
- `GET /pricing-configs` - Monetization settings
- `POST /pricing-configs` - Update pricing
- `GET /audit-logs` - Action history

**AI Stylist** (`/api/v1/`):
- `GET /ai-personas` - List available stylists
- `POST /ai-sessions` - Start chat session
- `POST /ai-sessions/:id/messages` - Send message, get GPT-5 response with context

### Scoring Algorithm

Products are scored based on:
- **Fit Score (50%)**: Measurement compatibility with size chart
- **Style Match (30%)**: Overlap of user style tags with product tags
- **Budget Match (20%)**: Price proximity to user's budget range

Total Score = (Fit × 0.5) + (Style × 0.3) + (Budget × 0.2)

### Monetization Model

1. **Affiliate Commissions**: 4-10% on retail Quick Buy
2. **Bespoke Platform Fee**: 10% on custom orders
3. **Maker Subscriptions**:
   - Basic: $0/mo (5 quotes/month)
   - Pro: $29/mo (unlimited quotes, analytics)
   - Elite: $99/mo (premium placement, marketing tools)
4. **AI Stylist Pro**: $9.99/mo (video/voice features)

## Design System

### Typography
- Primary: Inter (400, 500, 600, 700)
- Display: Plus Jakarta Sans (600, 700, 800)
- Hierarchy: Hero (text-5xl+), Section (text-3xl+), Body (text-base)

### Colors
- Using shadcn default color system with semantic tokens
- Elevation interactions: `hover-elevate`, `active-elevate-2` utilities

### Components
- All shadcn/ui primitives
- Custom: ProductCard (with scores), Header, persona chat interface
- Responsive grid patterns for products (1/2/3/4 cols)

## Seeded Data

Database automatically seeds on startup:
- 8 AI personas (Aiden, Luca, Evelyn, Kai, Mei Chen, Marcus Thompson, Sofia Rodriguez, Eduardo Morales)
- 4 subscription plans (3 maker tiers + AI Stylist Pro)
- 3 pricing configs (affiliate rates, platform fees)
- 15+ sample products (clothing across categories + footwear)
- 5 sample makers (Aria's Stitch House, Tailored by James, Rosa's Custom Couture, Urban Stitch Studio, Minimalist Wardrobe)

## Environment Variables

All managed via Replit integrations:
- `DATABASE_URL` - Neon PostgreSQL connection
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - GPT-5 endpoint
- `AI_INTEGRATIONS_OPENAI_API_KEY` - AI gateway key
- `SESSION_SECRET` - Session encryption

## Development

```bash
npm run dev       # Start dev server (port 5000)
npm run db:push   # Sync database schema
```

## Future Enhancements

1. **Video Avatars**: Synthesia/HeyGen integration for AI stylist video responses
2. **Voice Chat**: ElevenLabs voice synthesis
3. **Stripe Integration**: Payment processing for subscriptions
4. **AR Try-On**: Virtual fitting room
5. **Mobile Apps**: React Native implementation
6. **Social Features**: Outfit sharing, user reviews

## User Flows

### Shopper Journey
1. Land on homepage → Choose demographic
2. Onboarding: Measurements → Style description → Budget
3. Browse products with AI match scores
4. Quick Buy via affiliate link OR
5. Submit custom request → Compare maker quotes → Order

### Maker Journey
1. Sign up → Submit portfolio
2. Admin approves/verifies
3. Receive RFQs matching expertise
4. Submit competitive quotes
5. Win orders → Fulfill → Get paid (90% after platform fee)

### Admin Journey
1. Login with role-specific access
2. Dashboard: KPIs, recent activity
3. Approve new makers
4. Adjust monetization settings
5. Monitor transactions and audit logs

## Integration Status

### ✅ Complete & Tested
- **Onboarding Flow**: User creation, measurements (decimal/string handling), GPT-5 style analysis, budget persistence all verified end-to-end
- **Shop Page**: Product fetching with proper query string construction, AI scoring when userId present
- **AI Stylist**: GPT-5 chat integration with user context (personas, sessions, messages)
- **Database**: Full schema with seeded data, all CRUD operations working
- **API Layer**: All marketplace endpoints functional with TanStack Query integration
- **Custom Fit Marketplace**: Backend APIs (custom requests, quotes, maker management), frontend pages (request submission, my requests, makers browse, maker dashboard), 5 sample makers seeded, complete end-to-end flow tested and verified

### 🚧 Future Enhancements
- **Authentication**: Upgrade from localStorage to JWT + sessions (currently using demo localStorage auth)
- **Admin Panel**: Connect dashboard, analytics, maker approval to live data
- **Enhanced Marketplace Features**: In-app messaging, portfolio galleries, advanced search/filters
- **Transactions**: Order management, payment integration, reviews/ratings
- **Payments**: Integrate Stripe for subscriptions and bespoke orders
- **Video Avatars**: Synthesia/HeyGen for AI stylist video responses
- **Mobile**: React Native apps

## Technical Notes

- **Decimal Columns**: Drizzle-ORM decimal type expects strings in TypeScript (precision preservation)
- **API Requests**: Use `apiRequest(method, url, data)` parameter order consistently
- **Query Strings**: Build URLSearchParams manually for complex GET requests
- **localStorage**: Used for userId persistence (`perfectfit_user_id` key) and maker authentication (`perfectfit_maker_id`)
- **GPT-5 Timeouts**: Style analysis and chat may take 5-15 seconds
- **Maker Dashboard**: Uses localStorage for demo authentication, selects from real seeded maker IDs
- **Quote Form**: Converts numeric inputs (price, leadTimeDays) to strings before submission to match schema
- **End-to-end flow tested**: user creates request → maker submits quote → user accepts quote ✓
