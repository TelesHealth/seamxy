# SeamXY — Product Overview

**Last updated:** August 2026  
**Version:** Post-Editorial Redesign  
**Stack:** React 18 · Express · PostgreSQL (Supabase) · Anthropic Claude · AWS S3 · Stripe

---

## What SeamXY Is

SeamXY is an AI-powered personal style operating system. It connects your closet, body measurements, calendar, and taste into a single intelligent platform that tells you what to wear, helps you shop smarter, lets you try clothes on virtually, and connects you with local tailoring professionals.

It serves three audiences simultaneously:
- **Consumers** — personal styling, closet management, virtual try-on
- **Communities** — social closet sharing, friend groups, outfit polls
- **Businesses** — suppliers, makers, creators, and local service providers

The platform works for guests (no account needed for core discovery features) and unlocks a deeper experience for registered members.

---

## Navigation

The global nav surfaces nine core areas of the product:

| Label | Route | Guest Access |
|---|---|---|
| HOME | `/` | ✅ Open |
| SYSTEM | `/system` | ✅ Open |
| FIND LOOK | `/get-outfit-ideas` | ✅ Open |
| QUIZ | `/style-quiz` | ✅ Open |
| INSPO | `/inspo` | ✅ Open |
| CONCIERGE | `/ai-stylist` | 🔒 Members |
| DASHBOARD | `/dashboard` | 🔒 Members |
| TRY-ON | `/upload` | 🔒 Members |
| CLOSET | `/closet` | 🔒 Members |

---

## Feature Reference

---

### 1. Find Look — Situational Styling Engine
**Route:** `/get-outfit-ideas`  
**Auth:** Guest

The fastest entry point into SeamXY. No account required.

Users describe a real situation — a job interview, a first date, a beach wedding, a Monday morning — and the AI generates complete outfit ideas with styling rationale. The flow:

1. **Category selection** — Women's, Men's, Young Adults, Children
2. **Situation description** — free text or curated prompts
3. **Vibe selection** — Polished, Bold, Relaxed, Effortless (or skip for a mix)
4. **AI generation** — Claude produces full outfit recommendations with "why this works" reasoning
5. **Results** — "Shop the Look" links, save functionality, email capture ("Send me these looks")

Guest sessions are tracked via `anonymous_sessions`. Engagement events (outfit views, saves, email captures, sign-up prompts shown/accepted) are stored for funnel analysis. Signed-in users carry their results forward into their style dashboard.

**Key API:** `POST /api/v1/outfits/situational`

---

### 2. Style Quiz
**Route:** `/style-quiz`  
**Auth:** Guest (results saved if logged in)

A multi-step taste profiler that builds a persistent style identity:

- How you want your clothes to make you feel (Polished / Magnetic / Easeful / Bold)
- Aesthetic preferences and color palette
- Lifestyle context (how formal your daily life is)
- Body confidence areas and fit preferences

Results are stored as a `user_style_profile` and feed every AI recommendation on the platform — the Dashboard, Concierge, and Find Look all personalize based on quiz answers.

**Key APIs:** `POST /api/v1/users/:id/analyze-style`, `GET /api/v1/ai-personas`

---

### 3. Inspo
**Route:** `/inspo`  
**Auth:** Guest

A magazine-style editorial inspiration feed. Curated looks across categories — Wardrobe Staples, Texture, Occasion Dressing, Workwear, Minimal — displayed as tall portrait cards with editorial captions. Each card links back into the Find Look engine.

Includes a "This Week" featured editorial and a "Trending" dark-card feature.

---

### 4. System
**Route:** `/system`  
**Auth:** Guest

A brand/product overview page that explains the SeamXY intelligence system: Closet, Fit, Events, Weather, Inspiration, Shopping Gaps, and Advisor Guidance — all moving together. Links to the outfit finder and dashboard.

---

### 5. Dashboard
**Route:** `/dashboard`  
**Auth:** Members only

