import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useCustomerAuth } from "@/lib/customer-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StyleCTA } from "@/components/StyleCTA";
import {
  Plus,
  Trash2,
  Heart,
  Grid3X3,
  List,
  Search,
  Sparkles,
  Camera,
  X,
  Lock,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  ChevronRight,
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
  open, onOpenChange, onUpload, remainingSlots
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
    onUpload({ imageUrl: previewUrl, category, subcategory, color, brand, season });
    setSelectedFile(null);
    setPreviewUrl(null);
    setCategory("");
    setSubcategory("");
    setColor("");
    setBrand("");
    setSeason("");
    onOpenChange(false);
  };

  const selectedCategoryObj = categoryOptions.find(c => c.id === category);

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
              className="border-2 border-dashed border-foreground/15 rounded-2xl p-8 text-center cursor-pointer hover:border-[#2236E8]/40 transition-colors"
            >
              <Camera className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
              <p className="font-600 text-foreground/70">Click to upload</p>
              <p className="text-sm text-foreground/40">or drag and drop an image</p>
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
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
              <button
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-foreground/5 transition-colors"
                onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
              >
                <X className="w-4 h-4" />
              </button>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-[#2236E8] mx-auto animate-pulse" />
                    <p className="text-sm mt-2 text-foreground/70">AI analyzing image…</p>
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
                    {selectedCategoryObj?.subcategories.map(sub => (
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
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
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
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
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
            <span className="text-sm text-foreground/40">{remainingSlots} slots remaining</span>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                className="rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase"
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
        <div className="bg-white rounded-3xl w-full max-w-md text-center p-10 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-5">
            <Camera className="w-7 h-7 text-foreground/30" />
          </div>
          <h2 className="font-display text-3xl font-600 text-foreground mb-2">Your Digital Closet</h2>
          <p className="text-foreground/50 mb-7 text-sm leading-relaxed">
            Sign in to start building your wardrobe
          </p>
          <Button
            className="w-full rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase"
            onClick={() => setLocation("/login")}
          >
            Sign In
          </Button>
        </div>
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
    <div className="min-h-screen pb-16 sm:pb-0">
      <div className="px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-foreground/50 uppercase mb-3 flex items-center gap-3">
                <span className="w-8 h-px bg-foreground/30 inline-block" />
                Closet
              </p>
              <h1 className="font-display font-600 text-foreground leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                My Closet.
              </h1>
              <p className="text-foreground/50 mt-1">{usedSlots} items · {remainingSlots} slots remaining</p>
            </div>
            <div className="flex items-center gap-3">
              {subscription.tier === "free" && (
                <div className="hidden md:flex flex-col items-end gap-1">
                  <Progress value={(usedSlots / totalSlots) * 100} className="w-28 h-1.5" />
                  <p className="text-xs text-foreground/40">{usedSlots}/{totalSlots}</p>
                </div>
              )}
              <Button
                onClick={() => setUploadOpen(true)}
                disabled={isAtLimit}
                className="rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase px-5"
                data-testid="button-upload-item"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* ── Limit warning ── */}
          {isAtLimit && (
            <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-600 text-foreground">Closet limit reached</p>
                  <p className="text-sm text-foreground/50">Upgrade to Premium for unlimited closet storage</p>
                </div>
              </div>
              <Button
                className="rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase px-5 flex-shrink-0"
                onClick={() => setLocation("/pricing")}
              >
                Upgrade
              </Button>
            </div>
          )}

          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            {/* ── Left sidebar ── */}
            <div className="space-y-4">
              {/* Categories */}
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-4">Categories</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterCategory("all")}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                      filterCategory === "all"
                        ? "bg-[#0B1340] text-white"
                        : "text-foreground/60 hover:bg-foreground/4 hover:text-foreground"
                    }`}
                  >
                    <span className="font-500">All Items</span>
                    <span className={`text-xs ${filterCategory === "all" ? "text-white/60" : "text-foreground/30"}`}>
                      {items.length}
                    </span>
                  </button>
                  {categoryOptions.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                        filterCategory === cat.id
                          ? "bg-[#0B1340] text-white"
                          : "text-foreground/60 hover:bg-foreground/4 hover:text-foreground"
                      }`}
                    >
                      <span className="font-500">{cat.label}</span>
                      <span className={`text-xs ${filterCategory === cat.id ? "text-white/60" : "text-foreground/30"}`}>
                        {categoryCounts[cat.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gap analysis */}
              {gapAnalysis && (
                <div className="bg-[#0B1340] rounded-3xl p-5 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-white/40 tracking-widest uppercase">Wardrobe Analysis</p>
                    <span className="text-xs bg-white/10 rounded-full px-2.5 py-1 text-white/70">
                      {gapAnalysis.overallScore}%
                    </span>
                  </div>
                  <Progress value={gapAnalysis.overallScore || 0} className="h-1.5 mb-4 bg-white/10" />

                  {gapAnalysis.gaps && (gapAnalysis.gaps as any[]).length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-white/50 font-600 uppercase tracking-widest">Suggested</p>
                      {(gapAnalysis.gaps as any[]).slice(0, 3).map((gap, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                            gap.priority === "high" ? "text-red-400" : "text-white/30"
                          }`} />
                          <div>
                            <p className="text-xs font-600 text-white/80">{gap.category}</p>
                            <p className="text-[10px] text-white/40">{gap.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setLocation("/shop")}
                    className="w-full flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white/90 transition-colors border border-white/15 rounded-xl py-2.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Shop Recommendations
                  </button>
                </div>
              )}
            </div>

            {/* ── Main content ── */}
            <div className="space-y-5">
              {/* Filters bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-white rounded-full p-1 shadow-sm">
                  {["all", "favorites"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-1.5 text-xs tracking-widest uppercase font-500 transition-all ${
                        activeTab === tab
                          ? "bg-[#0B1340] text-white shadow"
                          : "text-foreground/50 hover:text-foreground"
                      }`}
                    >
                      {tab === "all" ? "All" : "Favorites"}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[160px] max-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
                  <Input
                    placeholder="Search closet…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-full border-foreground/10 bg-white text-sm h-9"
                    data-testid="input-search-closet"
                  />
                </div>

                <div className="flex gap-1 bg-white rounded-full p-1 shadow-sm ml-auto">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-full p-1.5 transition-all ${viewMode === "grid" ? "bg-[#0B1340] text-white" : "text-foreground/40 hover:text-foreground"}`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-full p-1.5 transition-all ${viewMode === "list" ? "bg-[#0B1340] text-white" : "text-foreground/40 hover:text-foreground"}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items */}
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-14 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-7 h-7 text-foreground/20" />
                  </div>
                  <h3 className="font-display font-600 text-foreground mb-2">
                    {items.length === 0 ? "Your closet is empty" : "No items match your filters"}
                  </h3>
                  <p className="text-sm text-foreground/50 mb-5">
                    {items.length === 0
                      ? "Start adding items to get personalized outfit recommendations"
                      : "Try adjusting your search or filters"}
                  </p>
                  {items.length === 0 && (
                    <Button
                      className="rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase px-7"
                      onClick={() => setUploadOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Item
                    </Button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm group"
                      >
                        <div className="relative aspect-square">
                          <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-t-2xl">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:bg-foreground/5 transition-colors"
                                onClick={() => toggleFavoriteMutation.mutate(item.id)}
                              >
                                <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? "fill-red-500 text-red-500" : "text-foreground/50"}`} />
                              </button>
                              <button
                                className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:bg-foreground/5 transition-colors"
                                onClick={() => deleteMutation.mutate(item.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-foreground/50" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-600 text-sm capitalize text-foreground">{item.subcategory || item.category}</p>
                          <p className="text-xs text-foreground/40">{item.brand || item.color}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-foreground/5 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-600 capitalize text-foreground">{item.subcategory || item.category}</p>
                        <p className="text-sm text-foreground/50">{item.brand}</p>
                        <div className="flex gap-1.5 mt-1">
                          {item.color && (
                            <span className="text-[10px] border border-foreground/10 rounded-full px-2 py-0.5 text-foreground/50">
                              {item.color}
                            </span>
                          )}
                          {item.season && item.season !== "all" && (
                            <span className="text-[10px] border border-foreground/10 rounded-full px-2 py-0.5 text-foreground/50">
                              {item.season}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="w-8 h-8 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-colors"
                          onClick={() => toggleFavoriteMutation.mutate(item.id)}
                        >
                          <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-red-500 text-red-500" : "text-foreground/30"}`} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-colors"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-foreground/30" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={(data) => uploadMutation.mutate(data)}
        remainingSlots={remainingSlots}
      />

      <StyleCTA />
    </div>
  );
}
