/**
 * Wedding & Prom Concierge API Routes
 */

import { type Express } from "express";
import { db } from "../db";
import { events, eventImageReferences, eventCustomRequests, voiceLogs, users, makers, quotes } from "@shared/schema";
import { insertEventSchema, insertEventImageReferenceSchema, insertEventCustomRequestSchema, insertVoiceLogSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { createEtsyClient } from "../services/etsyClient";

// Simple auth middleware for event routes (to be enhanced with proper session-based auth)
function requireAuth(req: any, res: any, next: any) {
  const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required. Please provide userId." });
  }
  
  req.userId = userId;
  next();
}

// Verify event ownership
async function verifyEventOwnership(req: any, res: any, next: any) {
  const eventId = req.params.eventId;
  const userId = req.userId;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId));

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (event.userId !== userId) {
    return res.status(403).json({ error: "Unauthorized: You don't own this event" });
  }

  req.event = event;
  next();
}

export function registerEventRoutes(app: Express) {
  
  // ============================================
  // EVENT MANAGEMENT
  // ============================================

  // Create a new event
  app.post("/api/v1/events", requireAuth, async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        userId: req.userId, // Enforce authenticated user
      });
      const [event] = await db.insert(events).values(eventData).returning();
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's events
  app.get("/api/v1/users/:userId/events", requireAuth, async (req: any, res) => {
    try {
      // Ensure user can only access their own events
      if (req.params.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const userEvents = await db
        .select()
        .from(events)
        .where(eq(events.userId, req.params.userId));
      res.json(userEvents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get event by ID with all related data
  app.get("/api/v1/events/:eventId", requireAuth, verifyEventOwnership, async (req: any, res) => {
    try {
      const event = req.event; // From middleware

      // Get related images
      const images = await db
        .select()
        .from(eventImageReferences)
        .where(eq(eventImageReferences.eventId, req.params.eventId));

      // Get related custom requests
      const customRequests = await db
        .select()
        .from(eventCustomRequests)
        .where(eq(eventCustomRequests.eventId, req.params.eventId));

      res.json({
        ...event,
        images,
        customRequests,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update event
  app.patch("/api/v1/events/:eventId", requireAuth, verifyEventOwnership, async (req: any, res) => {
    try {
      // Use partial schema to validate only provided fields
      const updateData = insertEventSchema.partial().parse(req.body);
      
      // Remove fields that shouldn't be updated
      const { userId, ...safeUpdate } = updateData as any;

      const [updated] = await db
        .update(events)
        .set({ ...safeUpdate, updatedAt: new Date() })
        .where(eq(events.id, req.params.eventId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // EVENT IMAGES
  // ============================================

  // Add image reference to event
  app.post("/api/v1/events/:eventId/images", requireAuth, verifyEventOwnership, async (req: any, res) => {
    try {
      const imageData = insertEventImageReferenceSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });

      const [image] = await db.insert(eventImageReferences).values(imageData).returning();
      res.json(image);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get event images
  app.get("/api/v1/events/:eventId/images", requireAuth, verifyEventOwnership, async (req: any, res) => {
    try {
      const images = await db
        .select()
        .from(eventImageReferences)
        .where(eq(eventImageReferences.eventId, req.params.eventId));
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete event image
  app.delete("/api/v1/events/images/:imageId", requireAuth, async (req: any, res) => {
    try {
      // Verify image ownership through event
      const [image] = await db
        .select()
        .from(eventImageReferences)
        .where(eq(eventImageReferences.id, req.params.imageId));

      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Verify event ownership
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, image.eventId));

      if (!event || event.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await db
        .delete(eventImageReferences)
        .where(eq(eventImageReferences.id, req.params.imageId));
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // EVENT CUSTOM REQUESTS
  // ============================================

  // Create custom request for event
  app.post("/api/v1/events/:eventId/custom-requests", requireAuth, verifyEventOwnership, async (req: any, res) => {
    try {
      const requestData = insertEventCustomRequestSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        userId: req.userId, // Enforce authenticated user
      });

      const [request] = await db.insert(eventCustomRequests).values(requestData).returning();
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get event custom requests with quotes
  app.get("/api/v1/events/:eventId/custom-requests", requireAuth, verifyEventOwnership, async (req: any, res) => {
    try {
      const requests = await db
        .select()
        .from(eventCustomRequests)
        .where(and(
          eq(eventCustomRequests.eventId, req.params.eventId),
          eq(eventCustomRequests.userId, req.userId) // Ensure user owns these requests
        ));

      // Get quotes for each request
      const requestsWithQuotes = await Promise.all(
        requests.map(async (request: any) => {
          const requestQuotes = await db
            .select()
            .from(quotes)
            .where(eq(quotes.requestId, request.id));
          return { ...request, quotes: requestQuotes };
        })
      );

      res.json(requestsWithQuotes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // VOICE LOGS
  // ============================================

  // Create voice log
  app.post("/api/v1/voice-logs", requireAuth, async (req: any, res) => {
    try {
      const voiceData = insertVoiceLogSchema.parse({
        ...req.body,
        userId: req.userId, // Enforce authenticated user
      });
      const [log] = await db.insert(voiceLogs).values(voiceData).returning();
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's voice logs
  app.get("/api/v1/users/:userId/voice-logs", requireAuth, async (req: any, res) => {
    try {
      // Ensure user can only access their own voice logs
      if (req.params.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const logs = await db
        .select()
        .from(voiceLogs)
        .where(eq(voiceLogs.userId, req.params.userId));
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // EVENT PRODUCT SEARCH (Etsy Integration)
  // ============================================

  // Search wedding dresses on Etsy
  app.post("/api/v1/events/:eventId/search/wedding-dresses", requireAuth, verifyEventOwnership, async (req: any, res) => {
    try {
      const etsyClient = createEtsyClient();
      
      if (!etsyClient) {
        // Graceful degradation - return empty results with helpful message
        return res.json({ 
          source: "etsy",
          count: 0,
          products: [],
          message: "Etsy integration not configured. Set ETSY_API_KEY to enable retail product search.",
          etsyEnabled: false
        });
      }

      const { budget, style, size } = req.body;

      try {
        const listings = await etsyClient.searchWeddingDresses({
          budget,
          style: style || [],
          size,
        });

        res.json({
          source: "etsy",
          count: listings.length,
          products: listings.map((listing) => ({
            id: listing.listing_id,
            title: listing.title,
            price: listing.price.amount / listing.price.divisor,
            currency: listing.price.currency_code,
            url: listing.url,
            images: listing.images?.map((img) => img.url_570xN) || [],
            shop: listing.shop.shop_name,
            tags: listing.tags,
          })),
          etsyEnabled: true
        });
      } catch (etsyError: any) {
        // Graceful fallback on Etsy API errors
        console.error("Etsy API error:", etsyError.message);
        res.json({
          source: "etsy",
          count: 0,
          products: [],
          message: "Etsy search temporarily unavailable. Please try again later.",
          etsyEnabled: true,
          error: etsyError.message
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search prom dresses on Etsy
  app.post("/api/v1/events/:eventId/search/prom-dresses", async (req, res) => {
    try {
      const etsyClient = createEtsyClient();
      
      if (!etsyClient) {
        return res.status(503).json({ 
          error: "Etsy integration not configured" 
        });
      }

      const { budget, style, colorScheme } = req.body;

      const listings = await etsyClient.searchPromDresses({
        budget,
        style: style || [],
        colorScheme: colorScheme || [],
      });

      res.json({
        source: "etsy",
        count: listings.length,
        products: listings.map((listing) => ({
          id: listing.listing_id,
          title: listing.title,
          price: listing.price.amount / listing.price.divisor,
          currency: listing.price.currency_code,
          url: listing.url,
          images: listing.images?.map((img) => img.url_570xN) || [],
          shop: listing.shop.shop_name,
          tags: listing.tags,
        })),
      });
    } catch (error: any) {
      console.error("Etsy prom dress search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Search formal suits/tuxedos on Etsy
  app.post("/api/v1/events/:eventId/search/formal-suits", async (req, res) => {
    try {
      const etsyClient = createEtsyClient();
      
      if (!etsyClient) {
        return res.status(503).json({ 
          error: "Etsy integration not configured" 
        });
      }

      const { budget, style, occasion } = req.body;

      const listings = await etsyClient.searchFormalSuits({
        budget,
        style: style || [],
        occasion: occasion || 'formal',
      });

      res.json({
        source: "etsy",
        count: listings.length,
        products: listings.map((listing) => ({
          id: listing.listing_id,
          title: listing.title,
          price: listing.price.amount / listing.price.divisor,
          currency: listing.price.currency_code,
          url: listing.url,
          images: listing.images?.map((img) => img.url_570xN) || [],
          shop: listing.shop.shop_name,
          tags: listing.tags,
        })),
      });
    } catch (error: any) {
      console.error("Etsy formal suit search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generic event product search
  app.post("/api/v1/events/:eventId/search", async (req, res) => {
    try {
      const etsyClient = createEtsyClient();
      
      if (!etsyClient) {
        return res.status(503).json({ 
          error: "Etsy integration not configured" 
        });
      }

      const { keywords, category, minPrice, maxPrice, tags, limit } = req.body;

      const listings = await etsyClient.searchListings({
        keywords,
        category,
        minPrice,
        maxPrice,
        tags: tags || [],
        limit: limit || 25,
      });

      res.json({
        source: "etsy",
        count: listings.length,
        products: listings.map((listing) => ({
          id: listing.listing_id,
          title: listing.title,
          price: listing.price.amount / listing.price.divisor,
          currency: listing.price.currency_code,
          url: listing.url,
          images: listing.images?.map((img) => img.url_570xN) || [],
          shop: listing.shop.shop_name,
          tags: listing.tags,
        })),
      });
    } catch (error: any) {
      console.error("Etsy product search error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
