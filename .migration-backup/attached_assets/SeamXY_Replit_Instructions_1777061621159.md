# SeamXY — Replit Agent Instructions
## Task: Migrate from OpenAI to Anthropic Claude + Configure for Vercel Deployment

These instructions are written for the Replit AI agent. Follow each step in order. 
Do not skip steps. Ask before making any changes outside the scope defined here.

---

## PHASE 1: Install Dependencies

### Step 1.1 — Install the Anthropic SDK

Run in the shell:

```bash
npm install @anthropic-ai/sdk
```

### Step 1.2 — Remove the OpenAI package

```bash
npm uninstall openai
```

Confirm `openai` no longer appears in `package.json` dependencies after this step.

---

## PHASE 2: Create the Anthropic Service File

### Step 2.1 — Create `server/services/anthropic.ts`

Create this file from scratch. Do not modify any existing files yet.

```typescript
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    "ANTHROPIC_API_KEY is required. Add it to your environment variables."
  );
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-5";

// ── Situational Outfits ──────────────────────────────────────────────────────
export async function generateSituationalOutfits(
  category: string,
  situation: string,
  vibe: string
) {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a warm, knowledgeable personal stylist. 
Generate 3 complete outfit ideas for someone who needs to dress for:
Category: ${category}
Situation: ${situation}
Vibe: ${vibe}

Return ONLY valid JSON with no markdown fences, no explanation, nothing else:
{
  "outfits": [
    {
      "title": "outfit name",
      "whyItWorks": "one sentence explanation in warm, human language",
      "stylingTip": "one concrete, practical tip",
      "items": [
        {
          "type": "Top",
          "name": "specific item name",
          "price": 85,
          "shopQuery": "search term for finding this item"
        }
      ]
    }
  ]
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return JSON.parse(text);
  } catch (error) {
    console.error("Claude outfit generation failed:", error);
    return getFallbackOutfits(category, vibe);
  }
}

// ── Style Analysis ───────────────────────────────────────────────────────────
export async function analyzeStyle(description: string) {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Analyze this style description and extract structured data.
Return ONLY valid JSON with no markdown fences, no explanation, nothing else.

Description: "${description}"

{
  "styleTags": ["tag1", "tag2", "tag3"],
  "lifestyle": "conscious|casual|professional|luxury",
  "budgetTier": "budget|mid_range|premium|luxury",
  "preferredBrands": []
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return JSON.parse(text);
  } catch (error) {
    console.error("Claude style analysis failed:", error);
    return {
      styleTags: extractKeywords(description),
      lifestyle: "casual",
      budgetTier: "mid_range",
      preferredBrands: [],
    };
  }
}

// ── AI Stylist Chat ──────────────────────────────────────────────────────────
export async function chatWithStylePersona(
  persona: {
    name: string;
    specialty: string;
    tone: string;
    systemPrompt: string;
  },
  messages: { role: "user" | "assistant"; content: string }[],
  userProfile?: object
) {
  try {
    const systemPrompt = `${persona.systemPrompt}

You are ${persona.name}, a personal fashion stylist specialising in ${persona.specialty}.
Your tone is: ${persona.tone}.
${userProfile ? `User style profile: ${JSON.stringify(userProfile)}` : ""}

Rules:
- Keep responses concise, warm, and actionable
- Never mention AI, algorithms, or technology
- Give specific, shoppable suggestions when possible
- Always make the user feel confident and understood`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "I'd love to help — could you tell me a bit more about what you're looking for?";
  } catch (error) {
    console.error("Claude stylist chat failed:", error);
    throw error;
  }
}

// ── Product Matching ─────────────────────────────────────────────────────────
export async function matchProducts(
  product: {
    brand: string;
    title: string;
    category: string;
    price: number;
  },
  candidates: { id: number; title: string; price: number }[]
) {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are a product matching engine for a fashion marketplace.
Find the best matches for the reference product from the candidate list.
Consider: brand alignment, style similarity, price range, and category fit.

Reference product:
${JSON.stringify(product)}

Candidates:
${JSON.stringify(candidates)}

Return ONLY valid JSON with no markdown fences, no explanation:
{
  "matches": [
    {
      "id": 1,
      "confidence": 0.92,
      "reason": "brief reason"
    }
  ],
  "aiMatchingEnabled": true
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return JSON.parse(text);
  } catch (error) {
    console.error("Claude product matching failed:", error);
    return { matches: [], aiMatchingEnabled: false };
  }
}

// ── Style Preview Generation ─────────────────────────────────────────────────
export async function generateStylePreview(styleProfile: object) {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 768,
      messages: [
        {
          role: "user",
          content: `Based on this style profile, generate a personalised style identity summary.
