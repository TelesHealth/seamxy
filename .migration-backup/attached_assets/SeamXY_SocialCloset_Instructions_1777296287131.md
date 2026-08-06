# SeamXY — Social Closet + Lifecycle Feature
## Full Feature Spec & Replit Agent Instructions

This document covers the complete Social Closet feature including:
- Friend groups and social sharing
- Closet lending between friends
- Outfit voting ("Help me decide")
- Haul posts
- Closet lifecycle (idle alerts, let it go, donate/sell/lend)
- Donation tracking
- Friend-group yard sales

Follow each phase in order. Confirm each phase before starting the next.

---

## FEATURE OVERVIEW

SeamXY's Social Closet transforms the platform from a personal styling tool
into the operating system for how a friend group thinks about clothes together.

The full clothing lifecycle inside SeamXY:
```
Buy → Add to Closet → Wear → Share with Friends → Get Feedback
         ↓                                              ↓
    Lend to Friends                            Try On Virtually
         ↓                                              ↓
    Item Returns                            Buy Your Own (affiliate)
         ↓
  Idle Alert fires (6+ months unworn)
         ↓
  Let It Go flow
    ↙      ↓      ↘
Lend    Sell    Donate
                  ↓
         Donation log (tax record)
         ↓
  New gap identified by AI
         ↓
  Intentional shopping recommendation
```

---

## PHASE 1: Database Schema

Open `shared/schema.ts` and add these new tables at the end.

### Step 1.1 — Add new enums

```typescript
// ── Social Closet Enums ───────────────────────────────────────────
export const closetItemStatusEnum = pgEnum("closet_item_status", [
  "owned",          // Normal owned item
  "lent_out",       // Currently lent to a friend
  "borrowed",       // Currently borrowing from a friend
  "for_sale",       // Listed in a closet sale
  "donated",        // Has been donated
  "sold",           // Has been sold
]);

export const borrowRequestStatusEnum = pgEnum("borrow_request_status", [
  "pending",        // Request sent, awaiting response
  "accepted",       // Owner accepted
  "declined",       // Owner declined
  "active",         // Currently borrowed
  "returned",       // Item returned and confirmed
  "overdue",        // Past return date
]);

export const closetSaleStatusEnum = pgEnum("closet_sale_status", [
  "draft",
  "friends_only",   // Visible to friend group only
  "public",         // Open to anyone
  "closed",
]);

export const groupMemberRoleEnum = pgEnum("group_member_role", [
  "owner",
  "member",
]);

export const reactionTypeEnum = pgEnum("reaction_type", [
  "love",
  "fire",
  "thumbs_up",
  "thumbs_down",
  "question",       // "Does this fit you?"
]);

export const donationDestinationEnum = pgEnum("donation_destination", [
  "goodwill",
  "salvation_army",
  "local_shelter",
  "thrift_store",
  "other",
]);
```

### Step 1.2 — Add Style Groups tables

```typescript
// ── Style Groups (Friend Groups) ─────────────────────────────────
export const styleGroups = pgTable("style_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url"),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteCode: varchar("invite_code", { length: 20 }).unique().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const styleGroupMembers = pgTable("style_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => styleGroups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: groupMemberRoleEnum("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});
```

### Step 1.3 — Update closet items with social fields

Add these columns to the existing `closetItems` table (or whatever the closet
items table is called in the existing schema — check first):

```typescript
// Add to existing closet items table:
// lastWornAt: timestamp("last_worn_at")
// wearCount: integer("wear_count").notNull().default(0)
// isLendable: boolean("is_lendable").notNull().default(false)
// status: closetItemStatusEnum("status").notNull().default("owned")
// purchasePrice: integer("purchase_price") // in cents
// estimatedValue: integer("estimated_value") // current estimated value in cents
// condition: varchar("condition", { length: 20 }).default("good") // excellent/good/fair/poor
// notes: text("notes")
// isPublicInGroup: boolean("is_public_in_group").notNull().default(false)
```

**IMPORTANT:** Check the existing closet items table schema before adding.
If these columns already exist, skip them. Do not duplicate.

### Step 1.4 — Add Borrow Requests table

