import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Shield, Package } from "lucide-react";
import type { Maker } from "@shared/schema";

export default function Makers() {
  const [, setLocation] = useLocation();

  const { data: makers, isLoading } = useQuery<Maker[]>({
    queryKey: ['/api/v1/makers'],
  });

  const verifiedMakers = makers?.filter((m) => m.isVerified && m.isActive) || [];

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-8">
        <div className="text-center">Loading makers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Custom Clothing Makers
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Connect with verified tailors and custom clothiers. Get bespoke pieces tailored exactly to your measurements and style.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {verifiedMakers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No makers available</h3>
                <p className="text-muted-foreground">Check back soon for verified makers.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {verifiedMakers.map((maker) => (
                <Card key={maker.id} className="overflow-hidden hover-elevate group" data-testid={`card-maker-${maker.id}`}>
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {maker.portfolioImages && maker.portfolioImages.length > 0 && (
                      <img
                        src={maker.portfolioImages[0]}
                        alt={maker.businessName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    {maker.isVerified && (
                      <div className="absolute top-3 right-3 p-2 rounded-full bg-primary text-primary-foreground">
                        <Shield className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-name-${maker.id}`}>
                        {maker.businessName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold" data-testid={`text-rating-${maker.id}`}>{maker.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({maker.totalReviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {maker.specialties?.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

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

                    <div className="p-3 rounded-lg bg-muted/50 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Typical Price Range</p>
                      <p className="font-semibold" data-testid={`text-budget-${maker.id}`}>
                        ${maker.budgetMin} - ${maker.budgetMax}
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => setLocation("/custom-request")}
                      data-testid={`button-request-quote-${maker.id}`}
                    >
                      Request Quote
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Are You a Maker or Tailor?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our network of verified custom clothiers and connect with customers looking for perfect-fit garments.
          </p>
          <Button size="lg" variant="outline" onClick={() => setLocation("/maker-dashboard")}>
            Join as a Maker
          </Button>
        </div>
      </section>
    </div>
  );
}
