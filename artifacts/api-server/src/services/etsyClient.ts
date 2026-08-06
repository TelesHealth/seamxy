/**
 * Etsy API v3 Client
 * Handles OAuth 2.0 authentication and product search for wedding/prom items
 * API Docs: https://developers.etsy.com/
 */

import axios, { type AxiosInstance } from 'axios';

const ETSY_API_BASE = 'https://api.etsy.com/v3/application';
const ETSY_OAUTH_BASE = 'https://www.etsy.com/oauth';

export interface EtsyConfig {
  apiKey: string;
  clientSecret?: string;
  accessToken?: string;
}

export interface EtsyListing {
  listing_id: number;
  title: string;
  description: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  url: string;
  images?: Array<{
    url_570xN: string;
    url_fullxfull: string;
  }>;
  tags: string[];
  shop: {
    shop_id: number;
    shop_name: string;
  };
}

export interface EtsySearchParams {
  keywords?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class EtsyClient {
  private client: AxiosInstance;
  private apiKey: string;
  private accessToken?: string;

  constructor(config: EtsyConfig) {
    this.apiKey = config.apiKey;
    this.accessToken = config.accessToken;

    this.client = axios.create({
      baseURL: ETSY_API_BASE,
      headers: {
        'x-api-key': this.apiKey,
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      },
    });
  }

  /**
   * Search for wedding/prom related products
   */
  async searchListings(params: EtsySearchParams): Promise<EtsyListing[]> {
    try {
      const searchParams: Record<string, any> = {
        limit: params.limit || 25,
        offset: params.offset || 0,
      };

      if (params.keywords) {
        searchParams.keywords = params.keywords;
      }

      if (params.minPrice) {
        searchParams.min_price = params.minPrice * 100; // Etsy uses cents
      }

      if (params.maxPrice) {
        searchParams.max_price = params.maxPrice * 100;
      }

      if (params.tags && params.tags.length > 0) {
        searchParams.tags = params.tags.join(',');
      }

      const response = await this.client.get('/listings/active', {
        params: searchParams,
      });

      return response.data.results || [];
    } catch (error: any) {
      console.error('Etsy API search error:', error.response?.data || error.message);
      throw new Error(`Etsy search failed: ${error.message}`);
    }
  }

  /**
   * Get detailed listing information
   */
  async getListing(listingId: number): Promise<EtsyListing> {
    try {
      const response = await this.client.get(`/listings/${listingId}`);
      return response.data;
    } catch (error: any) {
      console.error('Etsy API get listing error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Etsy listing: ${error.message}`);
    }
  }

  /**
   * Search for wedding dresses
   */
  async searchWeddingDresses(params: {
    budget?: number;
    style?: string[];
    size?: string;
  }): Promise<EtsyListing[]> {
    const keywords = ['wedding dress', params.style?.join(' ')].filter(Boolean).join(' ');
    const tags = ['wedding', 'bridal', 'wedding dress'];

    return this.searchListings({
      keywords,
      maxPrice: params.budget,
      tags,
      limit: 50,
    });
  }

  /**
   * Search for prom dresses
   */
  async searchPromDresses(params: {
    budget?: number;
    style?: string[];
    colorScheme?: string[];
  }): Promise<EtsyListing[]> {
    const keywords = [
      'prom dress',
      params.style?.join(' '),
      params.colorScheme?.join(' ')
    ].filter(Boolean).join(' ');
    
    const tags = ['prom', 'prom dress', 'formal dress'];

    return this.searchListings({
      keywords,
      maxPrice: params.budget,
      tags,
      limit: 50,
    });
  }

  /**
   * Search for formal suits/tuxedos
   */
  async searchFormalSuits(params: {
    budget?: number;
    style?: string[];
    occasion?: 'wedding' | 'prom' | 'formal';
  }): Promise<EtsyListing[]> {
    const keywords = [
      params.occasion === 'wedding' ? 'wedding suit tuxedo' : 'formal suit',
      params.style?.join(' ')
    ].filter(Boolean).join(' ');
    
    const tags = params.occasion === 'wedding' 
      ? ['wedding', 'suit', 'tuxedo', 'groomsmen']
      : ['prom', 'formal', 'suit'];

    return this.searchListings({
      keywords,
      maxPrice: params.budget,
      tags,
      limit: 50,
    });
  }

  /**
   * Generate OAuth authorization URL for user consent
   * (For future implementation when we need write access)
   */
  static generateAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state: Math.random().toString(36).substring(7), // CSRF protection
    });

    return `${ETSY_OAUTH_BASE}/connect?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * (For future implementation)
   */
  static async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    const response = await axios.post(`${ETSY_API_BASE}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    return response.data;
  }
}

/**
 * Create Etsy client with API key from environment
 */
export function createEtsyClient(): EtsyClient | null {
  const apiKey = process.env.ETSY_API_KEY;

  if (!apiKey) {
    console.warn('ETSY_API_KEY not configured. Etsy integration disabled.');
    return null;
  }

  return new EtsyClient({
    apiKey,
    accessToken: process.env.ETSY_ACCESS_TOKEN,
  });
}
