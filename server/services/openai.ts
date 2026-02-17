// Blueprint reference: javascript_openai_ai_integrations
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Supports both Replit AI Integrations (when on Replit) and direct OpenAI (production)
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY
});

export interface StyleAnalysisResult {
  styleTags: string[];
  lifestyle: string;
  budgetTier: string;
  preferredBrands: string[];
}

export async function analyzeStyleDescription(description: string): Promise<StyleAnalysisResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a fashion style analyzer. Extract structured data from user descriptions.
Return JSON with: styleTags (array of style keywords like "minimalist", "smart-casual"), lifestyle (single word like "professional"), budgetTier (one of: affordable, mid_range, premium, luxury), preferredBrands (array of brand names if mentioned).`
      },
      {
        role: "user",
        content: description
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 500
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return {
    styleTags: result.styleTags || [],
    lifestyle: result.lifestyle || "casual",
    budgetTier: result.budgetTier || "mid_range",
    preferredBrands: result.preferredBrands || []
  };
}

export interface ProductScore {
  fitScore: number; // 0-1
  styleMatch: number; // 0-1
  budgetMatch: number; // 0-1
  totalScore: number; // weighted average
}

export async function calculateProductScores(
  userProfile: { measurements: any; styleTags: string[]; budgetMin: number; budgetMax: number },
  product: { price: number; styleTags: string[]; sizeChart: any }
): Promise<ProductScore> {
  // Simplified scoring (can be enhanced with AI later)
  
  // Fit score: Based on measurement compatibility (simplified)
  const fitScore = 0.85; // Would compare measurements with size chart
  
  // Style match: Compare style tags
  const commonStyles = userProfile.styleTags.filter(tag => 
    product.styleTags?.includes(tag)
  ).length;
  const styleMatch = commonStyles > 0 ? Math.min(commonStyles / 3, 1) : 0.5;
  
  // Budget match: How well price fits user's budget
  const price = Number(product.price);
  const budgetMid = (userProfile.budgetMin + userProfile.budgetMax) / 2;
  const budgetRange = userProfile.budgetMax - userProfile.budgetMin;
  const priceDiff = Math.abs(price - budgetMid);
  const budgetMatch = Math.max(0, 1 - (priceDiff / budgetRange));
  
  // Total score: Weighted average (Fit 50%, Style 30%, Budget 20%)
  const totalScore = (fitScore * 0.5) + (styleMatch * 0.3) + (budgetMatch * 0.2);
  
  return { fitScore, styleMatch, budgetMatch, totalScore };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generateAiStylistResponse(
  personaSystemPrompt: string,
  userContext: { measurements: any; styleTags: string[]; budgetMin: number; budgetMax: number },
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<string> {
  const contextPrompt = `User Profile:
- Measurements: ${JSON.stringify(userContext.measurements)}
- Style: ${userContext.styleTags.join(", ")}
- Budget: $${userContext.budgetMin}-$${userContext.budgetMax}

${personaSystemPrompt}`;

  const messages: ChatMessage[] = [
    { role: "system", content: contextPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  try {
    console.log('🤖 Calling OpenAI API for AI stylist...');
    console.log('Model: gpt-5');
    console.log('Messages count:', messages.length);
    console.log('System prompt:', contextPrompt.substring(0, 200) + '...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages as any,
      max_completion_tokens: 4000
    });

    console.log('✅ OpenAI response received');
    console.log('Full response:', JSON.stringify(response, null, 2));
    console.log('Choices count:', response.choices?.length || 0);
    console.log('First choice:', response.choices[0]);
    console.log('Message:', response.choices[0]?.message);
    console.log('Content:', response.choices[0]?.message?.content);
    console.log('Response content length:', response.choices[0]?.message?.content?.length || 0);
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      console.error('❌ OpenAI returned empty content');
      console.error('Response object:', response);
      throw new Error('OpenAI returned empty response');
    }
    
    return content;
  } catch (error: any) {
    console.error('❌ OpenAI API Error:', error.message);
    console.error('Error details:', error);
    throw new Error(`AI stylist error: ${error.message}`);
  }
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

export async function generateSituationalOutfits(
  situation: string,
  vibe: string | null,
  category: string
): Promise<SituationalOutfit[]> {
  try {
  const vibeInstruction = vibe
    ? `The user wants a "${vibe}" vibe — lean into that energy.`
    : "The user didn't specify a vibe, so provide a diverse range of styles.";

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a personal stylist. Generate 3 complete outfit ideas for a specific real-life situation.

Rules:
- Each outfit should be a complete head-to-toe look with 4-6 items
- Include specific item names, colors/patterns, and approximate price ranges
- Write a short "why it works" explanation for each outfit (2-3 sentences, conversational tone)
- Include a practical styling tip for each outfit
- Use warm, approachable language — no jargon, no "AI-powered" language
- Focus on items people can actually find in stores or online
- Each outfit should feel distinct from the others

${vibeInstruction}

Return JSON with this exact structure:
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
}`
      },
      {
        role: "user",
        content: `Category: ${category}\nSituation: ${situation}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    console.error("OpenAI returned empty content for situational outfits");
    console.error("Response:", JSON.stringify(response.choices[0]));
    throw new Error("Failed to generate outfit ideas");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse outfit ideas response");
  }
  const outfits: SituationalOutfit[] = (parsed.outfits || []).map((o: any, idx: number) => ({
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

  return outfits;
  } catch (error: any) {
    console.error("generateSituationalOutfits error:", error.message);
    if (error.response) {
      console.error("OpenAI API response status:", error.response.status);
    }
    throw error;
  }
}
