import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, Star, Clock, Scissors, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

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

  const { data: providers = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/gig/providers", city],
    queryFn: () =>
      fetch(`/api/v1/gig/providers${city ? `?city=${encodeURIComponent(city)}` : ""}`)
        .then((r) => r.json()),
  });

  const handleSearch = () => setCity(searchInput);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Local Alteration Specialists</h1>
        <p className="text-muted-foreground">
          Find skilled seamstresses, tailors, and alteration specialists near you.
          Real people, real skills, local service.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-48">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter your city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
            data-testid="input-city-search"
          />
        </div>
        <Button onClick={handleSearch} data-testid="button-search-providers">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Link href="/gig/register">
          <Button variant="outline" data-testid="link-offer-services">
            <Scissors className="w-4 h-4 mr-2" />
            Offer Services
          </Button>
        </Link>
      </div>

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
            <Button data-testid="button-be-first">Be the first in your area</Button>
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
      <Card className="p-5 hover-elevate cursor-pointer" data-testid={`card-provider-${provider.id}`}>
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={provider.profileImageUrl} alt={provider.displayName} />
            <AvatarFallback>
              <Scissors className="w-6 h-6 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg" data-testid={`text-provider-name-${provider.id}`}>
                {provider.displayName}
              </h3>
              {provider.isVerified && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {provider.city}{provider.state ? `, ${provider.state}` : ""}
              </span>
              {provider.averageRating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {parseFloat(provider.averageRating).toFixed(1)}
                  <span>({provider.totalReviews})</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {provider.completedJobs} jobs done
              </span>
            </div>

            {topServices.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {topServices.map((s: any) => (
                  <div key={s.id} className="text-xs bg-muted rounded-md px-3 py-1">
                    <span className="font-medium">{SERVICE_LABELS[s.serviceType] || s.customName}</span>
                    <span className="text-muted-foreground ml-1">
                      ${(s.priceMin / 100).toFixed(0)}–${(s.priceMax / 100).toFixed(0)}
                    </span>
                  </div>
                ))}
                {services.length > 3 && (
                  <div className="text-xs bg-muted rounded-md px-3 py-1 text-muted-foreground">
                    +{services.length - 3} more
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {provider.offersDropOff && <Badge variant="outline" className="text-xs">Drop-off</Badge>}
              {provider.offersHomeVisits && <Badge variant="outline" className="text-xs">Home visits</Badge>}
              {provider.offersShipping && <Badge variant="outline" className="text-xs">Ships items</Badge>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
