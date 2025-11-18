import OpenAI from "openai";
import { priceComparisonService } from "./price-comparison";
import { RetailerProduct } from "./retailers/types";
import { ChatMessage } from "./openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY
});

/**
 * Enhanced AI Stylist Response with Product Recommendations
 */
export interface AIStylistResponse {
  message: string;
  productRecommendations: RetailerProduct[];
}

/**
 * Product search parameters extracted by AI
 */
interface ProductSearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: 'men' | 'women' | 'unisex' | 'children';
  limit?: number;
}

/**
 * Generate AI stylist response with automatic product recommendations
 * Uses OpenAI function calling to let AI decide when to search for products
 */
export async function generateAIStylistResponseWithProducts(
  personaSystemPrompt: string,
  userContext: { 
    measurements: any; 
    styleTags: string[]; 
    budgetMin: number; 
    budgetMax: number;
    demographic?: string;
  },
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<AIStylistResponse> {
  
  const contextPrompt = `User Profile:
- Measurements: ${JSON.stringify(userContext.measurements)}
- Style: ${userContext.styleTags.join(", ")}
- Budget: $${userContext.budgetMin}-$${userContext.budgetMax}
- Demographic: ${userContext.demographic || 'Not specified'}

${personaSystemPrompt}

IMPORTANT: When the user asks for product recommendations, outfit suggestions, or what to buy, use the search_products function to find real products. You can search multiple times for different items (e.g., blazer, pants, shoes separately).`;

  const messages: any[] = [
    { role: "system", content: contextPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  // Define the search_products function
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "search_products",
        description: "Search for fashion products across multiple retailers (Amazon, eBay, Rakuten). Use this when the user asks for product recommendations, outfit suggestions, or what to buy. You can call this multiple times for different items.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (e.g., 'blue blazer', 'dress shoes', 'wedding dress')"
            },
            category: {
              type: "string",
              description: "Product category (e.g., 'blazers', 'shirts', 'pants', 'dresses', 'shoes', 'accessories')"
            },
            minPrice: {
              type: "number",
              description: "Minimum price filter (use user's budget)"
            },
            maxPrice: {
              type: "number",
              description: "Maximum price filter (use user's budget)"
            },
            gender: {
              type: "string",
              enum: ["men", "women", "unisex", "children"],
              description: "Gender filter based on user's demographic"
            },
            limit: {
              type: "number",
              description: "Number of products to return (default 5, max 10)"
            }
          },
          required: ["query"]
        }
      }
    }
  ];

  try {
    console.log('🤖 Calling OpenAI with function calling enabled...');
    
    let response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      max_completion_tokens: 4000
    });

    const allProducts: RetailerProduct[] = [];
    let finalMessage = "";

    // Handle function calls
    while (response.choices[0]?.finish_reason === "tool_calls") {
      const toolCalls = response.choices[0].message.tool_calls;
      
      if (!toolCalls) break;

      // Add assistant's message with tool calls to history
      messages.push(response.choices[0].message);

      // Execute each tool call
      for (const toolCall of toolCalls) {
        if (toolCall.type === "function" && toolCall.function.name === "search_products") {
          console.log('🔍 AI requested product search:', toolCall.function.arguments);
          
          const args: ProductSearchParams = JSON.parse(toolCall.function.arguments);
          
          // Search retailers
          const products = await priceComparisonService.searchAllRetailers({
            query: args.query,
            category: args.category,
            minPrice: args.minPrice ?? userContext.budgetMin,
            maxPrice: args.maxPrice ?? userContext.budgetMax,
            gender: args.gender ?? mapDemographicToGender(userContext.demographic),
            limit: Math.min(args.limit || 5, 10)
          });

          console.log(`✅ Found ${products.length} products`);
          allProducts.push(...products);

          // Add function result to messages
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              productsFound: products.length,
              products: products.map(p => ({
                title: p.title,
                brand: p.brand,
                price: p.currentPrice,
                retailer: p.retailer
              }))
            })
          });
        }
      }

      // Get AI's final response after processing tools
      response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: messages,
        tools: tools,
        tool_choice: "auto",
        max_completion_tokens: 4000
      });
    }

    finalMessage = response.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";

    console.log(`✅ Final response with ${allProducts.length} product recommendations`);

    // Remove duplicates and rank products
    const uniqueProducts = deduplicateProducts(allProducts);
    const rankedProducts = rankProductsByRelevance(uniqueProducts, userContext);

    return {
      message: finalMessage,
      productRecommendations: rankedProducts.slice(0, 5) // Top 5 products
    };

  } catch (error: any) {
    console.error('❌ OpenAI API Error:', error.message);
    throw new Error(`AI stylist error: ${error.message}`);
  }
}

/**
 * Map demographic to gender for product search
 */
function mapDemographicToGender(demographic?: string): 'men' | 'women' | 'children' | 'unisex' {
  if (!demographic) return 'unisex';
  
  const demo = demographic.toLowerCase();
  if (demo === 'men') return 'men';
  if (demo === 'women') return 'women';
  if (demo === 'children' || demo === 'young_adults') return 'children';
  return 'unisex';
}

/**
 * Remove duplicate products (same external ID or very similar titles)
 */
function deduplicateProducts(products: RetailerProduct[]): RetailerProduct[] {
  const seen = new Set<string>();
  const unique: RetailerProduct[] = [];

  for (const product of products) {
    const key = `${product.retailer}-${product.externalId}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(product);
    }
  }

  return unique;
}

/**
 * Rank products by relevance to user context
 * Factors: Budget match, brand preference, style
 */
function rankProductsByRelevance(
  products: RetailerProduct[],
  userContext: { styleTags: string[]; budgetMin: number; budgetMax: number; preferredBrands?: string[] }
): RetailerProduct[] {
  return products.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, userContext);
    const scoreB = calculateRelevanceScore(b, userContext);
    return scoreB - scoreA; // Higher score first
  });
}

/**
 * Calculate relevance score (0-100)
 */
function calculateRelevanceScore(
  product: RetailerProduct,
  userContext: { styleTags: string[]; budgetMin: number; budgetMax: number; preferredBrands?: string[] }
): number {
  let score = 50; // Base score

  // Budget match (30 points max)
  const budgetMid = (userContext.budgetMin + userContext.budgetMax) / 2;
  const budgetRange = userContext.budgetMax - userContext.budgetMin;
  const priceDiff = Math.abs(product.currentPrice - budgetMid);
  const budgetScore = Math.max(0, 30 - (30 * priceDiff / budgetRange));
  score += budgetScore;

  // Preferred brand (20 points)
  if (userContext.preferredBrands && product.brand) {
    const brandMatch = userContext.preferredBrands.some(
      b => product.brand?.toLowerCase().includes(b.toLowerCase())
    );
    if (brandMatch) score += 20;
  }

  // Price discount bonus (small)
  if (product.originalPrice && product.currentPrice < product.originalPrice) {
    const discount = (product.originalPrice - product.currentPrice) / product.originalPrice;
    score += Math.min(discount * 10, 10);
  }

  return Math.min(100, score);
}
