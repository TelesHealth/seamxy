# AI Configuration Guide

SeamXY uses AI for style analysis, product matching, and AI stylist personas. This guide explains how to configure AI services for different deployment scenarios.

---

## Deployment Scenarios

### Scenario 1: Deployed on Replit (Recommended for Quick Start)

**Use Replit AI Integrations** - Zero configuration needed!

Replit automatically provides:
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Managed endpoint
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Managed API key
- Billing through Replit credits
- No external OpenAI account needed

**How to enable:**
1. In your Replit project, click "Tools" → "AI Integrations"
2. Enable OpenAI integration
3. Deploy your app using Replit's "Publish" feature

**No environment variables needed** - Replit handles everything automatically.

---

### Scenario 2: Deployed on External Server (VPS, AWS, DigitalOcean, etc.)

**Use Direct OpenAI API** - Replit AI Integrations are not available outside Replit.

#### Step 1: Get OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys** section
3. Click **"Create new secret key"**
4. Copy your API key (starts with `sk-proj-...`)
5. Add credits to your OpenAI account for billing

#### Step 2: Configure Environment Variable

Add to your `ecosystem.config.js` or `.env`:

```javascript
// ecosystem.config.js
env_production: {
  // For external deployment, use direct OpenAI:
  OPENAI_API_KEY: 'sk-proj-your-api-key-here',
  
  // Remove/comment out Replit-specific vars:
  // AI_INTEGRATIONS_OPENAI_BASE_URL: '...',
  // AI_INTEGRATIONS_OPENAI_API_KEY: '...',
}
```

Or in `.env`:

```bash
# Direct OpenAI for external deployment
OPENAI_API_KEY=sk-proj-your-api-key-here
```

#### Step 3: Verify Configuration

The application will automatically:
- Detect `OPENAI_API_KEY` is set
- Use OpenAI's default endpoint (`https://api.openai.com/v1`)
- Use the newer GPT-4o model (or GPT-5 if available)

---

## AI Features & Fallbacks

### Features That Require AI:

1. **Style Analysis** (`/api/v1/style-analysis`)
   - Analyzes freehand style descriptions
   - Extracts style tags, lifestyle, budget tier, brands
   - **Fallback:** Returns generic tags if AI unavailable

2. **AI Stylist Personas** (`/api/v1/chat/personas`)
   - 8 personality stylists with context-aware advice
   - **Fallback:** Returns error message if AI unavailable

3. **Smart Price Compare - AI Product Matching** (`/api/v1/products/:id/compare-prices`)
   - Uses GPT-4o to match similar products across retailers
   - Analyzes brand, title, category, specs
   - **Fallback:** Uses text-based similarity matching (works without AI)

### Graceful Degradation

The application handles missing AI credentials gracefully:

- **Price Comparison**: Falls back to text-based matching (50% confidence)
- **Style Analysis**: Returns basic tags based on keyword extraction
- **AI Stylist**: Shows error message prompting user to configure AI

---

## Model Selection

### Current Configuration

The codebase uses **GPT-5** (newest model as of August 2025):

```typescript
model: "gpt-5"
```

### Fallback Models

If GPT-5 is not available on your OpenAI account:

1. Open `server/services/openai.ts`
2. Change model to `gpt-4o` or `gpt-4-turbo`:

```typescript
// Change from:
model: "gpt-5"

// To:
model: "gpt-4o"  // or "gpt-4-turbo"
```

**Note:** GPT-4o provides excellent results and is widely available.

---

## Cost Estimation

### OpenAI Pricing (as of 2025)

**GPT-4o** (recommended):
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

**Typical Usage:**
- Style analysis: ~500 tokens per request (~$0.005)
- AI Stylist chat: ~1000 tokens per message (~$0.01)
- Product matching: ~300 tokens per comparison (~$0.003)

**Monthly estimates** (moderate usage):
- 1,000 users doing style analysis: ~$5
- 500 AI stylist conversations (10 msgs each): ~$50
- 10,000 price comparisons: ~$30

**Total**: ~$85/month for moderate traffic

### Replit AI Integrations Pricing

When deployed on Replit:
- Billed through Replit credits
- Pricing competitive with direct OpenAI
- Simplified billing (no separate OpenAI account)

---

## Environment Variable Priority

The application checks in this order:

1. **Replit AI Integrations** (if both are set):
   ```
   AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY
   ```

2. **Direct OpenAI** (if Replit vars not set):
   ```
   OPENAI_API_KEY
   ```

3. **No AI** (graceful degradation):
   - Price comparison uses text matching
   - Style analysis returns basic tags
   - AI Stylist shows configuration error

