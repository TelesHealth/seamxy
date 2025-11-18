import { RetailerProduct } from './types';

/**
 * Mock product database for demo purposes
 * In production, these would come from actual retailer APIs
 * Organized by category for easy filtering
 */

export const MOCK_PRODUCTS: Record<string, RetailerProduct[]> = {
  // BLAZERS / JACKETS
  blazers: [
    {
      externalId: 'AMZN-BLZ-001',
      retailer: 'amazon',
      title: 'Calvin Klein Modern Fit Wool Blazer',
      brand: 'Calvin Klein',
      category: 'Blazers',
      currentPrice: 149.99,
      originalPrice: 249.99,
      currency: 'USD',
      imageUrl: 'https://m.media-amazon.com/images/I/71nKx+TqP7L._AC_UX679_.jpg',
      productUrl: 'https://www.amazon.com/dp/B08WXYZ123',
      affiliateUrl: 'https://www.amazon.com/dp/B08WXYZ123?tag=seamxy-20',
      availableSizes: ['38R', '40R', '42R', '44R'],
      shippingCost: 0,
      deliveryDays: 2,
    },
    {
      externalId: 'EBAY-BLZ-002',
      retailer: 'ebay',
      title: 'Hugo Boss Slim Fit Navy Blazer',
      brand: 'Hugo Boss',
      category: 'Blazers',
      currentPrice: 279.00,
      originalPrice: 495.00,
      currency: 'USD',
      imageUrl: 'https://i.ebayimg.com/images/g/example/s-l1600.jpg',
      productUrl: 'https://www.ebay.com/itm/1234567890',
      affiliateUrl: 'https://rover.ebay.com/rover/1/711-53200-19255-0/1?mpre=https%3A%2F%2Fwww.ebay.com%2Fitm%2F1234567890',
      availableSizes: ['38R', '40R', '42R'],
      shippingCost: 9.99,
      deliveryDays: 5,
    },
  ],

  // SHIRTS
  shirts: [
    {
      externalId: 'AMZN-SHT-001',
      retailer: 'amazon',
      title: 'Brooks Brothers Non-Iron Dress Shirt',
      brand: 'Brooks Brothers',
      category: 'Dress Shirts',
      currentPrice: 79.50,
      originalPrice: 140.00,
      currency: 'USD',
      imageUrl: 'https://m.media-amazon.com/images/I/61example.jpg',
      productUrl: 'https://www.amazon.com/dp/B09ABC123',
      affiliateUrl: 'https://www.amazon.com/dp/B09ABC123?tag=seamxy-20',
      availableSizes: ['S', 'M', 'L', 'XL'],
      shippingCost: 0,
      deliveryDays: 2,
    },
    {
      externalId: 'RAKUTEN-SHT-001',
      retailer: 'rakuten',
      title: 'Uniqlo Supima Cotton Crew Neck T-Shirt',
      brand: 'Uniqlo',
      category: 'T-Shirts',
      currentPrice: 14.90,
      currency: 'USD',
      imageUrl: 'https://image.uniqlo.com/UQ/ST3/example.jpg',
      productUrl: 'https://www.rakuten.com/shop/example',
      affiliateUrl: 'https://click.linksynergy.com/fs-bin/click?id=example',
      availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      shippingCost: 5.00,
      deliveryDays: 7,
    },
  ],

  // PANTS / TROUSERS
  pants: [
    {
      externalId: 'AMZN-PNT-001',
      retailer: 'amazon',
      title: 'Haggar Premium Comfort Dress Pants',
      brand: 'Haggar',
      category: 'Dress Pants',
      currentPrice: 42.99,
      originalPrice: 89.99,
      currency: 'USD',
      imageUrl: 'https://m.media-amazon.com/images/I/71example.jpg',
      productUrl: 'https://www.amazon.com/dp/B08DEF456',
      affiliateUrl: 'https://www.amazon.com/dp/B08DEF456?tag=seamxy-20',
      availableSizes: ['30x30', '32x30', '32x32', '34x32', '36x32'],
      shippingCost: 0,
      deliveryDays: 2,
    },
    {
      externalId: 'EBAY-PNT-002',
      retailer: 'ebay',
      title: 'Levi\'s 511 Slim Fit Jeans - Dark Wash',
      brand: 'Levi\'s',
      category: 'Jeans',
      currentPrice: 49.99,
      originalPrice: 69.50,
      currency: 'USD',
      imageUrl: 'https://i.ebayimg.com/images/g/pants/s-l1600.jpg',
      productUrl: 'https://www.ebay.com/itm/9876543210',
      affiliateUrl: 'https://rover.ebay.com/rover/1/711-53200-19255-0/1?mpre=https%3A%2F%2Fwww.ebay.com%2Fitm%2F9876543210',
      availableSizes: ['28x30', '30x30', '32x32', '34x32', '36x34'],
      shippingCost: 0,
      deliveryDays: 3,
    },
  ],

  // SHOES
  shoes: [
    {
      externalId: 'AMZN-SHOE-001',
      retailer: 'amazon',
      title: 'Cole Haan Grand Wingtip Oxford',
      brand: 'Cole Haan',
      category: 'Dress Shoes',
      currentPrice: 129.95,
      originalPrice: 230.00,
      currency: 'USD',
      imageUrl: 'https://m.media-amazon.com/images/I/81shoes.jpg',
      productUrl: 'https://www.amazon.com/dp/B07GHI789',
      affiliateUrl: 'https://www.amazon.com/dp/B07GHI789?tag=seamxy-20',
      availableSizes: ['8', '8.5', '9', '9.5', '10', '10.5', '11'],
      shippingCost: 0,
      deliveryDays: 2,
    },
  ],

  // DRESSES
  dresses: [
    {
      externalId: 'AMZN-DRS-001',
      retailer: 'amazon',
      title: 'Calvin Klein Sleeveless Sheath Dress',
      brand: 'Calvin Klein',
      category: 'Dresses',
      currentPrice: 89.60,
      originalPrice: 134.00,
      currency: 'USD',
      imageUrl: 'https://m.media-amazon.com/images/I/dress-example.jpg',
      productUrl: 'https://www.amazon.com/dp/B09DRESS01',
      affiliateUrl: 'https://www.amazon.com/dp/B09DRESS01?tag=seamxy-20',
      availableSizes: ['2', '4', '6', '8', '10', '12'],
      shippingCost: 0,
      deliveryDays: 2,
    },
    {
      externalId: 'EBAY-DRS-002',
      retailer: 'ebay',
      title: 'Adrianna Papell Beaded Gown - Navy',
      brand: 'Adrianna Papell',
      category: 'Evening Gowns',
      currentPrice: 189.99,
      originalPrice: 320.00,
      currency: 'USD',
      imageUrl: 'https://i.ebayimg.com/images/g/gown/s-l1600.jpg',
      productUrl: 'https://www.ebay.com/itm/GOWN12345',
      affiliateUrl: 'https://rover.ebay.com/rover/1/711-53200-19255-0/1?mpre=https%3A%2F%2Fwww.ebay.com%2Fitm%2FGOWN12345',
      availableSizes: ['4', '6', '8', '10', '12', '14'],
      shippingCost: 12.99,
      deliveryDays: 5,
    },
  ],

  // ACCESSORIES
  accessories: [
    {
      externalId: 'AMZN-ACC-001',
      retailer: 'amazon',
      title: 'Silk Tie - Classic Burgundy',
      brand: 'Tommy Hilfiger',
      category: 'Ties',
      currentPrice: 29.99,
      originalPrice: 65.00,
      currency: 'USD',
      imageUrl: 'https://m.media-amazon.com/images/I/tie-example.jpg',
      productUrl: 'https://www.amazon.com/dp/B08TIE123',
      affiliateUrl: 'https://www.amazon.com/dp/B08TIE123?tag=seamxy-20',
      shippingCost: 0,
      deliveryDays: 2,
    },
  ],
};

