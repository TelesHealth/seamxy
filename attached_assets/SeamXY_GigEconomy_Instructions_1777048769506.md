# SeamXY — Gig Economy Layer
## Replit Agent Instructions: Local Service Providers Feature

These instructions add a gig economy layer to SeamXY — enabling local seamstresses,
tailors, and alteration specialists to offer services directly to nearby customers.
Follow each phase in order. Do not skip steps. Confirm each phase before starting the next.

---

## WHAT WE ARE BUILDING

A lightweight "TaskRabbit for fashion alterations" embedded inside SeamXY.
A local seamstress can list her services (hemming, zipper repair, fittings) with
prices and availability. When a user has a fit problem with something they bought,
SeamXY matches them to a nearby service provider automatically.

Three provider types will exist side by side:
- **Gig** — Local alterations/repairs. Location-based. No subscription required.
- **Maker** — Custom pieces. Ships to customer. Current model.
- **Creator** — Stylists and designers. Current model.

---

## PHASE 1: Database Schema Changes

### Step 1.1 — Open `shared/schema.ts`

Add these new tables at the end of the file, before the closing exports.

**IMPORTANT:** Check what the makers/suppliers table is actually called in the existing
schema before writing foreign key references. Use the correct table name.

```typescript
// ── Gig Service Types (enum) ──────────────────────────────────────
export const gigServiceTypeEnum = pgEnum("gig_service_type", [
  "hemming",
  "taking_in",
  "letting_out",
  "zipper_repair",
  "zipper_replacement",
  "button_repair",
  "lining_repair",
  "dress_fitting",
  "suit_alterations",
  "trouser_alterations",
  "sleeve_alterations",
  "general_alterations",
  "custom_embroidery",
  "patch_work",
  "clothing_repair",
  "other",
]);

// ── Gig Provider Profiles ─────────────────────────────────────────
export const gigProviders = pgTable("gig_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Identity
  displayName: varchar("display_name", { length: 100 }).notNull(),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone", { length: 20 }),

  // Location
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull().default("US"),
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  serviceRadiusMiles: integer("service_radius_miles").notNull().default(10),

  // Service preferences
  offersHomeVisits: boolean("offers_home_visits").notNull().default(false),
  offersDropOff: boolean("offers_drop_off").notNull().default(true),
  offersShipping: boolean("offers_shipping").notNull().default(false),

  // Status
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),

  // Ratings (calculated)
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").notNull().default(0),
  completedJobs: integer("completed_jobs").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Gig Services Offered ──────────────────────────────────────────
export const gigServices = pgTable("gig_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),

  serviceType: gigServiceTypeEnum("service_type").notNull(),
  customName: varchar("custom_name", { length: 100 }), // override for "other" type
  description: text("description"),

  // Pricing
  priceMin: integer("price_min").notNull(), // in cents
  priceMax: integer("price_max").notNull(), // in cents
  priceUnit: varchar("price_unit", { length: 20 }).notNull().default("per_item"), // per_item | per_hour

  // Turnaround
  turnaroundDaysMin: integer("turnaround_days_min").notNull().default(1),
  turnaroundDaysMax: integer("turnaround_days_max").notNull().default(5),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Gig Provider Availability ─────────────────────────────────────
export const gigAvailability = pgTable("gig_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),

  // 0=Sunday, 1=Monday ... 6=Saturday
  dayOfWeek: integer("day_of_week").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  timeStart: varchar("time_start", { length: 5 }).default("09:00"), // HH:MM
  timeEnd: varchar("time_end", { length: 5 }).default("17:00"),     // HH:MM
});

// ── Gig Job Requests ──────────────────────────────────────────────
export const gigJobs = pgTable("gig_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").references(() => gigProviders.id, { onDelete: "set null" }),

  // What needs doing
  serviceType: gigServiceTypeEnum("service_type").notNull(),
  garmentDescription: text("garment_description").notNull(),
  alterationDetails: text("alteration_details").notNull(),
  garmentImageUrl: varchar("garment_image_url"), // photo of the garment

  // Connected to a purchase (optional)
  productId: integer("product_id"), // if alteration is for a specific product

  // Delivery preference
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull().default("drop_off"), // drop_off | home_visit | shipping

  // Budget
  budgetMin: integer("budget_min"), // in cents
  budgetMax: integer("budget_max"), // in cents

  // Timeline
  neededBy: timestamp("needed_by"),
  scheduledAt: timestamp("scheduled_at"),

  // Status flow: open → quoted → accepted → in_progress → completed → reviewed
  status: varchar("status", { length: 20 }).notNull().default("open"),

  // Agreed price (after quote accepted)
  agreedPrice: integer("agreed_price"), // in cents
  platformFee: integer("platform_fee"), // in cents (12% of agreed price)

  // Customer location for matching
  customerCity: varchar("customer_city", { length: 100 }),
  customerLat: decimal("customer_lat", { precision: 10, scale: 7 }),
  customerLng: decimal("customer_lng", { precision: 10, scale: 7 }),

  // Stripe payment intent
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Gig Quotes ────────────────────────────────────────────────────
export const gigQuotes = pgTable("gig_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => gigJobs.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),

  price: integer("price").notNull(), // in cents
  turnaroundDays: integer("turnaround_days").notNull(),
  message: text("message"),

  // accepted | rejected | expired | pending
  status: varchar("status", { length: 20 }).notNull().default("pending"),

  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Gig Messages ──────────────────────────────────────────────────
export const gigMessages = pgTable("gig_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => gigJobs.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"), // for sending photos of garment progress
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Gig Reviews ───────────────────────────────────────────────────
export const gigReviews = pgTable("gig_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => gigJobs.id, { onDelete: "cascade" }).unique(),
  customerId: varchar("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").notNull().references(() => gigProviders.id, { onDelete: "cascade" }),

  rating: integer("rating").notNull(), // 1-5
  reviewText: text("review_text"),

  // Specific ratings
  qualityRating: integer("quality_rating"),    // 1-5
  speedRating: integer("speed_rating"),        // 1-5
  communicationRating: integer("communication_rating"), // 1-5

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Step 1.2 — Push schema to database

```bash
npm run db:push
```

Confirm it completes without errors.

---

## PHASE 2: Storage Methods

Open `server/storage.ts` and add these methods to the existing storage class.
Add them at the end of the class, before the closing brace.

```typescript
// ── Gig Providers ─────────────────────────────────────────────────

