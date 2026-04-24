import Anthropic from "@anthropic-ai/sdk";
import { priceComparisonService } from "./price-comparison";
import { RetailerProduct } from "./retailers/types";
import { ChatMessage } from "./anthropic";

const MODEL = "claude-opus-4-5";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
  gender?: "men" | "women" | "unisex" | "children";
  limit?: number;
}

/**
 * Generate AI stylist response with automatic product recommendations.
 * Uses Anthropic tool use to let Claude decide when to search for products.
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
  const systemPrompt = `User Profile:
- Measurements: ${JSON.stringify(userContext.measurements)}
- Style: ${userContext.styleTags.join(", ")}
- Budget: $${userContext.budgetMin}-$${userContext.budgetMax}
- Demographic: ${userContext.demographic || "Not specified"}

${personaSystemPrompt}

IMPORTANT: When the user asks for product recommendations, outfit suggestions, or what to buy, use the search_products tool to find real products. You can search multiple times for different items (e.g., blazer, pants, shoes separately).`;

  const tools: Anthropic.Tool[] = [
    {
      name: "search_products",
      description:
        "Search for fashion products across multiple retailers (Amazon, eBay, Rakuten). Use this when the user asks for product recommendations, outfit suggestions, or what to buy. You can call this multiple times for different items.",
      input_schema: {
        type: "object" as const,
        properties: {
          query: {
            type: "string",
            description: 'Search query (e.g., "blue blazer", "dress shoes", "wedding dress")',
          },
          category: {
            type: "string",
            description:
              "Product category (e.g., 'blazers', 'shirts', 'pants', 'dresses', 'shoes', 'accessories')",
          },
          minPrice: {
            type: "number",
            description: "Minimum price filter (use user's budget)",
          },
          maxPrice: {
            type: "number",
            description: "Maximum price filter (use user's budget)",
          },
          gender: {
            type: "string",
            enum: ["men", "women", "unisex", "children"],
            description: "Gender filter based on user's demographic",
          },
          limit: {
            type: "number",
            description: "Number of products to return (default 5, max 10)",
          },
        },
        required: ["query"],
      },
    },
  ];

  // Build initial messages — filter out "system" role since Claude takes system separately
  const messages: Anthropic.MessageParam[] = [];
  for (const msg of conversationHistory) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: "user", content: userMessage });

  try {
    console.log("Calling Claude with tool use enabled...");

    const allProducts: RetailerProduct[] = [];
    let finalMessage = "";

    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    });

    // Handle tool use in a loop
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) break;

      // Add assistant's response (with tool_use blocks) to messages
      messages.push({ role: "assistant", content: response.content });

      // Build tool_result blocks
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolBlock of toolUseBlocks) {
        if (toolBlock.name === "search_products") {
          console.log("Claude requested product search:", JSON.stringify(toolBlock.input));

          const args = toolBlock.input as ProductSearchParams;

          const products = await priceComparisonService.searchAllRetailers({
            query: args.query,
            category: args.category,
            minPrice: args.minPrice ?? userContext.budgetMin,
            maxPrice: args.maxPrice ?? userContext.budgetMax,
            gender: args.gender ?? mapDemographicToGender(userContext.demographic),
            limit: Math.min(args.limit || 5, 10),
          });

          console.log(`Found ${products.length} products`);
          allProducts.push(...products);

          toolResults.push({
            type: "tool_result",
            tool_use_id: toolBlock.id,
            content: JSON.stringify({
              productsFound: products.length,
              products: products.map((p) => ({
                title: p.title,
                brand: p.brand,
                price: p.currentPrice,
                retailer: p.retailer,
              })),
            }),
          });
        }
      }

      // Add tool results as user message
      messages.push({ role: "user", content: toolResults });

      // Continue conversation
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages,
      });
    }

    // Extract final text response
    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    finalMessage = textBlock?.text || "I apologize, I couldn't generate a response.";

    console.log(`Final response with ${allProducts.length} product recommendations`);

    const uniqueProducts = deduplicateProducts(allProducts);
    const rankedProducts = rankProductsByRelevance(uniqueProducts, userContext);

    return {
      message: finalMessage,
      productRecommendations: rankedProducts.slice(0, 5),
    };
  } catch (error: any) {
    console.error("Claude API Error:", error.message);
    throw new Error(`AI stylist error: ${error.message}`);
  }
}

/**
 * Map demographic to gender for product search
 */
function mapDemographicToGender(
  demographic?: string
): "men" | "women" | "children" | "unisex" {
  if (!demographic) return "unisex";
  const demo = demographic.toLowerCase();
  if (demo === "men") return "men";
  if (demo === "women") return "women";
  if (demo === "children" || demo === "young_adults") return "children";
  return "unisex";
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
 */
function rankProductsByRelevance(
  products: RetailerProduct[],
  userContext: {
    styleTags: string[];
    budgetMin: number;
    budgetMax: number;
    preferredBrands?: string[];
  }
): RetailerProduct[] {
  return products.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, userContext);
    const scoreB = calculateRelevanceScore(b, userContext);
    return scoreB - scoreA;
  });
}

/**
 * Calculate relevance score (0-100)
 */
function calculateRelevanceScore(
  product: RetailerProduct,
  userContext: {
    styleTags: string[];
    budgetMin: number;
    budgetMax: number;
    preferredBrands?: string[];
  }
): number {
  let score = 50;

  const budgetMid = (userContext.budgetMin + userContext.budgetMax) / 2;
  const budgetRange = userContext.budgetMax - userContext.budgetMin;
  const priceDiff = Math.abs(product.currentPrice - budgetMid);
  const budgetScore = Math.max(0, 30 - (30 * priceDiff) / budgetRange);
  score += budgetScore;

  if (userContext.preferredBrands && product.brand) {
    const brandMatch = userContext.preferredBrands.some((b) =>
      product.brand?.toLowerCase().includes(b.toLowerCase())
    );
    if (brandMatch) score += 20;
  }

  if (product.originalPrice && product.currentPrice < product.originalPrice) {
    const discount =
      (product.originalPrice - product.currentPrice) / product.originalPrice;
    score += Math.min(discount * 10, 10);
  }

  return Math.min(100, score);
}
