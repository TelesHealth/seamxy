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

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: messages as any,
    max_completion_tokens: 800
  });

  return response.choices[0].message.content || "I'm here to help with your style!";
}
