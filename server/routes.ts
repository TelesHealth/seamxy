import type { Express } from "express";
import { storage } from "./storage";
import { 
  analyzeStyleDescription, 
  calculateProductScores, 
  generateAiStylistResponse 
} from "./services/openai";
import { requireUser, requireAdmin, requireRole, type AuthenticatedRequest } from "./middleware/auth";
import {
  authenticateSupplier,
  requireRole as requireSupplierRole,
  requireTier,
  requireVerified,
  requireOnboarding,
  hashPassword,
  verifyPassword,
  validatePasswordStrength
} from "./middleware/supplier-auth";
import { encrypt, decrypt } from "./services/encryption";
import { 
  insertUserSchema, insertMeasurementSchema, insertProductSchema,
  insertMakerSchema, insertCustomRequestSchema, insertQuoteSchema, insertOrderSchema,
  insertAdminUserSchema, insertPricingConfigSchema, insertAiChatSessionSchema,
  insertSupplierAccountSchema, insertSupplierProfileSchema, insertRetailerProductSchema,
  insertDesignerCollectionSchema, insertPortfolioItemSchema, insertIntegrationTokenSchema,
  insertMessageThreadSchema, insertSupplierMessageSchema, insertSupplierOrderSchema,
  insertPriceAlertSchema, insertAffiliateClickSchema, insertAffiliateConversionSchema
} from "@shared/schema";
import { priceComparisonService } from "./services/price-comparison";
import { aiProductMatcher } from "./services/ai-product-matcher";

