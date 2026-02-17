import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Loader2, Heart, RefreshCw, Send, ChevronRight, Check, Mail, ShoppingBag } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Step = "category" | "situation" | "vibe" | "loading" | "results";

interface OutfitItem {
  name: string;
  type: string;
  description: string;
  colorOrPattern: string;
  priceRange: string;
}

interface OutfitResult {
  id: string;
  title: string;
  whyItWorks: string;
  items: OutfitItem[];
  stylingTip: string;
  overallVibe: string;
}

interface SituationalResponse {
  sessionId: string;
  outfits: OutfitResult[];
  situation: string;
  vibe: string | null;
}

const categories = [
  { id: "work", label: "Work & Professional", examples: "Office, meetings, presentations" },
  { id: "social", label: "Going Out", examples: "Dates, dinners, bars, parties" },
  { id: "casual", label: "Casual & Everyday", examples: "Brunch, errands, coffee, hangouts" },
  { id: "events", label: "Events & Occasions", examples: "Weddings, galas, graduations" },
  { id: "active", label: "Active & Outdoors", examples: "Hikes, gym, weekend sports" },
  { id: "travel", label: "Travel", examples: "Airport, resort, city exploring" },
];

const situationsByCategory: Record<string, Array<{ id: string; label: string }>> = {
  work: [
    { id: "job-interview", label: "Job interview" },
    { id: "client-meeting", label: "Client meeting" },
    { id: "casual-friday", label: "Casual Friday" },
    { id: "presentation", label: "Giving a presentation" },
    { id: "first-day", label: "First day at a new job" },
    { id: "networking-event", label: "Networking event" },
  ],
  social: [
    { id: "first-date", label: "First date" },
    { id: "dinner-party", label: "Dinner party" },
    { id: "night-out", label: "Night out with friends" },
    { id: "cocktail-bar", label: "Cocktail bar" },
    { id: "house-party", label: "House party" },
    { id: "double-date", label: "Double date" },
  ],
  casual: [
    { id: "weekend-brunch", label: "Weekend brunch" },
    { id: "coffee-shop", label: "Coffee shop hangout" },
    { id: "running-errands", label: "Running errands" },
    { id: "farmers-market", label: "Farmers market" },
    { id: "movie-night", label: "Movie night" },
    { id: "dog-park", label: "Dog park" },
  ],
  events: [
    { id: "wedding-guest", label: "Wedding guest" },
    { id: "black-tie-gala", label: "Black tie gala" },
    { id: "graduation", label: "Graduation ceremony" },
    { id: "holiday-party", label: "Holiday party" },
    { id: "birthday-dinner", label: "Birthday dinner" },
    { id: "prom", label: "Prom or formal dance" },
  ],
  active: [
    { id: "hiking", label: "Hiking trail" },
    { id: "gym-class", label: "Gym or fitness class" },
    { id: "weekend-sports", label: "Weekend sports" },
    { id: "yoga-studio", label: "Yoga studio" },
    { id: "beach-day", label: "Beach day" },
    { id: "picnic", label: "Outdoor picnic" },
  ],
  travel: [
    { id: "airport-flight", label: "Airport & flight" },
    { id: "resort-vacation", label: "Resort vacation" },
    { id: "city-exploring", label: "City exploring" },
    { id: "road-trip", label: "Road trip" },
    { id: "business-travel", label: "Business travel" },
    { id: "tropical-getaway", label: "Tropical getaway" },
  ],
};

const vibes = [
  { id: "polished", label: "Polished", description: "Put-together and refined" },
  { id: "bold", label: "Bold", description: "Statement-making and confident" },
  { id: "relaxed", label: "Relaxed", description: "Effortless and comfortable" },
  { id: "classic", label: "Classic", description: "Timeless and elegant" },
  { id: "creative", label: "Creative", description: "Unique and expressive" },
  { id: "minimalist", label: "Minimalist", description: "Clean and streamlined" },
];

