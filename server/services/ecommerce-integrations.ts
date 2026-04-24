/**
 * E-Commerce Platform Integration Service
 * Handles OAuth flows, catalog sync, and webhooks for Shopify, WooCommerce, BigCommerce, Amazon
 */

import { storage } from '../storage';
import { encrypt, decrypt } from './encryption';

// ============================================
// TYPES
// ============================================

export interface ProductSyncData {
  externalId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  inventory?: number;
  sku?: string;
  category?: string;
  sizeChart?: Record<string, any>;
}

export interface OrderWebhookData {
  externalOrderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  shippingAddress?: Record<string, any>;
}

// ============================================
// SHOPIFY INTEGRATION
// ============================================

export class ShopifyIntegration {
  private apiVersion = '2024-01';

  async exchangeCodeForToken(shop: string, code: string, clientId: string, clientSecret: string): Promise<string> {
    const url = `https://${shop}/admin/oauth/access_token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    if (!response.ok) {
      throw new Error(`Shopify OAuth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async syncProducts(shop: string, accessToken: string): Promise<ProductSyncData[]> {
    const url = `https://${shop}/admin/api/${this.apiVersion}/products.json`;
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify product fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.products.map((product: any) => ({
      externalId: product.id.toString(),
      name: product.title,
      description: product.body_html,
      price: parseFloat(product.variants[0]?.price || '0'),
      imageUrl: product.images[0]?.src,
      inventory: product.variants[0]?.inventory_quantity,
      sku: product.variants[0]?.sku,
      category: product.product_type
    }));
  }

  async registerWebhook(shop: string, accessToken: string, topic: string, address: string): Promise<void> {
    const url = `https://${shop}/admin/api/${this.apiVersion}/webhooks.json`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address,
          format: 'json'
        }
      })
    });
  }
}

// ============================================
// WOOCOMMERCE INTEGRATION
// ============================================

