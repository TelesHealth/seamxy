// Common types for all retailer integrations

export interface RetailerProduct {
  externalId: string;
  retailer: 'amazon' | 'ebay' | 'rakuten';
  title: string;
  brand?: string;
  category?: string;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  imageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  availableSizes?: string[];
  shippingCost?: number;
  deliveryDays?: number;
  isSustainable?: boolean;
  sustainabilityCertifications?: string[];
  attributes?: Record<string, any>; // Raw product attributes for AI matching
}

export interface SearchCriteria {
  query: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  gender?: 'men' | 'women' | 'unisex' | 'children';
  limit?: number;
}

export interface RetailerClient {
  name: string;
  search(criteria: SearchCriteria): Promise<RetailerProduct[]>;
  getProduct(externalId: string): Promise<RetailerProduct | null>;
  isAvailable(): boolean;
}

export interface RetailerConfig {
  retailer: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  partnerTag?: string;
  isActive: boolean;
  rateLimit: number; // requests per hour
}
