import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Shield } from "lucide-react";

// Mock maker data
const mockMakers = [
  {
    id: "1",
    businessName: "Savile Modern Tailors",
    ownerName: "James Richardson",
    location: "London, UK",
    specialties: ["Suits", "Shirts", "Formal Wear"],
    styleTags: ["classic", "elegant", "bespoke"],
    budgetMin: 600,
    budgetMax: 2500,
    leadTimeDays: 14,
    rating: 4.9,
    totalReviews: 127,
    deliveryZones: ["Global"],
    portfolioImages: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"],
    isVerified: true,
  },
  {
    id: "2",
    businessName: "Urban Stitch Co.",
    ownerName: "Maya Chen",
    location: "Los Angeles, USA",
    specialties: ["Denim", "Jackets", "Streetwear"],
    styleTags: ["modern", "street", "casual"],
    budgetMin: 200,
    budgetMax: 900,
    leadTimeDays: 21,
    rating: 4.7,
    totalReviews: 89,
    deliveryZones: ["US", "EU"],
    portfolioImages: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    isVerified: true,
  },
  {
    id: "3",
    businessName: "Minimal Atelier",
    ownerName: "Sofia Martinez",
    location: "Lisbon, PT",
    specialties: ["Shirts", "Chinos", "Minimalist"],
    styleTags: ["minimalist", "smart-casual", "contemporary"],
    budgetMin: 120,
    budgetMax: 600,
    leadTimeDays: 12,
    rating: 4.8,
    totalReviews: 64,
    deliveryZones: ["EU", "US"],
    portfolioImages: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"],
    isVerified: true,
  },
];

export default function Makers() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
            Custom Clothing Makers
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Connect with verified tailors and custom clothiers worldwide. Get bespoke pieces tailored exactly to your measurements and style.
          </p>
        </div>
      </section>

      {/* Makers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockMakers.map((maker) => (
              <Card key={maker.id} className="overflow-hidden hover-elevate group" data-testid={`card-maker-${maker.id}`}>
                {/* Portfolio Image */}
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={maker.portfolioImages[0]}
                    alt={maker.businessName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {maker.isVerified && (
                    <div className="absolute top-3 right-3 p-2 rounded-full bg-primary text-primary-foreground">
                      <Shield className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Business Name & Rating */}
                  <div className="mb-4">
                    <h3 className="text-xl font-600 text-foreground mb-2" data-testid={`text-name-${maker.id}`}>
                      {maker.businessName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-600" data-testid={`text-rating-${maker.id}`}>{maker.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({maker.totalReviews} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {maker.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span data-testid={`text-location-${maker.id}`}>{maker.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{maker.leadTimeDays} days lead time</span>
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div className="p-3 rounded-lg bg-muted/50 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Typical Price Range</p>
                    <p className="font-600" data-testid={`text-budget-${maker.id}`}>
                      ${maker.budgetMin} - ${maker.budgetMax}
                    </p>
                  </div>

                  {/* Request Quote Button */}
                  <Button className="w-full" data-testid={`button-request-quote-${maker.id}`}>
                    Request Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-700 mb-4">
            Are You a Maker or Tailor?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our network of verified custom clothiers and connect with customers looking for perfect-fit garments.
          </p>
          <Button size="lg" variant="outline">
            Join as a Maker
          </Button>
        </div>
      </section>
    </div>
  );
}
