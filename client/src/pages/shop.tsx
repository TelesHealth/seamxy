import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal } from "lucide-react";

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [demographic, setDemographic] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState("best_match");

  const userId = typeof window !== 'undefined' ? localStorage.getItem('perfectfit_user_id') : null;

  // Fetch products from API
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/v1/products", { demographic, category, minPrice: priceRange[0], maxPrice: priceRange[1], userId }],
    enabled: !!demographic || category !== "all",
  });

  const filteredProducts = products
    .filter((p: any) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price_low") return Number(a.price) - Number(b.price);
      if (sortBy === "price_high") return Number(b.price) - Number(a.price);
      return (b.totalScore || 0) - (a.totalScore || 0); // best_match
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
            Shop Perfect Fits
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover clothing matched to your measurements, style, and budget
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5" />
                <h2 className="font-600 text-lg">Filters</h2>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>

                {/* Demographic */}
                <div>
                  <Label htmlFor="demographic">Shop For</Label>
                  <Select value={demographic} onValueChange={setDemographic}>
                    <SelectTrigger id="demographic" className="mt-2" data-testid="select-demographic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="young_adults">Young Adults</SelectItem>
                      <SelectItem value="children">Children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="mt-2" data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="shirt">Shirts</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="jacket">Jackets</SelectItem>
                      <SelectItem value="dress">Dresses</SelectItem>
                      <SelectItem value="shoes">Shoes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Price Range</Label>
                  <div className="mt-4 px-2">
                    <Slider
                      min={0}
                      max={500}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm font-500">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchQuery("");
                  setCategory("all");
                  setDemographic("all");
                  setPriceRange([0, 500]);
                }} data-testid="button-reset-filters">
                  Reset Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground" data-testid="text-results-count">
                {filteredProducts.length} products found
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best_match">Best Match</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading products...</p>
              </Card>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    {...product}
                    price={Number(product.price)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No products found matching your filters. Try adjusting your search.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