---

## Testing AI Configuration

### Test 1: Check Environment Variables

```bash
# On your server
node -e "console.log('OpenAI Key:', process.env.OPENAI_API_KEY ? 'SET ✓' : 'NOT SET ✗')"
node -e "console.log('Replit AI:', process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? 'SET ✓' : 'NOT SET ✗')"
```

### Test 2: Test Style Analysis API

```bash
curl -X POST http://localhost:5000/api/v1/style-analysis \
  -H "Content-Type: application/json" \
  -d '{"description": "I love minimalist style, neutral colors, and sustainable fashion"}'
```

Expected response:
```json
{
  "styleTags": ["minimalist", "sustainable", "neutral"],
  "lifestyle": "conscious",
  "budgetTier": "mid_range",
  "preferredBrands": []
}
```

### Test 3: Check AI Matching Availability

```bash
# Call price comparison endpoint
curl http://localhost:5000/api/v1/products/1/compare-prices
```

Look for `aiMatchingEnabled` field:
```json
{
  "aiMatchingEnabled": true,  // ✓ AI is working
  "comparisons": [...]
}
```

### Test 4: Check Logs

```bash
pm2 logs seamxy-production | grep -i "openai"
```

You should NOT see:
- `"OpenAI client initialization failed"`
- `"AI matching unavailable"`

---

## Troubleshooting

### Error: "OpenAI API key not configured"

**Solution:**
```bash
# Add to ecosystem.config.js
OPENAI_API_KEY: 'sk-proj-...'

# Restart PM2
pm2 restart seamxy-production --update-env
```

### Error: "Invalid API key"

**Solution:**
1. Verify key starts with `sk-proj-` or `sk-`
2. Check key is active in [OpenAI dashboard](https://platform.openai.com/api-keys)
3. Ensure you have credits in your OpenAI account

### Error: "Model gpt-5 does not exist"

**Solution:**
1. Open `server/services/openai.ts`
2. Change model to `gpt-4o`:
   ```typescript
   model: "gpt-4o"
   ```
3. Rebuild and restart:
   ```bash
   npm run build
   pm2 restart seamxy-production
   ```

### AI Features Not Working on Replit

**Solution:**
1. Enable AI Integrations in Replit Tools menu
2. Ensure you have Replit credits
3. Redeploy your app

### AI Features Work But Responses Are Slow

**Solution:**
1. Check OpenAI API status: https://status.openai.com/
2. Consider caching AI responses for common queries
3. Use streaming for AI Stylist (future enhancement)

---

## Migration Path

### From Replit to External Hosting

If you're moving from Replit to external server:

1. **Get OpenAI API key** (see Scenario 2 above)
2. **Update environment variables**:
   ```javascript
   // Remove:
   // AI_INTEGRATIONS_OPENAI_BASE_URL
   // AI_INTEGRATIONS_OPENAI_API_KEY
   
   // Add:
   OPENAI_API_KEY: 'sk-proj-...'
   ```
3. **No code changes needed** - automatic fallback works
4. **Test all AI features** before going live

### From External Hosting to Replit

If you're moving from external server to Replit:

1. **Deploy to Replit**
2. **Enable AI Integrations** in Tools
3. **Remove** `OPENAI_API_KEY` from environment
4. Replit automatically sets `AI_INTEGRATIONS_*` variables

---

## Best Practices

1. **Never commit API keys** to version control
2. **Use different keys** for development and production
3. **Set spending limits** in OpenAI dashboard
4. **Monitor usage** regularly
5. **Enable rate limiting** for AI endpoints
6. **Cache AI responses** when appropriate
7. **Handle errors gracefully** - always have fallbacks

---

## Quick Reference

### Development (Replit)
```bash
# No setup needed - use Replit AI Integrations
# Just enable in Tools → AI Integrations
```

### Production (External Server)
```bash
# Get OpenAI key from platform.openai.com
# Add to ecosystem.config.js:
OPENAI_API_KEY=sk-proj-your-key-here

# Restart
pm2 restart seamxy-production --update-env
```

### Verify AI Works
```bash
# Check environment
node -e "console.log(process.env.OPENAI_API_KEY ? 'AI Configured ✓' : 'AI Not Configured ✗')"

# Test endpoint
curl -X POST http://localhost:5000/api/v1/style-analysis \
  -H "Content-Type: application/json" \
  -d '{"description": "casual and comfortable"}'
```

---

**For more help, see:**
- [OpenAI Platform Documentation](https://platform.openai.com/docs)
- [Replit AI Integrations Docs](https://docs.replit.com)
- `DEPLOYMENT.md` for full production setup guide