The personalized daily home base for logged-in members:

- **Daily Outfit** — weather-aware recommendation built from your closet and calendar
- **Weekly Edit** — curated capsule for the week ahead
- **Advisor Notes** — human-guidance style commentary from AI
- **Wardrobe Gap Analysis** — what your closet is missing for your lifestyle
- **Shop the Look** — shoppable product links tied to outfit suggestions
- **Outfit Refresh** — regenerate if you want different options

Powered by the user's style quiz results, closet contents, body measurements, and engagement history.

**Key APIs:** `GET /api/v1/dashboard`, `POST /api/v1/outfits/refresh`

---

### 6. AI Concierge
**Route:** `/ai-stylist`  
**Auth:** Members (subscription/credit gated)

Conversational AI styling powered by Anthropic Claude (`claude-opus-4-5`). Type any request in natural language and get a real styled response.

- Prompt examples: *"Style me for dinner using what I own"*, *"Build me a capsule wardrobe for a work trip"*, *"What should I wear to a garden party?"*
- Quick-select chips: Use only my closet / Date night / Capsule wardrobe / Make it elevated
- Claude's Tool Use API enables the AI to call back into the product catalog — recommendations are shoppable, not just descriptive
- 9 distinct AI personas with different style philosophies (Classic, Bold, Minimalist, Streetwear, etc.)
- Session history is persisted per user

**Key APIs:** `POST /api/v1/ai-sessions`, `POST /api/v1/ai-sessions/:sessionId/messages`

---

### 7. Virtual Try-On
**Routes:** `/upload` (photo), `/studio` (canvas), `/ar-try-on` (live camera), `/try-on/shared/:code` (shareable link)  
**Auth:** Upload/Studio require login; shared links are public

The most technically complex feature. A full AI-powered dressing room.

**Step 1 — Upload (`/upload`)**
- Upload your own photo or choose a pre-built body model
- MediaPipe pose detection runs to identify 33 body landmarks (shoulders, hips, elbows, knees, etc.)
- Height calibration modal ensures accurate proportions

**Step 2 — Studio (`/studio`)**
- Interactive canvas with clothing layers
- TPS (Thin Plate Spline) mathematical warping — deforms garment images to conform to detected body shape
- Layer controls: position, scale, rotation, opacity
- Multiple garments can be stacked (head-to-toe look building)
- "Complete the Look" AI suggestions
- Size recommendation engine with fit confidence score
- "Shop the Look" links from the studio

**Step 3 — Share**
- Generate a unique share token link
- Recipients can view the try-on and vote on the look
- Social proof for purchasing decisions

**AR Mode (`/ar-try-on`)**
- Real-time garment overlay using device webcam
- Pose detection runs continuously for live tracking

**Key APIs:** `GET /api/v1/try-on/models`, `POST /api/v1/try-on/sessions`, `POST /api/v1/try-on/shares`

---

### 8. Closet Management
**Route:** `/closet`  
**Auth:** Members only

A searchable, organized inventory of everything you own:

- Upload items with photo, category, brand, color, condition, size, and purchase price
- Tag items as Lendable (visible to Style Group members)
- Track wear frequency — mark items as worn
- Favorite items for quick access
- Estimated value tracking
- Filter and search across your full wardrobe

Closet data is the foundation for the Dashboard, Concierge, and Social features.

**Key APIs:** `GET /api/v1/closet`, `POST /api/v1/closet/items`, `DELETE /api/v1/closet/items/:id`

---

### 9. Let It Go — Closet Lifecycle
**Route:** `/closet/edit`  
**Auth:** Members only

Automatically surfaces closet items that haven't been worn in 6+ months. For each idle item the member chooses one action:

| Action | What Happens |
|---|---|
| **Lend** | Listed as available to borrow in your Style Group |
| **Sell** | Opened as a Closet Sale (friends-first peer selling) |
| **Donate** | Logged with estimated value for tax records |
| **Keep** | Dismissed from the idle list |