export class WooCommerceIntegration {
  async syncProducts(storeUrl: string, consumerKey: string, consumerSecret: string): Promise<ProductSyncData[]> {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const url = `${storeUrl}/wp-json/wc/v3/products`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce product fetch failed: ${response.statusText}`);
    }

    const products = await response.json();
    
    return products.map((product: any) => ({
      externalId: product.id.toString(),
      name: product.name,
      description: product.description,
      price: parseFloat(product.price || '0'),
      imageUrl: product.images[0]?.src,
      inventory: product.stock_quantity,
      sku: product.sku,
      category: product.categories[0]?.name
    }));
  }

  async registerWebhook(storeUrl: string, consumerKey: string, consumerSecret: string, topic: string, deliveryUrl: string): Promise<void> {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const url = `${storeUrl}/wp-json/wc/v3/webhooks`;
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `SeamXY - ${topic}`,
        topic,
        delivery_url: deliveryUrl,
        status: 'active'
      })
    });
  }
}

// ============================================
// BIGCOMMERCE INTEGRATION
// ============================================

export class BigCommerceIntegration {
  async exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<{ accessToken: string; storeHash: string }> {
    const url = 'https://login.bigcommerce.com/oauth2/token';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error(`BigCommerce OAuth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      storeHash: data.context.split('/')[1]
    };
  }

  async syncProducts(storeHash: string, accessToken: string): Promise<ProductSyncData[]> {
    const url = `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products`;
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`BigCommerce product fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.data.map((product: any) => ({
      externalId: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.images?.[0]?.url_standard,
      inventory: product.inventory_level,
      sku: product.sku,
      category: product.categories?.[0]
    }));
  }
}

// ============================================
// AMAZON SELLER INTEGRATION
// ============================================

export class AmazonSellerIntegration {
  // Amazon SP-API requires complex signing - simplified for MVP
  // In production, use Amazon SP-API SDK: amazon-sp-api

  async syncProducts(sellerId: string, accessToken: string, refreshToken: string, region: string): Promise<ProductSyncData[]> {
    // PLACEHOLDER - NOT IMPLEMENTED
    // Actual Amazon SP-API integration requires:
    // 1. Install amazon-sp-api package: npm install amazon-sp-api
    // 2. LWA (Login with Amazon) OAuth implementation
    // 3. AWS Signature Version 4 request signing
    // 4. SP-API endpoint calls with proper credentials
    // 
    // For MVP: Use manual CSV upload or defer Amazon integration to Phase 2
    
    throw new Error('Amazon SP-API integration not yet implemented. Use Shopify, WooCommerce, or BigCommerce instead.');
  }

  getAuthUrl(clientId: string, redirectUri: string): string {
    const baseUrl = 'https://sellercentral.amazon.com/apps/authorize/consent';
    const params = new URLSearchParams({
      application_id: clientId,
      redirect_uri: redirectUri,
      state: crypto.randomUUID(),
      version: 'beta'
    });
    return `${baseUrl}?${params.toString()}`;
  }
}

// ============================================
// INTEGRATION MANAGER
// ============================================

export class ECommerceIntegrationManager {
  private shopify = new ShopifyIntegration();
  private woocommerce = new WooCommerceIntegration();
  private bigcommerce = new BigCommerceIntegration();
  private amazon = new AmazonSellerIntegration();

  async connectPlatform(
    supplierId: string,
    platform: 'shopify' | 'woocommerce' | 'bigcommerce' | 'amazon',
    credentials: Record<string, any>
  ): Promise<void> {
    let accessToken = '';
    let refreshToken = '';
    let storeInfo: Record<string, any> = {};

    switch (platform) {
      case 'shopify':
        accessToken = await this.shopify.exchangeCodeForToken(
          credentials.shop,
          credentials.code,
          credentials.clientId,
          credentials.clientSecret
        );
        storeInfo = { shopDomain: credentials.shop };
        break;

      case 'woocommerce':
        // WooCommerce uses consumer key/secret directly
        accessToken = credentials.consumerKey;
        refreshToken = credentials.consumerSecret;
        storeInfo = { storeUrl: credentials.storeUrl };
        break;

      case 'bigcommerce':
        const bcTokens = await this.bigcommerce.exchangeCodeForToken(
          credentials.code,
          credentials.clientId,
          credentials.clientSecret,
          credentials.redirectUri
        );
        accessToken = bcTokens.accessToken;
        storeInfo = { storeHash: bcTokens.storeHash };
        break;

      case 'amazon':
        // Amazon requires LWA OAuth - simplified for MVP
        accessToken = credentials.accessToken;
        refreshToken = credentials.refreshToken;
        storeInfo = { sellerId: credentials.sellerId, region: credentials.region };
        break;
    }

    // Store encrypted tokens
    await storage.createIntegrationToken({
      supplierId,
      platform,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : null,
      shopDomain: storeInfo.shopDomain,
      storeUrl: storeInfo.storeUrl,
      isActive: true
    });
  }

  async syncCatalog(supplierId: string, platform: string): Promise<ProductSyncData[]> {
    const token = await storage.getIntegrationTokenByPlatform(supplierId, platform);
    if (!token || !token.isActive) {
      throw new Error('Integration not found or inactive');
    }

    const accessToken = decrypt(token.accessToken);
    let products: ProductSyncData[] = [];

    switch (platform) {
      case 'shopify':
        if (!token.shopDomain) throw new Error('Shop domain not configured');
        products = await this.shopify.syncProducts(token.shopDomain, accessToken);
        break;

      case 'woocommerce':
        if (!token.storeUrl) throw new Error('Store URL not configured');
        const consumerSecret = token.refreshToken ? decrypt(token.refreshToken) : '';
        products = await this.woocommerce.syncProducts(token.storeUrl, accessToken, consumerSecret);
        break;

      case 'bigcommerce':
        if (!token.storeUrl) throw new Error('Store hash not configured');
        products = await this.bigcommerce.syncProducts(token.storeUrl, accessToken);
        break;

      case 'amazon':
        // Amazon SP-API not yet implemented
        throw new Error('Amazon integration not available. Please use Shopify, WooCommerce, or BigCommerce.');
        break;
    }

    // Store products in retailer_products table
    for (const product of products) {
      await storage.createRetailerProduct({
        supplierId,
        productId: null, // Will be linked after AI fit matching
        externalId: product.externalId,
        channelSource: platform,
        lastSyncAt: new Date()
      } as any);
    }

    return products;
  }

  async setupWebhooks(supplierId: string, platform: string, baseUrl: string): Promise<void> {
    const token = await storage.getIntegrationTokenByPlatform(supplierId, platform);
    if (!token || !token.isActive) {
      throw new Error('Integration not found or inactive');
    }

    const accessToken = decrypt(token.accessToken);
    const webhookUrl = `${baseUrl}/api/v1/webhooks/${platform}/${supplierId}`;

    switch (platform) {
      case 'shopify':
        if (!token.shopDomain) throw new Error('Shop domain not configured');
        await this.shopify.registerWebhook(token.shopDomain, accessToken, 'orders/create', webhookUrl);
        await this.shopify.registerWebhook(token.shopDomain, accessToken, 'products/update', webhookUrl);
        break;

      case 'woocommerce':
        if (!token.storeUrl) throw new Error('Store URL not configured');
        const consumerSecret = token.refreshToken ? decrypt(token.refreshToken) : '';
        await this.woocommerce.registerWebhook(
          token.storeUrl,
          accessToken,
          consumerSecret,
          'order.created',
          webhookUrl
        );
        break;

      // BigCommerce and Amazon webhook setup similar
    }
  }
}

export const ecommerceIntegrations = new ECommerceIntegrationManager();
