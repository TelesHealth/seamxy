import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
import { StyleCTA } from "@/components/StyleCTA";

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
    <div className="min-h-screen">
      {/* Back button */}
      {step !== "category" && step !== "loading" && (
        <div className="px-6 md:px-10 pt-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
              data-testid="button-back-step"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── CATEGORY STEP ── */}
      {step === "category" && (
        <div className="px-6 md:px-10 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Returning visitor nudge */}
            {isReturningVisitor && (
              <div className="mb-8 bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between gap-4 max-w-lg" data-testid="card-welcome-back">
                <p className="text-sm text-foreground/70">
                  Welcome back! Save your picks permanently with a free account.
                </p>
                <Link href="/signup">
                  <Button className="rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase px-5 flex-shrink-0" data-testid="button-welcome-back-signup">
                    Join free
                  </Button>
                </Link>
              </div>
            )}

            {/* Three-panel editorial layout */}
            <div className="grid lg:grid-cols-[320px_1fr_260px] gap-6 items-start">
              {/* Left: category list */}
              <div>
                <p className="text-[10px] tracking-[0.2em] text-foreground/50 uppercase mb-5 flex items-center gap-3">
                  <span className="w-8 h-px bg-foreground/30 inline-block" />
                  Find Look
                </p>
                <h1 className="font-display font-600 text-foreground leading-tight mb-8" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }} data-testid="text-category-heading">
                  What are you<br />dressing for?
                </h1>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="w-full text-left bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
                      data-testid={`card-category-${cat.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-600 text-foreground group-hover:text-[#2236E8] transition-colors">{cat.label}</p>
                          <p className="text-xs text-foreground/50 mt-0.5">{cat.examples}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-[#2236E8] transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Center: hero image */}
              <div className="hidden lg:block relative rounded-3xl overflow-hidden shadow-xl h-[560px]">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80"
                  alt="Style"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1340]/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[9px] text-white/60 tracking-widest uppercase mb-1">Outfit Intelligence</p>
                  <p className="font-display text-white text-2xl font-600 leading-tight">Curated looks for every moment.</p>
                </div>
              </div>

              {/* Right: dark navy detail card */}
              <div className="bg-[#0B1340] rounded-3xl p-7 text-white flex flex-col justify-between min-h-[300px] lg:min-h-[560px]">
                <div>
                  <p className="text-[9px] text-white/40 tracking-widest uppercase mb-5">How it works</p>
                  <div className="space-y-6">
                    {[
                      { num: "01", title: "Pick a category", desc: "Work, going out, events, travel…" },
                      { num: "02", title: "Set your situation", desc: "First date, client meeting, brunch…" },
                      { num: "03", title: "Choose a vibe", desc: "Polished, bold, relaxed, classic…" },
                    ].map((s) => (
                      <div key={s.num} className="flex gap-4">
                        <span className="text-[9px] text-white/30 tracking-widest mt-0.5 flex-shrink-0">{s.num}</span>
                        <div>
                          <p className="font-display font-600 text-white text-base leading-tight">{s.title}</p>
                          <p className="text-xs text-white/50 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 bg-white/10 rounded-2xl p-4">
                  <p className="text-xs text-white/50 mb-2">Powered by SeamXY AI</p>
                  <p className="font-display text-white font-600 leading-tight">Personalized looks, not generic suggestions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SITUATION STEP ── */}
      {step === "situation" && (
        <div className="px-6 md:px-10 py-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-4">Find Look / Situation</p>
            <h2 className="font-display font-600 text-foreground leading-tight mb-2" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }} data-testid="text-situation-heading">
              What's the situation?
            </h2>
            <p className="text-foreground/50 mb-8">Pick one below or type your own.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {(situationsByCategory[selectedCategory] || []).map((sit) => (
                <button
                  key={sit.id}
                  onClick={() => handleSituationSelect(sit.label)}
                  className="text-left bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group flex items-center justify-between"
                  data-testid={`card-situation-${sit.id}`}
                >
                  <p className="font-display font-600 text-foreground group-hover:text-[#2236E8] transition-colors">{sit.label}</p>
                  <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-[#2236E8] transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex gap-3 items-center">
              <Input
                placeholder="Or describe your own situation…"
                value={customSituation}
                onChange={(e) => setCustomSituation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customSituation.trim()) setStep("vibe");
                }}
                className="border-0 shadow-none p-0 text-sm focus-visible:ring-0 placeholder:text-foreground/30"
                data-testid="input-custom-situation"
              />
              <Button
                onClick={() => { if (customSituation.trim()) setStep("vibe"); }}
                disabled={!customSituation.trim()}
                className="rounded-full bg-[#0B1340] text-white px-5 text-xs tracking-widest uppercase flex-shrink-0"
                data-testid="button-custom-situation-next"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIBE STEP ── */}
      {step === "vibe" && (
        <div className="px-6 md:px-10 py-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-4">Find Look / Vibe</p>
            <h2 className="font-display font-600 text-foreground leading-tight mb-2" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }} data-testid="text-vibe-heading">
              What vibe are you going for?
            </h2>
            <p className="text-foreground/50 mb-8">This helps us nail the right energy. Or skip it — we'll show you a mix.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {vibes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVibeSelect(v.id)}
                  className="text-left bg-white rounded-2xl px-5 py-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
                  data-testid={`card-vibe-${v.id}`}
                >
                  <p className="font-display font-600 text-foreground text-lg group-hover:text-[#2236E8] transition-colors">{v.label}</p>
                  <p className="text-xs text-foreground/50 mt-1">{v.description}</p>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleSkipVibe}
                className="text-sm text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
                data-testid="button-skip-vibe"
              >
                Skip — show me a mix
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOADING STEP ── */}
      {step === "loading" && (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#0B1340] flex items-center justify-center mx-auto mb-8">
              <Loader2 className="w-7 h-7 animate-spin text-white" />
            </div>
            <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-3">Curating your looks</p>
            <h2 className="font-display font-600 text-foreground leading-tight mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }} data-testid="text-loading">
              Putting together your looks…
            </h2>
            <p className="text-sm text-foreground/50">
              For: {customSituation || selectedSituation}
            </p>
          </div>
        </div>
      )}

      {/* ── RESULTS STEP ── */}
      {step === "results" && results && (
        <div className="px-6 md:px-10 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-3">Your Outfit Ideas</p>
              <h2 className="font-display font-600 text-foreground leading-tight mb-2" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }} data-testid="text-results-heading">
                {results.situation}
              </h2>
              {results.vibe && (
                <p className="text-foreground/50 text-sm">
                  Vibe: <span className="font-500 text-foreground">{results.vibe}</span>
                </p>
              )}
            </div>

            {/* Outfit cards grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {results.outfits.map((outfit) => (
                <div key={outfit.id} className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col" data-testid={`card-outfit-${outfit.id}`}>
                  {/* Card header */}
                  <div className="bg-[#0B1340] px-6 py-5 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-white/40 tracking-widest uppercase mb-1">Look</p>
                      <h3 className="font-display font-600 text-white text-lg leading-tight" data-testid={`text-outfit-title-${outfit.id}`}>
                        {outfit.title}
                      </h3>
                      <p className="text-xs text-white/50 mt-1">{outfit.overallVibe}</p>
                    </div>
                    <button
                      onClick={() => handleHeart(outfit.id)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center flex-shrink-0"
                      data-testid={`button-heart-${outfit.id}`}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${heartedOutfits.has(outfit.id) ? "fill-red-400 text-red-400" : "text-white/60"}`} />
                    </button>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-5 flex-1 space-y-3">
                    {outfit.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start" data-testid={`outfit-item-${outfit.id}-${idx}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2236E8] mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-600 text-foreground">{item.name}</p>
                            <Link href={`/shop?q=${encodeURIComponent(item.name + ' ' + item.colorOrPattern)}`}>
                              <button
                                className="text-[10px] text-foreground/40 hover:text-[#2236E8] transition-colors flex items-center gap-1"
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
                                <ShoppingBag className="w-3 h-3" />
                                Shop
                              </button>
                            </Link>
                          </div>
                          <p className="text-xs text-foreground/40 mt-0.5">{item.description} · {item.colorOrPattern} · {item.priceRange}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Why it works */}
                  <div className="mx-6 mb-5 bg-foreground/4 rounded-2xl p-4">
                    <p className="text-[10px] font-600 text-foreground/50 uppercase tracking-widest mb-1">Why it works</p>
                    <p className="text-xs text-foreground/60 leading-relaxed">{outfit.whyItWorks}</p>
                    {outfit.stylingTip && (
                      <p className="text-xs text-foreground/40 italic mt-2">Tip: {outfit.stylingTip}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Conversion prompt */}
            {showConversionPrompt && !conversionPromptDismissed && (
              <div className="bg-[#0B1340] rounded-3xl p-6 mb-8 flex items-center justify-between gap-4 flex-wrap" data-testid="card-conversion-prompt">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-600 text-white text-lg mb-1">
                    {heartedOutfits.size >= 3
                      ? "You've got great taste! Save your picks permanently."
                      : "Enjoying the ideas? Save them for next time."}
                  </p>
                  <p className="text-sm text-white/50">
                    Create a free account to keep your favorites and unlock more features.
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/signup${results?.sessionId ? `?session=${results.sessionId}` : ''}`}>
                    <Button className="rounded-full bg-white text-[#0B1340] text-xs tracking-widest uppercase px-5 hover:bg-white/90" data-testid="button-conversion-signup">
                      Create account
                    </Button>
                  </Link>
                  <button
                    onClick={() => setConversionPromptDismissed(true)}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors px-3"
                    data-testid="button-dismiss-conversion"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}

            {/* Action row */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="rounded-full border-foreground/20 text-xs tracking-widest uppercase px-7"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                data-testid="button-show-different"
              >
                {refreshMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Show me something different
              </Button>
              <button
                onClick={handleStartOver}
                className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                data-testid="button-start-over"
              >
                Start over
              </button>
            </div>

            {/* Hearted picks floating bar */}
            {heartedOutfits.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-[#0B1340] rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl">
                  <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                  <span className="text-sm font-500 text-white" data-testid="text-picks-count">
                    {heartedOutfits.size} {heartedOutfits.size === 1 ? "pick" : "picks"} saved
                  </span>
                  <Button
                    size="sm"
                    className="rounded-full bg-white text-[#0B1340] text-xs tracking-widest uppercase px-5 hover:bg-white/90"
                    onClick={() => setShowSendDialog(true)}
                    data-testid="button-send-looks"
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Send me these looks
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send dialog */}
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
              <div className="w-12 h-12 rounded-full bg-[#2236E8]/10 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-[#2236E8]" />
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
                  className="rounded-full bg-[#0B1340] text-white"
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

      <StyleCTA />
    </div>
  );
}
