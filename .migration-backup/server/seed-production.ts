import { db } from "./db";
import { supplierAccounts, users, stylistProfiles } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

/**
 * Production Seed Script
 * 
 * This script creates the designer@seamxy.test test account in production.
 * It's safe to run multiple times (checks for existing records).
 * 
 * Usage:
 *   tsx server/seed-production.ts
 */

async function seedProduction() {
  console.log("🌱 Seeding production database...");
  console.log("📍 DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");

  try {
    // Step 1: Create supplier account
    console.log("\n1️⃣ Creating designer supplier account...");
    
    const existingSupplier = await db
      .select()
      .from(supplierAccounts)
      .where(eq(supplierAccounts.email, "designer@seamxy.test"))
      .limit(1);

    let supplierId: string;
    
    if (existingSupplier.length > 0) {
      console.log("   ℹ️  Supplier account already exists");
      supplierId = existingSupplier[0].id;
    } else {
      const hashedPassword = await bcrypt.hash("password123", 12);
      
      const [newSupplier] = await db
        .insert(supplierAccounts)
        .values({
          email: "designer@seamxy.test",
          password: hashedPassword,
          businessName: "Luxe Design Studio",
          ownerName: "Test Designer",
          role: "designer",
          tier: "pro",
          isVerified: true,
          isActive: true,
        })
        .returning();
      
      supplierId = newSupplier.id;
      console.log("   ✅ Supplier account created:", supplierId);
    }

    // Step 2: Create internal user account
    console.log("\n2️⃣ Creating internal user account...");
    
    const internalEmail = `supplier-${supplierId}@seamxy.internal`;
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, internalEmail))
      .limit(1);

    let userId: string;

    if (existingUser.length > 0) {
      console.log("   ℹ️  Internal user already exists");
      userId = existingUser[0].id;
    } else {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 12);
      
      const [newUser] = await db
        .insert(users)
        .values({
          email: internalEmail,
          password: hashedPassword,
          name: "Luxe Design Studio (Internal)",
          demographic: "women",
        })
        .returning();
      
      userId = newUser.id;
      console.log("   ✅ Internal user created:", userId);
    }

    // Step 3: Create stylist profile
    console.log("\n3️⃣ Creating stylist profile...");
    
    const existingProfile = await db
      .select()
      .from(stylistProfiles)
      .where(eq(stylistProfiles.handle, "luxe-design-studio"))
      .limit(1);

    if (existingProfile.length > 0) {
      console.log("   ℹ️  Stylist profile already exists");
      console.log("   📝 Profile ID:", existingProfile[0].id);
      console.log("   🔗 Handle:", existingProfile[0].handle);
    } else {
      const [newProfile] = await db
        .insert(stylistProfiles)
        .values({
          userId: userId,
          handle: "luxe-design-studio",
          displayName: "Luxe Design Studio",
          bio: "AI Stylist for Luxe Design Studio",
          isVerified: true,
          isActive: true,
        })
        .returning();
      
      console.log("   ✅ Stylist profile created:", newProfile.id);
      console.log("   🔗 Handle:", newProfile.handle);
    }

    console.log("\n✨ Production seeding complete!\n");
    console.log("📋 Test Credentials:");
    console.log("   Email: designer@seamxy.test");
    console.log("   Password: password123");
    console.log("   Role: designer (Pro tier)");
    console.log("   Handle: luxe-design-studio\n");

  } catch (error) {
    console.error("❌ Error seeding production:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seed function
seedProduction();
