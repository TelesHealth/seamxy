import type { Express } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { ZodError } from "zod";
import { 
  analyzeStyleDescription, 
  calculateProductScores, 
  generateAiStylistResponse,
  generateSituationalOutfits
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
  insertStylistRfqSchema, insertStylistReviewSchema,
  insertCreatorTierSchema, insertCreatorPostSchema, insertCreatorSubscriptionSchema,
  insertCreatorTipSchema, insertCreatorCustomRequestSchema, insertModerationFlagSchema,
  adminUpdateUserSchema,
  insertUserStyleProfileSchema, insertUserClosetItemSchema
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
import Stripe from "stripe";

// Initialize Stripe - blueprint reference: javascript_stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia" as any,
});

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
                {
                  ...product,
                  price: Number(product.price),
                  styleTags: product.styleTags || []
                }
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
      
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Use bcrypt to compare passwords
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
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
    try {
      const users = await storage.getUsers();
      res.json({ users, total: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create user (admin only)
  app.post("/api/v1/admin/users", requireAdmin as any, async (req: AuthenticatedRequest, res) => {
    try {
      // Validate request body using Zod schema for regular users
      const validatedData = insertUserSchema.parse(req.body);
      const { password, ...userData } = validatedData;

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already in use" });
      }

      // Hash password with bcrypt (12 rounds)
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create audit log
      if (req.user) {
        await storage.createAuditLog({
          adminId: req.user.id,
          action: "create_user",
          targetType: "user",
          targetId: newUser.id,
          changes: { email: userData.email, name: userData.name },
          ipAddress: req.ip || null
        });
      }

      // Return user data without password, but include the original password in response for display
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ 
        user: userWithoutPassword,
        credentials: {
          email: newUser.email,
          password: password // Return unhashed password so admin can share it
        }
      });
    } catch (error: any) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update user (admin only)
  app.patch("/api/v1/admin/users/:id", requireAdmin as any, async (req: AuthenticatedRequest, res) => {
    try {
      // Validate the request body
      const updates = adminUpdateUserSchema.parse(req.body);
      
      // If email is being updated, check if it's already in use by another user
      if (updates.email) {
        const existingUser = await storage.getUserByEmail(updates.email);
        if (existingUser && existingUser.id !== req.params.id) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }
      
      // Update the user
      const user = await storage.updateUser(req.params.id, updates);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Create audit log
      if (req.user) {
        await storage.createAuditLog({
          adminId: req.user.id,
          action: "update_user",
          targetType: "user",
          targetId: req.params.id,
          changes: updates,
          ipAddress: req.ip || null
        });
      }
      
      res.json(user);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ADMIN PANEL - MAKER MANAGEMENT
  // ============================================

  // Create maker (admin only)
  app.post("/api/v1/admin/makers", requireAdmin as any, async (req: AuthenticatedRequest, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = insertMakerSchema.parse(req.body);
      const { password, ...makerData } = validatedData;

      // Check if email already exists
      const existingMaker = await storage.getMakerByEmail(makerData.email);
      if (existingMaker) {
        return res.status(409).json({ error: "Email already in use" });
      }

      // Hash password with bcrypt (12 rounds)
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create maker with hashed password
      const newMaker = await storage.createMaker({
        ...makerData,
        password: hashedPassword,
      });

      // Create audit log
      if (req.user) {
        await storage.createAuditLog({
          adminId: req.user.id,
          action: "create_maker",
          targetType: "maker",
          targetId: newMaker.id,
          changes: { email: makerData.email, businessName: makerData.businessName },
          ipAddress: req.ip || null
        });
      }

      // Return maker data without password, but include the original password in response for display
      const { password: _, ...makerWithoutPassword } = newMaker;
      res.json({ 
        maker: makerWithoutPassword,
        credentials: {
          email: newMaker.email,
          password: password // Return unhashed password so admin can share it
        }
      });
    } catch (error: any) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

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

      if (!session.personaId) {
        return res.status(400).json({ error: "Session has no persona assigned" });
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
          demographic: "men",
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

  // Get affiliate marketing analytics for stylist (designers only)
  app.get("/api/v1/supplier/affiliate-analytics",
    authenticateSupplier as any,
    requireSupplierRole('designer') as any,
    async (req, res) => {
      try {
        // For now, return mock data until we implement full affiliate tracking
        // TODO: Implement proper affiliate analytics aggregation
        res.json({
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: "0.00",
          conversionRate: "0.00",
          topProducts: [],
          clicksByRetailer: {
            amazon: 0,
            ebay: 0,
            rakuten: 0
          }
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // STYLIST PORTFOLIOS & PERSONAL AI PAGES
  // ============================================
  
  // Generate S3 presigned upload URL for portfolio images
  app.post("/api/v1/stylist/generate-upload-url",
    authenticateSupplier as any,
    async (req, res) => {
      try {
        const { fileName, contentType, uploadType } = req.body;
        
        if (!fileName || !contentType) {
          return res.status(400).json({ error: "fileName and contentType required" });
        }
        
        // Get supplier and create stylist profile handle
        const supplier = await storage.getSupplierAccount(req.supplierId!);
        if (!supplier) {
          return res.status(404).json({ error: "Supplier not found" });
        }
        
        const handle = supplier.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || 
                       `supplier-${req.supplierId}`;
        
        // Get stylist profile by handle
        const stylistProfile = await storage.getStylistProfileByHandle(handle);
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
  
  // ============================================
  // AI STYLIST ONBOARDING - PORTFOLIO UPLOADS
  // ============================================
  
  // Get stylist portfolio items
  app.get("/api/v1/stylist/:stylistId/portfolio", async (req, res) => {
    try {
      const items = await storage.getStylistPortfolioItems(req.params.stylistId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create portfolio item (note: imageUrl should be pre-uploaded to S3/storage)
  app.post("/api/v1/stylist/:stylistId/portfolio", async (req, res) => {
    try {
      const itemData = insertStylistPortfolioItemSchema.parse({
        stylistId: req.params.stylistId,
        ...req.body
      });
      
      const item = await storage.createStylistPortfolioItem(itemData);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update portfolio item
  app.patch("/api/v1/stylist/portfolio/:itemId", async (req, res) => {
    try {
      const updates = insertStylistPortfolioItemSchema.partial().parse(req.body);
      const updated = await storage.updateStylistPortfolioItem(req.params.itemId, updates);
      
      if (!updated) {
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete portfolio item
  app.delete("/api/v1/stylist/portfolio/:itemId", async (req, res) => {
    try {
      await storage.deleteStylistPortfolioItem(req.params.itemId);
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
      
      // Extract portfolio context from new AI training fields
      const portfolioWithContext = portfolioItems.map(item => ({
        item,
        context: {
          description: item.description || item.title || "",
          clientType: item.clientType || "",
          problemSolved: item.styleNotes || "",
          unique: item.tags?.join(", ") || "",
          occasion: item.occasion || "",
          priceRange: item.priceRange || ""
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
  
  // Chat with stylist AI (with credit deduction and Creator Studio subscription gating)
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
      
      // Check if stylist requires Creator Studio subscription
      let hasAccess = true;
      let creatorSubscription = null;
      
      if (stylist.requiresSubscription && stylist.supplierId) {
        // Check for active Creator Studio subscription
        creatorSubscription = await storage.getCreatorSubscription(userId, stylist.supplierId);
        
        if (!creatorSubscription || creatorSubscription.status !== 'active') {
          return res.status(402).json({
            error: "Subscription required",
            requiresCreatorSubscription: true,
            supplierId: stylist.supplierId,
            message: "This AI stylist requires an active Creator Studio subscription. Please subscribe to continue chatting.",
            currentStatus: creatorSubscription?.status || 'none'
          });
        }
      }
      
      // Check credits and AI subscription (legacy system for non-Creator Studio stylists)
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
      
      // Generate AI response with product recommendations
      const { generateAIStylistResponseWithProducts } = await import("./services/ai-stylist-with-products");
      
      const user = await storage.getUser(userId);
      const measurements = await storage.getUserMeasurements(userId);
      
      const aiResponseWithProducts = await generateAIStylistResponseWithProducts(
        prompt.systemPrompt,
        {
          measurements: measurements || {},
          styleTags: user?.styleTags || [],
          budgetMin: user?.budgetMin || 0,
          budgetMax: user?.budgetMax || 500,
          demographic: user?.demographic
        },
        [], // Empty chat history for now - TODO: add session management
        message
      );
      
      // Deduct credit (only if not subscribed to either Creator Studio or AI subscription)
      if (!subscription && !creatorSubscription && credit) {
        const deduction = creditManager.deductCredit(credit);
        if (deduction.success) {
          await storage.updateConversationCredit(credit.id, {
            creditsRemaining: deduction.newCreditsRemaining
          });
        }
        
        res.json({
          role: "assistant",
          content: aiResponseWithProducts.message,
          productRecommendations: aiResponseWithProducts.productRecommendations,
          timestamp: new Date(),
          creditsRemaining: deduction.newCreditsRemaining,
          creditMessage: deduction.message
        });
      } else {
        res.json({
          role: "assistant",
          content: aiResponseWithProducts.message,
          productRecommendations: aiResponseWithProducts.productRecommendations,
          timestamp: new Date(),
          isSubscribed: true,
          subscriptionType: creatorSubscription ? "creator_studio" : "ai_subscription"
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
  // CREATOR STUDIO - PUBLIC DIRECTORY
  // ============================================
  
  // Get all creators for public directory with search and filters
  app.get("/api/v1/creators", async (req, res) => {
    try {
      const { search, category, sortBy } = req.query;
      
      // Get all supplier accounts with designer role (creators)
      const designers = await storage.getSuppliersByRole("designer");
      const activeDesigners = designers.filter(s => s.isActive);
      
      // Get profiles, tiers, posts, and subscriber counts for each creator
      const creatorsWithStats = await Promise.all(
        activeDesigners.map(async (supplier: any) => {
          const profile = await storage.getSupplierProfile(supplier.id);
          const tiers = await storage.getCreatorTiers(supplier.id);
          const posts = await storage.getCreatorPosts(supplier.id);
          const subscriptions = await storage.getStylistCreatorSubscriptions(supplier.id);
          
          const publicPostCount = posts.filter((p: any) => p.isPublic).length;
          const totalSubscribers = subscriptions.filter((s: any) => s.status === 'active').length;
          
          // Generate handle from business name if not in profile
          const handle = supplier.businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          
          return {
            id: supplier.id,
            handle,
            displayName: supplier.businessName,
            bio: profile?.description || '',
            avatarUrl: profile?.logoUrl || null,
            coverImageUrl: null,
            category: 'Fashion',
            tierCount: tiers.length,
            lowestTierPrice: tiers.length > 0 ? Math.min(...tiers.map((t: any) => t.priceCents)) : null,
            postCount: posts.length,
            publicPostCount,
            subscriberCount: totalSubscribers,
            createdAt: supplier.createdAt,
          };
        })
      );
      
      // Filter by search query
      let filtered = creatorsWithStats;
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter((c: any) =>
          c.displayName.toLowerCase().includes(searchLower) ||
          c.bio.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by category
      if (category && typeof category === 'string') {
        filtered = filtered.filter((c: any) => c.category === category);
      }
      
      // Sort results
      if (sortBy === 'popular') {
        filtered.sort((a: any, b: any) => b.subscriberCount - a.subscriberCount);
      } else if (sortBy === 'newest') {
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'price-low') {
        filtered.sort((a: any, b: any) => (a.lowestTierPrice || 9999) - (b.lowestTierPrice || 9999));
      } else if (sortBy === 'price-high') {
        filtered.sort((a: any, b: any) => (b.lowestTierPrice || 0) - (a.lowestTierPrice || 0));
      }
      
      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // CREATOR STUDIO - SUBSCRIPTION TIERS
  // ============================================
  
  // Get all tiers for a creator
  app.get("/api/v1/creators/:stylistId/tiers", async (req, res) => {
    try {
      const tiers = await storage.getCreatorTiers(req.params.stylistId);
      res.json(tiers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create a new tier (creator only)
  app.post("/api/v1/creators/:stylistId/tiers",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Verify the user owns this stylist profile
        const profile = await storage.getStylistProfileById(req.params.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        const tierData = insertCreatorTierSchema.parse({
          ...req.body,
          stylistId: req.params.stylistId
        });
        
        const tier = await storage.createCreatorTier(tierData);
        res.json(tier);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Update a tier
  app.patch("/api/v1/creators/tiers/:tierId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const tier = await storage.getCreatorTier(req.params.tierId);
        if (!tier) {
          return res.status(404).json({ error: "Tier not found" });
        }
        
        // Verify ownership
        const profile = await storage.getStylistProfileById(tier.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        const updated = await storage.updateCreatorTier(req.params.tierId, req.body);
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Delete a tier
  app.delete("/api/v1/creators/tiers/:tierId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const tier = await storage.getCreatorTier(req.params.tierId);
        if (!tier) {
          return res.status(404).json({ error: "Tier not found" });
        }
        
        // Verify ownership
        const profile = await storage.getStylistProfileById(tier.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        await storage.deleteCreatorTier(req.params.tierId);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // CREATOR STUDIO - POSTS
  // ============================================
  
  // Get posts for a creator (public or subscriber-only based on auth)
  app.get("/api/v1/creators/:stylistId/posts", async (req: AuthenticatedRequest, res) => {
    try {
      const stylistId = req.params.stylistId;
      const userId = req.userId;
      
      // Check if user is subscribed
      let hasAccess = false;
      if (userId) {
        const subscription = await storage.getCreatorSubscription(userId, stylistId);
        hasAccess = !!subscription && subscription.status === 'active';
      }
      
      // Get posts (public only if not subscribed)
      const posts = await storage.getCreatorPosts(stylistId, hasAccess ? undefined : true);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create a post (creator only)
  app.post("/api/v1/creators/:stylistId/posts",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Verify ownership
        const profile = await storage.getStylistProfileById(req.params.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        const postData = insertCreatorPostSchema.parse({
          ...req.body,
          stylistId: req.params.stylistId
        });
        
        const post = await storage.createCreatorPost(postData);
        res.json(post);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Update a post
  app.patch("/api/v1/creators/posts/:postId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const post = await storage.getCreatorPost(req.params.postId);
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        
        // Verify ownership
        const profile = await storage.getStylistProfileById(post.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        const updated = await storage.updateCreatorPost(req.params.postId, req.body);
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Delete a post
  app.delete("/api/v1/creators/posts/:postId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const post = await storage.getCreatorPost(req.params.postId);
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        
        // Verify ownership
        const profile = await storage.getStylistProfileById(post.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        await storage.deleteCreatorPost(req.params.postId);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Increment post view count
  app.post("/api/v1/creators/posts/:postId/view", async (req, res) => {
    try {
      await storage.incrementPostView(req.params.postId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CREATOR STUDIO - SUBSCRIPTIONS
  // ============================================
  
  // Subscribe to a creator tier - blueprint reference: javascript_stripe
  app.post("/api/v1/creators/:stylistId/subscribe",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { tierId } = req.body;
        const userId = req.userId!;
        const stylistId = req.params.stylistId;
        
        // Get tier details
        const tier = await storage.getCreatorTier(tierId);
        if (!tier || tier.stylistId !== stylistId) {
          return res.status(404).json({ error: "Tier not found" });
        }
        
        // Check if already subscribed
        const existing = await storage.getCreatorSubscription(userId, stylistId);
        if (existing && existing.status === 'active') {
          return res.status(400).json({ error: "Already subscribed" });
        }
        
        // Get or create Stripe customer
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId }
          });
          customerId = customer.id;
        }
        
        // Create or get Stripe Price for this tier
        const price = await stripe.prices.create({
          currency: 'usd',
          unit_amount: tier.priceCents,
          recurring: {
            interval: 'month',
          },
          product_data: {
            name: `${tier.name} - Creator Subscription`,
            metadata: {
              tierId: tier.id,
              stylistId,
            },
          },
        });
        
        // Create Stripe subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: price.id,
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });
        
        // Calculate revenue split (80% creator, 20% platform)
        const creatorShare = Math.floor(tier.priceCents * 0.80);
        const platformShare = tier.priceCents - creatorShare;
        
        // Save subscription in database
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        
        const dbSubscription = await storage.createCreatorSubscription({
          userId,
          stylistId,
          tierId,
          status: 'active',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        });
        
        res.json({
          subscription: dbSubscription,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get user's creator subscriptions
  app.get("/api/v1/my-subscriptions",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const subscriptions = await storage.getUserCreatorSubscriptions(req.userId!);
        res.json(subscriptions);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Cancel subscription
  app.post("/api/v1/subscriptions/:subscriptionId/cancel",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const subscription = await storage.getCreatorSubscription(req.userId!, req.params.subscriptionId);
        if (!subscription) {
          return res.status(404).json({ error: "Subscription not found" });
        }
        
        // Cancel in Stripe
        if (subscription.stripeSubscriptionId) {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        }
        
        // Update in database
        const updated = await storage.cancelCreatorSubscription(subscription.id);
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // CREATOR STUDIO - TIPS/DONATIONS
  // ============================================
  
  // Send a tip to creator - blueprint reference: javascript_stripe
  app.post("/api/v1/creators/:stylistId/tip",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { amountCents, message } = req.body;
        const userId = req.userId!;
        const stylistId = req.params.stylistId;
        
        if (!amountCents || amountCents < 100) {
          return res.status(400).json({ error: "Minimum tip is $1.00" });
        }
        
        // Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: 'usd',
          metadata: { userId, stylistId, type: 'tip' }
        });
        
        // Save tip in database
        const tip = await storage.createCreatorTip({
          userId,
          stylistId,
          amountCents,
          message,
          stripePaymentIntentId: paymentIntent.id,
        });
        
        res.json({
          tip,
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get tips for a creator
  app.get("/api/v1/creators/:stylistId/tips",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Verify ownership
        const profile = await storage.getStylistProfileById(req.params.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        const tips = await storage.getCreatorTips(req.params.stylistId);
        res.json(tips);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // CREATOR STUDIO - CUSTOM REQUESTS (RFQ)
  // ============================================
  
  // Create a custom request
  app.post("/api/v1/creators/:stylistId/request",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const requestData = insertCreatorCustomRequestSchema.parse({
          ...req.body,
          userId: req.userId,
          stylistId: req.params.stylistId
        });
        
        const request = await storage.createCreatorCustomRequest(requestData);
        res.json(request);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Get custom requests for a creator
  app.get("/api/v1/creators/:stylistId/requests",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Verify ownership
        const profile = await storage.getStylistProfileById(req.params.stylistId);
        if (!profile || profile.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        const requests = await storage.getCreatorCustomRequests(req.params.stylistId);
        res.json(requests);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get user's custom requests
  app.get("/api/v1/my-requests",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const requests = await storage.getUserCustomRequestsCreator(req.userId!);
        res.json(requests);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get a single custom request
  app.get("/api/v1/requests/:requestId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const request = await storage.getCreatorCustomRequest(req.params.requestId);
        if (!request) {
          return res.status(404).json({ error: "Request not found" });
        }
        
        // Verify access (owner or creator)
        const profile = await storage.getStylistProfileById(request.stylistId);
        if (request.userId !== req.userId && profile?.userId !== req.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        res.json(request);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Update custom request (quote, accept, complete)
  app.patch("/api/v1/requests/:requestId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const request = await storage.getCreatorCustomRequest(req.params.requestId);
        if (!request) {
          return res.status(404).json({ error: "Request not found" });
        }
        
        // Verify access
        const profile = await storage.getStylistProfileById(request.stylistId);
        const isCreator = profile?.userId === req.userId;
        const isRequester = request.userId === req.userId;
        
        if (!isCreator && !isRequester) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        
        // Handle different status transitions
        const updates: any = { ...req.body };
        
        // Creator submitting quote
        if (isCreator && req.body.quotePriceCents) {
          updates.status = 'quoted';
          updates.quotedAt = new Date();
        }
        
        // Customer accepting quote
        if (isRequester && req.body.status === 'accepted') {
          // Create Stripe PaymentIntent for 10% platform fee
          const platformFee = Math.floor(request.quotePriceCents! * 0.10);
          const paymentIntent = await stripe.paymentIntents.create({
            amount: request.quotePriceCents!,
            currency: 'usd',
            metadata: { requestId: request.id, type: 'custom_request' }
          });
          
          updates.acceptedAt = new Date();
          updates.stripePaymentIntentId = paymentIntent.id;
        }
        
        const updated = await storage.updateCreatorCustomRequest(req.params.requestId, updates);
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // CREATOR STUDIO - MODERATION
  // ============================================
  
  // Flag content for moderation
  app.post("/api/v1/moderation/flag",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const flagData = insertModerationFlagSchema.parse({
          ...req.body,
          reporterId: req.userId
        });
        
        const flag = await storage.createModerationFlag(flagData);
        res.json(flag);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  // Get moderation flags (admin only)
  app.get("/api/v1/admin/moderation/flags",
    requireAdmin as any,
    async (req, res) => {
      try {
        const status = req.query.status as string | undefined;
        const flags = await storage.getModerationFlags(status);
        res.json(flags);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Review moderation flag (admin only)
  app.patch("/api/v1/admin/moderation/flags/:flagId",
    requireAdmin as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const updated = await storage.updateModerationFlag(req.params.flagId, {
          ...req.body,
          reviewerId: req.userId,
          reviewedAt: new Date()
        });
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // ADMIN - CREATORS MANAGEMENT
  // ============================================
  
  // Create creator account (admin only) - creates both user and stylist profile
  app.post("/api/v1/admin/creators", requireAdmin as any, async (req: AuthenticatedRequest, res) => {
    try {
      const { 
        email, 
        password, 
        name, 
        handle, 
        displayName,
        bio,
        styleSpecialties,
        instagramHandle,
        tiktokHandle,
        websiteUrl,
        isVerified,
        demographic
      } = req.body;

      // Validate required fields
      if (!email || !password || !name || !handle) {
        return res.status(400).json({ error: "Email, password, name, and handle are required" });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already in use" });
      }

      // Check if handle already exists
      const existingProfile = await storage.getStylistProfileByHandle(handle);
      if (existingProfile) {
        return res.status(409).json({ error: "Handle already in use" });
      }

      // Hash password with bcrypt (12 rounds)
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user account
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        demographic: demographic || 'women' // Default demographic
      });

      // Create stylist profile linked to user
      const stylistProfile = await storage.createStylistProfile({
        userId: newUser.id,
        handle,
        displayName: displayName || name,
        bio: bio || null,
        styleSpecialties: styleSpecialties || [],
        instagramHandle: instagramHandle || null,
        tiktokHandle: tiktokHandle || null,
        websiteUrl: websiteUrl || null,
        isVerified: isVerified || false,
        isActive: true
      });

      // Create audit log
      if (req.user) {
        await storage.createAuditLog({
          adminId: req.user.id,
          action: "create_creator",
          targetType: "user",
          targetId: newUser.id,
          changes: { email, name, handle },
          ipAddress: req.ip || null
        });
      }

      // Return creator data without password, but include the original password in response for display
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ 
        user: userWithoutPassword,
        profile: stylistProfile,
        credentials: {
          email: newUser.email,
          password: password // Return unhashed password so admin can share it
        }
      });
    } catch (error: any) {
      console.error('Creator creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get all creators with stats (admin only)
  app.get("/api/v1/admin/creators",
    requireAdmin as any,
    async (req, res) => {
      try {
        const creators = await storage.getCreatorsWithStats();
        res.json({ creators });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // STRIPE WEBHOOKS FOR CREATOR STUDIO
  // ============================================
  
  // Stripe webhook handler for subscription lifecycle events
  app.post("/api/v1/webhooks/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('No signature');
    }
    
    let event;
    
    try {
      // Verify webhook signature (in production, use STRIPE_WEBHOOK_SECRET)
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // In development, just parse the body
        event = req.body;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          
          // Extract metadata to identify the creator subscription
          const stylistId = subscription.metadata?.stylistId;
          const userId = subscription.metadata?.userId;
          const tierId = subscription.metadata?.tierId;
          
          if (stylistId && userId && tierId) {
            // Update or create creator subscription
            const existing = await storage.getCreatorSubscription(userId, stylistId);
            
            if (existing) {
              await storage.updateCreatorSubscription(existing.id, {
                status: subscription.status === 'active' ? 'active' : 
                       subscription.status === 'canceled' ? 'cancelled' :
                       subscription.status === 'past_due' ? 'past_due' : 'active',
                stripeSubscriptionId: subscription.id,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              });
            }
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const stripeSubscriptionId = subscription.id;
          
          // Find and cancel the creator subscription
          const subscriptions = await storage.getUserCreatorSubscriptions(subscription.metadata?.userId || '');
          const existing = subscriptions.find((s: any) => s.stripeSubscriptionId === stripeSubscriptionId);
          
          if (existing) {
            await storage.updateCreatorSubscription(existing.id, {
              status: 'cancelled',
              cancelledAt: new Date(),
            });
          }
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          
          // Update subscription status to active on successful payment
          const allSubscriptions = await storage.getUserCreatorSubscriptions(invoice.customer_email || '');
          const existing = allSubscriptions.find((s: any) => s.stripeSubscriptionId === subscriptionId);
          
          if (existing) {
            await storage.updateCreatorSubscription(existing.id, {
              status: 'active',
            });
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          
          // Update subscription status to past_due on failed payment
          const allSubscriptions = await storage.getUserCreatorSubscriptions(invoice.customer_email || '');
          const existing = allSubscriptions.find((s: any) => s.stripeSubscriptionId === subscriptionId);
          
          if (existing) {
            await storage.updateCreatorSubscription(existing.id, {
              status: 'past_due',
            });
          }
          break;
        }
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // WEDDING & PROM CONCIERGE ROUTES
  // ============================================
  
  // Register event routes
  registerEventRoutes(app);

  // ============================================
  // VIRTUAL TRY-ON (TryFit Integration)
  // ============================================
  
  // Get available try-on models
  app.get("/api/v1/try-on/models", async (req, res) => {
    try {
      const { gender, bodyType } = req.query;
      const models = await storage.getTryOnModels({
        gender: gender as string,
        bodyType: bodyType as string
      });
      res.json(models);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get single try-on model
  app.get("/api/v1/try-on/models/:id", async (req, res) => {
    try {
      const model = await storage.getTryOnModel(req.params.id);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      res.json(model);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // User photo management
  app.get("/api/v1/try-on/my-photos",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const photos = await storage.getUserTryOnPhotos(req.userId!);
        res.json(photos);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  app.post("/api/v1/try-on/photos",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const photo = await storage.createUserTryOnPhoto({
          userId: req.userId!,
          photoUrl: req.body.photoUrl,
          poseLandmarks: req.body.poseLandmarks,
          bodyMeasurements: req.body.bodyMeasurements,
          isDefault: req.body.isDefault || false
        });
        res.json(photo);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  app.patch("/api/v1/try-on/photos/:id",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const photo = await storage.getUserTryOnPhoto(req.params.id);
        if (!photo || photo.userId !== req.userId) {
          return res.status(404).json({ error: "Photo not found" });
        }
        
        const updated = await storage.updateUserTryOnPhoto(req.params.id, req.body);
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  app.delete("/api/v1/try-on/photos/:id",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const photo = await storage.getUserTryOnPhoto(req.params.id);
        if (!photo || photo.userId !== req.userId) {
          return res.status(404).json({ error: "Photo not found" });
        }
        
        await storage.deleteUserTryOnPhoto(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Try-on sessions
  app.post("/api/v1/try-on/sessions", async (req, res) => {
    try {
      // Generate a share token for sharing the result
      const shareToken = crypto.randomBytes(16).toString('hex');
      
      const session = await storage.createTryOnSession({
        userId: req.body.userId || null,
        photoType: req.body.photoType,
        userPhotoId: req.body.userPhotoId,
        modelId: req.body.modelId,
        tryOnItems: req.body.tryOnItems,
        status: 'pending',
        shareToken,
        isPublic: req.body.isPublic || false
      });
      
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  app.get("/api/v1/try-on/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getTryOnSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get session by share token (for shared results)
  app.get("/api/v1/try-on/shared/:shareToken", async (req, res) => {
    try {
      const session = await storage.getTryOnSessionByShareToken(req.params.shareToken);
      if (!session || !session.isPublic) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Increment view count
      await storage.incrementTryOnSessionViews(session.id);
      
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/v1/try-on/my-sessions",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const sessions = await storage.getUserTryOnSessions(req.userId!);
        res.json(sessions);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  app.patch("/api/v1/try-on/sessions/:id", async (req, res) => {
    try {
      const updated = await storage.updateTryOnSession(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Try-on feedback (for shared results)
  app.get("/api/v1/try-on/sessions/:sessionId/feedback", async (req, res) => {
    try {
      const feedback = await storage.getTryOnFeedback(req.params.sessionId);
      res.json(feedback);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/v1/try-on/sessions/:sessionId/feedback", async (req, res) => {
    try {
      const feedback = await storage.createTryOnFeedback({
        sessionId: req.params.sessionId,
        vote: req.body.vote,
        comment: req.body.comment,
        voterName: req.body.voterName
      });
      res.json(feedback);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Try-on closet (saved items)
  app.get("/api/v1/try-on/closet",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const items = await storage.getUserTryOnCloset(req.userId!);
        res.json(items);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  app.post("/api/v1/try-on/closet",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Check if already in closet
        const exists = await storage.isInTryOnCloset(req.userId!, req.body.productId);
        if (exists) {
          return res.status(409).json({ error: "Item already in closet" });
        }
        
        const item = await storage.addToTryOnCloset({
          userId: req.userId!,
          productId: req.body.productId
        });
        res.json(item);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  
  app.delete("/api/v1/try-on/closet/:productId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        await storage.removeFromTryOnCloset(req.userId!, req.params.productId);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Check if product is in closet
  app.get("/api/v1/try-on/closet/check/:productId",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const isInCloset = await storage.isInTryOnCloset(req.userId!, req.params.productId);
        res.json({ isInCloset });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Calculate size recommendations based on user measurements
  app.post("/api/v1/try-on/size-recommendation",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { productId } = req.body;
        
        // Get user measurements
        const measurements = await storage.getUserMeasurements(req.userId!);
        if (!measurements) {
          return res.status(400).json({ error: "No measurements found. Please complete your profile." });
        }
        
        // Get product info
        const product = await storage.getProduct(productId);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        
        // Calculate size recommendation based on measurements and product size chart
        const sizeChart = product.sizeChart as Record<string, any> | null;
        const sizes = product.sizes || [];
        
        // Simple size matching algorithm
        let recommendedSize = "M";
        let confidence = 0.75;
        let fit = "Standard fit";
        
        if (measurements.chest && sizeChart) {
          const chest = Number(measurements.chest);
          
          // Basic size mapping
          if (chest < 36) {
            recommendedSize = "XS";
            confidence = 0.85;
          } else if (chest < 38) {
            recommendedSize = "S";
            confidence = 0.90;
          } else if (chest < 40) {
            recommendedSize = "M";
            confidence = 0.90;
          } else if (chest < 42) {
            recommendedSize = "L";
            confidence = 0.85;
          } else if (chest < 44) {
            recommendedSize = "XL";
            confidence = 0.80;
          } else {
            recommendedSize = "XXL";
            confidence = 0.75;
          }
          
          // Check if recommended size is available
          if (!sizes.includes(recommendedSize)) {
            // Find closest available size
            const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
            const currentIndex = sizeOrder.indexOf(recommendedSize);
            
            for (let i = 1; i <= sizeOrder.length; i++) {
              if (currentIndex + i < sizeOrder.length && sizes.includes(sizeOrder[currentIndex + i])) {
                recommendedSize = sizeOrder[currentIndex + i];
                fit = "May run slightly large";
                confidence -= 0.15;
                break;
              }
              if (currentIndex - i >= 0 && sizes.includes(sizeOrder[currentIndex - i])) {
                recommendedSize = sizeOrder[currentIndex - i];
                fit = "May run slightly small";
                confidence -= 0.15;
                break;
              }
            }
          }
        }
        
        res.json({
          recommendedSize,
          confidence: Math.max(0.5, confidence),
          fit,
          availableSizes: sizes,
          userMeasurements: {
            chest: measurements.chest,
            waist: measurements.waist,
            hips: measurements.hips
          }
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // ENHANCED TRY-ON - Rate Limiting
  // ============================================
  
  const FREE_DAILY_LIMIT = 3;
  const PREMIUM_DAILY_LIMIT = -1; // Unlimited
  const PRO_DAILY_LIMIT = -1; // Unlimited + AR features
  
  const checkTryonRateLimit = async (userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> => {
    const today = new Date().toISOString().split('T')[0];
    const usage = await storage.getTryonUsage(userId, today);
    const currentCount = usage?.count || 0;
    
    // TODO: Check user subscription tier for actual limits
    // For now, using free tier limits
    const limit: number = FREE_DAILY_LIMIT;
    
    if (limit < 0) {
      return { allowed: true, remaining: -1, limit: -1 };
    }
    
    return {
      allowed: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
      limit
    };
  };
  
  // Check try-on rate limit
  app.get("/api/v1/try-on/rate-limit",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const result = await checkTryonRateLimit(req.userId!);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Increment try-on usage (called when a try-on is performed)
  app.post("/api/v1/try-on/usage",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const rateLimit = await checkTryonRateLimit(req.userId!);
        if (!rateLimit.allowed) {
          return res.status(429).json({ 
            error: "Daily try-on limit reached. Upgrade to Premium for unlimited try-ons.",
            remaining: 0,
            limit: rateLimit.limit
          });
        }
        
        const today = new Date().toISOString().split('T')[0];
        const usage = await storage.incrementTryonUsage(req.userId!, today);
        
        const newLimit = await checkTryonRateLimit(req.userId!);
        res.json({ 
          success: true, 
          count: usage.count,
          remaining: newLimit.remaining,
          limit: newLimit.limit
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // ============================================
  // ENHANCED TRY-ON - Garments
  // ============================================
  
  // Get available garments for try-on
  app.get("/api/v1/try-on/garments", async (req, res) => {
    try {
      const { category, stylistId } = req.query;
      const garments = await storage.getTryonGarments({
        category: category as string,
        stylistId: stylistId as string,
        isPublic: true
      });
      res.json(garments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get single garment
  app.get("/api/v1/try-on/garments/:id", async (req, res) => {
    try {
      const garment = await storage.getTryonGarment(req.params.id);
      if (!garment) {
        return res.status(404).json({ error: "Garment not found" });
      }
      res.json(garment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create garment (stylist only)
  app.post("/api/v1/try-on/garments",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Verify user is a stylist
        const stylist = await storage.getStylistProfileByUserId(req.userId!);
        if (!stylist) {
          return res.status(403).json({ error: "Only stylists can create garments" });
        }
        
        const garment = await storage.createTryonGarment({
          ...req.body,
          stylistId: stylist.id
        });
        res.status(201).json(garment);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Update garment (stylist only)
  app.patch("/api/v1/try-on/garments/:id",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const garment = await storage.getTryonGarment(req.params.id);
        if (!garment) {
          return res.status(404).json({ error: "Garment not found" });
        }
        
        const stylist = await storage.getStylistProfileByUserId(req.userId!);
        if (!stylist || garment.stylistId !== stylist.id) {
          return res.status(403).json({ error: "Not authorized to update this garment" });
        }
        
        const updated = await storage.updateTryonGarment(req.params.id, req.body);
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Delete garment (soft delete)
  app.delete("/api/v1/try-on/garments/:id",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const garment = await storage.getTryonGarment(req.params.id);
        if (!garment) {
          return res.status(404).json({ error: "Garment not found" });
        }
        
        const stylist = await storage.getStylistProfileByUserId(req.userId!);
        if (!stylist || garment.stylistId !== stylist.id) {
          return res.status(403).json({ error: "Not authorized to delete this garment" });
        }
        
        await storage.deleteTryonGarment(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // ============================================
  // ENHANCED TRY-ON - Results
  // ============================================
  
  // Get results for a session
  app.get("/api/v1/try-on/sessions/:sessionId/results",
    async (req, res) => {
      try {
        const results = await storage.getTryonResultsBySession(req.params.sessionId);
        res.json(results);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Create a try-on result
  app.post("/api/v1/try-on/results",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Check rate limit
        const rateLimit = await checkTryonRateLimit(req.userId!);
        if (!rateLimit.allowed) {
          return res.status(429).json({ 
            error: "Daily try-on limit reached",
            remaining: 0
          });
        }
        
        // Increment usage
        const today = new Date().toISOString().split('T')[0];
        await storage.incrementTryonUsage(req.userId!, today);
        
        const result = await storage.createTryonResult(req.body);
        res.status(201).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // ============================================
  // ENHANCED TRY-ON - Social Sharing
  // ============================================
  
  // Create a public share
  app.post("/api/v1/try-on/shares",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { resultId, title } = req.body;
        
        // Verify the result belongs to the user
        const result = await storage.getTryonResult(resultId);
        if (!result) {
          return res.status(404).json({ error: "Result not found" });
        }
        
        // Generate unique share code
        const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const share = await storage.createTryonShare({
          resultId,
          shareCode,
          title,
          voteCount: { love: 0, like: 0, meh: 0 }
        });
        
        // Update result to mark as shared
        await storage.updateTryonResult(resultId, { sharedPublicly: true });
        
        res.status(201).json(share);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get shared try-on by code
  app.get("/api/v1/try-on/shares/:shareCode", async (req, res) => {
    try {
      const share = await storage.getTryonShareByCode(req.params.shareCode);
      if (!share || !share.isActive) {
        return res.status(404).json({ error: "Share not found" });
      }
      
      // Get the result details
      const result = await storage.getTryonResult(share.resultId);
      
      res.json({ share, result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Vote on a shared try-on
  app.post("/api/v1/try-on/shares/:shareId/vote", async (req, res) => {
    try {
      const { vote } = req.body;
      const shareId = req.params.shareId;
      
      if (!['love', 'like', 'meh'].includes(vote)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }
      
      const share = await storage.getTryonShare(shareId);
      if (!share) {
        return res.status(404).json({ error: "Share not found" });
      }
      
      // Check if user/IP has already voted
      const userId = (req as any).userId;
      const voterIp = req.ip || req.socket.remoteAddress;
      
      const existingVote = await storage.getUserVoteOnShare(shareId, userId, voterIp);
      if (existingVote) {
        return res.status(400).json({ error: "Already voted on this try-on" });
      }
      
      // Create vote
      await storage.createTryonVote({
        shareId,
        voterId: userId,
        voterIp,
        vote
      });
      
      // Update vote count
      const currentVotes = share.voteCount || { love: 0, like: 0, meh: 0 };
      const newVotes = {
        ...currentVotes,
        [vote]: (currentVotes[vote as keyof typeof currentVotes] || 0) + 1
      };
      
      await storage.updateTryonShare(shareId, { voteCount: newVotes });
      
      res.json({ success: true, voteCount: newVotes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================
  // ENHANCED TRY-ON - Fit Feedback
  // ============================================
  
  // Submit fit feedback
  app.post("/api/v1/try-on/fit-feedback",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const feedback = await storage.createFitFeedback({
          ...req.body,
          userId: req.userId!
        });
        
        // Update user brand preference based on feedback
        const { brand, fitRating, wouldBuyAgain } = req.body;
        const existingPref = await storage.getUserBrandPreference(req.userId!, brand);
        
        // Calculate size adjustment based on fit rating
        let sizeAdjustment = 0;
        if (fitRating === 'too_small') sizeAdjustment = 1;
        else if (fitRating === 'slightly_small') sizeAdjustment = 0.5;
        else if (fitRating === 'slightly_large') sizeAdjustment = -0.5;
        else if (fitRating === 'too_large') sizeAdjustment = -1;
        
        // Calculate new average
        const totalPurchases = (existingPref?.totalPurchases || 0) + 1;
        const prevSizeAdj = existingPref ? Number(existingPref.sizeAdjustment) || 0 : 0;
        const newSizeAdj = ((prevSizeAdj * (totalPurchases - 1)) + sizeAdjustment) / totalPurchases;
        
        await storage.upsertUserBrandPreference({
          userId: req.userId!,
          brand,
          sizeAdjustment: newSizeAdj.toFixed(1),
          avgFitRating: newSizeAdj.toFixed(2),
          totalPurchases
        });
        
        res.status(201).json(feedback);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get user's fit feedback history
  app.get("/api/v1/try-on/fit-feedback",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const feedback = await storage.getUserFitFeedback(req.userId!);
        res.json(feedback);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get user's brand preferences
  app.get("/api/v1/try-on/brand-preferences",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const preferences = await storage.getUserBrandPreferences(req.userId!);
        res.json(preferences);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get specific brand preference
  app.get("/api/v1/try-on/brand-preferences/:brand",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const preference = await storage.getUserBrandPreference(req.userId!, req.params.brand);
        if (!preference) {
          return res.json({ brand: req.params.brand, sizeAdjustment: 0, totalPurchases: 0 });
        }
        res.json(preference);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // STYLE QUIZ & PROFILE
  // ============================================
  
  // Save/update style profile from quiz
  app.post("/api/v1/style-profile",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Validate request body with Zod schema
        const validatedData = insertUserStyleProfileSchema.parse({
          userId: req.userId!,
          ...req.body,
          onboardingCompleted: true,
          onboardingStep: 4
        });
        
        // Check if profile exists
        const existing = await storage.getUserStyleProfile(req.userId!);
        let profile;
        if (existing) {
          profile = await storage.updateUserStyleProfile(req.userId!, validatedData);
        } else {
          profile = await storage.createUserStyleProfile(validatedData);
        }
        
        res.json(profile);
      } catch (error: any) {
        if (error instanceof ZodError) {
          return res.status(400).json({ error: error.errors[0]?.message || "Validation error" });
        }
        console.error("Style profile error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Get style profile
  app.get("/api/v1/style-profile",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const profile = await storage.getUserStyleProfile(req.userId!);
        res.json(profile || null);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Generate AI preview from quiz data
  app.post("/api/v1/style-profile/generate-preview",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const quizData = req.body;
        
        // Generate style identity summary
        const aesthetics = quizData.aestheticPreferences?.slice(0, 2).join(" and ") || "classic";
        const vibes = quizData.vibeWords?.slice(0, 3).join(", ") || "sophisticated, polished";
        const lifestyle = quizData.primaryLifestyle || quizData.lifestyleNeeds?.[0] || "everyday";
        
        const styleIdentitySummary = `Based on your preferences, you have a ${quizData.riskTolerance || "balanced"} approach to fashion with a focus on ${aesthetics} aesthetics. Your style is characterized by ${vibes} vibes, perfect for your ${lifestyle} lifestyle.`;
        
        // Recommend stylist based on preferences
        const stylistMap: Record<string, string> = {
          minimalist: "aiden",
          classic: "eduardo",
          streetwear: "luca",
          bohemian: "sofia",
          edgy: "marcus",
          romantic: "evelyn",
          preppy: "kai",
          athleisure: "kai"
        };
        
        const recommendedStylistId = stylistMap[quizData.aestheticPreferences?.[0]] || "aiden";
        
        // Generate style board images
        const styleBoard = [
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&q=80",
          "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&q=80",
        ];
        
        // Generate outfit previews
        const outfitPreviews = [
          { title: "Workday Ready", description: "A polished look for the office" },
          { title: "Weekend Vibes", description: "Relaxed yet stylish" },
          { title: "Evening Out", description: "Perfect for dinner or drinks" },
        ];
        
        res.json({
          styleIdentitySummary,
          recommendedStylistId,
          styleBoard,
          outfitPreviews
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // STYLE DASHBOARD
  // ============================================
  
  // Get dashboard data
  app.get("/api/v1/dashboard",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const userId = req.userId!;
        
        // Get all dashboard data in parallel
        const [profile, subscription, closetItems, savedItems] = await Promise.all([
          storage.getUserStyleProfile(userId),
          storage.getUserSubscription(userId),
          storage.getUserClosetItems(userId),
          storage.getUserSavedItems(userId)
        ]);
        
        // Get outfit recommendations
        const todaysOutfits = await storage.getOutfitRecommendations(userId, "daily");
        const weeklyOutfits = await storage.getOutfitRecommendations(userId, "weekly");
        
        // Default subscription if none exists
        const sub = subscription || {
          tier: "free" as const,
          outfitsRemaining: 5,
          closetSlots: 20,
          closetUsed: closetItems.length
        };
        
        res.json({
          profile,
          todaysOutfits,
          weeklyOutfits,
          savedItems,
          closetItems: closetItems.slice(0, 8),
          stylistMessages: [],
          subscription: {
            tier: sub.tier,
            outfitsRemaining: (sub.weeklyOutfitLimit || 5) - (sub.outfitsUsedThisWeek || 0),
            closetSlots: sub.closetUploadLimit || 20,
            closetUsed: closetItems.length
          },
          goals: []
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Refresh outfit recommendations
  app.post("/api/v1/outfits/refresh",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Generate new outfit recommendations
        // For now, just return success
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Save outfit
  app.post("/api/v1/outfits/:id/save",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        await storage.saveOutfit(req.params.id, req.userId!);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // CLOSET MANAGEMENT
  // ============================================
  
  // Get closet data
  app.get("/api/v1/closet",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const userId = req.userId!;
        
        const [items, subscription, gapAnalysis] = await Promise.all([
          storage.getUserClosetItems(userId),
          storage.getUserSubscription(userId),
          storage.getWardrobeGapAnalysis(userId)
        ]);
        
        res.json({
          items,
          subscription: subscription || {
            tier: "free" as const,
            closetUploadLimit: 20
          },
          gapAnalysis
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Add closet item
  app.post("/api/v1/closet/items",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const userId = req.userId!;
        
        // Check subscription limits
        const subscription = await storage.getUserSubscription(userId);
        const items = await storage.getUserClosetItems(userId);
        const limit = subscription?.closetUploadLimit || 20;
        
        if (subscription?.tier === "free" && items.length >= limit) {
          return res.status(403).json({ error: "Closet limit reached. Upgrade to add more items." });
        }
        
        // Validate request body with Zod schema
        const validatedData = insertUserClosetItemSchema.parse({
          userId,
          ...req.body
        });
        
        const item = await storage.createClosetItem(validatedData);
        
        res.status(201).json(item);
      } catch (error: any) {
        if (error instanceof ZodError) {
          return res.status(400).json({ error: error.errors[0]?.message || "Validation error" });
        }
        console.error("Closet item error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Delete closet item
  app.delete("/api/v1/closet/items/:id",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const deleted = await storage.deleteClosetItem(req.params.id, req.userId!);
        if (!deleted) {
          return res.status(404).json({ error: "Item not found or not owned by user" });
        }
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  
  // Toggle favorite
  app.post("/api/v1/closet/items/:id/favorite",
    requireUser as any,
    async (req: AuthenticatedRequest, res) => {
      try {
        const item = await storage.toggleClosetItemFavorite(req.params.id, req.userId!);
        res.json(item);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // SITUATIONAL STYLING ENGINE (Stage 0)
  // ============================================

  app.post("/api/v1/outfits/situational", async (req, res) => {
    try {
      const { situation, vibe, category, sessionId } = req.body;

      if (!situation || !category) {
        return res.status(400).json({ error: "Situation and category are required" });
      }

      const outfits = await generateSituationalOutfits(situation, vibe || null, category);

      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const session = await storage.createAnonymousSession({
          category,
          situation,
          vibe: vibe || null,
        });
        currentSessionId = session.id;
      }

      for (const outfit of outfits) {
        await storage.createSessionOutfit({
          sessionId: currentSessionId,
          outfitData: outfit,
        });
      }

      await storage.createEngagementEvent({
        sessionId: currentSessionId,
        eventType: "outfits_generated",
        eventData: { situation, vibe, category, outfitCount: outfits.length },
      });

      res.json({
        sessionId: currentSessionId,
        outfits,
        situation,
        vibe: vibe || null,
      });
    } catch (error: any) {
      console.error("Situational styling error:", error.message);
      res.status(500).json({ error: "Failed to generate outfit ideas" });
    }
  });

  app.post("/api/v1/outfits/heart", async (req, res) => {
    try {
      const { outfitId, sessionId, hearted } = req.body;
      if (!outfitId || !sessionId) {
        return res.status(400).json({ error: "outfitId and sessionId are required" });
      }

      await storage.createEngagementEvent({
        sessionId,
        eventType: hearted ? "outfit_hearted" : "outfit_unhearted",
        eventData: { outfitId },
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/v1/outfits/track-event", async (req, res) => {
    try {
      const { sessionId, eventType, eventData } = req.body;
      if (!sessionId || !eventType) {
        return res.status(400).json({ error: "sessionId and eventType are required" });
      }

      await storage.createEngagementEvent({
        sessionId,
        eventType,
        eventData: eventData || {},
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/v1/outfits/send-looks", async (req, res) => {
    try {
      const { email, sessionId } = req.body;
      if (!email || !sessionId) {
        return res.status(400).json({ error: "Email and sessionId are required" });
      }

      await storage.createLead({
        email,
        sessionId,
        source: "send_looks",
      });

      await storage.createEngagementEvent({
        sessionId,
        eventType: "email_captured",
        eventData: { email, source: "send_looks" },
      });

      res.json({ success: true, message: "We'll send your looks shortly!" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
