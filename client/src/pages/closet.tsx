import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useCustomerAuth } from "@/lib/customer-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Plus,
  Trash2,
  Heart,
  Filter,
  Grid3X3,
  List,
  Search,
  Sparkles,
  Camera,
  X,
  ChevronRight,
  Lock,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import type { UserClosetItem, UserSubscription, WardrobeGapAnalysis } from "@shared/schema";

const categoryOptions = [
  { id: "tops", label: "Tops", subcategories: ["t-shirt", "blouse", "sweater", "cardigan", "tank_top", "shirt"] },
  { id: "bottoms", label: "Bottoms", subcategories: ["jeans", "pants", "shorts", "skirt", "leggings"] },
  { id: "dresses", label: "Dresses", subcategories: ["casual", "formal", "maxi", "mini", "midi"] },
  { id: "outerwear", label: "Outerwear", subcategories: ["jacket", "coat", "blazer", "vest", "hoodie"] },
  { id: "shoes", label: "Shoes", subcategories: ["sneakers", "heels", "boots", "sandals", "flats", "loafers"] },
  { id: "accessories", label: "Accessories", subcategories: ["bag", "jewelry", "scarf", "belt", "hat", "watch"] },
];

const seasonOptions = ["spring", "summer", "fall", "winter", "all"];
const colorOptions = ["black", "white", "gray", "navy", "brown", "beige", "red", "pink", "blue", "green", "yellow", "purple", "orange", "multicolor"];

interface ClosetData {
  items: UserClosetItem[];
  subscription: UserSubscription;
  gapAnalysis: WardrobeGapAnalysis | null;
}

