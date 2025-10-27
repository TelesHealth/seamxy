import { db } from "../db";
import { retailerConfigs, externalProducts, priceHistory } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { AmazonClient } from './retailers/amazon';
import { EbayClient } from './retailers/ebay';
import { RakutenClient } from './retailers/rakuten';
import { RetailerClient, RetailerProduct, SearchCriteria } from './retailers/types';

/**
 * Price Comparison Service
 * 
 * Orchestrates multiple retailer APIs to find and compare products
 * Features:
 * - Multi-retailer search aggregation
 * - In-memory caching for performance
 * - Rate limiting per retailer
 * - Price history tracking
 */

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

export class PriceComparisonService {
  private clients: Map<string, RetailerClient> = new Map();
  private rateLimits: Map<string, RateLimitTracker> = new Map();
  private searchCache: Map<string, { results: RetailerProduct[]; expiresAt: number }> = new Map();
  private cacheExpiryMs = 15 * 60 * 1000; // 15 minutes

  constructor() {
    // Clients will be initialized lazily when needed
  }

  /**
   * Initialize retailer clients from database config
   */
  private async initializeClients(): Promise<void> {
    if (this.clients.size > 0) return; // Already initialized

    try {
      const configs = await db.select().from(retailerConfigs).where(eq(retailerConfigs.isActive, true));

      for (const config of configs) {
        let client: RetailerClient | null = null;

        switch (config.retailer) {
          case 'amazon':
            client = new AmazonClient({
              partnerTag: config.partnerTag || undefined,
              accessKey: config.apiKey || undefined,
              secretKey: config.apiSecret || undefined,
              isActive: config.isActive
            });
            break;

          case 'ebay':
            client = new EbayClient({
              clientId: config.apiKey || undefined,
              clientSecret: config.apiSecret || undefined,
              partnerNetworkId: config.partnerTag || undefined,
              isActive: config.isActive
            });
            break;

          case 'rakuten':
            client = new RakutenClient({
              apiKey: config.apiKey || undefined,
              affiliateId: config.partnerTag || undefined,
              isActive: config.isActive
            });
            break;

          default:
            console.warn(`Unknown retailer: ${config.retailer}`);
        }

        if (client && client.isAvailable()) {
          this.clients.set(config.retailer, client);
          this.rateLimits.set(config.retailer, {
            count: 0,
            resetAt: Date.now() + 3600000 // 1 hour
          });
        }
      }

      console.log(`✅ Initialized ${this.clients.size} retailer clients`);
    } catch (error) {
      console.error('Failed to initialize retailer clients:', error);
    }
  }

  /**
   * Search across multiple retailers
   */
  async searchAllRetailers(criteria: SearchCriteria): Promise<RetailerProduct[]> {
    await this.initializeClients();

    const cacheKey = JSON.stringify(criteria);
    const cached = this.searchCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiresAt) {
      console.log('✅ Returning cached search results');
      return cached.results;
    }

    const searchPromises: Promise<RetailerProduct[]>[] = [];

    for (const [retailer, client] of Array.from(this.clients.entries())) {
      if (this.canMakeRequest(retailer)) {
        searchPromises.push(
          client.search(criteria).catch((error: any) => {
            console.error(`${retailer} search failed:`, error);
            return [];
          })
        );
        this.incrementRateLimit(retailer);
      }
    }

    const results = await Promise.all(searchPromises);
    const allProducts = results.flat();

    // Cache the results
    this.searchCache.set(cacheKey, {
      results: allProducts,
      expiresAt: Date.now() + this.cacheExpiryMs
    });

    // Clear old cache entries
    this.cleanupCache();

    return allProducts;
  }

  /**
   * Get product from specific retailer
   */
  async getProductFromRetailer(retailer: string, externalId: string): Promise<RetailerProduct | null> {
    await this.initializeClients();

    const client = this.clients.get(retailer);
    if (!client || !this.canMakeRequest(retailer)) {
      return null;
    }

    this.incrementRateLimit(retailer);
    return client.getProduct(externalId);
  }

  /**
   * Save external product to database and track price
   */
  async saveExternalProduct(
    product: RetailerProduct,
    internalProductId?: string,
    matchConfidence?: number,
    fitConfidence?: number
  ): Promise<string> {
    const [savedProduct] = await db.insert(externalProducts).values({
      internalProductId: internalProductId || null,
      retailer: product.retailer,
      externalId: product.externalId,
      title: product.title,
      brand: product.brand || null,
      category: product.category || null,
      currentPrice: product.currentPrice.toString(),
      originalPrice: product.originalPrice?.toString() || null,
      currency: product.currency,
      imageUrl: product.imageUrl || null,
      productUrl: product.productUrl,
      affiliateUrl: product.affiliateUrl || null,
      availableSizes: product.availableSizes || null,
      shippingCost: product.shippingCost?.toString() || null,
      deliveryDays: product.deliveryDays || null,
      isSustainable: product.isSustainable || false,
      sustainabilityCertifications: product.sustainabilityCertifications || null,
      matchConfidence: matchConfidence?.toString() || null,
      fitConfidence: fitConfidence?.toString() || null,
      lastCheckedAt: new Date()
    }).returning();

    // Record initial price history
    await db.insert(priceHistory).values({
      externalProductId: savedProduct.id,
      price: product.currentPrice.toString(),
      originalPrice: product.originalPrice?.toString() || null,
      isAvailable: true,
      checkedAt: new Date()
    });

    return savedProduct.id;
  }

  /**
   * Check rate limit for retailer
   */
  private canMakeRequest(retailer: string): boolean {
    const limit = this.rateLimits.get(retailer);
    if (!limit) return false;

    const now = Date.now();
    
    // Reset counter if window expired
    if (now >= limit.resetAt) {
      limit.count = 0;
      limit.resetAt = now + 3600000; // Reset in 1 hour
    }

    // Check if under limit (1000 per hour default)
    return limit.count < 1000;
  }

  /**
   * Increment rate limit counter
   */
  private incrementRateLimit(retailer: string): void {
    const limit = this.rateLimits.get(retailer);
    if (limit) {
      limit.count++;
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of Array.from(this.searchCache.entries())) {
      if (now >= value.expiresAt) {
        this.searchCache.delete(key);
      }
    }
  }

  /**
   * Get available retailers
   */
  async getAvailableRetailers(): Promise<string[]> {
    await this.initializeClients();
    return Array.from(this.clients.keys());
  }
}

// Singleton instance
export const priceComparisonService = new PriceComparisonService();
