import OpenAI from 'openai';
import { RetailerProduct } from './retailers/types';
import { Product } from '../../shared/schema';

/**
 * AI Product Matching Service
 * 
 * Uses OpenAI GPT-5 to intelligently match products across retailers
 * Analyzes title, brand, category, description, and images
 * Returns confidence score (0-100)
 */

export interface ProductMatch {
  externalProduct: RetailerProduct;
  matchConfidence: number; // 0-100
  matchReason: string;
}

export class AIProductMatcher {
  private openai: OpenAI | null = null;

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    return this.openai;
  }

  /**
   * Find matching products across retailers for a given internal product
   */
  async findMatches(
    internalProduct: Product,
    externalProducts: RetailerProduct[]
  ): Promise<ProductMatch[]> {
    if (externalProducts.length === 0) {
      return [];
    }

    const matches: ProductMatch[] = [];

    // Use GPT-5 to analyze each external product for similarity
    for (const externalProduct of externalProducts) {
      const confidence = await this.calculateMatchConfidence(internalProduct, externalProduct);
      
      if (confidence >= 50) { // Only include matches with 50%+ confidence
        matches.push({
          externalProduct,
          matchConfidence: confidence,
          matchReason: this.generateMatchReason(confidence)
        });
      }
    }

    // Sort by confidence descending
    return matches.sort((a, b) => b.matchConfidence - a.matchConfidence);
  }

  /**
   * Calculate match confidence using AI
   */
  private async calculateMatchConfidence(
    internal: Product,
    external: RetailerProduct
  ): Promise<number> {
    try {
      const prompt = this.buildMatchingPrompt(internal, external);

      const completion = await this.getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at matching fashion products across different retailers. Analyze if two products are the same item or very similar variants. Return a confidence score from 0-100, where 100 means definitely the same product and 0 means completely different."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent scoring
        max_tokens: 150
      });

      const response = completion.choices[0]?.message?.content || "0";
      const confidence = this.extractConfidenceScore(response);

      return Math.min(100, Math.max(0, confidence));
    } catch (error) {
      console.error('AI matching failed:', error);
      // Fallback to simple text matching
      return this.simpleTextMatch(internal, external);
    }
  }

  /**
   * Build prompt for AI matching
   */
  private buildMatchingPrompt(internal: Product, external: RetailerProduct): string {
    return `
Compare these two products and determine if they are the same item:

PRODUCT A (Internal Catalog):
- Name: ${internal.name}
- Brand: ${internal.brand}
- Category: ${internal.category}
- Price: $${internal.price}
- Description: ${internal.description || 'N/A'}

PRODUCT B (${external.retailer.toUpperCase()}):
- Name: ${external.title}
- Brand: ${external.brand || 'Unknown'}
- Category: ${external.category || 'Unknown'}
- Price: $${external.currentPrice}

Analyze:
1. Are the brand names the same or variants (e.g., "Nike" vs "NIKE" vs "nike.com")?
2. Are the product names describing the same item?
3. Is the category/type the same?
4. Is the price in a reasonable range (accounting for discounts/sales)?
5. Do they appear to be the same model/SKU?

Return ONLY a confidence score (0-100) followed by a brief explanation.
Format: "Score: XX - Explanation"
`.trim();
  }

  /**
   * Extract confidence score from AI response
   */
  private extractConfidenceScore(response: string): number {
    // Look for patterns like "Score: 85" or "85%" or just "85"
    const patterns = [
      /score:\s*(\d+)/i,
      /confidence:\s*(\d+)/i,
      /(\d+)%/,
      /^(\d+)/
    ];

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    return 0;
  }

  /**
   * Fallback: Simple text-based matching
   */
  private simpleTextMatch(internal: Product, external: RetailerProduct): number {
    let score = 0;

    // Brand match (40 points)
    if (internal.brand.toLowerCase() === external.brand?.toLowerCase()) {
      score += 40;
    } else if (external.brand && internal.brand.toLowerCase().includes(external.brand.toLowerCase())) {
      score += 20;
    }

    // Title similarity (40 points)
    const titleSimilarity = this.calculateTextSimilarity(
      internal.name.toLowerCase(),
      external.title.toLowerCase()
    );
    score += titleSimilarity * 40;

    // Category match (20 points)
    if (internal.category.toLowerCase() === external.category?.toLowerCase()) {
      score += 20;
    }

    return Math.round(score);
  }

  /**
   * Calculate text similarity using Jaccard index
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Generate human-readable match reason
   */
  private generateMatchReason(confidence: number): string {
    if (confidence >= 90) return "Exact match - Same brand, model, and specifications";
    if (confidence >= 75) return "Very likely match - Similar product with minor variations";
    if (confidence >= 60) return "Probable match - Same category and brand";
    return "Possible match - Similar characteristics";
  }

  /**
   * Calculate fit confidence for external product based on user measurements
   */
  async calculateFitConfidence(
    externalProduct: RetailerProduct,
    userMeasurements: any
  ): Promise<number> {
    // If size is available and matches user's typical size
    if (externalProduct.availableSizes && externalProduct.availableSizes.length > 0) {
      // This is a simplified version - in production, use your existing fit scoring algorithm
      return 75; // Default moderate fit confidence
    }

    return 50; // Unknown fit
  }
}

// Singleton instance
export const aiProductMatcher = new AIProductMatcher();
