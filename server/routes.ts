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
  insertPriceAlertSchema, insertAffiliateClickSchema, insertAffiliateConversionSchema,
  insertStylistApplicationSchema, insertStylistProfileSchema, insertStylistPortfolioItemSchema,
  insertStylistRfqSchema, insertStylistReviewSchema
} from "@shared/schema";
import { priceComparisonService } from "./services/price-comparison";
import { aiProductMatcher } from "./services/ai-product-matcher";
import { registerEventRoutes } from "./routes/events";
import { 
  generateStylistPortfolioUploadUrl,
  generateStylistAvatarUploadUrl,
  generateStylistCoverUploadUrl,
  deleteS3Object
} from "./services/s3";

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
  // CUSTOMER AUTHENTICATION ROUTES
  // ============================================

  // Customer registration
  app.post("/api/v1/auth/register", async (req, res) => {
    try {
      const { email, password, name, demographic } = req.body;

      // Validate required fields
      if (!email || !password || !name || !demographic) {
        return res.status(400).json({ 
          error: "Missing required fields: email, password, name, demographic" 
        });
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ error: passwordValidation.errors.join(", ") });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user account
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        demographic,
        budgetMin: req.body.budgetMin || 0,
        budgetMax: req.body.budgetMax || 1000,
        styleTags: req.body.styleTags || []
      });

      // Set session
      // @ts-ignore
      if (req.session) {
        // @ts-ignore
        req.session.userId = user.id;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Customer registration error:", error);
      res.status(500).json({ error: error.message || "Registration failed" });
    }
  });

  // Customer login
  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Set session
      // @ts-ignore
      if (req.session) {
        // @ts-ignore
        req.session.userId = user.id;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Customer login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current customer
  app.get("/api/v1/auth/me", requireUser, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer logout
  app.post("/api/v1/auth/logout", (req, res) => {
    // @ts-ignore
    if (req.session) {
      // @ts-ignore
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Logged out successfully" });
    }
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

  // Get a specific chat session
  app.get("/api/v1/ai-sessions/:sessionId", async (req, res) => {
    try {
      const session = await storage.getAiChatSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  // Get or create stylist profile for supplier (for AI Stylist Onboarding)
  app.get("/api/v1/supplier/:supplierId/stylist-profile", authenticateSupplier as any, async (req, res) => {
    try {
      const supplierId = req.params.supplierId;
      
      // Check if supplier exists
      const supplier = await storage.getSupplierAccount(supplierId);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      
      // Try to find existing stylist profile by handle (using supplier business name)
      const handle = supplier.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const existingProfile = await storage.getStylistProfileByHandle(handle);
      
      if (existingProfile) {
        return res.json(existingProfile);
      }
      
      // Create a user account for the supplier if needed (for stylist profile foreign key)
      // This is a workaround since stylistProfiles requires a userId
      const userEmail = `supplier-${supplier.id}@seamxy.internal`;
      let user = await storage.getUserByEmail(userEmail);
      
      if (!user) {
        const hashedPassword = await hashPassword(Math.random().toString(36));
        user = await storage.createUser({
          email: userEmail,
          password: hashedPassword,
          name: supplier.ownerName,
          demographic: "unisex",
          budgetMin: 0,
          budgetMax: 10000,
          styleTags: [],
        });
      }
      
      // Create stylist profile
      const stylistProfile = await storage.createStylistProfile({
        userId: user.id,
        handle,
        displayName: supplier.businessName,
        bio: `AI Stylist for ${supplier.businessName}`,
        location: null,
        styleSpecialties: [],
        isVerified: true,
        isActive: true,
      });
      
      res.json(stylistProfile);
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

  // ============================================
  // STYLIST PORTFOLIOS & PERSONAL AI PAGES
  // ============================================
  
  // Generate S3 presigned upload URL for portfolio images
  app.post("/api/v1/stylist/generate-upload-url",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { fileName, contentType, uploadType } = req.body;
        
        if (!fileName || !contentType) {
          return res.status(400).json({ error: "fileName and contentType required" });
        }
        
        // Get stylist profile
        const stylistProfile = await storage.getStylistProfileByUserId(req.userId!);
        if (!stylistProfile) {
          return res.status(403).json({ error: "Must be an approved stylist to upload images" });
        }
        
        let uploadData;
        if (uploadType === 'avatar') {
          uploadData = await generateStylistAvatarUploadUrl(stylistProfile.id, fileName, contentType);
        } else if (uploadType === 'cover') {
          uploadData = await generateStylistCoverUploadUrl(stylistProfile.id, fileName, contentType);
        } else {
          uploadData = await generateStylistPortfolioUploadUrl({
            stylistId: stylistProfile.id,
            fileName,
            contentType
          });
        }
        
        res.json(uploadData);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Submit stylist application
  app.post("/api/v1/stylist/apply",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const applicationData = insertStylistApplicationSchema.parse({
          ...req.body,
          userId: req.userId
        });
        
        // Check if user already has an application
        const existing = await storage.getStylistApplicationByUserId(req.userId!);
        if (existing) {
          return res.status(400).json({ error: "Application already submitted" });
        }
        
        const application = await storage.createStylistApplication(applicationData);
        res.json(application);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Get user's own stylist application status
  app.get("/api/v1/stylist/application",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      const application = await storage.getStylistApplicationByUserId(req.userId!);
      res.json(application || null);
    }
  );
  
  // Get stylist profile by userId (own profile)
  app.get("/api/v1/stylist/profile",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      const profile = await storage.getStylistProfileByUserId(req.userId!);
      res.json(profile || null);
    }
  );
  
  // Update stylist profile
  app.patch("/api/v1/stylist/profile",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByUserId(req.userId!);
        if (!profile) {
          return res.status(404).json({ error: "Stylist profile not found" });
        }
        
        const updateData = insertStylistProfileSchema.partial().parse(req.body);
        const updated = await storage.updateStylistProfile(profile.id, updateData);
        res.json(updated);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Link AI persona to stylist profile
  app.post("/api/v1/stylist/link-persona/:personaId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByUserId(req.userId!);
        if (!profile) {
          return res.status(404).json({ error: "Stylist profile not found" });
        }
        
        // Verify persona exists
        const persona = await storage.getAiPersona(req.params.personaId);
        if (!persona) {
          return res.status(404).json({ error: "AI persona not found" });
        }
        
        const updated = await storage.updateStylistProfile(profile.id, {
          linkedPersonaId: req.params.personaId
        });
        
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Create portfolio item (after S3 upload)
  app.post("/api/v1/stylist/portfolio",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByUserId(req.userId!);
        if (!profile) {
          return res.status(403).json({ error: "Must be an approved stylist" });
        }
        
        const portfolioData = insertStylistPortfolioItemSchema.parse({
          ...req.body,
          stylistId: profile.id
        });
        
        const item = await storage.createStylistPortfolioItem(portfolioData);
        res.json(item);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Get own portfolio items
  app.get("/api/v1/stylist/portfolio",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      const profile = await storage.getStylistProfileByUserId(req.userId!);
      if (!profile) {
        return res.json([]);
      }
      
      const items = await storage.getStylistPortfolioItems(profile.id);
      res.json(items);
    }
  );
  
  // Update portfolio item
  app.patch("/api/v1/stylist/portfolio/:id",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByUserId(req.userId!);
        if (!profile) {
          return res.status(403).json({ error: "Must be an approved stylist" });
        }
        
        // Verify ownership
        const item = await storage.getStylistPortfolioItemById(req.params.id);
        if (!item || item.stylistId !== profile.id) {
          return res.status(404).json({ error: "Portfolio item not found" });
        }
        
        const updateData = insertStylistPortfolioItemSchema.partial().parse(req.body);
        const updated = await storage.updateStylistPortfolioItem(req.params.id, updateData);
        res.json(updated);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Delete portfolio item
  app.delete("/api/v1/stylist/portfolio/:id",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByUserId(req.userId!);
        if (!profile) {
          return res.status(403).json({ error: "Must be an approved stylist" });
        }
        
        // Verify ownership
        const item = await storage.getStylistPortfolioItemById(req.params.id);
        if (!item || item.stylistId !== profile.id) {
          return res.status(404).json({ error: "Portfolio item not found" });
        }
        
        // Delete from S3
        await deleteS3Object(item.s3Key);
        
        // Delete from database
        await storage.deleteStylistPortfolioItem(req.params.id);
        
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get received RFQs (stylist inbox)
  app.get("/api/v1/stylist/rfqs",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      const profile = await storage.getStylistProfileByUserId(req.userId!);
      if (!profile) {
        return res.json([]);
      }
      
      const rfqs = await storage.getStylistRfqs(profile.id);
      res.json(rfqs);
    }
  );
  
  // Respond to RFQ
  app.patch("/api/v1/stylist/rfqs/:id/respond",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByUserId(req.userId!);
        if (!profile) {
          return res.status(403).json({ error: "Must be an approved stylist" });
        }
        
        const rfq = await storage.getStylistRfqById(req.params.id);
        if (!rfq || rfq.stylistId !== profile.id) {
          return res.status(404).json({ error: "RFQ not found" });
        }
        
        const { stylistResponse, estimatedPrice, estimatedTimeline } = req.body;
        
        const updated = await storage.updateStylistRfq(req.params.id, {
          stylistResponse,
          estimatedPrice,
          estimatedTimeline,
          status: 'responded',
          respondedAt: new Date()
        });
        
        res.json(updated);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Browse all stylists (public)
  app.get("/api/v1/stylists", async (req, res) => {
    const { specialty, tags, location, search } = req.query;
    
    const stylists = await storage.browseStylistProfiles({
      specialty: specialty as string,
      tags: tags ? (tags as string).split(',') : undefined,
      location: location as string,
      search: search as string
    });
    
    res.json(stylists);
  });
  
  // Get stylist profile by handle (public)
  app.get("/api/v1/stylists/:handle", async (req, res) => {
    const profile = await storage.getStylistProfileByHandle(req.params.handle);
    if (!profile) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    res.json(profile);
  });
  
  // Get stylist portfolio by handle (public)
  app.get("/api/v1/stylists/:handle/portfolio", async (req, res) => {
    const profile = await storage.getStylistProfileByHandle(req.params.handle);
    if (!profile) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    const items = await storage.getStylistPortfolioItems(profile.id);
    res.json(items);
  });
  
  // Submit RFQ to stylist
  app.post("/api/v1/stylists/:handle/rfq",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByHandle(req.params.handle);
        if (!profile) {
          return res.status(404).json({ error: "Stylist not found" });
        }
        
        const rfqData = insertStylistRfqSchema.parse({
          ...req.body,
          userId: req.userId,
          stylistId: profile.id
        });
        
        const rfq = await storage.createStylistRfq(rfqData);
        res.json(rfq);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Follow stylist
  app.post("/api/v1/stylists/:handle/follow",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByHandle(req.params.handle);
        if (!profile) {
          return res.status(404).json({ error: "Stylist not found" });
        }
        
        await storage.followStylist(req.userId!, profile.id);
        
        // Update follower count
        await storage.updateStylistProfile(profile.id, {
          totalFollowers: (profile.totalFollowers || 0) + 1
        });
        
        res.json({ success: true });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Unfollow stylist
  app.delete("/api/v1/stylists/:handle/follow",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByHandle(req.params.handle);
        if (!profile) {
          return res.status(404).json({ error: "Stylist not found" });
        }
        
        await storage.unfollowStylist(req.userId!, profile.id);
        
        // Update follower count
        await storage.updateStylistProfile(profile.id, {
          totalFollowers: Math.max(0, (profile.totalFollowers || 0) - 1)
        });
        
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Submit review
  app.post("/api/v1/stylists/:handle/review",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getStylistProfileByHandle(req.params.handle);
        if (!profile) {
          return res.status(404).json({ error: "Stylist not found" });
        }
        
        const reviewData = insertStylistReviewSchema.parse({
          ...req.body,
          userId: req.userId,
          stylistId: profile.id
        });
        
        const review = await storage.createStylistReview(reviewData);
        
        // Recalculate average rating
        const allReviews = await storage.getStylistReviews(profile.id);
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await storage.updateStylistProfile(profile.id, {
          totalReviews: allReviews.length,
          averageRating: avgRating.toFixed(2)
        });
        
        res.json(review);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Get stylist reviews
  app.get("/api/v1/stylists/:handle/reviews", async (req, res) => {
    const profile = await storage.getStylistProfileByHandle(req.params.handle);
    if (!profile) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    const reviews = await storage.getStylistReviews(profile.id);
    res.json(reviews);
  });
  
  // ============================================
  // AI STYLIST ONBOARDING - TRAINING & PROMPTS
  // ============================================
  
  // Get all training responses for a stylist
  app.get("/api/v1/stylist/:stylistId/training-responses", async (req, res) => {
    try {
      const responses = await storage.getTrainingResponses(req.params.stylistId);
      res.json(responses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Save or update training response (upsert)
  app.post("/api/v1/stylist/:stylistId/training-responses", async (req, res) => {
    try {
      const { questionId, questionText, answer, category } = req.body;
      
      if (!questionId || !questionText || !answer || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Check if response already exists for this question
      const existingResponses = await storage.getTrainingResponses(req.params.stylistId);
      const existing = existingResponses.find(r => r.questionId === questionId);
      
      let response;
      if (existing) {
        // Update existing response
        response = await storage.updateTrainingResponse(existing.id, answer);
      } else {
        // Create new response
        response = await storage.saveTrainingResponse({
          stylistId: req.params.stylistId,
          questionId,
          questionText,
          answer,
          category
        });
      }
      
      res.json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update training response
  app.patch("/api/v1/stylist/training-responses/:responseId", async (req, res) => {
    try {
      const { answer } = req.body;
      
      if (!answer) {
        return res.status(400).json({ error: "Answer is required" });
      }
      
      const updated = await storage.updateTrainingResponse(req.params.responseId, answer);
      
      if (!updated) {
        return res.status(404).json({ error: "Training response not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete training response
  app.delete("/api/v1/stylist/training-responses/:responseId", async (req, res) => {
    try {
      await storage.deleteTrainingResponse(req.params.responseId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Generate AI prompt from training responses
  app.post("/api/v1/stylist/:stylistId/generate-prompt", async (req, res) => {
    try {
      const stylist = await storage.getStylistProfileById(req.params.stylistId);
      if (!stylist) {
        return res.status(404).json({ error: "Stylist not found" });
      }
      
      const responses = await storage.getTrainingResponses(req.params.stylistId);
      const portfolioItems = await storage.getStylistPortfolioItems(req.params.stylistId);
      
      // TODO: Extract portfolio context from portfolio item descriptions
      const portfolioWithContext = portfolioItems.map(item => ({
        item,
        context: {
          description: item.title || "",
          clientType: item.description || "",
          problemSolved: "",
          unique: "",
          occasion: item.occasion || ""
        }
      }));
      
      const { promptGenerator } = await import("./services/prompt-generator");
      const systemPrompt = promptGenerator.generate({
        stylist,
        trainingResponses: responses,
        portfolioItems: portfolioWithContext
      });
      
      // Check if prompt already exists
      let existingPrompt = await storage.getStylistPrompt(req.params.stylistId);
      
      if (existingPrompt) {
        // Update existing prompt
        const updated = await storage.updateStylistPrompt(req.params.stylistId, {
          systemPrompt,
          promptVersion: existingPrompt.promptVersion + 1,
          trainingCompletedAt: new Date()
        });
        res.json(updated);
      } else {
        // Create new prompt
        const prompt = await storage.createStylistPrompt({
          stylistId: req.params.stylistId,
          systemPrompt,
          promptVersion: 1,
          trainingCompletedAt: new Date(),
          isActive: true
        });
        res.json(prompt);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get stylist's AI prompt
  app.get("/api/v1/stylist/:stylistId/prompt", async (req, res) => {
    try {
      const prompt = await storage.getStylistPrompt(req.params.stylistId);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found. Complete training first." });
      }
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Check conversation credits
  app.get("/api/v1/users/:userId/stylists/:stylistId/credits", async (req, res) => {
    try {
      const { userId, stylistId } = req.params;
      
      const credit = await storage.getConversationCredit(userId, stylistId);
      const subscription = await storage.getAiSubscription(userId, stylistId);
      
      const { creditManager } = await import("./services/credit-manager");
      const check = await creditManager.checkCredit(credit || null, subscription || null);
      
      res.json(check);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Chat with stylist AI (with credit deduction)
  app.post("/api/v1/stylists/:handle/chat", async (req, res) => {
    try {
      const { userId, message } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: "Missing userId or message" });
      }
      
      const stylist = await storage.getStylistProfileByHandle(req.params.handle);
      if (!stylist) {
        return res.status(404).json({ error: "Stylist not found" });
      }
      
      const prompt = await storage.getStylistPrompt(stylist.id);
      if (!prompt) {
        return res.status(404).json({ error: "Stylist AI not trained yet" });
      }
      
      // Check credits and subscription
      let credit = await storage.getConversationCredit(userId, stylist.id);
      const subscription = await storage.getAiSubscription(userId, stylist.id);
      
      const { creditManager } = await import("./services/credit-manager");
      
      // Initialize credits if needed
      if (!credit && !subscription) {
        credit = await storage.createConversationCredit(
          creditManager.createInitialCredit(userId, stylist.id)
        );
      }
      
      // Check if reset needed
      if (credit && creditManager.shouldResetCredits(credit)) {
        const reset = creditManager.resetCreditPeriod(credit);
        credit = await storage.updateConversationCredit(credit.id, reset) || credit;
      }
      
      // Check credit availability
      const check = await creditManager.checkCredit(credit || null, subscription || null);
      
      if (!check.hasCredits) {
        return res.status(402).json({ 
          error: "No credits remaining",
          requiresUpgrade: true,
          message: "Please upgrade to premium for unlimited messages."
        });
      }
      
      // Generate AI response
      const { generateAiStylistResponse } = await import("./services/openai");
      
      const user = await storage.getUser(userId);
      const measurements = await storage.getUserMeasurements(userId);
      
      const aiResponse = await generateAiStylistResponse(
        prompt.systemPrompt,
        {
          measurements: measurements || {},
          styleTags: user?.styleTags || [],
          budgetMin: user?.budgetMin || 0,
          budgetMax: user?.budgetMax || 500
        },
        [], // Empty chat history for now - TODO: add session management
        message
      );
      
      // Deduct credit (only if not subscribed)
      if (!subscription && credit) {
        const deduction = creditManager.deductCredit(credit);
        if (deduction.success) {
          await storage.updateConversationCredit(credit.id, {
            creditsRemaining: deduction.newCreditsRemaining
          });
        }
        
        res.json({
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
          creditsRemaining: deduction.newCreditsRemaining,
          creditMessage: deduction.message
        });
      } else {
        res.json({
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
          isSubscribed: true
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create AI subscription
  app.post("/api/v1/users/:userId/stylists/:stylistId/subscribe", async (req, res) => {
    try {
      const { userId, stylistId } = req.params;
      
      // Check if subscription already exists
      const existing = await storage.getAiSubscription(userId, stylistId);
      if (existing && existing.status === "active") {
        return res.status(400).json({ error: "Subscription already active" });
      }
      
      const { creditManager } = await import("./services/credit-manager");
      const subscription = await storage.createAiSubscription(
        creditManager.createSubscription(userId, stylistId)
      );
      
      res.json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Cancel AI subscription
  app.post("/api/v1/subscriptions/:subscriptionId/cancel", async (req, res) => {
    try {
      const cancelled = await storage.cancelAiSubscription(req.params.subscriptionId);
      if (!cancelled) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(cancelled);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get user's AI subscriptions
  app.get("/api/v1/users/:userId/ai-subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getUserAiSubscriptions(req.params.userId);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // ADMIN - STYLIST MANAGEMENT
  // ============================================
  
  // Get all stylist applications
  app.get("/api/v1/admin/stylist-applications",
    requireAdmin as any,
    async (req, res) => {
      const { status } = req.query;
      const applications = await storage.getAllStylistApplications(status as any);
      res.json(applications);
    }
  );
  
  // Approve stylist application
  app.post("/api/v1/admin/stylist-applications/:id/approve",
    requireAdmin as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const application = await storage.getStylistApplicationById(req.params.id);
        if (!application) {
          return res.status(404).json({ error: "Application not found" });
        }
        
        if (application.status !== 'pending') {
          return res.status(400).json({ error: "Application already processed" });
        }
        
        // Update application status
        await storage.updateStylistApplication(req.params.id, {
          status: 'approved',
          reviewedBy: req.userId,
          reviewedAt: new Date(),
          reviewNotes: req.body.reviewNotes
        });
        
        // Get user info
        const user = await storage.getUser(application.userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Create stylist profile
        const handle = req.body.handle || user.name.toLowerCase().replace(/\s+/g, '');
        const profile = await storage.createStylistProfile({
          userId: application.userId,
          applicationId: application.id,
          handle,
          displayName: user.name,
          styleSpecialties: application.styleSpecialties,
          instagramHandle: application.instagramHandle,
          tiktokHandle: application.tiktokHandle,
          websiteUrl: application.websiteUrl
        });
        
        res.json({ application, profile });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Reject stylist application
  app.post("/api/v1/admin/stylist-applications/:id/reject",
    requireAdmin as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const application = await storage.getStylistApplicationById(req.params.id);
        if (!application) {
          return res.status(404).json({ error: "Application not found" });
        }
        
        if (application.status !== 'pending') {
          return res.status(400).json({ error: "Application already processed" });
        }
        
        const updated = await storage.updateStylistApplication(req.params.id, {
          status: 'rejected',
          reviewedBy: req.userId,
          reviewedAt: new Date(),
          reviewNotes: req.body.reviewNotes
        });
        
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // WEDDING & PROM CONCIERGE ROUTES
  // ============================================
  
  // Register event routes
  registerEventRoutes(app);
}
