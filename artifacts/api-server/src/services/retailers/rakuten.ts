import { RetailerClient, RetailerProduct, SearchCriteria } from './types';
import { searchMockProducts, getMockProductById } from './mock-products';

/**
 * Rakuten Advertising API Client
 * 
 * Uses Rakuten Product Search API
 * Requires: API Key (Application ID)
 */

export class RakutenClient implements RetailerClient {
  name = 'Rakuten';
  private apiKey: string;
  private affiliateId: string;
  private isEnabled: boolean;
  private baseUrl = 'https://api.rakuten.net/rws/3.0/rest';

  constructor(config: { apiKey?: string; affiliateId?: string; isActive?: boolean }) {
    this.apiKey = config.apiKey || '';
    this.affiliateId = config.affiliateId || '';
    this.isEnabled = config.isActive ?? true; // Enable by default for demo
  }

  isAvailable(): boolean {
    // Return true if enabled OR if we're in demo mode
    return this.isEnabled;
  }

  async search(criteria: SearchCriteria): Promise<RetailerProduct[]> {
    // If API key is configured, use real API (TODO: implement)
    if (this.apiKey) {
      console.log('Rakuten API key configured - would call real API');
      // TODO: Implement actual Rakuten API call
      return [];
    }

    // Otherwise, return mock data for demo
    console.log('🔧 Rakuten: Using mock data (API key not configured)');
    const mockResults = searchMockProducts({
      query: criteria.query,
      category: criteria.category,
      minPrice: criteria.minPrice,
      maxPrice: criteria.maxPrice,
      limit: criteria.limit,
    });

    // Filter to only Rakuten products
    return mockResults.filter(p => p.retailer === 'rakuten');
  }

  async getProduct(itemCode: string): Promise<RetailerProduct | null> {
    // If API key is configured, use real API (TODO: implement)
    if (this.apiKey) {
      console.log('Rakuten API key configured - would call real API');
      // TODO: Implement actual Rakuten API call
      return null;
    }

    // Otherwise, return mock data
    const product = getMockProductById(itemCode);
    return product?.retailer === 'rakuten' ? product : null;
  }

  private normalizeProduct(rakutenProduct: any): RetailerProduct {
    return {
      externalId: rakutenProduct.itemCode,
      retailer: 'rakuten',
      title: rakutenProduct.itemName,
      brand: rakutenProduct.shopName, // Rakuten doesn't always have brand
      category: rakutenProduct.genreId,
      currentPrice: rakutenProduct.itemPrice,
      currency: 'JPY', // Rakuten is primarily JPY
      imageUrl: rakutenProduct.mediumImageUrls?.[0]?.imageUrl,
      productUrl: rakutenProduct.itemUrl,
      affiliateUrl: this.buildAffiliateUrl(rakutenProduct.affiliateUrl),
      shippingCost: rakutenProduct.postageFlag === 1 ? 0 : undefined,
      deliveryDays: 7, // Default estimate
      attributes: rakutenProduct
    };
  }

  private buildAffiliateUrl(affiliateUrl: string): string {
    return affiliateUrl || '';
  }
}
