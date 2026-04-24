import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-5";

// ── Shared Types (matching openai.ts signatures for drop-in compatibility) ──────

export interface StyleAnalysisResult {
  styleTags: string[];
  lifestyle: string;
  budgetTier: string;
  preferredBrands: string[];
}

export interface ProductScore {
  fitScore: number;
  styleMatch: number;
  budgetMatch: number;
  totalScore: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SituationalOutfitItem {
  name: string;
  type: string;
  description: string;
  colorOrPattern: string;
  priceRange: string;
}

export interface SituationalOutfit {
  id: string;
  title: string;
  whyItWorks: string;
  items: SituationalOutfitItem[];
  stylingTip: string;
  overallVibe: string;
}

// ── Helper ───────────────────────────────────────────────────────────────────

function cleanJson(text: string): string {
  return text.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
}

// ── analyzeStyleDescription ──────────────────────────────────────────────────
// Drop-in replacement for openai.ts export of the same name

export async function analyzeStyleDescription(description: string): Promise<StyleAnalysisResult> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are a fashion style analyzer. Extract structured data from user descriptions.
Return ONLY valid JSON with no markdown fences, no explanation:

{
  "styleTags": ["minimalist", "smart-casual"],
  "lifestyle": "professional",
  "budgetTier": "mid_range",
  "preferredBrands": []
}

budgetTier must be one of: affordable, mid_range, premium, luxury

Description: "${description}"`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(cleanJson(text));
    return {
      styleTags: result.styleTags || [],
      lifestyle: result.lifestyle || "casual",
      budgetTier: result.budgetTier || "mid_range",
      preferredBrands: result.preferredBrands || [],
    };
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

// ── analyzeStyle (alias for API routes that call this name directly) ──────────

export async function analyzeStyle(description: string): Promise<StyleAnalysisResult> {
  return analyzeStyleDescription(description);
}

// ── calculateProductScores ───────────────────────────────────────────────────
// Pure math — no AI call needed, identical to openai.ts implementation

export async function calculateProductScores(
  userProfile: { measurements: any; styleTags: string[]; budgetMin: number; budgetMax: number },
  product: { price: number; styleTags: string[]; sizeChart: any }
): Promise<ProductScore> {
  const fitScore = 0.85;

  const commonStyles = userProfile.styleTags.filter((tag) =>
    product.styleTags?.includes(tag)
  ).length;
  const styleMatch = commonStyles > 0 ? Math.min(commonStyles / 3, 1) : 0.5;

  const price = Number(product.price);
  const budgetMid = (userProfile.budgetMin + userProfile.budgetMax) / 2;
  const budgetRange = userProfile.budgetMax - userProfile.budgetMin;
  const priceDiff = Math.abs(price - budgetMid);
  const budgetMatch = Math.max(0, 1 - priceDiff / budgetRange);

  const totalScore = fitScore * 0.5 + styleMatch * 0.3 + budgetMatch * 0.2;
  return { fitScore, styleMatch, budgetMatch, totalScore };
}

// ── generateAiStylistResponse ────────────────────────────────────────────────
// Drop-in replacement for openai.ts export of the same name

export async function generateAiStylistResponse(
  personaSystemPrompt: string,
  userContext: { measurements: any; styleTags: string[]; budgetMin: number; budgetMax: number },
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<string> {
  const systemPrompt = `User Profile:
- Measurements: ${JSON.stringify(userContext.measurements)}
- Style: ${userContext.styleTags.join(", ")}
- Budget: $${userContext.budgetMin}-$${userContext.budgetMax}

${personaSystemPrompt}`;

  const messages: Anthropic.MessageParam[] = [];
  for (const msg of conversationHistory) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: "user", content: userMessage });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    if (!content) throw new Error("Claude returned empty response");
    return content;
  } catch (error: any) {
    console.error("Claude stylist error:", error.message);
    throw new Error(`AI stylist error: ${error.message}`);
  }
}

// ── generateSituationalOutfits ───────────────────────────────────────────────
// Drop-in replacement for openai.ts export of the same name (same param order)

export async function generateSituationalOutfits(
  situation: string,
  vibe: string | null,
  category: string
): Promise<SituationalOutfit[]> {
  const vibeInstruction = vibe
    ? `The user wants a "${vibe}" vibe — lean into that energy.`
    : "The user didn't specify a vibe, so provide a diverse range of styles.";

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are a personal stylist. Generate 3 complete outfit ideas for a specific real-life situation.

Rules:
- Each outfit should be a complete head-to-toe look with 4-6 items
- Include specific item names, colors/patterns, and approximate price ranges
- Write a short "why it works" explanation for each outfit (2-3 sentences, conversational tone)
- Include a practical styling tip for each outfit
- Use warm, approachable language — no jargon, no AI language
- Focus on items people can actually find in stores or online
- Each outfit should feel distinct from the others

${vibeInstruction}

Category: ${category}
Situation: ${situation}

Return ONLY valid JSON with no markdown fences, no explanation:
{
  "outfits": [
    {
      "title": "Name of the look",
      "whyItWorks": "Why this outfit is great for this situation",
      "items": [
        {
          "name": "Specific item name",
          "type": "Category (e.g., Top, Bottom, Shoes, Accessory)",
          "description": "Brief description of the item",
          "colorOrPattern": "Color or pattern",
          "priceRange": "Approximate price range like $40-60"
        }
      ],
      "stylingTip": "One practical tip for pulling this look together",
      "overallVibe": "2-3 word vibe description"
    }
  ]
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(cleanJson(text));

    return (parsed.outfits || []).map((o: any, idx: number) => ({
      id: `outfit-${Date.now()}-${idx}`,
      title: o.title || "Outfit",
      whyItWorks: o.whyItWorks || "",
      items: (o.items || []).map((item: any) => ({
        name: item.name || "",
        type: item.type || "",
        description: item.description || "",
        colorOrPattern: item.colorOrPattern || "",
        priceRange: item.priceRange || "",
      })),
      stylingTip: o.stylingTip || "",
      overallVibe: o.overallVibe || "",
    }));
  } catch (error: any) {
    console.error("Claude outfit generation failed:", error.message);
    throw error;
  }
}

// ── chatWithStylePersona ─────────────────────────────────────────────────────

export async function chatWithStylePersona(
  persona: {
    name: string;
    specialty: string;
    tone: string;
    systemPrompt: string;
  },
  messages: { role: "user" | "assistant"; content: string }[],
  userProfile?: object
): Promise<string> {
  const systemPrompt = `${persona.systemPrompt}

You are ${persona.name}, a personal fashion stylist specialising in ${persona.specialty}.
Your tone is: ${persona.tone}.
${userProfile ? `User style profile: ${JSON.stringify(userProfile)}` : ""}

Rules:
- Keep responses concise, warm, and actionable
- Never mention AI, algorithms, or technology
- Give specific, shoppable suggestions when possible
- Always make the user feel confident and understood`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages as Anthropic.MessageParam[],
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "I'd love to help — could you tell me a bit more about what you're looking for?";
  } catch (error) {
    console.error("Claude stylist chat failed:", error);
    throw error;
  }
}

// ── matchProducts ────────────────────────────────────────────────────────────

export async function matchProducts(
  product: { brand: string; title: string; category: string; price: number },
  candidates: { id: number; title: string; price: number }[]
): Promise<{ matches: { id: number; confidence: number; reason: string }[]; aiMatchingEnabled: boolean }> {
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
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error("Claude product matching failed:", error);
    return { matches: [], aiMatchingEnabled: false };
  }
}

// ── generateStylePreview ─────────────────────────────────────────────────────

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
    return JSON.parse(cleanJson(text));
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

function extractKeywords(text: string): string[] {
  const known = [
    "minimal", "casual", "classic", "bold", "elegant",
    "streetwear", "preppy", "bohemian", "romantic", "edgy",
    "sustainable", "luxury", "athleisure",
  ];
  return known.filter((k) => text.toLowerCase().includes(k));
}