function UploadModal({ 
  open, 
  onOpenChange, 
  onUpload,
  remainingSlots 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onUpload: (data: any) => void;
  remainingSlots: number;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [season, setSeason] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      setIsAnalyzing(true);
      setTimeout(() => {
        setCategory("tops");
        setSubcategory("t-shirt");
        setColor("black");
        setIsAnalyzing(false);
      }, 1500);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !category) return;
    
    onUpload({
      imageUrl: previewUrl,
      category,
      subcategory,
      color,
      brand,
      season,
    });
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setCategory("");
    setSubcategory("");
    setColor("");
    setBrand("");
    setSeason("");
    onOpenChange(false);
  };

  const selectedCategory = categoryOptions.find(c => c.id === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Closet</DialogTitle>
          <DialogDescription>
            Upload a photo of your clothing item. Our AI will help identify it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Click to upload</p>
              <p className="text-sm text-muted-foreground">or drag and drop an image</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-closet-upload"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" />
                    <p className="text-sm mt-2">AI analyzing image...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {previewUrl && !isAnalyzing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                  <SelectTrigger data-testid="select-subcategory">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.subcategories.map(sub => (
                      <SelectItem key={sub} value={sub}>
                        {sub.replace("_", " ").charAt(0).toUpperCase() + sub.slice(1).replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger data-testid="select-color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(c => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Season</Label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger data-testid="select-season">
                    <SelectValue placeholder="All seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonOptions.map(s => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Brand (optional)</Label>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Nike, Zara, H&M"
                  data-testid="input-brand"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {remainingSlots} slots remaining
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedFile || !category}
                data-testid="button-save-closet-item"
              >
                Add to Closet
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GapAnalysisCard({ analysis }: { analysis: WardrobeGapAnalysis }) {
  const [, setLocation] = useLocation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Wardrobe Analysis
          </CardTitle>
          <Badge variant={analysis.overallScore && analysis.overallScore >= 70 ? "default" : "secondary"}>
            {analysis.overallScore}% Complete
          </Badge>
        </div>
        <CardDescription>
          AI-powered insights about your wardrobe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={analysis.overallScore || 0} className="h-2" />
        
        {analysis.gaps && (analysis.gaps as any[]).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Suggested Additions</h4>
            {(analysis.gaps as any[]).slice(0, 3).map((gap, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-muted rounded-md">
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  gap.priority === "high" ? "text-destructive" : "text-muted-foreground"
                }`} />
                <div>
                  <p className="text-sm font-medium">{gap.category}</p>
                  <p className="text-xs text-muted-foreground">{gap.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {analysis.capsuleSuggestions && (analysis.capsuleSuggestions as any[]).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Capsule Wardrobe Ideas</h4>
            {(analysis.capsuleSuggestions as any[]).slice(0, 2).map((capsule, i) => (
              <div key={i} className="p-2 bg-muted rounded-md">
                <p className="text-sm font-medium">{capsule.name}</p>
                <p className="text-xs text-muted-foreground">{capsule.pieces.length} pieces</p>
              </div>
            ))}
          </div>
        )}

        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => setLocation("/shop")}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Shop Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Closet() {
  const [, setLocation] = useLocation();
  const { customer } = useCustomerAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading } = useQuery<ClosetData>({
    queryKey: ["/api/v1/closet"],
    enabled: !!customer,
  });

  const uploadMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await apiRequest("POST", "/api/v1/closet/items", itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/closet"] });
      toast({ title: "Item added to closet!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/v1/closet/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/closet"] });
      toast({ title: "Item removed from closet" });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("POST", `/api/v1/closet/items/${itemId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/closet"] });
    },
  });

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your Digital Closet</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to start building your wardrobe
          </p>
          <Button onClick={() => setLocation("/login")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  const closetData = data || {
    items: [],
    subscription: { tier: "free" as const, closetUploadLimit: 20 },
    gapAnalysis: null,
  };

  const { items, subscription, gapAnalysis } = closetData;
  const usedSlots = items.length;
  const totalSlots = subscription.closetUploadLimit || 20;
  const remainingSlots = Math.max(0, totalSlots - usedSlots);
  const isAtLimit = subscription.tier === "free" && remainingSlots <= 0;

  const filteredItems = items.filter(item => {
    if (activeTab === "favorites" && !item.isFavorite) return false;
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (searchQuery && !item.category.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.brand?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Closet</h1>
            <p className="text-muted-foreground mt-1">
              {usedSlots} items • {remainingSlots} slots remaining
            </p>
          </div>
          <div className="flex items-center gap-3">
            {subscription.tier === "free" && (
              <div className="hidden md:block">
                <Progress value={(usedSlots / totalSlots) * 100} className="w-32 h-2" />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {usedSlots}/{totalSlots} items
                </p>
              </div>
            )}
            <Button 
              onClick={() => setUploadOpen(true)} 
              disabled={isAtLimit}
              data-testid="button-upload-item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Limit Warning */}
        {isAtLimit && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium">Closet limit reached</p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Premium for unlimited closet storage
                  </p>
                </div>
              </div>
              <Button onClick={() => setLocation("/pricing")}>
                Upgrade
              </Button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Categories & Analysis */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={filterCategory === "all" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setFilterCategory("all")}
                >
                  All Items
                  <Badge variant="outline" className="ml-auto">{items.length}</Badge>
                </Button>
                {categoryOptions.map(cat => (
                  <Button
                    key={cat.id}
                    variant={filterCategory === cat.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setFilterCategory(cat.id)}
                  >
                    {cat.label}
                    <Badge variant="outline" className="ml-auto">
                      {categoryCounts[cat.id] || 0}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {gapAnalysis && <GapAnalysisCard analysis={gapAnalysis} />}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="favorites">
                    <Heart className="w-4 h-4 mr-1" />
                    Favorites
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search closet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                  data-testid="input-search-closet"
                />
              </div>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Items Grid/List */}
            {filteredItems.length === 0 ? (
              <Card className="p-12 text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {items.length === 0 ? "Your closet is empty" : "No items match your filters"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {items.length === 0 
                    ? "Start adding items to get personalized outfit recommendations"
                    : "Try adjusting your search or filters"
                  }
                </p>
                {items.length === 0 && (
                  <Button onClick={() => setUploadOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Item
                  </Button>
                )}
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="overflow-hidden group">
                        <div className="relative aspect-square">
                          <img
                            src={item.imageUrl}
                            alt={item.category}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="w-8 h-8"
                                onClick={() => toggleFavoriteMutation.mutate(item.id)}
                              >
                                <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="w-8 h-8"
                                onClick={() => deleteMutation.mutate(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm capitalize">{item.subcategory || item.category}</p>
                          <p className="text-xs text-muted-foreground">{item.brand || item.color}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.category}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium capitalize">{item.subcategory || item.category}</p>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                        <div className="flex gap-1 mt-1">
                          {item.color && <Badge variant="outline" className="text-xs">{item.color}</Badge>}
                          {item.season && item.season !== "all" && (
                            <Badge variant="outline" className="text-xs">{item.season}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFavoriteMutation.mutate(item.id)}
                        >
                          <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={(data) => uploadMutation.mutate(data)}
        remainingSlots={remainingSlots}
      />
    </div>
  );
}