async createGigProvider(data: {
  userId: string;
  displayName: string;
  bio?: string;
  city: string;
  state?: string;
  country?: string;
  locationLat?: string;
  locationLng?: string;
  serviceRadiusMiles?: number;
  offersHomeVisits?: boolean;
  offersDropOff?: boolean;
  offersShipping?: boolean;
}) {
  const [provider] = await db.insert(gigProviders).values(data).returning();
  return provider;
}

async getGigProviderByUserId(userId: string) {
  const [provider] = await db
    .select()
    .from(gigProviders)
    .where(eq(gigProviders.userId, userId));
  return provider || null;
}

async getGigProviderById(id: string) {
  const [provider] = await db
    .select()
    .from(gigProviders)
    .where(eq(gigProviders.id, id));
  return provider || null;
}

async updateGigProvider(id: string, userId: string, data: Partial<typeof gigProviders.$inferInsert>) {
  const [updated] = await db
    .update(gigProviders)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(gigProviders.id, id), eq(gigProviders.userId, userId)))
    .returning();
  return updated;
}

// Search providers by city (simple text match for MVP)
// In a future iteration, use PostGIS for proper radius search
async searchGigProviders(filters: {
  city?: string;
  serviceType?: string;
  offersHomeVisits?: boolean;
  offersShipping?: boolean;
}) {
  let query = db
    .select({
      provider: gigProviders,
      services: sql<any[]>`
        array_agg(
          json_build_object(
            'id', ${gigServices.id},
            'serviceType', ${gigServices.serviceType},
            'customName', ${gigServices.customName},
            'priceMin', ${gigServices.priceMin},
            'priceMax', ${gigServices.priceMax},
            'turnaroundDaysMin', ${gigServices.turnaroundDaysMin},
            'turnaroundDaysMax', ${gigServices.turnaroundDaysMax}
          )
        ) filter (where ${gigServices.id} is not null)
      `,
    })
    .from(gigProviders)
    .leftJoin(gigServices, and(
      eq(gigServices.providerId, gigProviders.id),
      eq(gigServices.isActive, true)
    ))
    .where(eq(gigProviders.isActive, true))
    .groupBy(gigProviders.id);

  const results = await query;

  // Client-side filter by city if provided (case-insensitive)
  if (filters.city) {
    return results.filter(r =>
      r.provider.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }

  return results;
}

// ── Gig Services ──────────────────────────────────────────────────

async addGigService(providerId: string, data: {
  serviceType: string;
  customName?: string;
  description?: string;
  priceMin: number;
  priceMax: number;
  priceUnit?: string;
  turnaroundDaysMin: number;
  turnaroundDaysMax: number;
}) {
  const [service] = await db.insert(gigServices).values({
    providerId,
    ...data,
  }).returning();
  return service;
}

async updateGigService(id: string, providerId: string, data: any) {
  const [updated] = await db
    .update(gigServices)
    .set(data)
    .where(and(eq(gigServices.id, id), eq(gigServices.providerId, providerId)))
    .returning();
  return updated;
}

async deleteGigService(id: string, providerId: string) {
  await db
    .update(gigServices)
    .set({ isActive: false })
    .where(and(eq(gigServices.id, id), eq(gigServices.providerId, providerId)));
}

async getProviderServices(providerId: string) {
  return db
    .select()
    .from(gigServices)
    .where(and(
      eq(gigServices.providerId, providerId),
      eq(gigServices.isActive, true)
    ));
}

// ── Gig Jobs ──────────────────────────────────────────────────────

async createGigJob(data: {
  customerId: string;
  serviceType: string;
  garmentDescription: string;
  alterationDetails: string;
  garmentImageUrl?: string;
  productId?: number;
  deliveryMethod?: string;
  budgetMin?: number;
  budgetMax?: number;
  neededBy?: Date;
  customerCity?: string;
  customerLat?: string;
  customerLng?: string;
}) {
  const [job] = await db.insert(gigJobs).values(data).returning();
  return job;
}

async getGigJob(id: string) {
  const [job] = await db.select().from(gigJobs).where(eq(gigJobs.id, id));
  return job || null;
}

async getCustomerGigJobs(customerId: string) {
  return db
    .select()
    .from(gigJobs)
    .where(eq(gigJobs.customerId, customerId))
    .orderBy(desc(gigJobs.createdAt));
}

async getProviderGigJobs(providerId: string) {
  return db
    .select()
    .from(gigJobs)
    .where(eq(gigJobs.providerId, providerId))
    .orderBy(desc(gigJobs.createdAt));
}

async getOpenGigJobs(city?: string) {
  const jobs = await db
    .select()
    .from(gigJobs)
    .where(eq(gigJobs.status, "open"))
    .orderBy(desc(gigJobs.createdAt));

  if (city) {
    return jobs.filter(j =>
      j.customerCity?.toLowerCase().includes(city.toLowerCase())
    );
  }
  return jobs;
}

async updateGigJobStatus(id: string, status: string, additionalData?: any) {
  const [updated] = await db
    .update(gigJobs)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(gigJobs.id, id))
    .returning();
  return updated;
}