Write in warm, encouraging second-person language. No AI jargon.

Profile: ${JSON.stringify(styleProfile)}

Return ONLY valid JSON with no markdown fences:
{
  "styleIdentity": "2-3 sentence style identity description",
  "keyWords": ["word1", "word2", "word3"],
  "colorStory": "one sentence about their color approach",
  "signaturePieces": ["piece1", "piece2", "piece3"],
  "stylistNote": "one encouraging, personal note from their AI stylist"
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return JSON.parse(text);
  } catch (error) {
    console.error("Claude style preview failed:", error);
    return {
      styleIdentity: "Your style is uniquely yours — we're still learning it.",
      keyWords: ["personal", "evolving", "intentional"],
      colorStory: "Your palette is waiting to be discovered.",
      signaturePieces: ["A great-fitting jean", "A versatile layer", "One bold accent"],
      stylistNote: "Every wardrobe starts with one great piece.",
    };
  }
}

// ── Fallback Utilities ───────────────────────────────────────────────────────
function getFallbackOutfits(category: string, vibe: string) {
  return {
    outfits: [
      {
        title: `${vibe} ${category} Look`,
        whyItWorks: "A clean, versatile combination that works across most occasions.",
        stylingTip: "Focus on fit first — well-fitted basics always look intentional.",
        items: [
          {
            type: "Top",
            name: "Classic fitted top",
            price: 45,
            shopQuery: `${vibe} top ${category}`,
          },
          {
            type: "Bottom",
            name: "Tailored trousers",
            price: 80,
            shopQuery: `${vibe} trousers`,
          },
          {
            type: "Shoes",
            name: "Clean leather shoes",
            price: 120,
            shopQuery: "minimal leather shoes",
          },
        ],
      },
    ],
  };
}

function extractKeywords(text: string): string[] {
  const knownKeywords = [
    "minimal", "casual", "classic", "bold", "elegant",
    "streetwear", "preppy", "bohemian", "romantic", "edgy",
    "sustainable", "luxury", "athleisure",
  ];
  return knownKeywords.filter((k) => text.toLowerCase().includes(k));
}
```

---

## PHASE 3: Replace All OpenAI Imports

### Step 3.1 — Find every file that imports from the OpenAI service

Search the entire codebase for any of these import patterns:

```
from './services/openai'
from '../services/openai'
from '../../services/openai'
from "./services/openai"
from "../services/openai"
```

List every file found before making any changes.

### Step 3.2 — Replace imports in each file found

For each file identified in Step 3.1, change the import path:

```typescript
// BEFORE (any variation of):
import { generateSituationalOutfits, analyzeStyle, chatWithStylePersona, matchProducts } from './services/openai';

// AFTER:
import { generateSituationalOutfits, analyzeStyle, chatWithStylePersona, matchProducts } from './services/anthropic';
```

The function names stay identical — only the import path changes.

### Step 3.3 — Delete the old OpenAI service file

Only delete this file after confirming all imports have been updated and TypeScript compiles without errors:

```bash
rm server/services/openai.ts
```

### Step 3.4 — Remove Replit AI Integration references

Search for any references to these environment variable names and remove them:

```
AI_INTEGRATIONS_OPENAI_BASE_URL
AI_INTEGRATIONS_OPENAI_API_KEY
```

These were Replit-specific OpenAI wrappers and are no longer needed.

---

## PHASE 4: Update Environment Variables

### Step 4.1 — Update `.env.example`

Replace the entire AI-related section of `.env.example` with:

```bash
# ── AI (Anthropic Claude) ──────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-your-key-here

# ── Database ───────────────────────────────────────────────────────
DATABASE_URL=postgresql://...

# ── Authentication ─────────────────────────────────────────────────
SESSION_SECRET=generate-a-long-random-string-here

# ── Payments ───────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── File Storage ───────────────────────────────────────────────────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