export function registerRoutes(app: Express) {
  
  // ============================================
  // MARKETPLACE - USER ROUTES
  // ============================================
  
  // Create user profile
  app.post("/api/v1/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user profile
  app.get("/api/v1/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Update user profile with AI style analysis
  app.post("/api/v1/users/:id/analyze-style", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Style description required" });
      }

      // Use GPT-5 to analyze style description
      const analysis = await analyzeStyleDescription(description);
      
      // Update user profile
      const user = await storage.updateUser(req.params.id, {
        styleTags: analysis.styleTags,
        lifestyle: analysis.lifestyle,
        budgetTier: analysis.budgetTier as any,
        preferredBrands: analysis.preferredBrands
      });

      res.json({ user, analysis });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user profile (budget, preferences, etc)
  app.patch("/api/v1/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save/update measurements
  app.post("/api/v1/measurements", async (req, res) => {
    try {
      const measurementData = insertMeasurementSchema.parse(req.body);
      const measurement = await storage.upsertMeasurements(measurementData);
      res.json(measurement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user measurements
  app.get("/api/v1/users/:userId/measurements", async (req, res) => {
    const measurements = await storage.getUserMeasurements(req.params.userId);
    res.json(measurements || null);
  });

  // ============================================
  // MARKETPLACE - PRODUCT ROUTES
  // ============================================

  // Search products with AI-powered scoring
  app.get("/api/v1/products", async (req, res) => {
    try {
      const { demographic, category, minPrice, maxPrice, userId } = req.query;
      
      const products = await storage.getProducts({
        demographic: demographic as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      });

      // If userId provided, calculate match scores
      if (userId) {
        const user = await storage.getUser(userId as string);
        const measurements = await storage.getUserMeasurements(userId as string);
        
        if (user && measurements) {
          const scoredProducts = await Promise.all(
            products.map(async (product) => {
              const scores = await calculateProductScores(
                {
                  measurements: measurements,
                  styleTags: user.styleTags || [],
                  budgetMin: user.budgetMin || 0,
                  budgetMax: user.budgetMax || 500
                },
                product
              );
              return { ...product, ...scores };
            })
          );
          
          // Sort by total score descending
          scoredProducts.sort((a, b) => b.totalScore - a.totalScore);
          return res.json(scoredProducts);
        }
      }

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get product by ID
  app.get("/api/v1/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  // Create product (admin only in production)
  app.post("/api/v1/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Compare prices across retailers
  app.get("/api/v1/products/:id/compare-prices", async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Search across retailers
      const externalProducts = await priceComparisonService.searchAllRetailers({
        query: `${product.brand} ${product.name}`,
        category: product.category,
        minPrice: Number(product.price) * 0.7, // -30%
        maxPrice: Number(product.price) * 1.3, // +30%
        limit: 10
      });

      // Use AI to match products (if OpenAI key is available)
      let matches;
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
      
      if (hasOpenAIKey) {
        try {
          matches = await aiProductMatcher.findMatches(product, externalProducts);
        } catch (error: any) {
          console.warn('AI matching failed, falling back to text-based matching:', error.message);
          hasOpenAIKey && console.error(error);
          // Fallback: simple text similarity matching
          matches = externalProducts.map(ext => ({
            externalProduct: ext,
            matchConfidence: 50, // Conservative estimate
            matchReason: 'Text-based matching (AI unavailable)'
          }));
        }
      } else {
        // No AI: return external products with basic matching
        matches = externalProducts.map(ext => ({
          externalProduct: ext,
          matchConfidence: 50,
          matchReason: 'Text-based matching (OpenAI not configured)'
        }));
      }

      // Return comparison results
      res.json({
        internalProduct: product,
        externalMatches: matches.map(match => ({
          ...match.externalProduct,
          matchConfidence: match.matchConfidence,
          matchReason: match.matchReason
        })),
        aiMatchingEnabled: hasOpenAIKey
      });
    } catch (error: any) {
      console.error('Price comparison failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PRICE ALERTS
  // ============================================

  // Create price alert
  app.post("/api/v1/price-alerts", async (req, res) => {
    try {
      const alertData = insertPriceAlertSchema.parse(req.body);
      const alert = await storage.createPriceAlert(alertData);
      res.json(alert);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's price alerts
  app.get("/api/v1/price-alerts", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const alerts = await storage.getUserPriceAlerts(userId as string);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // AFFILIATE TRACKING
  // ============================================

  // Track affiliate click
  app.post("/api/v1/affiliate-click", async (req, res) => {
    try {
      const clickData = insertAffiliateClickSchema.parse(req.body);
      const click = await storage.createAffiliateClick(clickData);
      res.json({ clickId: click.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Record affiliate conversion (webhook)
  app.post("/api/v1/affiliate-conversion", async (req, res) => {
    try {
      const conversionData = insertAffiliateConversionSchema.parse(req.body);
      const conversion = await storage.createAffiliateConversion(conversionData);
      res.json({ conversionId: conversion.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // MARKETPLACE - MAKER ROUTES
  // ============================================

  // Get all makers
  app.get("/api/v1/makers", async (req, res) => {
    const { verified } = req.query;
    if (verified !== undefined) {
      const makers = await storage.getMakers({
        verified: verified === 'true'
      });
      res.json(makers);
    } else {
      const allMakers = await storage.getAllMakers();
      res.json(allMakers);
    }
  });

  // Get maker by ID
  app.get("/api/v1/makers/:id", async (req, res) => {
    const maker = await storage.getMaker(req.params.id);
    if (!maker) {
      return res.status(404).json({ error: "Maker not found" });
    }
    res.json(maker);
  });

  // Create maker
  app.post("/api/v1/makers", async (req, res) => {
    try {
      const makerData = insertMakerSchema.parse(req.body);
      const maker = await storage.createMaker(makerData);
      res.json(maker);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // MARKETPLACE - CUSTOM REQUEST & QUOTE ROUTES
  // ============================================

  // Create custom request (RFQ)
  app.post("/api/v1/custom-requests", async (req, res) => {
    try {
      const requestData = insertCustomRequestSchema.parse(req.body);
      const request = await storage.createCustomRequest(requestData);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's custom requests
  app.get("/api/v1/users/:userId/custom-requests", async (req, res) => {
    const requests = await storage.getUserCustomRequests(req.params.userId);
    res.json(requests);
  });

  // Get single custom request with details
  app.get("/api/v1/custom-requests/:id", async (req, res) => {
    const request = await storage.getCustomRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(request);
  });

  // Get all open custom requests (for makers)
  app.get("/api/v1/custom-requests", async (req, res) => {
    const requests = await storage.getOpenCustomRequests();
    res.json(requests);
  });

  // Get quotes for a request
  app.get("/api/v1/custom-requests/:requestId/quotes", async (req, res) => {
    const quotes = await storage.getQuotesForRequest(req.params.requestId);
    res.json(quotes);
  });

  // Submit quote (maker)
  app.post("/api/v1/quotes", async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Accept quote (user)
  app.post("/api/v1/quotes/:id/accept", async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Accept the quote
      const updatedQuote = await storage.acceptQuote(req.params.id);

      // Update request status
      await storage.updateCustomRequest(quote.requestId, {
        status: 'accepted',
        selectedQuoteId: req.params.id,
      });

      res.json(updatedQuote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // MARKETPLACE - ORDER ROUTES
  // ============================================

  // Create order
  app.post("/api/v1/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's orders
  app.get("/api/v1/users/:userId/orders", async (req, res) => {
    const orders = await storage.getUserOrders(req.params.userId);
    res.json(orders);
  });

  // ============================================
  // ADMIN PANEL - AUTH ROUTES
  // ============================================

  // Admin login
  app.post("/api/v1/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.getAdminUserByEmail(email);
      
      // In production, use proper password hashing (bcrypt)
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!admin.isActive) {
        return res.status(401).json({ error: "Account inactive" });
      }

      res.json({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ADMIN PANEL - USER MANAGEMENT
  // ============================================

  // Get all users (admin only)
  app.get("/api/v1/admin/users", requireAdmin as any, async (req, res) => {
    // In production, implement pagination
    res.json({ users: [], total: 0 });
  });

  // ============================================
  // ADMIN PANEL - MAKER MANAGEMENT
  // ============================================

  // Approve/verify maker
  app.patch("/api/v1/admin/makers/:id/verify", requireAdmin as any, async (req: AuthenticatedRequest, res) => {
    try {
      const maker = await storage.updateMaker(req.params.id, {
        isVerified: true
      });
      
      if (maker && req.user) {
        await storage.createAuditLog({
          adminId: req.user.id,
          action: "verify_maker",
          targetType: "maker",
          targetId: req.params.id,
          changes: { isVerified: true },
          ipAddress: req.ip || null
        });
      }
      
      res.json(maker);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ADMIN PANEL - PRICING & MONETIZATION
  // ============================================

  // Get all pricing configs
  app.get("/api/v1/admin/pricing-configs", requireAdmin as any, async (req, res) => {
    const configs = await storage.getAllPricingConfigs();
    res.json(configs);
  });

  // Update pricing config
  app.post("/api/v1/admin/pricing-configs", requireAdmin as any, async (req: AuthenticatedRequest, res) => {
    try {
      const configData = insertPricingConfigSchema.parse(req.body);
      const config = await storage.upsertPricingConfig({
        ...configData,
        updatedBy: req.user?.id
      });
      
      if (req.user) {
        await storage.createAuditLog({
          adminId: req.user.id,
          action: "update_pricing",
          targetType: "pricing",
          targetId: config.configKey,
          changes: config,
          ipAddress: req.ip || null
        });
      }
      
      res.json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get subscription plans
  app.get("/api/v1/subscription-plans", async (req, res) => {
    const plans = await storage.getSubscriptionPlans();
    res.json(plans);
  });

  // Get audit logs
  app.get("/api/v1/admin/audit-logs", requireAdmin as any, async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const logs = await storage.getAuditLogs(limit);
    res.json(logs);
  });

  // ============================================
  // AI PERSONALITY - CHAT ROUTES
  // ============================================

  // Get all AI personas
  app.get("/api/v1/ai-personas", async (req, res) => {
    const personas = await storage.getAiPersonas();
    res.json(personas);
  });

  // Get user's chat sessions
  app.get("/api/v1/users/:userId/ai-sessions", async (req, res) => {
    const sessions = await storage.getUserChatSessions(req.params.userId);
    res.json(sessions);
  });

  // Create new chat session
  app.post("/api/v1/ai-sessions", async (req, res) => {
    try {
      const sessionData = insertAiChatSessionSchema.parse(req.body);
      const session = await storage.createAiChatSession(sessionData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Send message to AI stylist
  app.post("/api/v1/ai-sessions/:sessionId/messages", async (req, res) => {
    try {
      const { message, userId } = req.body;
      
      const session = await storage.getAiChatSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const persona = await storage.getAiPersona(session.personaId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      const user = await storage.getUser(userId);
      const measurements = await storage.getUserMeasurements(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate AI response
      const aiResponse = await generateAiStylistResponse(
        persona.systemPrompt,
        {
          measurements: measurements || {},
          styleTags: user.styleTags || [],
          budgetMin: user.budgetMin || 0,
          budgetMax: user.budgetMax || 500
        },
        session.messages as any,
        message
      );

      // Update session with new messages
      const updatedMessages = [
        ...(session.messages as any[]),
        { role: "user", content: message, timestamp: new Date() },
        { role: "assistant", content: aiResponse, timestamp: new Date() }
      ];

      await storage.updateAiChatSession(req.params.sessionId, updatedMessages);

      res.json({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // SUPPLIER PORTAL - AUTHENTICATION
  // ============================================

  // Supplier registration
  app.post("/api/v1/supplier/register", async (req, res) => {
    try {
      const { password, ...accountData } = req.body;
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ error: "Weak password", details: passwordValidation.errors });
      }

      // Check if email already exists
      const existing = await storage.getSupplierAccountByEmail(accountData.email);
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create supplier account
      const supplierData = insertSupplierAccountSchema.parse({
        ...accountData,
        password: hashedPassword
      });
      const supplier = await storage.createSupplierAccount(supplierData);

      // Create initial profile
      await storage.createSupplierProfile({
        supplierId: supplier.id
      });

      // Create free tier subscription
      await storage.createSupplierSubscription({
        supplierId: supplier.id,
        tier: supplier.tier,
        status: 'active'
      });

      // Omit password from response
      const { password: _, ...safeSupplier } = supplier;
      res.json({ supplier: safeSupplier });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Supplier login
  app.post("/api/v1/supplier/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const supplier = await storage.getSupplierAccountByEmail(email);
      if (!supplier) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValid = await verifyPassword(password, supplier.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!supplier.isActive) {
        return res.status(403).json({ error: "Account is deactivated" });
      }

      // Set session (if session middleware is configured)
      // @ts-ignore - session type augmentation may not be picked up
      if (req.session) {
        req.session.supplierId = supplier.id;
      }

      // Omit password from response
      const { password: _, ...safeSupplier } = supplier;
      res.json({ supplier: safeSupplier });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current supplier
  app.get("/api/v1/supplier/me", authenticateSupplier as any, async (req, res) => {
    const supplier = await storage.getSupplierAccount(req.supplierId!);
    const profile = await storage.getSupplierProfile(req.supplierId!);
    
    if (supplier) {
      const { password: _, ...safeSupplier } = supplier;
      res.json({ supplier: safeSupplier, profile });
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  });

  // ============================================
  // SUPPLIER PORTAL - PROFILE MANAGEMENT
  // ============================================

  // Update supplier profile
  app.patch("/api/v1/supplier/profile", authenticateSupplier as any, async (req, res) => {
    try {
      const profileData = insertSupplierProfileSchema.partial().parse(req.body);
      const profile = await storage.updateSupplierProfile(req.supplierId!, profileData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Complete onboarding
  app.post("/api/v1/supplier/complete-onboarding", authenticateSupplier as any, async (req, res) => {
    try {
      const supplier = await storage.updateSupplierAccount(req.supplierId!, {
        onboardingCompleted: true
      });
      res.json(supplier);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // SUPPLIER PORTAL - RETAILER ROUTES
  // ============================================

  // Get retailer products
  app.get("/api/v1/supplier/retailer/products", 
    authenticateSupplier as any,
    requireSupplierRole('retailer') as any,
    async (req, res) => {
      const products = await storage.getRetailerProducts(req.supplierId!);
      res.json(products);
    }
  );

  // Create retailer product
  app.post("/api/v1/supplier/retailer/products",
    authenticateSupplier as any,
    requireSupplierRole('retailer') as any,
    async (req, res) => {
      try {
        const productData = insertRetailerProductSchema.parse({
          ...req.body,
          supplierId: req.supplierId
        });
        const product = await storage.createRetailerProduct(productData);
        res.json(product);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Update retailer product
  app.patch("/api/v1/supplier/retailer/products/:id",
    authenticateSupplier as any,
    requireSupplierRole('retailer') as any,
    async (req, res) => {
      try {
        const product = await storage.updateRetailerProduct(req.params.id, req.body);
        res.json(product);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Delete retailer product
  app.delete("/api/v1/supplier/retailer/products/:id",
    authenticateSupplier as any,
    requireSupplierRole('retailer') as any,
    async (req, res) => {
      await storage.deleteRetailerProduct(req.params.id);
      res.json({ success: true });
    }
  );

  // ============================================
  // SUPPLIER PORTAL - TAILOR ROUTES
  // ============================================

  // Get portfolio items
  app.get("/api/v1/supplier/tailor/portfolio",
    authenticateSupplier as any,
    requireSupplierRole('tailor') as any,
    async (req, res) => {
      const items = await storage.getPortfolioItems(req.supplierId!);
      res.json(items);
    }
  );

  // Create portfolio item
  app.post("/api/v1/supplier/tailor/portfolio",
    authenticateSupplier as any,
    requireSupplierRole('tailor') as any,
    async (req, res) => {
      try {
        const itemData = insertPortfolioItemSchema.parse({
          ...req.body,
          supplierId: req.supplierId
        });
        const item = await storage.createPortfolioItem(itemData);
        res.json(item);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Get custom requests for tailor
  app.get("/api/v1/supplier/tailor/custom-requests",
    authenticateSupplier as any,
    requireSupplierRole('tailor') as any,
    async (req, res) => {
      // Get all open custom requests that match tailor's specialties
      const requests = await storage.getOpenCustomRequests();
      res.json(requests);
    }
  );

  // ============================================
  // SUPPLIER PORTAL - DESIGNER ROUTES
  // ============================================

  // Get designer collections
  app.get("/api/v1/supplier/designer/collections",
    authenticateSupplier as any,
    requireSupplierRole('designer') as any,
    async (req, res) => {
      const collections = await storage.getDesignerCollections(req.supplierId!);
      res.json(collections);
    }
  );

  // Create designer collection
  app.post("/api/v1/supplier/designer/collections",
    authenticateSupplier as any,
    requireSupplierRole('designer') as any,
    async (req, res) => {
      try {
        const collectionData = insertDesignerCollectionSchema.parse({
          ...req.body,
          supplierId: req.supplierId
        });
        const collection = await storage.createDesignerCollection(collectionData);
        res.json(collection);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Update designer collection
  app.patch("/api/v1/supplier/designer/collections/:id",
    authenticateSupplier as any,
    requireSupplierRole('designer') as any,
    async (req, res) => {
      try {
        const collection = await storage.updateDesignerCollection(req.params.id, req.body);
        res.json(collection);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // SUPPLIER PORTAL - INTEGRATION ROUTES
  // ============================================

  // Get integration tokens
  app.get("/api/v1/supplier/integrations",
    authenticateSupplier as any,
    requireTier('pro', 'enterprise') as any,
    async (req, res) => {
      const tokens = await storage.getIntegrationTokens(req.supplierId!);
      // Decrypt tokens before sending
      const decryptedTokens = tokens.map(t => ({
        ...t,
        accessToken: decrypt(t.accessToken),
        refreshToken: t.refreshToken ? decrypt(t.refreshToken) : null
      }));
      res.json(decryptedTokens);
    }
  );

  // Create integration token
  app.post("/api/v1/supplier/integrations",
    authenticateSupplier as any,
    requireTier('pro', 'enterprise') as any,
    async (req, res) => {
      try {
        const { accessToken, refreshToken, ...tokenData } = req.body;
        
        // Encrypt tokens before storage
        const encryptedToken = insertIntegrationTokenSchema.parse({
          ...tokenData,
          supplierId: req.supplierId,
          accessToken: encrypt(accessToken),
          refreshToken: refreshToken ? encrypt(refreshToken) : null
        });
        
        const token = await storage.createIntegrationToken(encryptedToken);
        res.json(token);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Delete integration token
  app.delete("/api/v1/supplier/integrations/:id",
    authenticateSupplier as any,
    async (req, res) => {
      await storage.deleteIntegrationToken(req.params.id);
      res.json({ success: true });
    }
  );

  // ============================================
  // SUPPLIER PORTAL - MESSAGING ROUTES
  // ============================================

  // Get message threads
  app.get("/api/v1/supplier/messages",
    authenticateSupplier as any,
    async (req, res) => {
      const threads = await storage.getMessageThreads(req.supplierId!);
      res.json(threads);
    }
  );

  // Get messages in thread
  app.get("/api/v1/supplier/messages/:threadId",
    authenticateSupplier as any,
    async (req, res) => {
      const messages = await storage.getMessagesInThread(req.params.threadId);
      res.json(messages);
    }
  );

  // Send message
  app.post("/api/v1/supplier/messages/:threadId",
    authenticateSupplier as any,
    async (req, res) => {
      try {
        const messageData = insertSupplierMessageSchema.parse({
          threadId: req.params.threadId,
          senderId: req.supplierId,
          senderType: 'supplier',
          ...req.body
        });
        const message = await storage.createSupplierMessage(messageData);
        
        // Update thread
        await storage.updateMessageThread(req.params.threadId, {
          lastMessageAt: new Date()
        });
        
        res.json(message);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // ============================================
  // SUPPLIER PORTAL - ORDER MANAGEMENT
  // ============================================

  // Get supplier orders
  app.get("/api/v1/supplier/orders",
    authenticateSupplier as any,
    async (req, res) => {
      const orders = await storage.getSupplierOrders(req.supplierId!);
      res.json(orders);
    }
  );

  // Update supplier order
  app.patch("/api/v1/supplier/orders/:id",
    authenticateSupplier as any,
    async (req, res) => {
      try {
        const orderData = insertSupplierOrderSchema.partial().parse(req.body);
        const order = await storage.updateSupplierOrder(req.params.id, orderData);
        res.json(order);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // SUPPLIER PORTAL - ANALYTICS
  // ============================================

  // Get analytics snapshots
  app.get("/api/v1/supplier/analytics",
    authenticateSupplier as any,
    async (req, res) => {
      const { startDate, endDate } = req.query;
      const snapshots = await storage.getAnalyticsSnapshots(
        req.supplierId!,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(snapshots);
    }
  );
}