// ── Gig Quotes ────────────────────────────────────────────────────

async createGigQuote(data: {
  jobId: string;
  providerId: string;
  price: number;
  turnaroundDays: number;
  message?: string;
}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3); // 3 day expiry

  const [quote] = await db.insert(gigQuotes).values({
    ...data,
    expiresAt,
  }).returning();
  return quote;
}

async getQuotesForJob(jobId: string) {
  return db
    .select()
    .from(gigQuotes)
    .where(eq(gigQuotes.jobId, jobId))
    .orderBy(asc(gigQuotes.createdAt));
}

async acceptGigQuote(quoteId: string, customerId: string) {
  // Get the quote
  const [quote] = await db
    .select()
    .from(gigQuotes)
    .where(eq(gigQuotes.id, quoteId));

  if (!quote) throw new Error("Quote not found");

  // Reject all other quotes for this job
  await db
    .update(gigQuotes)
    .set({ status: "rejected" })
    .where(and(
      eq(gigQuotes.jobId, quote.jobId),
      ne(gigQuotes.id, quoteId)
    ));

  // Accept this quote
  await db
    .update(gigQuotes)
    .set({ status: "accepted" })
    .where(eq(gigQuotes.id, quoteId));

  // Update the job
  const platformFee = Math.round(quote.price * 0.12); // 12% platform fee
  const [updatedJob] = await db
    .update(gigJobs)
    .set({
      providerId: quote.providerId,
      status: "accepted",
      agreedPrice: quote.price,
      platformFee,
      updatedAt: new Date(),
    })
    .where(eq(gigJobs.id, quote.jobId))
    .returning();

  return updatedJob;
}

// ── Gig Messages ──────────────────────────────────────────────────

async sendGigMessage(data: {
  jobId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
}) {
  const [message] = await db.insert(gigMessages).values(data).returning();
  return message;
}

async getGigMessages(jobId: string) {
  return db
    .select()
    .from(gigMessages)
    .where(eq(gigMessages.jobId, jobId))
    .orderBy(asc(gigMessages.createdAt));
}

async markMessagesRead(jobId: string, userId: string) {
  await db
    .update(gigMessages)
    .set({ readAt: new Date() })
    .where(and(
      eq(gigMessages.jobId, jobId),
      ne(gigMessages.senderId, userId),
      isNull(gigMessages.readAt)
    ));
}

// ── Gig Reviews ───────────────────────────────────────────────────

async createGigReview(data: {
  jobId: string;
  customerId: string;
  providerId: string;
  rating: number;
  reviewText?: string;
  qualityRating?: number;
  speedRating?: number;
  communicationRating?: number;
}) {
  const [review] = await db.insert(gigReviews).values(data).returning();

  // Recalculate provider average rating
  const allReviews = await db
    .select({ rating: gigReviews.rating })
    .from(gigReviews)
    .where(eq(gigReviews.providerId, data.providerId));

  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await db
    .update(gigProviders)
    .set({
      averageRating: avg.toFixed(2),
      totalReviews: allReviews.length,
      updatedAt: new Date(),
    })
    .where(eq(gigProviders.id, data.providerId));

  return review;
}

