import { db } from "./db";
import { aiPersonas, subscriptionPlans, pricingConfigs, products, makers } from "@shared/schema";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Seed AI Personas
  const personasData = [
    {
      id: "aiden",
      name: "Aiden",
      description: "Modern minimalist stylist for professionals",
      tone: "Confident, calm, and polished",
      specialty: "Smart-casual & Business",
      systemPrompt: `You are Aiden, a professional fashion stylist specializing in modern minimalist and smart-casual styles. 
You help professionals dress confidently for work and life. Your tone is calm, polished, and encouraging.
Focus on timeless pieces, quality over quantity, and versatile wardrobes.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden",
      voiceId: null,
      isActive: true,
    },
    {
      id: "luca",
      name: "Luca",
      description: "Trendy streetwear expert",
      tone: "Energetic, witty, urban",
      specialty: "Streetwear & Sneakers",
      systemPrompt: `You are Luca, an energetic streetwear expert who knows all the latest trends and drops.
You're witty, use urban slang naturally, and help people express themselves through bold fashion choices.
Focus on sneakers, limited editions, and street culture.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luca",
      voiceId: null,
      isActive: true,
    },
    {
      id: "evelyn",
      name: "Evelyn",
      description: "Luxury fashion guide",
      tone: "Elegant, warm, sophisticated",
      specialty: "Luxury & Formal",
      systemPrompt: `You are Evelyn, a sophisticated luxury fashion consultant with years of experience in high-end fashion.
You're warm yet refined, helping clients invest in timeless luxury pieces and navigate formal dress codes.
Focus on quality craftsmanship, designer heritage, and elegant styling.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn",
      voiceId: null,
      isActive: true,
    },
    {
      id: "kai",
      name: "Kai",
      description: "Budget-conscious style coach",
      tone: "Friendly, practical, down-to-earth",
      specialty: "Budget & Everyday",
      systemPrompt: `You are Kai, a friendly and practical style coach who helps people look great on any budget.
You're down-to-earth, encouraging, and focused on value and versatility. You know all the best affordable brands.
Focus on mixing high and low, thrifting tips, and maximizing wardrobe value.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kai",
      voiceId: null,
      isActive: true,
    },
    {
      id: "mei",
      name: "Mei Chen",
      description: "East-meets-West fusion expert",
      tone: "Thoughtful, cultured, balanced",
      specialty: "Minimalist & Cultural Fusion",
      systemPrompt: `You are Mei Chen, a fashion stylist who beautifully blends Eastern and Western aesthetics. 
You specialize in modern minimalism infused with cultural depth and artful details. Your tone is thoughtful, cultured, and balanced.
Focus on clean lines, quality fabrics, subtle cultural influences, and mindful wardrobe curation.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mei",
      voiceId: null,
      isActive: true,
    },
    {
      id: "marcus",
      name: "Marcus Thompson",
      description: "Bold contemporary fashion innovator",
      tone: "Confident, creative, authentic",
      specialty: "Contemporary & Pattern Mixing",
      systemPrompt: `You are Marcus Thompson, a contemporary fashion expert who celebrates bold choices and cultural expression.
You excel at pattern mixing, color coordination, and helping clients express their authentic selves through fashion.
Your tone is confident, creative, and encouraging. Focus on statement pieces, cultural pride, and fearless style.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      voiceId: null,
      isActive: true,
    },
    {
      id: "sofia",
      name: "Sofia Rodriguez",
      description: "Vibrant Latin fashion specialist",
      tone: "Warm, energetic, passionate",
      specialty: "Color & Latin Fashion",
      systemPrompt: `You are Sofia Rodriguez, a vibrant fashion stylist who brings Latin flair to modern fashion.
You're passionate about bold colors, beautiful textures, and outfits that celebrate life and personality.
Your tone is warm, energetic, and encouraging. Focus on vibrant palettes, cultural influences, and confident styling.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
      voiceId: null,
      isActive: true,
    },
    {
      id: "eduardo",
      name: "Eduardo Morales",
      description: "Distinguished classic style expert",
      tone: "Refined, warm, knowledgeable",
      specialty: "Classic & Timeless Elegance",
      systemPrompt: `You are Eduardo Morales, a distinguished gentleman with decades of experience in classic menswear and timeless style.
You blend Old World sophistication with modern sensibility, helping clients invest in quality pieces that age gracefully.
Your tone is refined, warm, and knowledgeable. Focus on heritage brands, proper tailoring, elegant details, and enduring style that transcends trends.`,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eduardo",
      voiceId: null,
      isActive: true,
    },
  ];

  try {
    for (const persona of personasData) {
      await db.insert(aiPersonas).values(persona).onConflictDoNothing();
    }
    console.log("✅ AI Personas seeded");
  } catch (error) {
    console.log("ℹ️ AI Personas already exist");
  }

  // Seed Subscription Plans
  const plansData = [
    {
      planType: "maker",
      name: "Basic",
      price: "0",
      billingCycle: "monthly",
      features: ["Basic profile", "Up to 5 quotes/month", "Community support"],
      isActive: true,
      stripePriceId: null,
    },
    {
      planType: "maker",
      name: "Pro",
      price: "29",
      billingCycle: "monthly",
      features: ["Featured profile", "Unlimited quotes", "Priority support", "Analytics dashboard"],
      isActive: true,
      stripePriceId: null,
    },
    {
      planType: "maker",
      name: "Elite",
      price: "99",
      billingCycle: "monthly",
      features: ["Premium placement", "Unlimited quotes", "Dedicated support", "Advanced analytics", "Marketing tools"],
      isActive: true,
      stripePriceId: null,
    },
    {
      planType: "user",
      name: "AI Stylist Pro",
      price: "9.99",
      billingCycle: "monthly",
      features: ["Video avatar consultations", "Voice chat", "Priority AI responses", "Unlimited conversations"],
      isActive: true,
      stripePriceId: null,
    },
  ];

  try {
    for (const plan of plansData) {
      await db.insert(subscriptionPlans).values(plan).onConflictDoNothing();
    }
    console.log("✅ Subscription plans seeded");
  } catch (error) {
    console.log("ℹ️ Subscription plans already exist");
  }

  // Seed Pricing Configs
  const configsData = [
    {
      configKey: "affiliate_commission_default",
      configValue: JSON.stringify({ rate: 0.05, description: "5% commission on retail sales" }),
      description: "Default affiliate commission rate",
    },
    {
      configKey: "affiliate_commission_premium",
      configValue: JSON.stringify({ rate: 0.07, description: "7% commission for premium partners" }),
      description: "Premium partner affiliate commission rate",
    },
    {
      configKey: "bespoke_platform_fee",
      configValue: JSON.stringify({ rate: 0.10, description: "10% platform fee on custom orders" }),
      description: "Platform fee for bespoke orders",
    },
  ];

  try {
    for (const config of configsData) {
      await db.insert(pricingConfigs).values(config).onConflictDoNothing();
    }
    console.log("✅ Pricing configs seeded");
  } catch (error) {
    console.log("ℹ️ Pricing configs already exist");
  }

  // Seed Sample Products
  const productsData = [
    {
      name: "Slim Fit Chino Pants",
      brand: "Bonobos",
      category: "pants",
      demographic: "men" as const,
      price: "128",
      budgetTier: "mid_range" as const,
      styleTags: ["minimalist", "smart-casual"],
      imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
      description: "Perfectly tailored chinos for the modern professional",
      sizes: ["28", "30", "32", "34", "36"],
      sizeChart: null,
      affiliateUrl: "https://bonobos.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Stretch Oxford Shirt",
      brand: "Banana Republic",
      category: "shirt",
      demographic: "men" as const,
      price: "89",
      budgetTier: "mid_range" as const,
      styleTags: ["smart-casual", "modern"],
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
      description: "Classic oxford with modern stretch for all-day comfort",
      sizes: ["S", "M", "L", "XL"],
      sizeChart: null,
      affiliateUrl: "https://bananarepublic.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Essential Blazer",
      brand: "Everlane",
      category: "jacket",
      demographic: "women" as const,
      price: "248",
      budgetTier: "mid_range" as const,
      styleTags: ["minimalist", "professional"],
      imageUrl: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
      description: "Timeless blazer crafted from sustainable materials",
      sizes: ["XS", "S", "M", "L", "XL"],
      sizeChart: null,
      affiliateUrl: "https://everlane.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Classic Denim Jacket",
      brand: "Levi's",
      category: "jacket",
      demographic: "young_adults" as const,
      price: "98",
      budgetTier: "mid_range" as const,
      styleTags: ["casual", "street"],
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
      description: "Iconic denim jacket that never goes out of style",
      sizes: ["S", "M", "L", "XL"],
      sizeChart: null,
      affiliateUrl: "https://levis.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Premium Leather Sneakers",
      brand: "Cole Haan",
      category: "shoes",
      demographic: "men" as const,
      price: "180",
      budgetTier: "mid_range" as const,
      styleTags: ["smart-casual", "modern", "minimalist"],
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      description: "Versatile leather sneakers with superior comfort technology",
      sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
      sizeChart: null,
      affiliateUrl: "https://colehaan.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Classic Oxford Dress Shoes",
      brand: "Allen Edmonds",
      category: "shoes",
      demographic: "men" as const,
      price: "395",
      budgetTier: "premium" as const,
      styleTags: ["formal", "professional", "classic"],
      imageUrl: "https://images.unsplash.com/photo-1614252368970-e1e9f5d476fe?w=800&q=80",
      description: "Handcrafted oxfords for the discerning professional",
      sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
      sizeChart: null,
      affiliateUrl: "https://allenedmonds.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Running Performance Sneakers",
      brand: "Nike",
      category: "shoes",
      demographic: "young_adults" as const,
      price: "140",
      budgetTier: "mid_range" as const,
      styleTags: ["street", "athletic", "modern"],
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      description: "High-performance running shoes with street style appeal",
      sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
      sizeChart: null,
      affiliateUrl: "https://nike.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Chelsea Ankle Boots",
      brand: "Thursday Boot Company",
      category: "shoes",
      demographic: "women" as const,
      price: "199",
      budgetTier: "mid_range" as const,
      styleTags: ["modern", "minimalist", "versatile"],
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      description: "Timeless chelsea boots crafted from premium leather",
      sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
      sizeChart: null,
      affiliateUrl: "https://thursdayboots.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
    {
      name: "Casual Canvas Sneakers",
      brand: "Vans",
      category: "shoes",
      demographic: "young_adults" as const,
      price: "65",
      budgetTier: "affordable" as const,
      styleTags: ["casual", "street", "vintage"],
      imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
      description: "Classic low-top canvas sneakers for everyday wear",
      sizes: ["6", "7", "8", "9", "10", "11", "12"],
      sizeChart: null,
      affiliateUrl: "https://vans.com/example",
      isSponsored: false,
      sponsorPriority: 0,
    },
  ];

  try {
    for (const product of productsData) {
      await db.insert(products).values(product).onConflictDoNothing();
    }
    console.log("✅ Sample products seeded");
  } catch (error) {
    console.log("ℹ️ Sample products already exist");
  }

  // Seed Makers
  const makersData = [
    {
      email: "aria@stitchhouse.com",
      password: "password123",
      businessName: "Aria's Stitch House",
      ownerName: "Aria Williams",
      description: "Boutique atelier specializing in custom wedding dresses and formal gowns. 15 years of experience creating dream garments.",
      specialties: ["Dresses", "Gowns", "Formal Wear"],
      styleTags: ["elegant", "romantic", "luxury"],
      budgetMin: 800,
      budgetMax: 5000,
      location: "New York, NY",
      deliveryZones: ["New York", "New Jersey", "Connecticut"],
      leadTimeDays: 45,
      rating: "4.9",
      totalReviews: 127,
      portfolioImages: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80"
      ],
      stripeAccountId: null,
      subscriptionTier: "pro",
      isVerified: true,
      isActive: true,
    },
    {
      email: "james@tailored.co",
      password: "password123",
      businessName: "Tailored by James",
      ownerName: "James Chen",
      description: "Master tailor focused on bespoke men's suits and business attire. Trained in Savile Row techniques.",
      specialties: ["Suits", "Blazers", "Shirts"],
      styleTags: ["classic", "professional", "modern"],
      budgetMin: 600,
      budgetMax: 3500,
      location: "San Francisco, CA",
      deliveryZones: ["California", "Nevada", "Oregon"],
      leadTimeDays: 30,
      rating: "4.8",
      totalReviews: 89,
      portfolioImages: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80"
      ],
      stripeAccountId: null,
      subscriptionTier: "elite",
      isVerified: true,
      isActive: true,
    },
    {
      email: "rosa@customcouture.com",
      password: "password123",
      businessName: "Rosa's Custom Couture",
      ownerName: "Rosa Martinez",
      description: "Vibrant custom clothing with a Latin flair. Specializing in quinceañera dresses, party wear, and colorful ensembles.",
      specialties: ["Dresses", "Party Wear", "Traditional Attire"],
      styleTags: ["colorful", "vibrant", "cultural"],
      budgetMin: 400,
      budgetMax: 2500,
      location: "Miami, FL",
      deliveryZones: ["Florida", "Georgia", "Texas"],
      leadTimeDays: 21,
      rating: "4.7",
      totalReviews: 156,
      portfolioImages: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
      ],
      stripeAccountId: null,
      subscriptionTier: "pro",
      isVerified: true,
      isActive: true,
    },
    {
      email: "malik@urbanstitch.com",
      password: "password123",
      businessName: "Urban Stitch Studio",
      ownerName: "Malik Johnson",
      description: "Contemporary streetwear and custom jackets. Bringing bold designs and cultural expression to life.",
      specialties: ["Jackets", "Streetwear", "Casual"],
      styleTags: ["street", "contemporary", "bold"],
      budgetMin: 300,
      budgetMax: 1500,
      location: "Atlanta, GA",
      deliveryZones: ["Georgia", "Alabama", "Tennessee", "North Carolina"],
      leadTimeDays: 14,
      rating: "4.6",
      totalReviews: 73,
      portfolioImages: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"
      ],
      stripeAccountId: null,
      subscriptionTier: "basic",
      isVerified: true,
      isActive: true,
    },
    {
      email: "lily@minimalistwardrobe.com",
      password: "password123",
      businessName: "Minimalist Wardrobe",
      ownerName: "Lily Park",
      description: "Clean lines, quality fabrics, and timeless designs. Specializing in minimalist capsule wardrobe pieces.",
      specialties: ["Dresses", "Pants", "Shirts", "Jackets"],
      styleTags: ["minimalist", "modern", "versatile"],
      budgetMin: 350,
      budgetMax: 1800,
      location: "Seattle, WA",
      deliveryZones: ["Washington", "Oregon", "California"],
      leadTimeDays: 28,
      rating: "4.9",
      totalReviews: 94,
      portfolioImages: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80"
      ],
      stripeAccountId: null,
      subscriptionTier: "pro",
      isVerified: true,
      isActive: true,
    },
  ];

  try {
    for (const maker of makersData) {
      await db.insert(makers).values(maker).onConflictDoNothing();
    }
    console.log("✅ Sample makers seeded");
  } catch (error) {
    console.log("ℹ️ Sample makers already exist");
  }

  console.log("🎉 Database seeding complete!");
}