# ── Security ───────────────────────────────────────────────────────
# Must be exactly 32 bytes. Generate with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
INTEGRATION_TOKEN_KEY=
```

### Step 4.2 — Add `ANTHROPIC_API_KEY` to Replit Secrets

In the Replit sidebar go to **Tools → Secrets** and add:

```
Key:   ANTHROPIC_API_KEY
Value: (the actual API key — get this from console.anthropic.com)
```

Do not put the real API key in any file that gets committed to git.

---

## PHASE 5: Fix the Session Store

This must be done before Vercel deployment. Vercel is serverless — in-memory sessions are lost on every request.

### Step 5.1 — Open `server/index.ts`

Find the session configuration. It will look something like this:

```typescript
// This is what to look for and remove:
import memorystore from 'memorystore';
const MemoryStore = memorystore(session);
store: new MemoryStore({ checkPeriod: 86400000 })
```

### Step 5.2 — Replace with `connect-pg-simple`

The replacement should look like this:

```typescript
import session from "express-session";
import connectPg from "connect-pg-simple";

const PgStore = connectPg(session);

app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);
```

### Step 5.3 — Make the server export-compatible for Vercel

At the bottom of `server/index.ts`, the server startup block should be wrapped so it only runs locally:

```typescript
// Local development only — Vercel does not use this
if (process.env.NODE_ENV !== "production" || process.env.REPL_ID) {
  const PORT = parseInt(process.env.PORT || "5000");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
```

---

## PHASE 6: Create Vercel Configuration Files

### Step 6.1 — Create `vercel.json` in the project root

```json
{
  "version": 2,
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Step 6.2 — Update `package.json` build script

Find the `"build"` script in `package.json`. It currently looks like:

```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

Update it to:

```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
"vercel-build": "npm run build"
```

### Step 6.3 — Create `.vercelignore` in the project root

```
node_modules
.replit
replit.md
replit (copy).md
attached_assets
.env
*.local
dist
```

---

## PHASE 7: TypeScript Verification

### Step 7.1 — Run the TypeScript compiler

```bash
npm run check
```

Expected result: zero errors. If there are errors, fix them before continuing. Common issues will be:

- Any remaining `openai` type imports that weren't caught in Phase 3
- The `export default app` line if the Express app type doesn't match — fix by ensuring `app` is typed as `express.Application`

### Step 7.2 — Run a local build

```bash
npm run build
```

Confirm `dist/public/index.html` exists and `dist/index.js` exists after the build completes.

---

## PHASE 8: Test the Claude Integration

### Step 8.1 — Start the dev server

```bash
npm run dev
```

### Step 8.2 — Test style analysis

```bash
curl -X POST http://localhost:5000/api/v1/style-analysis \
  -H "Content-Type: application/json" \
  -d '{"description": "I love minimalist style, neutral colors, clean lines"}'
```

Expected: a JSON response with `styleTags`, `lifestyle`, `budgetTier`, `preferredBrands`.

### Step 8.3 — Test situational outfit generation

```bash
curl -X POST http://localhost:5000/api/v1/outfits/situational \
  -H "Content-Type: application/json" \
  -d '{"category": "Work", "situation": "Client meeting", "vibe": "Polished"}'
```

Expected: a JSON response with an `outfits` array containing at least one outfit with `title`, `whyItWorks`, `stylingTip`, and `items`.

### Step 8.4 — Confirm no OpenAI references remain

```bash
grep -r "openai" server/ --include="*.ts" -l
grep -r "AI_INTEGRATIONS" server/ --include="*.ts" -l
grep -r "gpt-" server/ --include="*.ts" -l
```

All three commands should return no results.

---

## PHASE 9: Vercel Deployment Setup

### Step 9.1 — Connect the GitHub repo to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import the `TelesHealth/seamxy` GitHub repository
4. Vercel will auto-detect the framework — if it guesses wrong, set Framework to **Other**
5. Do not deploy yet — set environment variables first

### Step 9.2 — Add all environment variables in Vercel

In the Vercel project → **Settings → Environment Variables**, add each of the following for the **Production** environment:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `SESSION_SECRET` | A long random string (min 32 chars) |
| `STRIPE_SECRET_KEY` | From Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe dashboard (update after deploy) |
| `AWS_ACCESS_KEY_ID` | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | From AWS IAM |
| `AWS_S3_BUCKET` | Your S3 bucket name |
| `AWS_REGION` | e.g. `us-east-1` |
| `INTEGRATION_TOKEN_KEY` | 32-byte hex string (see below) |
| `NODE_ENV` | `production` |

To generate `INTEGRATION_TOKEN_KEY` if not already done:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output as the value.

### Step 9.3 — Deploy to Vercel

Click **Deploy**. Watch the build log. Common issues and fixes:

**Build fails with "Cannot find module '@anthropic-ai/sdk'"**
→ Run `npm install` locally and commit the updated `package-lock.json`

**Build fails with TypeScript errors**
→ Fix errors identified in Phase 7 and push again

**Build succeeds but API routes return 500**
→ Check Vercel Function logs. Usually a missing environment variable.

### Step 9.4 — Update the Stripe webhook endpoint

After the first successful Vercel deployment:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Find the existing webhook pointing at the Replit URL
3. Update the endpoint URL to: `https://seamxy.com/api/v1/webhooks/stripe`
4. Copy the new **Signing Secret** (starts with `whsec_`)
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
6. Redeploy (or trigger a redeploy from Vercel dashboard)

### Step 9.5 — Point the domain to Vercel

In Vercel project → **Settings → Domains**:

1. Add `seamxy.com`
2. Add `www.seamxy.com`
3. Follow Vercel's DNS instructions — this typically means updating your domain's nameservers or adding CNAME/A records at your registrar
4. Vercel will provision an SSL certificate automatically

---

## PHASE 10: Post-Deployment Verification

Run these checks after the domain is live on Vercel:

### Step 10.1 — Test the live AI endpoints

```bash
# Style analysis
curl -X POST https://seamxy.com/api/v1/style-analysis \
  -H "Content-Type: application/json" \
  -d '{"description": "casual minimalist with earth tones"}'

# Situational outfits
curl -X POST https://seamxy.com/api/v1/outfits/situational \
  -H "Content-Type: application/json" \
  -d '{"category": "Casual", "situation": "Weekend brunch", "vibe": "Relaxed"}'
```

Both should return valid JSON responses from Claude (not fallback data).

### Step 10.2 — Test session persistence

1. Sign up for an account on the live site
2. Close the browser tab completely
3. Open a new tab and go to seamxy.com
4. Confirm you are still logged in

If session is lost, the `connect-pg-simple` store is not configured correctly — revisit Phase 5.

### Step 10.3 — Test Stripe

Make a test payment using Stripe's test card `4242 4242 4242 4242`. Confirm the webhook fires and the subscription status updates in the app.

### Step 10.4 — Confirm no Replit-specific code runs in production

Check Vercel Function logs for any of these — they should not appear:

```
cartographer
devBanner
runtimeErrorOverlay (only fine in dev)
REPL_ID
```

---

## Summary of Files Changed

| File | Action |
|---|---|
| `server/services/anthropic.ts` | Created (new) |
| `server/services/openai.ts` | Deleted |
| `server/index.ts` | Modified (session store, export) |
| `server/routes.ts` (and any other files importing openai service) | Modified (import paths) |
| `package.json` | Modified (removed openai, added vercel-build script) |
| `.env.example` | Modified (replaced OpenAI vars with Anthropic) |
| `vercel.json` | Created (new) |
| `.vercelignore` | Created (new) |

---

## Do Not Touch

- `shared/schema.ts` — no changes needed
- `client/` — no changes needed  
- `migrations/` — no changes needed
- `drizzle.config.ts` — no changes needed
- `tailwind.config.ts` — no changes needed
- Any file in the `Z` folder (per user preferences)

---

## If Something Goes Wrong

**Claude returns an error instead of JSON**
→ The model occasionally adds markdown fences (` ```json `) around output. Add a JSON-cleaning step before `JSON.parse()`:

```typescript
const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
return JSON.parse(cleaned);
```

**`ANTHROPIC_API_KEY` error on startup**
→ Confirm the key is set in Vercel environment variables AND that you redeployed after adding it.

**Sessions not persisting**
→ Run this in the Neon SQL console to confirm the session table was created:
```sql
SELECT * FROM session LIMIT 5;
```
If the table doesn't exist, the `createTableIfMissing: true` option in connect-pg-simple should handle it on first request — but confirm `DATABASE_URL` is correct.

**Vercel functions timing out**
→ Claude Opus can take 5–10 seconds for longer responses. The `maxDuration: 30` in `vercel.json` handles this, but confirm the function is not doing multiple sequential Claude calls in one request.
