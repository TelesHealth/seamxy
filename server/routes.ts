import type { Express } from "express";
import { storage } from "./storage";
import { 
  analyzeStyleDescription, 
  calculateProductScores, 
  generateAiStylistResponse 
} from "./services/openai";
import { requireUser, requireAdmin, requireRole, type AuthenticatedRequest } from "./middleware/auth";
import { 
  insertUserSchema, insertMeasurementSchema, insertProductSchema,
  insertMakerSchema, insertCustomRequestSchema, insertQuoteSchema, insertOrderSchema,
  insertAdminUserSchema, insertPricingConfigSchema, insertAiChatSessionSchema
} from "@shared/schema";

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

  // ============================================
  // MARKETPLACE - MAKER ROUTES
  // ============================================

  // Get all makers
  app.get("/api/v1/makers", async (req, res) => {
    const { verified } = req.query;
    const makers = await storage.getMakers({
      verified: verified === 'true'
    });
    res.json(makers);
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
}
