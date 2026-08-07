import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useCustomerAuth } from "@/lib/customer-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StyleCTA } from "@/components/StyleCTA";
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Bookmark,
  Calendar,
  Target,
  TrendingUp,
  MessageCircle,
  Lock,
  ChevronRight,
  RefreshCw,
  Sun,
  Cloud,
  Snowflake,
  Shirt,
  Plus,
  Camera,
  Play,
} from "lucide-react";
import type { OutfitRecommendation, UserStyleProfile, UserClosetItem, UserSavedItem } from "@shared/schema";

interface DashboardData {
  profile: UserStyleProfile | null;
  todaysOutfits: OutfitRecommendation[];
  weeklyOutfits: OutfitRecommendation[];
  savedItems: UserSavedItem[];
  closetItems: UserClosetItem[];
  stylistMessages: any[];
  subscription: {
    tier: "free" | "premium" | "pro";
    outfitsRemaining: number;
    closetSlots: number;
    closetUsed: number;
  };
  goals: {
    id: string;
    title: string;
    progress: number;
    target: number;
  }[];
}

function OutfitCard({ outfit, isLocked = false }: { outfit: OutfitRecommendation; isLocked?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/v1/outfits/${outfit.id}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/dashboard"] });
      toast({ title: "Outfit saved to your lookbook!" });
    },
  });

  const weatherIcon = {
    sunny: Sun, rainy: Cloud, cold: Snowflake, hot: Sun,
  }[outfit.weather || "sunny"] || Sun;
  const WeatherIcon = weatherIcon;

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-sm ${isLocked ? "opacity-75" : ""}`}>
      <div className="relative aspect-[4/5] bg-foreground/5">
        {isLocked && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Lock className="w-8 h-8 text-foreground/30 mb-2" />
            <p className="text-sm text-foreground/50">Premium Content</p>
            <Button size="sm" className="mt-3 rounded-full bg-[#CC1519] text-white text-xs tracking-widest uppercase px-5">Unlock</Button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-1 p-2 h-full">
          {(outfit.items as any[])?.slice(0, 4).map((item, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden bg-white">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              {item.price && (
                <span className="absolute bottom-1 right-1 text-[10px] bg-white/90 px-1.5 rounded-full">
                  ${item.price}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-display font-600 text-foreground">{outfit.title}</h3>
            <p className="text-sm text-foreground/50 line-clamp-2">{outfit.description}</p>
          </div>
          {outfit.weather && (
            <span className="flex items-center gap-1 text-xs text-foreground/40 flex-shrink-0">
              <WeatherIcon className="w-3 h-3" />
              {outfit.weather}
            </span>
          )}
        </div>
        {outfit.stylistNotes && (
          <div className="mt-3 bg-foreground/4 rounded-2xl p-3 text-xs text-foreground/60 leading-relaxed">
            {outfit.stylistNotes}
          </div>
        )}
        {outfit.voiceNoteUrl && (
          <button className="mt-2 flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground transition-colors">
            <Play className="w-3.5 h-3.5" />
            Listen to stylist notes
          </button>
        )}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-full border-foreground/15 text-xs"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid={`button-save-outfit-${outfit.id}`}
          >
            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-full bg-[#CC1519] text-white text-xs hover:bg-[#CC1519]/90"
            data-testid={`button-shop-outfit-${outfit.id}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Shop Look
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StyleDashboard() {
  const [, setLocation] = useLocation();
  const { customer } = useCustomerAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"today" | "weekly">("today");

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/v1/dashboard"],
    enabled: !!customer,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/v1/outfits/refresh");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/dashboard"] });
      toast({ title: "New outfits generated!" });
    },
  });

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md text-center p-10 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#CC1519]/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-7 h-7 text-[#CC1519]" />
          </div>
          <h2 className="font-display text-3xl font-600 text-foreground mb-2">Welcome to SeamXY</h2>
          <p className="text-foreground/50 mb-7 text-sm leading-relaxed">
            Sign in to access your personalized style dashboard
          </p>
          <div className="space-y-3">
            <Button
              className="w-full rounded-full bg-[#CC1519] text-white text-xs tracking-widest uppercase"
              onClick={() => setLocation("/login")}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-foreground/15 text-xs tracking-widest uppercase"
              onClick={() => setLocation("/signup")}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-[400px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const dashboardData: DashboardData = data || {
    profile: null,
    todaysOutfits: [],
    weeklyOutfits: [],
    savedItems: [],
    closetItems: [],
    stylistMessages: [],
    subscription: { tier: "free", outfitsRemaining: 5, closetSlots: 20, closetUsed: 0 },
    goals: [],
  };

  const { profile, todaysOutfits, weeklyOutfits, savedItems, closetItems, stylistMessages, subscription, goals } = dashboardData;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const firstName = customer.name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen">
      <div className="px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-foreground/50 uppercase mb-3 flex items-center gap-3">
                <span className="w-8 h-px bg-foreground/30 inline-block" />
                Dashboard
              </p>
              <h1 className="font-display font-600 text-foreground leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                {greeting}{firstName ? `, ${firstName}` : ""}.
              </h1>
              <p className="text-foreground/50 mt-1">Here's your personalized style feed for today.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs tracking-widest uppercase px-3 py-1.5 rounded-full font-500 ${
                subscription.tier === "free"
                  ? "bg-foreground/8 text-foreground/60"
                  : "bg-[#111111] text-white"
              }`}>
                {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
              </span>
              {subscription.tier === "free" && (
                <Button
                  size="sm"
                  className="rounded-full bg-[#CC1519] hover:bg-[#CC1519]/90 text-white text-xs tracking-widest uppercase px-5"
                  onClick={() => setLocation("/pricing")}
                >
                  Upgrade
                  <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>

          {/* ── Style Identity Card ── */}
          {profile?.styleIdentitySummary && (
            <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-[#CC1519]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#CC1519]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-1">Your Style Identity</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{profile.styleIdentitySummary}</p>
                <button
                  className="text-xs text-[#CC1519] hover:underline mt-2 flex items-center gap-1"
                  onClick={() => setLocation("/style-quiz")}
                >
                  Update your preferences
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ── Left col: Outfits ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-white rounded-full p-1 shadow-sm">
                  {(["today", "weekly"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-5 py-2 text-xs tracking-widest uppercase font-500 transition-all ${
                        activeTab === tab
                          ? "bg-[#CC1519] text-white shadow"
                          : "text-foreground/50 hover:text-foreground"
                      }`}
                      data-testid={`tab-${tab}`}
                    >
                      {tab === "today" ? "Today" : "This Week"}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                  className="rounded-full border-foreground/15 text-xs tracking-widest uppercase"
                  data-testid="button-refresh-outfits"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
                  New Ideas
                </Button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {activeTab === "today" ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {todaysOutfits.length === 0 ? (
                        <div className="col-span-2 bg-white rounded-3xl p-12 text-center shadow-sm">
                          <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                            <Shirt className="w-7 h-7 text-foreground/30" />
                          </div>
                          <h3 className="font-display font-600 text-foreground mb-2">No outfits yet</h3>
                          <p className="text-sm text-foreground/50 mb-5">
                            Complete your style quiz to get personalized recommendations
                          </p>
                          <Button
                            className="rounded-full bg-[#CC1519] text-white text-xs tracking-widest uppercase px-7"
                            onClick={() => setLocation("/style-quiz")}
                          >
                            Take Style Quiz
                          </Button>
                        </div>
                      ) : (
                        todaysOutfits.map((outfit) => (
                          <OutfitCard
                            key={outfit.id}
                            outfit={outfit}
                            isLocked={!!outfit.isLocked && subscription.tier === "free"}
                          />
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {weeklyOutfits.length === 0 ? (
                        <div className="col-span-2 bg-white rounded-3xl p-12 text-center shadow-sm">
                          <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-7 h-7 text-foreground/30" />
                          </div>
                          <h3 className="font-display font-600 text-foreground mb-2">Weekly outfits coming soon</h3>
                          <p className="text-sm text-foreground/50">
                            Check back later for your weekly style recommendations
                          </p>
                        </div>
                      ) : (
                        weeklyOutfits.map((outfit) => (
                          <OutfitCard
                            key={outfit.id}
                            outfit={outfit}
                            isLocked={!!outfit.isLocked && subscription.tier === "free"}
                          />
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Usage bar */}
              {subscription.tier === "free" && (
                <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#CC1519]/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-[#CC1519]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-600 text-sm text-foreground">{subscription.outfitsRemaining} outfits remaining this week</p>
                      <p className="text-xs text-foreground/50">Upgrade for unlimited personalized looks</p>
                    </div>
                  </div>
                  <Button
                    className="rounded-full bg-[#CC1519] text-white text-xs tracking-widest uppercase px-5 flex-shrink-0"
                    onClick={() => setLocation("/pricing")}
                  >
                    Upgrade
                  </Button>
                </div>
              )}
            </div>

            {/* ── Right col: Sidebar ── */}
            <div className="space-y-5">
              {/* Advisor Notes */}
              <div className="bg-[#111111] rounded-3xl p-6 text-white">
                <p className="text-[9px] text-white/40 tracking-widest uppercase mb-3">Advisor Notes</p>
                {stylistMessages.length === 0 ? (
                  <div className="text-center py-4">
                    <MessageCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/50">No messages yet</p>
                    <button
                      className="text-xs text-white/40 hover:text-white/70 transition-colors mt-2 flex items-center gap-1 mx-auto"
                      onClick={() => setLocation("/ai-stylist")}
                    >
                      Chat with AI Stylist
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stylistMessages.slice(0, 3).map((msg, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarImage src={msg.stylistAvatar} />
                          <AvatarFallback className="bg-white/10 text-white text-xs">{msg.stylistName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-600 text-white/80">{msg.stylistName}</p>
                          <p className="text-xs text-white/50 truncate">{msg.preview}</p>
                        </div>
                        <span className="text-[10px] text-white/30 flex-shrink-0">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Closet preview */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] tracking-widest uppercase text-foreground/40">My Closet</p>
                  <button
                    className="text-xs text-[#CC1519] hover:underline flex items-center gap-1"
                    onClick={() => setLocation("/closet")}
                  >
                    View All
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm text-foreground/50 mb-4">{closetItems.length} items uploaded</p>
                <div className="grid grid-cols-4 gap-2">
                  {closetItems.slice(0, 7).map((item) => (
                    <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-foreground/5">
                      <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button
                    className="aspect-square rounded-xl border-2 border-dashed border-foreground/15 flex flex-col items-center justify-center hover:border-foreground/30 transition-colors"
                    onClick={() => setLocation("/closet")}
                    data-testid="button-add-closet-item"
                  >
                    <Plus className="w-4 h-4 text-foreground/30" />
                  </button>
                </div>
              </div>

              {/* Saved items */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] tracking-widest uppercase text-foreground/40 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    Saved Items
                  </p>
                  <button
                    className="text-xs text-[#CC1519] hover:underline"
                    onClick={() => setLocation("/saved")}
                  >
                    View All
                  </button>
                </div>
                {savedItems.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-foreground/40 mb-2">No saved items yet</p>
                    <button
                      className="text-xs text-[#CC1519] hover:underline"
                      onClick={() => setLocation("/shop")}
                    >
                      Browse Shop
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {savedItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="w-14 h-14 rounded-xl overflow-hidden bg-foreground/5 flex-shrink-0">
                        <Shirt className="w-full h-full p-3 text-foreground/20" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Style Goals */}
              {goals.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <p className="text-[10px] tracking-widest uppercase text-foreground/40 flex items-center gap-1.5 mb-4">
                    <Target className="w-3.5 h-3.5" />
                    Style Goals
                  </p>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground/70">{goal.title}</span>
                          <span className="text-foreground/40">{goal.progress}/{goal.target}</span>
                        </div>
                        <Progress value={(goal.progress / goal.target) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-4">Quick Actions</p>
                <div className="space-y-2">
                  {[
                    { label: "Chat with AI Stylist", icon: MessageCircle, href: "/ai-stylist", testId: "button-chat-stylist" },
                    { label: "Browse Shop", icon: ShoppingBag, href: "/shop", testId: "button-browse-shop" },
                    { label: "Upload to Closet", icon: Camera, href: "/closet", testId: "button-manage-closet" },
                    { label: "Virtual Try-On", icon: Camera, href: "/upload", testId: "button-virtual-tryon" },
                  ].map(({ label, icon: Icon, href, testId }) => (
                    <button
                      key={href}
                      onClick={() => setLocation(href)}
                      className="w-full flex items-center gap-3 text-sm text-foreground/60 hover:text-foreground hover:bg-foreground/4 rounded-xl px-3 py-2.5 transition-all"
                      data-testid={testId}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StyleCTA />
    </div>
  );
}
