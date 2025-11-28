import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useCustomerAuth } from "@/lib/customer-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Bookmark,
  Calendar,
  Target,
  TrendingUp,
  MessageCircle,
  ExternalLink,
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
    sunny: Sun,
    rainy: Cloud,
    cold: Snowflake,
    hot: Sun,
  }[outfit.weather || "sunny"] || Sun;

  const WeatherIcon = weatherIcon;

  return (
    <Card className={`overflow-hidden ${isLocked ? "opacity-75" : ""}`}>
      <div className="relative aspect-[4/5] bg-muted">
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Premium Content</p>
            <Button size="sm" className="mt-3">Unlock</Button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-1 p-2 h-full">
          {(outfit.items as any[])?.slice(0, 4).map((item, i) => (
            <div key={i} className="relative rounded-md overflow-hidden bg-background">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.price && (
                <span className="absolute bottom-1 right-1 text-xs bg-background/80 px-1 rounded">
                  ${item.price}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{outfit.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{outfit.description}</p>
          </div>
          {outfit.weather && (
            <Badge variant="outline" className="flex-shrink-0">
              <WeatherIcon className="w-3 h-3 mr-1" />
              {outfit.weather}
            </Badge>
          )}
        </div>
        {outfit.stylistNotes && (
          <div className="mt-3 p-2 bg-muted rounded-md text-sm">
            <p className="text-muted-foreground">{outfit.stylistNotes}</p>
          </div>
        )}
        {outfit.voiceNoteUrl && (
          <Button variant="ghost" size="sm" className="mt-2 w-full">
            <Play className="w-4 h-4 mr-2" />
            Listen to stylist notes
          </Button>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          data-testid={`button-save-outfit-${outfit.id}`}
        >
          <Bookmark className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button size="sm" className="flex-1" data-testid={`button-shop-outfit-${outfit.id}`}>
          <ShoppingBag className="w-4 h-4 mr-1" />
          Shop Look
        </Button>
      </CardFooter>
    </Card>
  );
}

function ClosetPreview({ items }: { items: UserClosetItem[] }) {
  const [, setLocation] = useLocation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Closet</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/closet")}>
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <CardDescription>
          {items.length} items uploaded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {items.slice(0, 7).map((item) => (
            <div 
              key={item.id} 
              className="aspect-square rounded-md overflow-hidden bg-muted"
            >
              <img
                src={item.imageUrl}
                alt={item.category}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <Button
            variant="outline"
            className="aspect-square flex flex-col items-center justify-center"
            onClick={() => setLocation("/closet")}
            data-testid="button-add-closet-item"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs mt-1">Add</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StylistMessages({ messages }: { messages: any[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Stylist Messages</CardTitle>
          <Badge variant="secondary">{messages.length} new</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <Button variant="ghost" size="sm" className="mt-2">
                Chat with AI Stylist
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-3 p-2 rounded-lg hover-elevate">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.stylistAvatar} />
                    <AvatarFallback>{msg.stylistName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{msg.stylistName}</p>
                    <p className="text-sm text-muted-foreground truncate">{msg.preview}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function GoalsProgress({ goals }: { goals: DashboardData["goals"] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          Style Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No goals set yet</p>
            <Button variant="ghost" size="sm">Set a goal</Button>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{goal.title}</span>
                <span className="text-muted-foreground">{goal.progress}/{goal.target}</span>
              </div>
              <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SavedItemsPreview({ items }: { items: UserSavedItem[] }) {
  const [, setLocation] = useLocation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Saved Items
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/saved")}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No saved items yet</p>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/shop")}>
              Browse Shop
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {items.slice(0, 5).map((item, i) => (
              <div 
                key={item.id} 
                className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0"
              >
                <Shirt className="w-full h-full p-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StyleDashboard() {
  const [, setLocation] = useLocation();
  const { customer } = useCustomerAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("today");

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
        <Card className="w-full max-w-md text-center p-8">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to SeamXY</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to access your personalized style dashboard
          </p>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => setLocation("/login")}>
              Sign In
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/signup")}>
              Create Account
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {customer.name?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your personalized style feed for today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={subscription.tier === "free" ? "secondary" : "default"}>
              {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
            </Badge>
            {subscription.tier === "free" && (
              <Button size="sm" onClick={() => setLocation("/pricing")}>
                Upgrade
                <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Style Profile Summary */}
        {profile?.styleIdentitySummary && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Your Style Identity</h3>
                  <p className="text-sm text-muted-foreground">{profile.styleIdentitySummary}</p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto mt-2" onClick={() => setLocation("/style-quiz")}>
                    Update your preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Outfit Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="today" data-testid="tab-today">
                    <Calendar className="w-4 h-4 mr-2" />
                    Today
                  </TabsTrigger>
                  <TabsTrigger value="weekly" data-testid="tab-weekly">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    This Week
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                data-testid="button-refresh-outfits"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
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
                      <Card className="col-span-2 p-12 text-center">
                        <Shirt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No outfits yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Complete your style quiz to get personalized recommendations
                        </p>
                        <Button onClick={() => setLocation("/style-quiz")}>
                          Take Style Quiz
                        </Button>
                      </Card>
                    ) : (
                      todaysOutfits.map((outfit, i) => (
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
                      <Card className="col-span-2 p-12 text-center">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Weekly outfits coming soon</h3>
                        <p className="text-sm text-muted-foreground">
                          Check back later for your weekly style recommendations
                        </p>
                      </Card>
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

            {subscription.tier === "free" && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {subscription.outfitsRemaining} outfits remaining this week
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Upgrade for unlimited personalized looks
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setLocation("/pricing")}>
                    Upgrade
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-6">
            <StylistMessages messages={stylistMessages} />
            <ClosetPreview items={closetItems} />
            <SavedItemsPreview items={savedItems} />
            <GoalsProgress goals={goals} />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/ai-stylist")}
                  data-testid="button-chat-stylist"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with AI Stylist
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/shop")}
                  data-testid="button-browse-shop"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Shop
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/closet")}
                  data-testid="button-manage-closet"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload to Closet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