**Key API:** `GET /api/v1/closet/idle`, `POST /api/v1/closet/idle/:alertId/resolve`

---

### 10. Style Groups — Social Closet
**Route:** `/groups`, `/groups/:id`  
**Auth:** Members only

Private friend communities built around shared wardrobes:

- **Create or join** a group with an invite code
- **Shared closet access** — see group members' lendable items
- **Borrow requests** — request an item, owner confirms, return is dual-confirmed
- **Haul posts** — share new purchases, group members react with emoji
- **Outfit polls** — post two looks, let the group vote before you decide
- **Closet Sales** — sell to friends before listing publicly

**Key APIs:** `GET /api/v1/groups`, `POST /api/v1/groups/join`, `POST /api/v1/borrow-requests`, `POST /api/v1/hauls/:id/react`, `POST /api/v1/polls/:id/vote`

---

### 11. Shop
**Route:** `/shop`  
**Auth:** Guest (purchase requires account)

Product browsing powered by integrated supplier catalogs and affiliate partners. Products are scored and ranked based on the user's style profile, measurements, and fit preferences using a weighted algorithm: Fit (50%) · Style (30%) · Budget (20%).

Integrated retailers: Etsy, Amazon, eBay, Rakuten (via affiliate APIs).

---

### 12. Smart Price Compare
**Auth:** Guest

Real-time price comparison for any product across major e-commerce platforms with AI product matching — finds the closest equivalent item at the best price.

---

### 13. Local Alterations — Gig Economy
**Route:** `/gig`  
**Auth:** Browse is open; job posting requires account

A local services marketplace connecting members with tailors, seamstresses, and clothing repair professionals:

**For customers:**
- Browse providers by city, service type (alterations, repairs, custom), and rating
- View portfolios, pricing, and availability
- Post a job with photos and a description
- Receive quotes from multiple providers
- Accept a quote and message the provider in-platform
- Leave a rated review after completion

**For providers:**
- Register as a provider with a service profile
- Set service types, pricing ranges, turnaround time, home visit/shipping availability
- Receive and respond to job quotes
- Manage job status through the workflow

**Platform fee:** 12% on completed jobs  
**Key APIs:** `GET /api/v1/gig/providers`, `POST /api/v1/gig/jobs`, `POST /api/v1/gig/quotes/:quoteId/accept`

---

### 14. Makers Directory
**Route:** `/makers`  
**Auth:** Browse is open; custom requests require account

A curated directory of custom clothing makers — designers and tailors who create bespoke pieces:

- Browse by specialty, price tier, and availability
- Submit a custom request with measurements, reference photos, and budget
- Maker reviews and quotes the job
- Track order through production
- Full order management system

---

### 15. Creator Studio
**Route:** `/for-creators`, `/creators`, `/creator/:handle`  
**Auth:** Supplier/creator auth required

Enables fashion stylists to build a monetized audience on SeamXY:

- Public stylist profile page with portfolio
- **Subscription tiers** — followers pay for access to exclusive content
- **Exclusive posts** — gated styling content for paying subscribers
- **Tip system** — followers can tip for advice or appreciation
- **Custom request intake** — clients commission personalized styling sessions
- **Affiliate analytics** — track product recommendation clicks and commissions
- **Revenue split:** 80% to the creator, 20% to SeamXY platform fee

---

### 16. Supplier Portal
**Routes:** `/supplier/*`  
**Auth:** Separate supplier authentication

A full B2B dashboard for brands, retailers, tailors, and designers:

| Module | Function |
|---|---|
| **Products** | Catalog management, bulk upload, inventory tracking |
| **Orders** | Fulfillment tracking, custom request management |
| **Integrations** | Connect Shopify, WooCommerce, or BigCommerce |
| **AI Training** | Teach SeamXY your brand's aesthetic for better matching |
| **Analytics** | Views, conversions, affiliate clicks, revenue |
| **Portfolio** | Showcase work for maker profiles |
| **Collections** | Curated product groupings |
| **Messages** | Customer communication inbox |
| **AI Preview** | Test how SeamXY's AI describes your products |

