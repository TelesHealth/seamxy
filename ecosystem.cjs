module.exports = {
  apps: [
    {
      name: 'seamxy-production',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--experimental-specifier-resolution=node',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        
        // ========================================
        // REQUIRED: PostgreSQL Database Configuration
        // ========================================
        DATABASE_URL: 'postgresql://username:password@host:port/database',
        PGHOST: 'your-db-host.com',
        PGPORT: 5432,
        PGUSER: 'your-db-user',
        PGPASSWORD: 'your-db-password',
        PGDATABASE: 'seamxy_production',
        
        // ========================================
        // REQUIRED: Security & Encryption
        // ========================================
        // Generate session secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
        SESSION_SECRET: 'your-128-char-session-secret-here',
        
        // Generate encryption key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        INTEGRATION_TOKEN_KEY: 'your-64-char-encryption-key-here',
        
        // ========================================
        // REQUIRED: AI Services
        // ========================================
        // For external deployment (VPS, AWS, etc), use direct OpenAI:
        OPENAI_API_KEY: 'sk-proj-your-openai-api-key-here',
        
        // For Replit deployment, use Replit AI Integrations instead:
        // (Replit AI Integrations only work on Replit platform)
        // AI_INTEGRATIONS_OPENAI_BASE_URL: 'your-replit-ai-base-url',
        // AI_INTEGRATIONS_OPENAI_API_KEY: 'your-replit-ai-api-key',
        
        // ========================================
        // OPTIONAL: Retailer APIs (Price Comparison Feature)
        // Leave blank to disable specific retailers
        // ========================================
        // Amazon Product Advertising API
        // Get credentials: https://affiliate-program.amazon.com/
        // AMAZON_PARTNER_TAG: 'your-amazon-associate-tag',
        // AMAZON_ACCESS_KEY: 'your-amazon-access-key',
        // AMAZON_SECRET_KEY: 'your-amazon-secret-key',
        
        // eBay Browse API
        // Get credentials: https://developer.ebay.com/
        // EBAY_CLIENT_ID: 'your-ebay-client-id',
        // EBAY_CLIENT_SECRET: 'your-ebay-client-secret',
        // EBAY_PARTNER_NETWORK_ID: 'your-ebay-partner-network-id',
        
        // Rakuten Advertising API
        // Get credentials: https://rakutenadvertising.com/
        // RAKUTEN_API_KEY: 'your-rakuten-api-key',
        // RAKUTEN_AFFILIATE_ID: 'your-rakuten-affiliate-id',
        
        // ========================================
        // OPTIONAL: E-commerce Platform OAuth (Supplier Portal)
        // Only needed if suppliers will connect their stores
        // ========================================
        // Shopify
        // Get credentials: https://partners.shopify.com/
        // SHOPIFY_CLIENT_ID: 'your-shopify-client-id',
        // SHOPIFY_CLIENT_SECRET: 'your-shopify-client-secret',
        
        // WooCommerce (uses consumer key/secret per store)
        // Set up in WooCommerce store settings
        // WOOCOMMERCE_CONSUMER_KEY: 'ck_...',
        // WOOCOMMERCE_CONSUMER_SECRET: 'cs_...',
        
        // BigCommerce
        // Get credentials: https://developer.bigcommerce.com/
        // BIGCOMMERCE_CLIENT_ID: 'your-bigcommerce-client-id',
        // BIGCOMMERCE_CLIENT_SECRET: 'your-bigcommerce-client-secret',
      },
    },
  ],
};
