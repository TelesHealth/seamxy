import Anthropic from "@anthropic-ai/sdk";
import { RetailerProduct } from './retailers/types';
import { Product } from '../../shared/schema';

const MODEL = "claude-opus-4-5";

/**
 * AI Product Matching Service
 *
 * Uses Anthropic Claude to intelligently match products across retailers.
 * Analyses title, brand, category, and price.
 * Returns confidence score (0-100).
 */

export interface ProductMatch {
  externalProduct: RetailerProduct;
  matchConfidence: number; // 0-100
  matchReason: string;
}

export class AIProductMatcher {
  private anthropic: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.anthropic) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    return this.anthropic;
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

    for (const externalProduct of externalProducts) {
      const confidence = await this.calculateMatchConfidence(internalProduct, externalProduct);

      if (confidence >= 50) {
        matches.push({
          externalProduct,
          matchConfidence: confidence,
          matchReason: this.generateMatchReason(confidence),
        });
      }
    }

    return matches.sort((a, b) => b.matchConfidence - a.matchConfidence);
  }

  /**
   * Calculate match confidence using Claude
   */
  private async calculateMatchConfidence(
    internal: Product,
    external: RetailerProduct
  ): Promise<number> {
    try {
      const prompt = this.buildMatchingPrompt(internal, external);

      const message = await this.getClient().messages.create({
        model: MODEL,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `You are an expert at matching fashion products across different retailers. Analyse if two products are the same item or very similar variants. Return a confidence score from 0-100, where 100 means definitely the same product and 0 means completely different.\n\n${prompt}`,
          },
        ],
      });

      const response =
        message.content[0].type === "text" ? message.content[0].text : "0";
      const confidence = this.extractConfidenceScore(response);

      return Math.min(100, Math.max(0, confidence));
    } catch (error) {
      console.error("AI matching failed:", error);
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

Analyse:
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
    const patterns = [
      /score:\s*(\d+)/i,
      /confidence:\s*(\d+)/i,
      /(\d+)%/,
      /^(\d+)/,
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

    if (internal.brand.toLowerCase() === external.brand?.toLowerCase()) {
      score += 40;
    } else if (external.brand && internal.brand.toLowerCase().includes(external.brand.toLowerCase())) {
      score += 20;
    }

    const titleSimilarity = this.calculateTextSimilarity(
      internal.name.toLowerCase(),
      external.title.toLowerCase()
    );
    score += titleSimilarity * 40;

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

    const intersection = new Set(Array.from(words1).filter((word) => words2.has(word)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);

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
    if (externalProduct.availableSizes && externalProduct.availableSizes.length > 0) {
      return 75;
    }
    return 50;
  }
}

// Singleton instance
export const aiProductMatcher = new AIProductMatcher();
