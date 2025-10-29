module.exports = {
  apps: [
    {
      name: 'seamxy-production',
      script: './dist/index.js',
      args: 'server/index.ts',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        
        // ========================================
        // REQUIRED: PostgreSQL Database Configuration
        // ========================================
        DATABASE_URL: 'postgresql://postgres:Pgowkt18reuPkCr@localhost:5432/seamxydb',
        PGHOST: 'localhost',
        PGPORT: 5432,
        PGUSER: 'postgres',
        PGPASSWORD: 'Pgowkt18reuPkCr',
        PGDATABASE: 'seamxydb',
        
        // ========================================
        // REQUIRED: Security & Encryption
        // ========================================
        // Generate session secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
        SESSION_SECRET: '25315739474162f8a837dfb19088c4f889ca9d135772900d543376baf7e5c211d45785d54034c49058b960cd8517cc996c7e02d07a069bb83e019c402858e979',
        
        // Generate encryption key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        INTEGRATION_TOKEN_KEY: 'e53d85ce9a37f61021bd1c3ebd7c8d9f9eb6b3aad9182cf71b0b37e65d7e8889',
        
        // ========================================
        // REQUIRED: AI Services
        // ========================================
        // For external deployment (VPS, AWS, etc), use direct OpenAI:
        OPENAI_API_KEY: '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',
        
        // For Replit deployment, use Replit AI Integrations instead:
        // (Replit AI Integrations only work on Replit platform)
        // AI_INTEGRATIONS_OPENAI_BASE_URL: 'your-replit-ai-base-url',
        // AI_INTEGRATIONS_OPENAI_API_KEY: 'your-replit-ai-api-key',
        
        // ========================================
        // OPTIONAL: Retailer APIs (Price Comparison Feature)
        // Leave blank to disable specific retailers
        // ========================================
        // Amazon Product Advertising API
        // AMAZON_PARTNER_TAG: 'your-amazon-associate-tag',
        // AMAZON_ACCESS_KEY: 'your-amazon-access-key',
        // AMAZON_SECRET_KEY: 'your-amazon-secret-key',
        
        // eBay Browse API
        // EBAY_CLIENT_ID: 'your-ebay-client-id',
        // EBAY_CLIENT_SECRET: 'your-ebay-client-secret',
        // EBAY_PARTNER_NETWORK_ID: 'your-ebay-partner-network-id',
        
        // Rakuten Advertising API
        // RAKUTEN_API_KEY: 'your-rakuten-api-key',
        // RAKUTEN_AFFILIATE_ID: 'your-rakuten-affiliate-id',
        
        // ========================================
        // OPTIONAL: E-commerce Platform OAuth (Supplier Portal)
        // Only needed if suppliers will connect their stores
        // ========================================
        // Shopify
        // SHOPIFY_CLIENT_ID: 'your-shopify-client-id',
        // SHOPIFY_CLIENT_SECRET: 'your-shopify-client-secret',
        
        // WooCommerce (uses consumer key/secret per store)
        // WOOCOMMERCE_CONSUMER_KEY: 'ck_...',
        // WOOCOMMERCE_CONSUMER_SECRET: 'cs_...',
        
        // BigCommerce
        // BIGCOMMERCE_CLIENT_ID: 'your-bigcommerce-client-id',
        // BIGCOMMERCE_CLIENT_SECRET: 'your-bigcommerce-client-secret',
      },
    },
  ],
};

