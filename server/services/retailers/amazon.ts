import { RetailerClient, RetailerProduct, SearchCriteria } from './types';
import { searchMockProducts, getMockProductById } from './mock-products';

/**
 * Amazon Product Advertising API 5.0 Client
 * 
 * NOTE: This is a placeholder implementation. Full Amazon PAA5 requires:
 * 1. AWS Signature Version 4 signing
 * 2. amazon-paapi package or manual HMAC signing
 * 3. Associate Tag (Partner ID)
 * 4. Access Key & Secret Key
 * 
 * For MVP, we return mock data that simulates the API structure.
 * In production, integrate the official amazon-paapi SDK.
 */

export class AmazonClient implements RetailerClient {
  name = 'Amazon';
  private partnerTag: string;
  private accessKey: string;
  private secretKey: string;
  private isEnabled: boolean;

  constructor(config: { partnerTag?: string; accessKey?: string; secretKey?: string; isActive?: boolean }) {
    this.partnerTag = config.partnerTag || 'seamxy-20'; // Default demo tag
    this.accessKey = config.accessKey || '';
    this.secretKey = config.secretKey || '';
    this.isEnabled = config.isActive ?? true; // Enable by default for demo
  }

  isAvailable(): boolean {
    // Return true if enabled OR if we're in demo mode (no keys configured)
    return this.isEnabled;
  }

  async search(criteria: SearchCriteria): Promise<RetailerProduct[]> {
    // If API keys are configured, use real API (TODO: implement)
    if (this.accessKey && this.secretKey) {
      console.log('Amazon API keys configured - would call real API');
      // TODO: Implement actual Amazon PAA5 API call
      return [];
    }

    // Otherwise, return mock data for demo
    console.log('🔧 Amazon: Using mock data (API keys not configured)');
    const mockResults = searchMockProducts({
      query: criteria.query,
      category: criteria.category,
      minPrice: criteria.minPrice,
      maxPrice: criteria.maxPrice,
      limit: criteria.limit,
    });

    // Filter to only Amazon products
    return mockResults.filter(p => p.retailer === 'amazon');
  }

  async getProduct(asin: string): Promise<RetailerProduct | null> {
    // If API keys are configured, use real API (TODO: implement)
    if (this.accessKey && this.secretKey) {
      console.log('Amazon API keys configured - would call real API');
      // TODO: Implement actual Amazon PAA5 API call
      return null;
    }

    // Otherwise, return mock data
    const product = getMockProductById(asin);
    return product?.retailer === 'amazon' ? product : null;
  }

  /**
   * Helper to normalize Amazon API response to our standard format
   */
  private normalizeProduct(amazonProduct: any): RetailerProduct {
    // This will parse the Amazon API response structure
    return {
      externalId: amazonProduct.ASIN,
      retailer: 'amazon',
      title: amazonProduct.ItemInfo?.Title?.DisplayValue || '',
      brand: amazonProduct.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
      category: amazonProduct.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName,
      currentPrice: amazonProduct.Offers?.Listings?.[0]?.Price?.Amount || 0,
      originalPrice: amazonProduct.Offers?.Listings?.[0]?.SavingBasis?.Amount,
      currency: amazonProduct.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
      imageUrl: amazonProduct.Images?.Primary?.Large?.URL,
      productUrl: amazonProduct.DetailPageURL,
      affiliateUrl: this.buildAffiliateUrl(amazonProduct.ASIN),
      shippingCost: amazonProduct.Offers?.Listings?.[0]?.DeliveryInfo?.ShippingCharges?.Amount,
      deliveryDays: this.parseDeliveryDays(amazonProduct.Offers?.Listings?.[0]?.DeliveryInfo?.IsFreeShippingEligible),
      isSustainable: amazonProduct.ItemInfo?.ProductInfo?.ItemDimensions?.Weight?.DisplayValue?.includes('Climate Pledge Friendly'),
      attributes: amazonProduct
    };
  }

  private buildAffiliateUrl(asin: string): string {
    return `https://www.amazon.com/dp/${asin}?tag=${this.partnerTag}`;
  }

  private parseDeliveryDays(isFreeShipping?: boolean): number {
    // Amazon typically delivers in 2 days for Prime
    return isFreeShipping ? 2 : 5;
  }
}
