import { RetailerClient, RetailerProduct, SearchCriteria } from './types';
import { searchMockProducts, getMockProductById } from './mock-products';

/**
 * eBay Browse API Client
 * 
 * Uses OAuth 2.0 Application token for search
 * Requires: Client ID, Client Secret
 */

export class EbayClient implements RetailerClient {
  name = 'eBay';
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private isEnabled: boolean;
  private partnerNetworkId: string;

  constructor(config: { clientId?: string; clientSecret?: string; partnerNetworkId?: string; isActive?: boolean }) {
    this.clientId = config.clientId || '';
    this.clientSecret = config.clientSecret || '';
    this.partnerNetworkId = config.partnerNetworkId || '9';
    this.isEnabled = config.isActive ?? true; // Enable by default for demo
  }

  isAvailable(): boolean {
    // Return true if enabled OR if we're in demo mode
    return this.isEnabled;
  }

  async search(criteria: SearchCriteria): Promise<RetailerProduct[]> {
    // If API keys are configured, use real API (TODO: implement)
    if (this.clientId && this.clientSecret) {
      console.log('eBay API keys configured - would call real API');
      await this.ensureToken();
      // TODO: Implement actual eBay Browse API call
      return [];
    }

    // Otherwise, return mock data for demo
    console.log('🔧 eBay: Using mock data (API keys not configured)');
    const mockResults = searchMockProducts({
      query: criteria.query,
      category: criteria.category,
      minPrice: criteria.minPrice,
      maxPrice: criteria.maxPrice,
      limit: criteria.limit,
    });

    // Filter to only eBay products
    return mockResults.filter(p => p.retailer === 'ebay');
  }

  async getProduct(itemId: string): Promise<RetailerProduct | null> {
    // If API keys are configured, use real API (TODO: implement)
    if (this.clientId && this.clientSecret) {
      console.log('eBay API keys configured - would call real API');
      await this.ensureToken();
      // TODO: Implement actual eBay Browse API call
      return null;
    }

    // Otherwise, return mock data
    const product = getMockProductById(itemId);
    return product?.retailer === 'ebay' ? product : null;
  }

  /**
   * Get OAuth 2.0 Application Access Token
   */
  private async ensureToken(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return; // Token still valid
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
      });

      if (!response.ok) {
        throw new Error(`eBay auth failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early
    } catch (error) {
      console.error('eBay token fetch failed:', error);
      throw error;
    }
  }

  private normalizeProduct(ebayProduct: any): RetailerProduct {
    return {
      externalId: ebayProduct.itemId,
      retailer: 'ebay',
      title: ebayProduct.title,
      brand: ebayProduct.brand,
      category: ebayProduct.categories?.[0]?.categoryName,
      currentPrice: parseFloat(ebayProduct.price?.value || '0'),
      currency: ebayProduct.price?.currency || 'USD',
      imageUrl: ebayProduct.image?.imageUrl,
      productUrl: ebayProduct.itemWebUrl,
      affiliateUrl: this.buildAffiliateUrl(ebayProduct.itemWebUrl),
      shippingCost: parseFloat(ebayProduct.shippingOptions?.[0]?.shippingCost?.value || '0'),
      deliveryDays: this.parseDeliveryDays(ebayProduct.shippingOptions?.[0]?.maxEstimatedDeliveryDate),
      attributes: ebayProduct
    };
  }

  private buildAffiliateUrl(itemUrl: string): string {
    if (!this.partnerNetworkId) return itemUrl;
    return `${itemUrl}?mkcid=1&mkrid=711-53200-19255-0&campid=${this.partnerNetworkId}`;
  }

  private parseDeliveryDays(maxDeliveryDate?: string): number {
    if (!maxDeliveryDate) return 7;
    const deliveryDate = new Date(maxDeliveryDate);
    const today = new Date();
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }
}