```typescript
// ── Closet Lending ────────────────────────────────────────────────
export const borrowRequests = pgTable("borrow_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  closetItemId: varchar("closet_item_id").notNull(),
  borrowerId: varchar("borrower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lenderId: varchar("lender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").references(() => styleGroups.id),
  
  // What for
  occasion: varchar("occasion", { length: 200 }),
  message: text("message"),
  
  // When
  requestedFrom: timestamp("requested_from").notNull(),
  requestedUntil: timestamp("requested_until").notNull(),
  
  // Condition tracking
  conditionOnLend: varchar("condition_on_lend", { length: 20 }),
  conditionOnReturn: varchar("condition_on_return", { length: 20 }),
  lenderConditionNote: text("lender_condition_note"),
  
  status: borrowRequestStatusEnum("status").notNull().default("pending"),
  
  // Confirmations
  lentConfirmedAt: timestamp("lent_confirmed_at"),
  returnedConfirmedByBorrower: timestamp("returned_confirmed_by_borrower"),
  returnedConfirmedByLender: timestamp("returned_confirmed_by_lender"),
  
  // Post-return
  borrowerRating: integer("borrower_rating"), // 1-5
  lenderRating: integer("lender_rating"),
  borrowerWouldBuy: boolean("borrower_would_buy").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Step 1.5 — Add Haul Posts table

```typescript
// ── Haul Posts (Social Sharing) ───────────────────────────────────
export const haulPosts = pgTable("haul_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => styleGroups.id, { onDelete: "cascade" }),
  
  title: varchar("title", { length: 200 }),
  caption: text("caption"),
  
  // Items featured in this haul
  closetItemIds: text("closet_item_ids").array().notNull().default(sql`'{}'::text[]`),
  
  // Media
  imageUrls: text("image_urls").array().notNull().default(sql`'{}'::text[]`),
  videoUrl: varchar("video_url"),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const haulPostReactions = pgTable("haul_post_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  haulPostId: varchar("haul_post_id").notNull().references(() => haulPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reaction: reactionTypeEnum("reaction").notNull(),
  comment: text("comment"),
  
  // Friend can suggest an item to pair with
  suggestedProductId: integer("suggested_product_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Step 1.6 — Add Outfit Polls table

```typescript
// ── Outfit Polls ("Help Me Decide") ──────────────────────────────
export const outfitPolls = pgTable("outfit_polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => styleGroups.id, { onDelete: "cascade" }),
  
  question: varchar("question", { length: 300 }).notNull(),
  occasion: varchar("occasion", { length: 200 }),
  
  // Up to 4 outfit options
  options: jsonb("options").notNull(), // array of { label, imageUrl, closetItemIds[] }
  
  closesAt: timestamp("closes_at").notNull(), // poll expires
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outfitPollVotes = pgTable("outfit_poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => outfitPolls.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  optionIndex: integer("option_index").notNull(), // which option they voted for
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Step 1.7 — Add Closet Lifecycle tables

```typescript
// ── Closet Lifecycle ──────────────────────────────────────────────
export const closetSales = pgTable("closet_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").references(() => styleGroups.id),
  
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  
  // Items in this sale
  closetItemIds: text("closet_item_ids").array().notNull().default(sql`'{}'::text[]`),
  
  status: closetSaleStatusEnum("status").notNull().default("draft"),
  
  // Friends-only window before going public
  friendsOnlyUntil: timestamp("friends_only_until"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const closetSaleInterests = pgTable("closet_sale_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").notNull().references(() => closetSales.id, { onDelete: "cascade" }),
  closetItemId: varchar("closet_item_id").notNull(),
  interestedUserId: varchar("interested_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("interested"), // interested/claimed/passed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const donationLogs = pgTable("donation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Items donated
  closetItemIds: text("closet_item_ids").array().notNull().default(sql`'{}'::text[]`),
  itemDescriptions: jsonb("item_descriptions"), // snapshot of item details at time of donation
  
  destination: donationDestinationEnum("destination").notNull(),
  destinationName: varchar("destination_name", { length: 200 }),
  destinationAddress: text("destination_address"),
  
  donatedAt: timestamp("donated_at").notNull(),
  estimatedTotalValue: integer("estimated_total_value"), // in cents, for tax purposes
  receiptImageUrl: varchar("receipt_image_url"),
  
  taxYear: integer("tax_year").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const closetIdleAlerts = pgTable("closet_idle_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  closetItemId: varchar("closet_item_id").notNull(),
  
  alertedAt: timestamp("alerted_at").defaultNow().notNull(),
  idleMonths: integer("idle_months").notNull(),
  
  // User's response
  action: varchar("action", { length: 20 }), // keep/lend/sell/donate/dismissed
  actionTakenAt: timestamp("action_taken_at"),
});
```

### Step 1.8 — Push schema to database

```bash
npm run db:push
```

Confirm it completes without errors before proceeding.

---

## PHASE 2: Storage Methods

Open `server/storage.ts` and add these methods.

```typescript
// ════════════════════════════════════════════════════════════════
// STYLE GROUPS
// ════════════════════════════════════════════════════════════════

async createStyleGroup(data: {
  name: string;
  description?: string;
  ownerId: string;
}) {
  // Generate a short unique invite code
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const [group] = await db.insert(styleGroups).values({
    ...data,
    inviteCode,
  }).returning();
  
  // Auto-add owner as member
  await db.insert(styleGroupMembers).values({
    groupId: group.id,
    userId: data.ownerId,
    role: "owner",
  });
  
  return group;
}

async getStyleGroup(id: string) {
  const [group] = await db.select().from(styleGroups).where(eq(styleGroups.id, id));
  return group || null;
}

async getStyleGroupByInviteCode(code: string) {
  const [group] = await db
    .select()
    .from(styleGroups)
    .where(eq(styleGroups.inviteCode, code.toUpperCase()));
  return group || null;
}

async getUserStyleGroups(userId: string) {
  return db
    .select({ group: styleGroups, role: styleGroupMembers.role })
    .from(styleGroupMembers)
    .innerJoin(styleGroups, eq(styleGroupMembers.groupId, styleGroups.id))
    .where(and(eq(styleGroupMembers.userId, userId), eq(styleGroups.isActive, true)));
}

async joinStyleGroup(groupId: string, userId: string) {
  // Check if already a member
  const [existing] = await db
    .select()
    .from(styleGroupMembers)
    .where(and(eq(styleGroupMembers.groupId, groupId), eq(styleGroupMembers.userId, userId)));
  
  if (existing) return existing;
  
  const [member] = await db.insert(styleGroupMembers).values({
    groupId,
    userId,
    role: "member",
  }).returning();
  return member;
}

async getGroupMembers(groupId: string) {
  return db
    .select({ member: styleGroupMembers, user: users })
    .from(styleGroupMembers)
    .innerJoin(users, eq(styleGroupMembers.userId, users.id))
    .where(eq(styleGroupMembers.groupId, groupId));
}

async isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const [member] = await db
    .select()
    .from(styleGroupMembers)
    .where(and(eq(styleGroupMembers.groupId, groupId), eq(styleGroupMembers.userId, userId)));
  return !!member;
}

async leaveStyleGroup(groupId: string, userId: string) {
  await db
    .delete(styleGroupMembers)
    .where(and(eq(styleGroupMembers.groupId, groupId), eq(styleGroupMembers.userId, userId)));
}

// ════════════════════════════════════════════════════════════════
// BORROW REQUESTS
// ════════════════════════════════════════════════════════════════

async createBorrowRequest(data: {
  closetItemId: string;
  borrowerId: string;
  lenderId: string;
  groupId?: string;
  occasion?: string;
  message?: string;
  requestedFrom: Date;
  requestedUntil: Date;
}) {
  const [request] = await db.insert(borrowRequests).values(data).returning();
  return request;
}

async getBorrowRequest(id: string) {
  const [request] = await db.select().from(borrowRequests).where(eq(borrowRequests.id, id));
  return request || null;
}

async getUserBorrowRequests(userId: string) {
  // Both as borrower and lender
  return db
    .select()
    .from(borrowRequests)
    .where(or(eq(borrowRequests.borrowerId, userId), eq(borrowRequests.lenderId, userId)))
    .orderBy(desc(borrowRequests.createdAt));
}

async updateBorrowRequestStatus(id: string, status: string, additionalData?: any) {
  const [updated] = await db
    .update(borrowRequests)
    .set({ status: status as any, ...additionalData, updatedAt: new Date() })
    .where(eq(borrowRequests.id, id))
    .returning();
  return updated;
}

async confirmReturn(requestId: string, userId: string, isLender: boolean) {
  const now = new Date();
  const updateData = isLender
    ? { returnedConfirmedByLender: now }
    : { returnedConfirmedByBorrower: now };
  
  const request = await this.getBorrowRequest(requestId);
  if (!request) throw new Error("Request not found");
  
  await db.update(borrowRequests).set(updateData).where(eq(borrowRequests.id, requestId));
  
  // If both confirmed, mark as returned
  const updated = await this.getBorrowRequest(requestId);
  if (updated?.returnedConfirmedByBorrower && updated?.returnedConfirmedByLender) {
    await db
      .update(borrowRequests)
      .set({ status: "returned" })
      .where(eq(borrowRequests.id, requestId));
  }
  
  return updated;
}

// ════════════════════════════════════════════════════════════════
// HAUL POSTS
// ════════════════════════════════════════════════════════════════

async createHaulPost(data: {
  userId: string;
  groupId: string;
  title?: string;
  caption?: string;
  closetItemIds: string[];
  imageUrls?: string[];
  videoUrl?: string;
}) {
  const [post] = await db.insert(haulPosts).values(data).returning();
  return post;
}

async getGroupHaulPosts(groupId: string, limit: number = 20) {
  return db
    .select()
    .from(haulPosts)
    .where(and(eq(haulPosts.groupId, groupId), eq(haulPosts.isActive, true)))
    .orderBy(desc(haulPosts.createdAt))
    .limit(limit);
}

async addHaulReaction(data: {
  haulPostId: string;
  userId: string;
  reaction: string;
  comment?: string;
  suggestedProductId?: number;
}) {
  // Remove existing reaction from this user first
  await db
    .delete(haulPostReactions)
    .where(and(
      eq(haulPostReactions.haulPostId, data.haulPostId),
      eq(haulPostReactions.userId, data.userId)
    ));
  
  const [reaction] = await db.insert(haulPostReactions).values(data as any).returning();
  return reaction;
}

// ════════════════════════════════════════════════════════════════
// OUTFIT POLLS
// ════════════════════════════════════════════════════════════════

async createOutfitPoll(data: {
  userId: string;
  groupId: string;
  question: string;
  occasion?: string;
  options: any[];
  closesAt: Date;
}) {
  const [poll] = await db.insert(outfitPolls).values(data).returning();
  return poll;
}

async getGroupPolls(groupId: string) {
  return db
    .select()
    .from(outfitPolls)
    .where(and(eq(outfitPolls.groupId, groupId), eq(outfitPolls.isActive, true)))
    .orderBy(desc(outfitPolls.createdAt));
}

async voteOnPoll(data: {
  pollId: string;
  userId: string;
  optionIndex: number;
  comment?: string;
}) {
  // Remove existing vote
  await db
    .delete(outfitPollVotes)
    .where(and(eq(outfitPollVotes.pollId, data.pollId), eq(outfitPollVotes.userId, data.userId)));
  
  const [vote] = await db.insert(outfitPollVotes).values(data).returning();
  return vote;
}

async getPollResults(pollId: string) {
  const votes = await db
    .select()
    .from(outfitPollVotes)
    .where(eq(outfitPollVotes.pollId, pollId));
  
  const results: Record<number, number> = {};
  votes.forEach(v => {
    results[v.optionIndex] = (results[v.optionIndex] || 0) + 1;
  });
  return { votes, results, total: votes.length };
}

// ════════════════════════════════════════════════════════════════
// CLOSET SALES
// ════════════════════════════════════════════════════════════════

async createClosetSale(data: {
  userId: string;
  groupId?: string;
  title: string;
  description?: string;
  closetItemIds: string[];
}) {
  const [sale] = await db.insert(closetSales).values(data).returning();
  return sale;
}

async getClosetSale(id: string) {
  const [sale] = await db.select().from(closetSales).where(eq(closetSales.id, id));
  return sale || null;
}

async getUserClosetSales(userId: string) {
  return db
    .select()
    .from(closetSales)
    .where(eq(closetSales.userId, userId))
    .orderBy(desc(closetSales.createdAt));
}

async updateClosetSaleStatus(id: string, status: string) {
  const [updated] = await db
    .update(closetSales)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(closetSales.id, id))
    .returning();
  return updated;
}

async expressInterestInSaleItem(data: {
  saleId: string;
  closetItemId: string;
  interestedUserId: string;
  message?: string;
}) {
  const [interest] = await db.insert(closetSaleInterests).values(data).returning();
  return interest;
}

// ════════════════════════════════════════════════════════════════
// DONATION LOGS
// ════════════════════════════════════════════════════════════════

async createDonationLog(data: {
  userId: string;
  closetItemIds: string[];
  itemDescriptions: any;
  destination: string;
  destinationName?: string;
  destinationAddress?: string;
  donatedAt: Date;
  estimatedTotalValue?: number;
  taxYear: number;
}) {
  const [log] = await db.insert(donationLogs).values(data as any).returning();
  return log;
}

async getUserDonationLogs(userId: string, taxYear?: number) {
  let query = db.select().from(donationLogs).where(eq(donationLogs.userId, userId));
  return query.orderBy(desc(donationLogs.donatedAt));
}

async getUserDonationTotal(userId: string, taxYear: number) {
  const logs = await db
    .select({ value: donationLogs.estimatedTotalValue })
    .from(donationLogs)
    .where(and(eq(donationLogs.userId, userId), eq(donationLogs.taxYear, taxYear)));
  
  return logs.reduce((sum, log) => sum + (log.value || 0), 0);
}

// ════════════════════════════════════════════════════════════════
// IDLE ALERTS
// ════════════════════════════════════════════════════════════════

async getIdleClosetItems(userId: string, idleMonths: number = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - idleMonths);
  
  // This query depends on your closet items table structure
  // Adjust the table and column names to match your schema
  const items = await db
    .select()
    .from(closetItems)
    .where(and(
      eq(closetItems.userId, userId),
      or(
        isNull(closetItems.lastWornAt),
        lt(closetItems.lastWornAt, cutoffDate)
      )
    ));
  
  return items;
}

async createIdleAlert(data: {
  userId: string;
  closetItemId: string;
  idleMonths: number;
}) {
  const [alert] = await db.insert(closetIdleAlerts).values(data).returning();
  return alert;
}

async resolveIdleAlert(id: string, action: string) {
  const [updated] = await db
    .update(closetIdleAlerts)
    .set({ action, actionTakenAt: new Date() })
    .where(eq(closetIdleAlerts.id, id))
    .returning();
  return updated;
}

async markClosetItemWorn(closetItemId: string, userId: string) {
  await db
    .update(closetItems)
    .set({ 
      lastWornAt: new Date(),
      wearCount: sql`wear_count + 1`
    })
    .where(and(eq(closetItems.id, closetItemId), eq(closetItems.userId, userId)));
}
```

---

## PHASE 3: API Routes

Add these routes to `server/routes.ts`.

```typescript
// ════════════════════════════════════════════════════════════════
// STYLE GROUPS
// ════════════════════════════════════════════════════════════════

// Create a group
app.post("/api/v1/groups", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Group name required" });
    
    const group = await storage.createStyleGroup({ name, description, ownerId: userId });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get my groups
app.get("/api/v1/groups", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const groups = await storage.getUserStyleGroups(userId);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get a group
app.get("/api/v1/groups/:id", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const group = await storage.getStyleGroup(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    
    const isMember = await storage.isGroupMember(group.id, userId);
    if (!isMember) return res.status(403).json({ error: "Not a member" });
    
    const members = await storage.getGroupMembers(group.id);
    res.json({ ...group, members });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Join a group via invite code
app.post("/api/v1/groups/join", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { inviteCode } = req.body;
    
    const group = await storage.getStyleGroupByInviteCode(inviteCode);
    if (!group) return res.status(404).json({ error: "Invalid invite code" });
    
    const member = await storage.joinStyleGroup(group.id, userId);
    res.status(201).json({ group, member });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Leave a group
app.delete("/api/v1/groups/:id/leave", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    await storage.leaveStyleGroup(req.params.id, userId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════
// BORROW REQUESTS
// ════════════════════════════════════════════════════════════════

// Request to borrow an item
app.post("/api/v1/borrow-requests", requireUser, async (req, res) => {
  try {
    const borrowerId = (req.user as any).id;
    const { closetItemId, lenderId, groupId, occasion, message, requestedFrom, requestedUntil } = req.body;
    
    if (!closetItemId || !lenderId || !requestedFrom || !requestedUntil) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const request = await storage.createBorrowRequest({
      closetItemId,
      borrowerId,
      lenderId,
      groupId,
      occasion,
      message,
      requestedFrom: new Date(requestedFrom),
      requestedUntil: new Date(requestedUntil),
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get my borrow requests (as borrower and lender)
app.get("/api/v1/borrow-requests", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const requests = await storage.getUserBorrowRequests(userId);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Accept or decline a borrow request (lender only)
app.patch("/api/v1/borrow-requests/:id/respond", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { action, conditionNote } = req.body; // accept or decline
    
    const request = await storage.getBorrowRequest(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.lenderId !== userId) return res.status(403).json({ error: "Not the lender" });
    
    const status = action === "accept" ? "accepted" : "declined";
    const updated = await storage.updateBorrowRequestStatus(req.params.id, status, {
      conditionOnLend: conditionNote,
      lenderConditionNote: conditionNote,
      lentConfirmedAt: action === "accept" ? new Date() : null,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Confirm return
app.post("/api/v1/borrow-requests/:id/confirm-return", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const request = await storage.getBorrowRequest(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    
    const isLender = request.lenderId === userId;
    const isBorrower = request.borrowerId === userId;
    if (!isLender && !isBorrower) return res.status(403).json({ error: "Access denied" });
    
    const updated = await storage.confirmReturn(req.params.id, userId, isLender);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════
// HAUL POSTS
// ════════════════════════════════════════════════════════════════

// Create a haul post
app.post("/api/v1/groups/:groupId/hauls", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const isMember = await storage.isGroupMember(req.params.groupId, userId);
    if (!isMember) return res.status(403).json({ error: "Not a member" });
    
    const post = await storage.createHaulPost({
      userId,
      groupId: req.params.groupId,
      ...req.body,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get group haul posts
app.get("/api/v1/groups/:groupId/hauls", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const isMember = await storage.isGroupMember(req.params.groupId, userId);
    if (!isMember) return res.status(403).json({ error: "Not a member" });
    
    const posts = await storage.getGroupHaulPosts(req.params.groupId);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// React to a haul post
app.post("/api/v1/hauls/:id/react", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { reaction, comment, suggestedProductId } = req.body;
    
    const result = await storage.addHaulReaction({
      haulPostId: req.params.id,
      userId,
      reaction,
      comment,
      suggestedProductId,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════
// OUTFIT POLLS
// ════════════════════════════════════════════════════════════════

// Create a poll
app.post("/api/v1/groups/:groupId/polls", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const isMember = await storage.isGroupMember(req.params.groupId, userId);
    if (!isMember) return res.status(403).json({ error: "Not a member" });
    
    const { question, occasion, options, hoursOpen = 24 } = req.body;
    if (!question || !options?.length) {
      return res.status(400).json({ error: "Question and options required" });
    }
    
    const closesAt = new Date();
    closesAt.setHours(closesAt.getHours() + hoursOpen);
    
    const poll = await storage.createOutfitPoll({
      userId,
      groupId: req.params.groupId,
      question,
      occasion,
      options,
      closesAt,
    });
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get group polls
app.get("/api/v1/groups/:groupId/polls", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const isMember = await storage.isGroupMember(req.params.groupId, userId);
    if (!isMember) return res.status(403).json({ error: "Not a member" });
    
    const polls = await storage.getGroupPolls(req.params.groupId);
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Vote on a poll
app.post("/api/v1/polls/:id/vote", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { optionIndex, comment } = req.body;
    
    const vote = await storage.voteOnPoll({
      pollId: req.params.id,
      userId,
      optionIndex,
      comment,
    });
    
    const results = await storage.getPollResults(req.params.id);
    res.json({ vote, results });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get poll results
app.get("/api/v1/polls/:id/results", requireUser, async (req, res) => {
  try {
    const results = await storage.getPollResults(req.params.id);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════
// CLOSET SALES
// ════════════════════════════════════════════════════════════════

// Create a closet sale
app.post("/api/v1/closet-sales", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const sale = await storage.createClosetSale({ userId, ...req.body });
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get my sales
app.get("/api/v1/closet-sales", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const sales = await storage.getUserClosetSales(userId);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Express interest in a sale item
app.post("/api/v1/closet-sales/:saleId/interest", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { closetItemId, message } = req.body;
    
    const interest = await storage.expressInterestInSaleItem({
      saleId: req.params.saleId,
      closetItemId,
      interestedUserId: userId,
      message,
    });
    res.status(201).json(interest);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════
// DONATION LOGS
// ════════════════════════════════════════════════════════════════

// Log a donation
app.post("/api/v1/donations", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { closetItemIds, destination, destinationName, destinationAddress, donatedAt, estimatedTotalValue } = req.body;
    
    const taxYear = new Date(donatedAt || Date.now()).getFullYear();
    
    const log = await storage.createDonationLog({
      userId,
      closetItemIds,
      itemDescriptions: req.body.itemDescriptions || {},
      destination,
      destinationName,
      destinationAddress,
      donatedAt: new Date(donatedAt || Date.now()),
      estimatedTotalValue,
      taxYear,
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get my donation history
app.get("/api/v1/donations", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const logs = await storage.getUserDonationLogs(userId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get donation total for tax year
app.get("/api/v1/donations/tax-summary", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const total = await storage.getUserDonationTotal(userId, year);
    res.json({ taxYear: year, estimatedTotalValue: total, formattedTotal: `$${(total / 100).toFixed(2)}` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════
// IDLE ALERTS
// ════════════════════════════════════════════════════════════════

// Get idle items
app.get("/api/v1/closet/idle", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const months = parseInt(req.query.months as string) || 6;
    const items = await storage.getIdleClosetItems(userId, months);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mark item as worn
app.post("/api/v1/closet/:itemId/worn", requireUser, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    await storage.markClosetItemWorn(req.params.itemId, userId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Resolve idle alert
app.post("/api/v1/closet/idle/:alertId/resolve", requireUser, async (req, res) => {
  try {
    const { action } = req.body; // keep/lend/sell/donate/dismissed
    const resolved = await storage.resolveIdleAlert(req.params.alertId, action);
    res.json(resolved);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

---

## PHASE 4: Frontend Pages

### Step 4.1 — Create `client/src/pages/style-groups.tsx`

The main groups hub page:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Users, Plus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StyleGroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery<any[]>({
    queryKey: ["/api/v1/groups"],
  });

  const { mutate: createGroup, isPending: isCreating } = useMutation({
    mutationFn: () => apiRequest("POST", "/api/v1/groups", { name: groupName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/groups"] });
      setShowCreate(false);
      setGroupName("");
      toast({ title: "Group created!" });
    },
  });

  const { mutate: joinGroup, isPending: isJoining } = useMutation({
    mutationFn: () => apiRequest("POST", "/api/v1/groups/join", { inviteCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/groups"] });
      setShowJoin(false);
      setInviteCode("");
      toast({ title: "Joined the group!" });
    },
    onError: () => toast({ title: "Invalid invite code", variant: "destructive" }),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Style Groups</h1>
          <p className="text-muted-foreground text-sm">Share outfits, get feedback, borrow clothes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoin(true)}>Join</Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No style groups yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create a group with friends to share outfits, vote on looks, and borrow from each other's closets.
          </p>
          <Button onClick={() => setShowCreate(true)}>Create Your First Group</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((item: any) => (
            <Link key={item.group.id} href={`/groups/${item.group.id}`}>
              <div className="border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.group.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.role}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a Style Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group name (e.g. The Squad, Work Besties)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={!groupName || isCreating}
              onClick={() => createGroup()}
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Group Modal */}
      <Dialog open={showJoin} onOpenChange={setShowJoin}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Join a Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            />
            <Button
              className="w-full"
              disabled={!inviteCode || isJoining}
              onClick={() => joinGroup()}
            >
              {isJoining ? "Joining..." : "Join Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### Step 4.2 — Create `client/src/pages/let-it-go.tsx`

The closet lifecycle / idle items page:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, ShoppingBag, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ACTIONS = [
  { key: "lend", label: "Lend to Friends", icon: Heart, description: "Offer it to your style group first", color: "bg-pink-50 border-pink-200 text-pink-700" },
  { key: "sell", label: "Sell It", icon: ShoppingBag, description: "List it in a closet sale", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "donate", label: "Donate", icon: Gift, description: "Give it to a good cause and log for taxes", color: "bg-green-50 border-green-200 text-green-700" },
  { key: "keep", label: "Keep It", icon: X, description: "I'll hold onto this one", color: "bg-gray-50 border-gray-200 text-gray-700" },
];

export default function LetItGoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: idleItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/closet/idle"],
  });

  const { mutate: markWorn } = useMutation({
    mutationFn: (itemId: string) => apiRequest("POST", `/api/v1/closet/${itemId}/worn`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/closet/idle"] });
      toast({ title: "Marked as worn!" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Closet Edit</h1>
        <p className="text-muted-foreground">
          These items haven't been worn in 6+ months. Time to decide what stays and what goes.
        </p>
      </div>

      {idleItems.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Your closet is in great shape!</h3>
          <p className="text-muted-foreground text-sm">No items have been idle for 6+ months.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {idleItems.map((item: any) => (
            <div key={item.id} className="border rounded-xl overflow-hidden">
              <div className="flex gap-4 p-4">
                {item.imageUrl && (
                  <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  {item.brand && <p className="text-sm text-muted-foreground">{item.brand}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Not worn in {item.idleMonths || "6"}+ months
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => markWorn(item.id)}
                  >
                    I wore this recently
                  </Button>
                </div>
              </div>

              <div className="border-t grid grid-cols-2 divide-x">
                {ACTIONS.map((action) => (
                  <button
                    key={action.key}
                    className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <action.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 5: Register Routes in App.tsx

Open `client/src/App.tsx` and add:

```typescript
import StyleGroupsPage from "./pages/style-groups";
import LetItGoPage from "./pages/let-it-go";

// Add to Route block:
<Route path="/groups" component={StyleGroupsPage} />
<Route path="/groups/:id" component={StyleGroupsPage} />
<Route path="/closet/edit" component={LetItGoPage} />
```

---

## PHASE 6: Add to Navigation

Open `client/src/components/header.tsx`.

For logged-in users, add to the nav:

```typescript
{ label: "My Group", href: "/groups" }
```

And add to the closet page a link to the "Closet Edit" feature:

```typescript
{ label: "Closet Edit", href: "/closet/edit" }
```

---

## PHASE 7: TypeScript Check and Push

```bash
npm run check
```

Fix any type errors. Common issues:
- Import the new schema tables in storage.ts
- Add `or`, `lt`, `isNull` imports from drizzle-orm if not already imported

Then commit and push:

```bash
git add .
git commit -m "feat: social closet - friend groups, lending, polls, hauls, lifecycle"
git push origin main
```

---

## Summary of What This Builds

| Feature | Route | Description |
|---|---|---|
| Style Groups | `/groups` | Create/join private friend groups |
| Group Feed | `/groups/:id` | Haul posts, polls, activity |
| Borrow Requests | via API | Request to borrow from friend's closet |
| Outfit Polls | via API | "Help me decide" voting |
| Closet Sales | via API | Friend-group yard sales |
| Donation Logs | via API | Tax-ready donation records |
| Closet Edit | `/closet/edit` | Idle item alerts + Let It Go flow |

## Do Not Touch
- `server/services/anthropic.ts`
- `vercel.json`
- `client/src/lib/tpsWarp.ts`
- Any file in the `Z` folder