---

### 17. Admin Panel
**Routes:** `/admin/*`  
**Auth:** Admin users only

Internal operations dashboard:

- User management (view, edit, create VIP accounts)
- Maker and creator verification and approval
- Subscription plan configuration
- Pricing and commission config
- Audit logs (all privileged actions recorded)
- Platform analytics

---

### 18. Auth & Onboarding
**Routes:** `/login`, `/signup`, `/onboarding`

Three separate auth tracks (customer, supplier, admin) with RBAC middleware.

Multi-step customer onboarding:
1. Account creation (email/password, bcrypt hashed)
2. Body measurements (height, chest, waist, hips, inseam, foot size)
3. Style quiz completion
4. Closet seeding (optional)
5. Dashboard activation

---

### 19. Subscriptions & Pricing
**Auth:** Members

Free vs. Pro membership tiers:

| Feature | Free | Pro |
|---|---|---|
| Find Look / Situational Styling | ✅ | ✅ |
| Style Quiz | ✅ | ✅ |
| Closet (limited items) | ✅ | ✅ |
| Full Closet | — | ✅ |
| AI Concierge | Limited | Unlimited |
| Dashboard | Basic | Full |
| Advisor Notes | — | ✅ |
| Capsule Planning | — | ✅ |
| Curated Shopping | — | ✅ |
| Stylist Consults | — | ✅ |

Payments handled by **Stripe** with webhook integration for subscription lifecycle events.

---

## Technical Architecture

| Layer | Technology |
|---|---|
| Frontend | React 18, Wouter, TanStack Query, Tailwind CSS, shadcn/ui |
| State (try-on) | Zustand |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| AI | Anthropic Claude `claude-opus-4-5` (Tool Use API) |
| File Storage | AWS S3 |
| Payments | Stripe |
| Pose Detection | MediaPipe |
| Warping | TPS (Thin Plate Spline) — custom implementation |
| Security | Bcrypt, AES-256-CBC, RBAC middleware |
| Fonts | Cormorant Garamond (display), Inter (body) |

---

## Revenue Model

| Stream | Rate |
|---|---|
| Pro membership | Monthly/annual subscription |
| Affiliate commissions | 4–10% per referred purchase |
| Gig economy platform fee | 12% of completed job value |
| Bespoke custom order fee | 10% of order value |
| Maker supplier subscriptions | Tiered monthly fee |
| Creator revenue share | 20% of creator subscription/tip revenue |

---

## Key File Locations

```
client/src/pages/
  home.tsx                  — Homepage / hero
  get-outfit-ideas.tsx      — Find Look / situational styling
  style-quiz.tsx            — Style quiz
  inspo.tsx                 — Editorial inspo feed
  system.tsx                — System overview page
  ai-stylist.tsx            — AI Concierge
  style-dashboard.tsx       — Member dashboard
  Upload.tsx                — Try-on photo upload
  Studio.tsx                — Try-on canvas studio
  ar-try-on.tsx             — AR try-on
  closet.tsx                — Closet management
  let-it-go.tsx             — Closet lifecycle / idle items
  style-groups.tsx          — Social closet groups
  gig-directory.tsx         — Local alterations directory
  shop.tsx                  — Product shop
  makers.tsx                — Makers directory

client/src/components/
  header.tsx                — Global floating pill nav
  try-on/                   — Virtual try-on component suite
  style-quiz/               — Quiz component suite

server/
  routes.ts                 — All API routes (~4,700 lines)
  storage.ts                — Database access layer (~2,500 lines)
  services/anthropic.ts     — Claude AI integration

shared/
  schema.ts                 — Full database schema (~2,500 lines)
```

---

*SeamXY is built on Replit. Database: Supabase PostgreSQL. AI: Anthropic Claude.*