async getProviderReviews(providerId: string) {
  return db
    .select()
    .from(gigReviews)
    .where(eq(gigReviews.providerId, providerId))
    .orderBy(desc(gigReviews.createdAt));
}
```

---

## PHASE 3: API Routes

Open `server/routes.ts` and add these routes to the existing route registration.
Place them after the existing custom request routes.

```typescript
// ════════════════════════════════════════════════════════════════
// GIG ECONOMY ROUTES
// ════════════════════════════════════════════════════════════════

// ── Provider Registration & Profile ──────────────────────────────

// Register as a gig provider (any authenticated user)
app.post("/api/v1/gig/register", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;

    // Check if already registered
    const existing = await storage.getGigProviderByUserId(userId);
    if (existing) {
      return res.status(409).json({ error: "Already registered as a gig provider" });
    }

    const {
      displayName, bio, city, state, country,
      locationLat, locationLng, serviceRadiusMiles,
      offersHomeVisits, offersDropOff, offersShipping
    } = req.body;

    if (!displayName || !city) {
      return res.status(400).json({ error: "displayName and city are required" });
    }

    const provider = await storage.createGigProvider({
      userId,
      displayName,
      bio,
      city,
      state,
      country: country || "US",
      locationLat,
      locationLng,
      serviceRadiusMiles: serviceRadiusMiles || 10,
      offersHomeVisits: offersHomeVisits || false,
      offersDropOff: offersDropOff !== false,
      offersShipping: offersShipping || false,
    });

    res.status(201).json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user's provider profile
app.get("/api/v1/gig/my-profile", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(404).json({ error: "Not registered as a provider" });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update provider profile
app.patch("/api/v1/gig/my-profile", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    const updated = await storage.updateGigProvider(provider.id, userId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get any provider's public profile
app.get("/api/v1/gig/providers/:id", async (req, res) => {
  try {
    const provider = await storage.getGigProviderById(req.params.id);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    const services = await storage.getProviderServices(provider.id);
    const reviews = await storage.getProviderReviews(provider.id);

    res.json({ ...provider, services, reviews });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Search providers
app.get("/api/v1/gig/providers", async (req, res) => {
  try {
    const { city, serviceType, offersHomeVisits, offersShipping } = req.query;

    const providers = await storage.searchGigProviders({
      city: city as string,
      serviceType: serviceType as string,
      offersHomeVisits: offersHomeVisits === "true",
      offersShipping: offersShipping === "true",
    });

    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Services Management ───────────────────────────────────────────

// Add a service to provider's catalog
app.post("/api/v1/gig/services", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(403).json({ error: "Not a registered provider" });

    const { serviceType, customName, description, priceMin, priceMax, priceUnit, turnaroundDaysMin, turnaroundDaysMax } = req.body;

    if (!serviceType || !priceMin || !priceMax) {
      return res.status(400).json({ error: "serviceType, priceMin, and priceMax are required" });
    }

    const service = await storage.addGigService(provider.id, {
      serviceType,
      customName,
      description,
      priceMin: Math.round(priceMin * 100), // convert dollars to cents
      priceMax: Math.round(priceMax * 100),
      priceUnit: priceUnit || "per_item",
      turnaroundDaysMin: turnaroundDaysMin || 1,
      turnaroundDaysMax: turnaroundDaysMax || 5,
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get my services
app.get("/api/v1/gig/services", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(404).json({ error: "Not a provider" });

    const services = await storage.getProviderServices(provider.id);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update a service
app.patch("/api/v1/gig/services/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(403).json({ error: "Not a provider" });

    const updated = await storage.updateGigService(req.params.id, provider.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Remove a service
app.delete("/api/v1/gig/services/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(403).json({ error: "Not a provider" });

    await storage.deleteGigService(req.params.id, provider.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Job Requests ──────────────────────────────────────────────────

// Customer posts a job request
app.post("/api/v1/gig/jobs", requireAuth, async (req, res) => {
  try {
    const customerId = (req.user as any).id;

    const {
      serviceType, garmentDescription, alterationDetails,
      garmentImageUrl, productId, deliveryMethod,
      budgetMin, budgetMax, neededBy,
      customerCity, customerLat, customerLng
    } = req.body;

    if (!serviceType || !garmentDescription || !alterationDetails) {
      return res.status(400).json({
        error: "serviceType, garmentDescription, and alterationDetails are required"
      });
    }

    const job = await storage.createGigJob({
      customerId,
      serviceType,
      garmentDescription,
      alterationDetails,
      garmentImageUrl,
      productId,
      deliveryMethod: deliveryMethod || "drop_off",
      budgetMin: budgetMin ? Math.round(budgetMin * 100) : undefined,
      budgetMax: budgetMax ? Math.round(budgetMax * 100) : undefined,
      neededBy: neededBy ? new Date(neededBy) : undefined,
      customerCity,
      customerLat,
      customerLng,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get customer's own jobs
app.get("/api/v1/gig/jobs/mine", requireAuth, async (req, res) => {
  try {
    const customerId = (req.user as any).id;
    const jobs = await storage.getCustomerGigJobs(customerId);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get open jobs near a city (for providers to browse)
app.get("/api/v1/gig/jobs/open", requireAuth, async (req, res) => {
  try {
    const { city } = req.query;
    const jobs = await storage.getOpenGigJobs(city as string);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get jobs assigned to the current provider
app.get("/api/v1/gig/jobs/assigned", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(403).json({ error: "Not a provider" });

    const jobs = await storage.getProviderGigJobs(provider.id);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single job
app.get("/api/v1/gig/jobs/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const job = await storage.getGigJob(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Only customer or assigned provider can see the job
    const provider = await storage.getGigProviderByUserId(userId);
    const isCustomer = job.customerId === userId;
    const isProvider = provider && job.providerId === provider.id;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ error: "Access denied" });
    }

    const quotes = await storage.getQuotesForJob(job.id);
    const messages = await storage.getGigMessages(job.id);

    res.json({ ...job, quotes, messages });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update job status (provider marks in_progress or completed)
app.patch("/api/v1/gig/jobs/:id/status", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { status } = req.body;

    const validStatuses = ["in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const provider = await storage.getGigProviderByUserId(userId);
    const job = await storage.getGigJob(req.params.id);

    if (!job || !provider || job.providerId !== provider.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await storage.updateGigJobStatus(job.id, status);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Quotes ────────────────────────────────────────────────────────

// Provider submits a quote
app.post("/api/v1/gig/jobs/:jobId/quotes", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const provider = await storage.getGigProviderByUserId(userId);
    if (!provider) return res.status(403).json({ error: "Not a provider" });

    const job = await storage.getGigJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.status !== "open") return res.status(400).json({ error: "Job is no longer open" });

    const { price, turnaroundDays, message } = req.body;
    if (!price || !turnaroundDays) {
      return res.status(400).json({ error: "price and turnaroundDays are required" });
    }

    const quote = await storage.createGigQuote({
      jobId: job.id,
      providerId: provider.id,
      price: Math.round(price * 100), // dollars to cents
      turnaroundDays,
      message,
    });

    // Update job status to quoted
    await storage.updateGigJobStatus(job.id, "quoted");

    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Customer accepts a quote
app.post("/api/v1/gig/quotes/:quoteId/accept", requireAuth, async (req, res) => {
  try {
    const customerId = (req.user as any).id;
    const updatedJob = await storage.acceptGigQuote(req.params.quoteId, customerId);
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Messages ──────────────────────────────────────────────────────

app.post("/api/v1/gig/jobs/:jobId/messages", requireAuth, async (req, res) => {
  try {
    const senderId = (req.user as any).id;
    const { content, imageUrl } = req.body;

    if (!content?.trim()) return res.status(400).json({ error: "Content required" });

    const job = await storage.getGigJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Only customer or provider can message
    const provider = await storage.getGigProviderByUserId(senderId);
    const isCustomer = job.customerId === senderId;
    const isProvider = provider && job.providerId === provider.id;
    if (!isCustomer && !isProvider) return res.status(403).json({ error: "Access denied" });

    const message = await storage.sendGigMessage({
      jobId: job.id,
      senderId,
      content: content.trim(),
      imageUrl,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Reviews ───────────────────────────────────────────────────────

app.post("/api/v1/gig/jobs/:jobId/review", requireAuth, async (req, res) => {
  try {
    const customerId = (req.user as any).id;
    const job = await storage.getGigJob(req.params.jobId);

    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.customerId !== customerId) return res.status(403).json({ error: "Access denied" });
    if (job.status !== "completed") return res.status(400).json({ error: "Job not yet completed" });
    if (!job.providerId) return res.status(400).json({ error: "No provider assigned" });

    const { rating, reviewText, qualityRating, speedRating, communicationRating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    const review = await storage.createGigReview({
      jobId: job.id,
      customerId,
      providerId: job.providerId,
      rating,
      reviewText,
      qualityRating,
      speedRating,
      communicationRating,
    });

    // Mark job as reviewed
    await storage.updateGigJobStatus(job.id, "reviewed");

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/v1/gig/providers/:id/reviews", async (req, res) => {
  try {
    const reviews = await storage.getProviderReviews(req.params.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

---

## PHASE 4: Frontend Pages

### Step 4.1 — Create `client/src/pages/gig-directory.tsx`

This is the public-facing page where customers find local providers.

```typescript
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, Star, Clock, Scissors, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const SERVICE_LABELS: Record<string, string> = {
  hemming: "Hemming",
  taking_in: "Taking In",
  letting_out: "Letting Out",
  zipper_repair: "Zipper Repair",
  zipper_replacement: "Zipper Replacement",
  button_repair: "Button Repair",
  lining_repair: "Lining Repair",
  dress_fitting: "Dress Fitting",
  suit_alterations: "Suit Alterations",
  trouser_alterations: "Trouser Alterations",
  sleeve_alterations: "Sleeve Alterations",
  general_alterations: "General Alterations",
  custom_embroidery: "Custom Embroidery",
  patch_work: "Patch Work",
  clothing_repair: "Clothing Repair",
  other: "Other",
};

export default function GigDirectoryPage() {
  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/v1/gig/providers", city],
    queryFn: () =>
      fetch(`/api/v1/gig/providers${city ? `?city=${encodeURIComponent(city)}` : ""}`)
        .then((r) => r.json()),
  });

  const handleSearch = () => setCity(searchInput);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Local Alteration Specialists</h1>
        <p className="text-muted-foreground">
          Find skilled seamstresses, tailors, and alteration specialists near you.
          Real people, real skills, local service.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter your city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Link href="/gig/register">
          <Button variant="outline">
            <Scissors className="w-4 h-4 mr-2" />
            Offer Services
          </Button>
        </Link>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16">
          <Scissors className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No providers found</h3>
          <p className="text-muted-foreground mb-4">
            {city ? `No providers in ${city} yet.` : "Search for providers in your city."}
          </p>
          <Link href="/gig/register">
            <Button>Be the first in your area</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {providers.map((item: any) => (
            <ProviderCard key={item.provider.id} provider={item.provider} services={item.services || []} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderCard({ provider, services }: { provider: any; services: any[] }) {
  const topServices = services.slice(0, 3);

  return (
    <Link href={`/gig/providers/${provider.id}`}>
      <div className="border rounded-xl p-5 hover:border-primary hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {provider.profileImageUrl ? (
              <img
                src={provider.profileImageUrl}
                alt={provider.displayName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{provider.displayName}</h3>
                {provider.isVerified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {provider.city}{provider.state ? `, ${provider.state}` : ""}
                </span>
                {provider.averageRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {parseFloat(provider.averageRating).toFixed(1)}
                    <span className="text-muted-foreground">({provider.totalReviews})</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {provider.completedJobs} jobs done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Services preview */}
        {topServices.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {topServices.map((s: any) => (
              <div key={s.id} className="text-xs bg-muted rounded-lg px-3 py-1">
                <span className="font-medium">{SERVICE_LABELS[s.serviceType] || s.customName}</span>
                <span className="text-muted-foreground ml-1">
                  ${(s.priceMin / 100).toFixed(0)}–${(s.priceMax / 100).toFixed(0)}
                </span>
              </div>
            ))}
            {services.length > 3 && (
              <div className="text-xs bg-muted rounded-lg px-3 py-1 text-muted-foreground">
                +{services.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Delivery options */}
        <div className="flex gap-2 mt-3">
          {provider.offersDropOff && <Badge variant="outline" className="text-xs">Drop-off</Badge>}
          {provider.offersHomeVisits && <Badge variant="outline" className="text-xs">Home visits</Badge>}
          {provider.offersShipping && <Badge variant="outline" className="text-xs">Ships items</Badge>}
        </div>
      </div>
    </Link>
  );
}
```

### Step 4.2 — Create `client/src/pages/gig-register.tsx`

The sign-up flow for service providers.

```typescript
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Scissors, MapPin, DollarSign, Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

const SERVICE_TYPES = [
  { value: "hemming", label: "Hemming" },
  { value: "taking_in", label: "Taking In" },
  { value: "letting_out", label: "Letting Out" },
  { value: "zipper_repair", label: "Zipper Repair" },
  { value: "zipper_replacement", label: "Zipper Replacement" },
  { value: "button_repair", label: "Button Repair" },
  { value: "dress_fitting", label: "Dress Fitting" },
  { value: "suit_alterations", label: "Suit Alterations" },
  { value: "trouser_alterations", label: "Trouser Alterations" },
  { value: "general_alterations", label: "General Alterations" },
  { value: "custom_embroidery", label: "Custom Embroidery" },
  { value: "clothing_repair", label: "Clothing Repair" },
  { value: "other", label: "Other" },
];

interface ServiceEntry {
  serviceType: string;
  priceMin: string;
  priceMax: string;
  turnaroundDaysMin: string;
  turnaroundDaysMax: string;
  description: string;
}

export default function GigRegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    city: "",
    state: "",
    serviceRadiusMiles: "10",
    offersDropOff: true,
    offersHomeVisits: false,
    offersShipping: false,
  });

  const [services, setServices] = useState<ServiceEntry[]>([
    { serviceType: "hemming", priceMin: "15", priceMax: "30", turnaroundDaysMin: "1", turnaroundDaysMax: "3", description: "" }
  ]);

  const { mutate: register, isPending } = useMutation({
    mutationFn: async () => {
      // Create provider profile
      const provider = await apiRequest("POST", "/api/v1/gig/register", profile);

      // Add each service
      for (const service of services) {
        if (service.serviceType && service.priceMin && service.priceMax) {
          await apiRequest("POST", "/api/v1/gig/services", {
            ...service,
            priceMin: parseFloat(service.priceMin),
            priceMax: parseFloat(service.priceMax),
            turnaroundDaysMin: parseInt(service.turnaroundDaysMin),
            turnaroundDaysMax: parseInt(service.turnaroundDaysMax),
          });
        }
      }

      return provider;
    },
    onSuccess: () => {
      toast({ title: "You're registered!", description: "Customers in your area can now find you." });
      setLocation("/gig/dashboard");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addService = () => {
    setServices(prev => [...prev, {
      serviceType: "general_alterations", priceMin: "", priceMax: "",
      turnaroundDaysMin: "1", turnaroundDaysMax: "5", description: ""
    }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceEntry, value: string) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Offer Your Services</h1>
        </div>
        <p className="text-muted-foreground">
          Join SeamXY's network of local alteration specialists. No monthly fees —
          we take 12% only when you complete a job.
        </p>
      </div>

      {/* Profile section */}
      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">Your Profile</h2>

        <div>
          <label className="text-sm font-medium mb-1 block">Your Name or Business Name *</label>
          <Input
            placeholder="e.g. Maria's Alterations"
            value={profile.displayName}
            onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">About You</label>
          <Textarea
            placeholder="Tell customers about your experience and specialties..."
            value={profile.bio}
            onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
            className="h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">City *</label>
            <Input
              placeholder="Chicago"
              value={profile.city}
              onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">State</label>
            <Input
              placeholder="IL"
              value={profile.state}
              onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">How do you work?</label>
          <div className="flex gap-3 flex-wrap">
            {[
              { key: "offersDropOff", label: "Customer drops off" },
              { key: "offersHomeVisits", label: "I visit customer" },
              { key: "offersShipping", label: "Ship items to me" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setProfile(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  profile[key as keyof typeof profile]
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Your Services</h2>
          <Button variant="outline" size="sm" onClick={addService}>
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        </div>

        {services.map((service, index) => (
          <div key={index} className="border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <select
                value={service.serviceType}
                onChange={(e) => updateService(index, "serviceType", e.target.value)}
                className="text-sm font-medium bg-transparent border-none outline-none"
              >
                {SERVICE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {services.length > 1 && (
                <button onClick={() => removeService(index)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Price ($)</label>
                <Input
                  type="number"
                  placeholder="15"
                  value={service.priceMin}
                  onChange={(e) => updateService(index, "priceMin", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Price ($)</label>
                <Input
                  type="number"
                  placeholder="35"
                  value={service.priceMax}
                  onChange={(e) => updateService(index, "priceMax", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Days</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={service.turnaroundDaysMin}
                  onChange={(e) => updateService(index, "turnaroundDaysMin", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Days</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={service.turnaroundDaysMax}
                  onChange={(e) => updateService(index, "turnaroundDaysMax", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Commission note */}
      <div className="bg-muted rounded-xl p-4 mb-6 text-sm">
        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="font-medium">No monthly fees</p>
            <p className="text-muted-foreground">
              SeamXY takes 12% only when you complete a paid job.
              You keep 88% of every job.
            </p>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!profile.displayName || !profile.city || isPending}
        onClick={() => register()}
      >
        {isPending ? "Setting up your profile..." : "Start Offering Services"}
      </Button>
    </div>
  );
}
```

### Step 4.3 — Create `client/src/pages/gig-post-job.tsx`

Simple form for customers to post an alteration job.

```typescript
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

const SERVICE_TYPES = [
  { value: "hemming", label: "Hemming — shorten or lengthen" },
  { value: "taking_in", label: "Taking in — make it smaller" },
  { value: "letting_out", label: "Letting out — make it larger" },
  { value: "zipper_repair", label: "Zipper repair" },
  { value: "zipper_replacement", label: "Zipper replacement" },
  { value: "button_repair", label: "Button repair or replacement" },
  { value: "dress_fitting", label: "Dress fitting" },
  { value: "suit_alterations", label: "Suit alterations" },
  { value: "general_alterations", label: "General alterations" },
  { value: "clothing_repair", label: "Clothing repair" },
  { value: "custom_embroidery", label: "Custom embroidery" },
  { value: "other", label: "Something else" },
];

export default function GigPostJobPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    serviceType: "",
    garmentDescription: "",
    alterationDetails: "",
    deliveryMethod: "drop_off",
    budgetMax: "",
    customerCity: "",
    neededBy: "",
  });

  const { mutate: postJob, isPending } = useMutation({
    mutationFn: () => apiRequest("POST", "/api/v1/gig/jobs", {
      ...form,
      budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : undefined,
      neededBy: form.neededBy || undefined,
    }),
    onSuccess: () => {
      toast({ title: "Job posted!", description: "Local providers will send you quotes." });
      setLocation("/gig/my-jobs");
    },
    onError: () => {
      toast({ title: "Error posting job", variant: "destructive" });
    },
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Get Alteration Help</h1>
      <p className="text-muted-foreground mb-6">
        Describe what you need and local specialists will send you quotes.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">What do you need done? *</label>
          <div className="grid grid-cols-1 gap-2">
            {SERVICE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setForm(f => ({ ...f, serviceType: t.value }))}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  form.serviceType === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Describe the garment *</label>
          <Input
            placeholder="e.g. Black wool blazer, size 10"
            value={form.garmentDescription}
            onChange={(e) => setForm(f => ({ ...f, garmentDescription: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Alteration details *</label>
          <Textarea
            placeholder="e.g. Sleeves are 2 inches too long. Need them shortened to wrist length."
            value={form.alterationDetails}
            onChange={(e) => setForm(f => ({ ...f, alterationDetails: e.target.value }))}
            className="h-24"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Your city *</label>
          <Input
            placeholder="Chicago"
            value={form.customerCity}
            onChange={(e) => setForm(f => ({ ...f, customerCity: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">How would you prefer to hand it over?</label>
          <div className="flex gap-2">
            {[
              { value: "drop_off", label: "I'll drop it off" },
              { value: "home_visit", label: "Home visit" },
              { value: "shipping", label: "Ship it" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm(f => ({ ...f, deliveryMethod: opt.value }))}
                className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                  form.deliveryMethod === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Max budget ($)</label>
            <Input
              type="number"
              placeholder="50"
              value={form.budgetMax}
              onChange={(e) => setForm(f => ({ ...f, budgetMax: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Needed by</label>
            <Input
              type="date"
              value={form.neededBy}
              onChange={(e) => setForm(f => ({ ...f, neededBy: e.target.value }))}
            />
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!form.serviceType || !form.garmentDescription || !form.alterationDetails || !form.customerCity || isPending}
          onClick={() => postJob()}
        >
          {isPending ? "Posting..." : "Post Job — Get Quotes"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Free to post. You only pay when you accept a quote.
        </p>
      </div>
    </div>
  );
}
```

---

## PHASE 5: Register Routes in App.tsx

Open `client/src/App.tsx` and add the new gig routes.

Find the existing `<Route>` block and add:

```typescript
// Add imports at the top:
import GigDirectoryPage from "./pages/gig-directory";
import GigRegisterPage from "./pages/gig-register";
import GigPostJobPage from "./pages/gig-post-job";

// Add inside the Route block:
<Route path="/gig" component={GigDirectoryPage} />
<Route path="/gig/register" component={GigRegisterPage} />
<Route path="/gig/post-job" component={GigPostJobPage} />
```

---

## PHASE 6: Add Gig Link to Navigation

Open `client/src/components/header.tsx` (or wherever the main navigation is).

For **logged-out users**, add a nav link:
```typescript
{ label: "Find Local Help", href: "/gig" }
```

For **logged-in users**, add:
```typescript
{ label: "Local Alterations", href: "/gig" }
```

---

## PHASE 7: Post-Alteration Prompt on Shop Page

When a user buys something (or clicks Quick Buy), show a subtle prompt.

Find the Quick Buy button handler in the shop/product card component and add
after the purchase action:

```typescript
// After Quick Buy click, show a gentle prompt
setTimeout(() => {
  toast({
    title: "Need it altered?",
    description: "Find a local seamstress or tailor to get the perfect fit.",
    action: (
      <Button size="sm" variant="outline" onClick={() => setLocation("/gig/post-job")}>
        Find Help
      </Button>
    ),
  });
}, 2000);
```

---

## PHASE 8: Push Schema and Test

### Step 8.1 — TypeScript check

```bash
npm run check
```

Fix any errors before continuing.

### Step 8.2 — Push to database

```bash
npm run db:push
```

### Step 8.3 — Test API endpoints

```bash
# Search providers (should return empty array)
curl http://localhost:5000/api/v1/gig/providers

# Try posting a job (requires auth cookie)
curl -X POST http://localhost:5000/api/v1/gig/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "hemming",
    "garmentDescription": "Black trousers",
    "alterationDetails": "Need hem shortened by 2 inches",
    "customerCity": "Chicago"
  }'
```

### Step 8.4 — Commit and push to GitHub

```bash
git add .
git commit -m "feat: add gig economy layer for local alteration specialists"
git push origin main
```

---

## Summary of Files Created or Modified

| File | Action |
|---|---|
| `shared/schema.ts` | Modified — 6 new tables, 1 new enum |
| `server/storage.ts` | Modified — gig storage methods |
| `server/routes.ts` | Modified — gig API routes |
| `client/src/pages/gig-directory.tsx` | Created |
| `client/src/pages/gig-register.tsx` | Created |
| `client/src/pages/gig-post-job.tsx` | Created |
| `client/src/App.tsx` | Modified — 3 new routes |
| `client/src/components/header.tsx` | Modified — nav link |

## Do Not Touch
- `server/services/anthropic.ts`
- `vercel.json`
- Any file in the `Z` folder
- TryFit merge files already in progress

## Platform Fee Summary
- Provider lists services: **Free**
- Customer posts job: **Free**
- Job completed and paid: **SeamXY takes 12%, provider keeps 88%**
- No monthly subscription required for gig providers
