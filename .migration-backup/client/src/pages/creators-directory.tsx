import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Users, TrendingUp, DollarSign, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Creator {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  category: string;
  tierCount: number;
  lowestTierPrice: number | null;
  postCount: number;
  publicPostCount: number;
  subscriberCount: number;
  createdAt: string;
}

export default function CreatorsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: [`/api/v1/creators?search=${searchQuery}&category=${category !== 'all' ? category : ''}&sortBy=${sortBy}`],
  });

  const categories = [
    "all",
    "Fashion",
    "Streetwear",
    "Luxury",
    "Sustainable",
    "Vintage",
    "Minimalist",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Discover Fashion Creators</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with talented stylists and designers. Subscribe for exclusive content, personalized styling, and AI-powered fashion advice.
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search creators..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-creators"
                />
              </div>
              <Button variant="outline" size="icon" data-testid="button-filters">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="ml-auto text-sm text-muted-foreground">
              {creators.length} {creators.length === 1 ? 'creator' : 'creators'} found
            </div>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-muted" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No creators found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/creator/${creator.handle}`}>
                <Card className="hover-elevate cursor-pointer h-full flex flex-col" data-testid={`card-creator-${creator.id}`}>
                  {/* Cover Image */}
                  <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
                    {creator.coverImageUrl && (
                      <img
                        src={creator.coverImageUrl}
                        alt={`${creator.displayName} cover`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      {creator.category}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-background -mt-8 relative z-10">
                        <AvatarImage src={creator.avatarUrl || undefined} />
                        <AvatarFallback>{creator.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{creator.displayName}</CardTitle>
                        <CardDescription className="text-xs">@{creator.handle}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {creator.bio || "Fashion creator and stylist"}
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-semibold" data-testid={`text-subscribers-${creator.id}`}>
                          {creator.subscriberCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Subscribers</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{creator.publicPostCount}</div>
                        <div className="text-xs text-muted-foreground">Posts</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{creator.tierCount}</div>
                        <div className="text-xs text-muted-foreground">Tiers</div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                      {creator.lowestTierPrice ? (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            ${(creator.lowestTierPrice / 100).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">/mo</span>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Free content</div>
                      )}
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