/**
 * Search mock products by query and filters
 */
export function searchMockProducts(params: {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}): RetailerProduct[] {
  const { query, category, minPrice = 0, maxPrice = 10000, limit = 10 } = params;
  
  const queryLower = query.toLowerCase();
  let allProducts: RetailerProduct[] = [];

  // Collect all products from all categories
  for (const products of Object.values(MOCK_PRODUCTS)) {
    allProducts = allProducts.concat(products);
  }

  // Filter by search query
  let results = allProducts.filter(product => {
    const matchesQuery = 
      product.title.toLowerCase().includes(queryLower) ||
      product.brand?.toLowerCase().includes(queryLower) ||
      product.category?.toLowerCase().includes(queryLower);
    
    const matchesCategory = !category || product.category?.toLowerCase().includes(category.toLowerCase());
    const matchesPrice = product.currentPrice >= minPrice && product.currentPrice <= maxPrice;

    return matchesQuery && matchesCategory && matchesPrice;
  });

  // Sort by relevance (price within budget gets priority)
  results.sort((a, b) => {
    const aMidPrice = (minPrice + maxPrice) / 2;
    const bMidPrice = (minPrice + maxPrice) / 2;
    const aDiff = Math.abs(a.currentPrice - aMidPrice);
    const bDiff = Math.abs(b.currentPrice - bMidPrice);
    return aDiff - bDiff;
  });

  return results.slice(0, limit);
}

/**
 * Get mock product by ID
 */
export function getMockProductById(externalId: string): RetailerProduct | null {
  for (const products of Object.values(MOCK_PRODUCTS)) {
    const found = products.find(p => p.externalId === externalId);
    if (found) return found;
  }
  return null;
}