export default function GetOutfitIdeas() {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSituation, setSelectedSituation] = useState<string>("");
  const [customSituation, setCustomSituation] = useState<string>("");
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [results, setResults] = useState<SituationalResponse | null>(null);
  const [heartedOutfits, setHeartedOutfits] = useState<Set<string>>(new Set());
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showConversionPrompt, setShowConversionPrompt] = useState(false);
  const [conversionPromptDismissed, setConversionPromptDismissed] = useState(false);
  const [sessionCount, setSessionCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem("seamxy_session_count") || "0", 10);
    } catch { return 0; }
  });
  const [isReturningVisitor] = useState(() => {
    try {
      const lastVisit = localStorage.getItem("seamxy_last_visit");
      localStorage.setItem("seamxy_last_visit", Date.now().toString());
      if (lastVisit) {
        const hoursSince = (Date.now() - parseInt(lastVisit, 10)) / (1000 * 60 * 60);
        return hoursSince > 1;
      }
      return false;
    } catch { return false; }
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (payload: { situation: string; vibe: string | null; category: string }) => {
      const res = await apiRequest("POST", "/api/v1/outfits/situational", payload);
      return res.json();
    },
    onSuccess: (data: SituationalResponse) => {
      setResults(data);
      setStep("results");
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      try { localStorage.setItem("seamxy_session_count", newCount.toString()); } catch {}
      if (newCount >= 2 && !conversionPromptDismissed) {
        setShowConversionPrompt(true);
      }
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "We couldn't generate outfits right now. Please try again.", variant: "destructive" });
      setStep("vibe");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const situation = customSituation || selectedSituation;
      const res = await apiRequest("POST", "/api/v1/outfits/situational", {
        situation,
        vibe: selectedVibe || null,
        category: selectedCategory,
        sessionId: results?.sessionId,
      });
      return res.json();
    },
    onSuccess: (data: SituationalResponse) => {
      setResults(data);
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "We couldn't refresh your outfits. Please try again.", variant: "destructive" });
    },
  });

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep("situation");
  }, []);

  const handleSituationSelect = useCallback((situationLabel: string) => {
    setSelectedSituation(situationLabel);
    setStep("vibe");
  }, []);

  const handleVibeSelect = useCallback((vibeId: string) => {
    setSelectedVibe(vibeId);
    const situation = customSituation || selectedSituation;
    setStep("loading");
    generateMutation.mutate({ situation, vibe: vibeId, category: selectedCategory });
  }, [customSituation, selectedSituation, selectedCategory, generateMutation]);

  const handleSkipVibe = useCallback(() => {
    const situation = customSituation || selectedSituation;
    setStep("loading");
    generateMutation.mutate({ situation, vibe: null, category: selectedCategory });
  }, [customSituation, selectedSituation, selectedCategory, generateMutation]);

  const heartMutation = useMutation({
    mutationFn: async (payload: { outfitId: string; hearted: boolean }) => {
      if (!results?.sessionId) return;
      await apiRequest("POST", "/api/v1/outfits/heart", {
        ...payload,
        sessionId: results.sessionId,
      });
    },
  });

  const sendLooksMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!results?.sessionId) return;
      const res = await apiRequest("POST", "/api/v1/outfits/send-looks", {
        email,
        sessionId: results.sessionId,
      });
      return res.json();
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({ title: "Done!", description: "We'll send your outfit picks to your inbox." });
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleHeart = useCallback((outfitId: string) => {
    setHeartedOutfits(prev => {
      const next = new Set(prev);
      const wasHearted = next.has(outfitId);
      if (wasHearted) {
        next.delete(outfitId);
      } else {
        next.add(outfitId);
      }
      heartMutation.mutate({ outfitId, hearted: !wasHearted });
      if (!wasHearted && next.size >= 3 && !conversionPromptDismissed) {
        setShowConversionPrompt(true);
      }
      return next;
    });
  }, [heartMutation, conversionPromptDismissed]);

  const handleStartOver = useCallback(() => {
    setStep("category");
    setSelectedCategory("");
    setSelectedSituation("");
    setCustomSituation("");
    setSelectedVibe("");
    setResults(null);
    setHeartedOutfits(new Set());
  }, []);

  const goBack = useCallback(() => {
    if (step === "situation") setStep("category");
    else if (step === "vibe") setStep("situation");
    else if (step === "results") setStep("vibe");
  }, [step]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {step !== "category" && step !== "loading" && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-6" data-testid="button-back-step">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        {step === "category" && isReturningVisitor && (
          <Card className="p-4 mb-6 border-primary/20 bg-primary/5" data-testid="card-welcome-back">
            <p className="text-sm text-foreground font-500">
              Welcome back! Your previous picks are gone, but you can save them permanently with a free account.
            </p>
            <Link href="/signup">
              <Button variant="ghost" size="sm" className="mt-2" data-testid="button-welcome-back-signup">
                Create a free account
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </Card>
        )}

        {step === "category" && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-4xl font-700 text-foreground mb-3" data-testid="text-category-heading">
                What are you dressing for?
              </h1>
              <p className="text-muted-foreground">
                Pick a category and we'll help you find the right look.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  className="p-5 cursor-pointer hover-elevate"
                  onClick={() => handleCategorySelect(cat.id)}
                  data-testid={`card-category-${cat.id}`}
                >
                  <h3 className="font-display text-lg font-600 text-foreground mb-1">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.examples}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === "situation" && (
          <div>
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-700 text-foreground mb-3" data-testid="text-situation-heading">
                What's the situation?
              </h2>
              <p className="text-muted-foreground">
                Pick one below or type your own.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {(situationsByCategory[selectedCategory] || []).map((sit) => (
                <Card
                  key={sit.id}
                  className="p-4 cursor-pointer hover-elevate"
                  onClick={() => handleSituationSelect(sit.label)}
                  data-testid={`card-situation-${sit.id}`}
                >
                  <p className="text-foreground font-500">{sit.label}</p>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Or type your own situation..."
                value={customSituation}
                onChange={(e) => setCustomSituation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customSituation.trim()) {
                    setStep("vibe");
                  }
                }}
                data-testid="input-custom-situation"
              />
              <Button
                onClick={() => {
                  if (customSituation.trim()) setStep("vibe");
                }}
                disabled={!customSituation.trim()}
                data-testid="button-custom-situation-next"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "vibe" && (
          <div>
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-700 text-foreground mb-3" data-testid="text-vibe-heading">
                What vibe are you going for?
              </h2>
              <p className="text-muted-foreground">
                This helps us nail the right energy. Or skip it — we'll show you a mix.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {vibes.map((v) => (
                <Card
                  key={v.id}
                  className="p-4 cursor-pointer hover-elevate"
                  onClick={() => handleVibeSelect(v.id)}
                  data-testid={`card-vibe-${v.id}`}
                >
                  <p className="text-foreground font-600 mb-1">{v.label}</p>
                  <p className="text-xs text-muted-foreground">{v.description}</p>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button variant="ghost" onClick={handleSkipVibe} data-testid="button-skip-vibe">
                Skip — show me a mix
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
            <h2 className="font-display text-xl font-600 text-foreground mb-2" data-testid="text-loading">
              Putting together your looks...
            </h2>
            <p className="text-sm text-muted-foreground">
              Curating outfits for: {customSituation || selectedSituation}
            </p>
          </div>
        )}

        {step === "results" && results && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-700 text-foreground mb-2" data-testid="text-results-heading">
                Your outfit ideas
              </h2>
              <p className="text-muted-foreground text-sm">
                For: <span className="font-500 text-foreground">{results.situation}</span>
                {results.vibe && <> &middot; <span className="font-500 text-foreground">{results.vibe}</span> vibe</>}
              </p>
            </div>

            <div className="space-y-6">
              {results.outfits.map((outfit) => (
                <Card key={outfit.id} className="overflow-visible" data-testid={`card-outfit-${outfit.id}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-600 text-foreground mb-1" data-testid={`text-outfit-title-${outfit.id}`}>
                          {outfit.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">{outfit.overallVibe}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleHeart(outfit.id)}
                        data-testid={`button-heart-${outfit.id}`}
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${heartedOutfits.has(outfit.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                        />
                      </Button>
                    </div>

                    <div className="space-y-3 mb-4">
                      {outfit.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start" data-testid={`outfit-item-${outfit.id}-${idx}`}>
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-sm font-500 text-foreground">{item.name}</p>
                              <Link href={`/shop?q=${encodeURIComponent(item.name + ' ' + item.colorOrPattern)}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs px-2"
                                  onClick={() => {
                                    if (results?.sessionId) {
                                      apiRequest("POST", "/api/v1/outfits/track-event", {
                                        sessionId: results.sessionId,
                                        eventType: "shop_click",
                                        eventData: { outfitId: outfit.id, itemName: item.name, itemType: item.type },
                                      }).catch(() => {});
                                    }
                                  }}
                                  data-testid={`button-shop-item-${outfit.id}-${idx}`}
                                >
                                  <ShoppingBag className="w-3 h-3 mr-1" />
                                  Shop similar
                                </Button>
                              </Link>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description} &middot; {item.colorOrPattern} &middot; {item.priceRange}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/50 rounded-md p-4 mb-3">
                      <p className="text-xs font-600 text-foreground mb-1">Why it works</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{outfit.whyItWorks}</p>
                    </div>

                    {outfit.stylingTip && (
                      <p className="text-xs text-muted-foreground italic">
                        Styling tip: {outfit.stylingTip}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {showConversionPrompt && !conversionPromptDismissed && (
              <Card className="p-5 mt-6 border-primary/20 bg-primary/5" data-testid="card-conversion-prompt">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-foreground mb-1">
                      {heartedOutfits.size >= 3
                        ? "You've got great taste! Save your picks permanently."
                        : "Enjoying the ideas? Save them for next time."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create a free account to keep your favorites, get personalized recommendations, and unlock more features.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/signup${results?.sessionId ? `?session=${results.sessionId}` : ''}`}>
                      <Button size="sm" data-testid="button-conversion-signup">
                        Create account
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConversionPromptDismissed(true)}
                      data-testid="button-dismiss-conversion"
                    >
                      Not now
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                data-testid="button-show-different"
              >
                {refreshMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Show me something different
              </Button>
              <Button variant="ghost" onClick={handleStartOver} data-testid="button-start-over">
                Start over
              </Button>
            </div>

            {heartedOutfits.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                <Card className="px-5 py-3 flex items-center gap-3 shadow-lg">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  <span className="text-sm font-500 text-foreground" data-testid="text-picks-count">
                    {heartedOutfits.size} {heartedOutfits.size === 1 ? "pick" : "picks"} saved
                  </span>
                  <Button size="sm" onClick={() => setShowSendDialog(true)} data-testid="button-send-looks">
                    <Send className="w-3 h-3 mr-2" />
                    Send me these looks
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {emailSent ? "You're all set!" : "Send your picks to your inbox"}
              </DialogTitle>
              <DialogDescription>
                {emailSent
                  ? "Check your email — your outfit picks are on the way."
                  : "We'll email your saved outfits so you can reference them later. No account needed."}
              </DialogDescription>
            </DialogHeader>
            {emailSent ? (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Check className="w-6 h-6" />
                </div>
                <Button variant="ghost" onClick={() => setShowSendDialog(false)} data-testid="button-close-send-dialog">
                  Close
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && sendEmail.includes("@")) {
                        sendLooksMutation.mutate(sendEmail);
                      }
                    }}
                    data-testid="input-send-email"
                  />
                  <Button
                    onClick={() => sendLooksMutation.mutate(sendEmail)}
                    disabled={!sendEmail.includes("@") || sendLooksMutation.isPending}
                    data-testid="button-submit-send-email"
                  >
                    {sendLooksMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll only use this to send your outfits. No spam, no marketing.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
