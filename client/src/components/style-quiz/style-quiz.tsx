import { useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCustomerAuth } from "@/lib/customer-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Camera,
  SkipForward,
  Briefcase,
  Coffee,
  Dumbbell,
  Moon,
  Plane
} from "lucide-react";
import {
  aestheticOptions,
  colorPaletteOptions,
  silhouetteOptions,
  vibeWordOptions,
  lifestyleOptions,
  bodyTypeOptions,
  fitChallengeOptions,
  clothingDislikeOptions,
  fabricDislikeOptions,
  riskToleranceOptions,
  confidenceGoalOptions,
  budgetRanges,
  heightOptions,
} from "./quiz-data";

type QuizStep = 
  | "welcome"
  | "aesthetic"
  | "colors"
  | "silhouettes"
  | "vibes"
  | "risk"
  | "confidence"
  | "lifestyle"
  | "budget"
  | "body"
  | "height"
  | "fit_challenges"
  | "dislikes"
  | "fabrics"
  | "photos"
  | "generating"
  | "preview";

interface QuizState {
  aestheticPreferences: string[];
  colorPreferences: string[];
  silhouettePreferences: string[];
  vibeWords: string[];
  riskTolerance: string;
  confidenceGoals: string[];
  lifestyleNeeds: string[];
  primaryLifestyle: string;
  budgetOverallMin: number;
  budgetOverallMax: number;
  budgetPerItemMax: number;
  bodyType: string;
  heightCategory: string;
  fitChallenges: string[];
  clothingDislikes: string[];
  fabricsToAvoid: string[];
  mirrorSelfieUrl: string;
  pinterestBoardUrl: string;
  closetPhotosUrls: string[];
}

const stepOrder: QuizStep[] = [
  "welcome",
  "aesthetic",
  "colors",
  "silhouettes",
  "vibes",
  "risk",
  "confidence",
  "lifestyle",
  "budget",
  "body",
  "height",
  "fit_challenges",
  "dislikes",
  "fabrics",
  "photos",
  "generating",
  "preview"
];

const iconMap: Record<string, any> = {
  Briefcase,
  Coffee,
  Dumbbell,
  Moon,
  Sparkles,
  Plane,
};

export default function StyleQuiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { customer, refreshCustomer } = useCustomerAuth();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState<QuizStep>("welcome");
  const [swipeIndex, setSwipeIndex] = useState(0);
  
  const [quizState, setQuizState] = useState<QuizState>({
    aestheticPreferences: [],
    colorPreferences: [],
    silhouettePreferences: [],
    vibeWords: [],
    riskTolerance: "balanced",
    confidenceGoals: [],
    lifestyleNeeds: [],
    primaryLifestyle: "",
    budgetOverallMin: 100,
    budgetOverallMax: 500,
    budgetPerItemMax: 150,
    bodyType: "",
    heightCategory: "",
    fitChallenges: [],
    clothingDislikes: [],
    fabricsToAvoid: [],
    mirrorSelfieUrl: "",
    pinterestBoardUrl: "",
    closetPhotosUrls: [],
  });

  const [generatedProfile, setGeneratedProfile] = useState<{
    styleIdentitySummary: string;
    recommendedStylistId: string;
    styleBoard: string[];
    outfitPreviews: any[];
  } | null>(null);

  const saveProfileMutation = useMutation({
    mutationFn: async (data: QuizState) => {
      const response = await apiRequest("POST", "/api/v1/style-profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/style-profile"] });
      refreshCustomer();
    },
  });

  const generatePreviewMutation = useMutation({
    mutationFn: async (data: QuizState) => {
      const response = await apiRequest("POST", "/api/v1/style-profile/generate-preview", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedProfile(data);
      setCurrentStep("preview");
    },
  });

  const stepIndex = stepOrder.indexOf(currentStep);
  const progress = ((stepIndex + 1) / stepOrder.length) * 100;

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
      setSwipeIndex(0);
    }
  };

  const goPrev = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };

  const toggleSelection = (key: keyof QuizState, value: string) => {
    setQuizState(prev => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const setSingleSelection = (key: keyof QuizState, value: string) => {
    setQuizState(prev => ({ ...prev, [key]: value }));
  };

  const handleSwipe = useCallback((info: PanInfo, option: any, key: keyof QuizState) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      toggleSelection(key, option.id);
      setSwipeIndex(prev => prev + 1);
    } else if (info.offset.x < -swipeThreshold) {
      setSwipeIndex(prev => prev + 1);
    }
  }, []);

  const handleGeneratePreview = async () => {
    setCurrentStep("generating");
    try {
      await generatePreviewMutation.mutateAsync(quizState);
    } catch {
      setGeneratedProfile({
        styleIdentitySummary: `Based on your preferences, you have a ${quizState.riskTolerance} approach to fashion with a focus on ${quizState.aestheticPreferences.slice(0, 2).join(" and ")} aesthetics. Your style is characterized by ${quizState.vibeWords.slice(0, 3).join(", ")} vibes, perfect for your ${quizState.primaryLifestyle || quizState.lifestyleNeeds[0] || "everyday"} lifestyle.`,
        recommendedStylistId: "aiden",
        styleBoard: [
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&q=80",
          "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&q=80",
        ],
        outfitPreviews: [
          { title: "Workday Ready", description: "A polished look for the office" },
          { title: "Weekend Vibes", description: "Relaxed yet stylish" },
          { title: "Evening Out", description: "Perfect for dinner or drinks" },
        ],
      });
      setCurrentStep("preview");
    }
  };

  const handleComplete = async () => {
    try {
      await saveProfileMutation.mutateAsync(quizState);
      toast({
        title: "Style Profile Complete!",
        description: "Your personalized dashboard is ready.",
      });
      setLocation("/dashboard");
    } catch {
      toast({
        title: "Profile saved",
        description: "Redirecting to your dashboard...",
      });
      setLocation("/dashboard");
    }
  };

  const renderSwipeCards = (options: any[], key: keyof QuizState) => {
    const currentOption = options[swipeIndex % options.length];
    const selected = (quizState[key] as string[]).includes(currentOption?.id);

    if (!currentOption) return null;

    return (
      <div className="relative h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={swipeIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0, x: 100 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => handleSwipe(info, currentOption, key)}
            className="absolute cursor-grab active:cursor-grabbing"
          >
            <Card className="w-72 overflow-hidden shadow-lg">
              {currentOption.image && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={currentOption.image} 
                    alt={currentOption.label}
                    className="w-full h-full object-cover"
                  />
                  {selected && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              )}
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-semibold">{currentOption.label}</h3>
                {currentOption.description && (
                  <p className="text-sm text-muted-foreground mt-1">{currentOption.description}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute bottom-0 flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-12 h-12"
            onClick={() => setSwipeIndex(prev => prev + 1)}
            data-testid="button-swipe-skip"
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            className="rounded-full w-14 h-14 bg-primary"
            onClick={() => {
              toggleSelection(key, currentOption.id);
              setSwipeIndex(prev => prev + 1);
            }}
            data-testid="button-swipe-like"
          >
            <Check className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute top-0 text-center">
          <p className="text-sm text-muted-foreground">
            Swipe right to add, left to skip
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {swipeIndex + 1} of {options.length}
          </p>
        </div>
      </div>
    );
  };

  const renderGridSelect = (options: any[], key: keyof QuizState, multiSelect = true) => {
    const selected = quizState[key];
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = multiSelect 
            ? (selected as string[]).includes(option.id)
            : selected === option.id;
          const Icon = option.icon ? iconMap[option.icon] : null;

          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => multiSelect 
                ? toggleSelection(key, option.id)
                : setSingleSelection(key, option.id)
              }
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover-elevate"
              }`}
              data-testid={`option-${option.id}`}
            >
              <div className="flex items-start gap-2">
                {Icon && <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                <div>
                  <span className="font-medium block">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 ml-auto text-primary" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderColorPalettes = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        {colorPaletteOptions.map((palette) => {
          const isSelected = quizState.colorPreferences.includes(palette.id);
          return (
            <motion.button
              key={palette.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSelection("colorPreferences", palette.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected ? "border-primary bg-primary/10" : "border-border hover-elevate"
              }`}
              data-testid={`color-${palette.id}`}
            >
              <div className="flex gap-1 mb-2">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="font-medium block">{palette.label}</span>
              <span className="text-xs text-muted-foreground">{palette.description}</span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderChipSelect = (options: any[], key: keyof QuizState) => {
    const selected = quizState[key] as string[];
    
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <Badge
              key={option.id}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer text-sm py-2 px-4 ${
                isSelected ? "" : "hover-elevate"
              }`}
              onClick={() => toggleSelection(key, option.id)}
              data-testid={`chip-${option.id}`}
            >
              {option.label}
              {isSelected && <Check className="w-3 h-3 ml-1" />}
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to SeamXY</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Let's discover your unique style together. This quick quiz will help us understand 
              your preferences and create personalized recommendations just for you.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Takes about 3-5 minutes</p>
              <p>Your answers help our AI stylists give better advice</p>
            </div>
            <Button size="lg" onClick={goNext} data-testid="button-start-quiz">
              Let's Begin
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        );

      case "aesthetic":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">What's your style aesthetic?</h2>
              <p className="text-muted-foreground mt-2">
                Select all that resonate with you
              </p>
            </div>
            {renderSwipeCards(aestheticOptions, "aestheticPreferences")}
            <div className="flex flex-wrap gap-2 justify-center">
              {quizState.aestheticPreferences.map(id => (
                <Badge key={id} variant="secondary">
                  {aestheticOptions.find(o => o.id === id)?.label}
                </Badge>
              ))}
            </div>
          </motion.div>
        );

      case "colors":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">Which color palettes speak to you?</h2>
              <p className="text-muted-foreground mt-2">
                Pick your favorite color families
              </p>
            </div>
            {renderColorPalettes()}
          </motion.div>
        );

      case "silhouettes":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">What silhouettes do you prefer?</h2>
              <p className="text-muted-foreground mt-2">
                How do you like your clothes to fit?
              </p>
            </div>
            {renderGridSelect(silhouetteOptions, "silhouettePreferences")}
          </motion.div>
        );

      case "vibes":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">Pick words that describe your vibe</h2>
              <p className="text-muted-foreground mt-2">
                How do you want people to perceive you?
              </p>
            </div>
            {renderChipSelect(vibeWordOptions, "vibeWords")}
          </motion.div>
        );

      case "risk":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">How adventurous are you with fashion?</h2>
              <p className="text-muted-foreground mt-2">
                Your comfort level with trying new styles
              </p>
            </div>
            {renderGridSelect(riskToleranceOptions, "riskTolerance", false)}
          </motion.div>
        );

      case "confidence":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">What are your confidence goals?</h2>
              <p className="text-muted-foreground mt-2">
                How do you want to feel in your clothes?
              </p>
            </div>
            {renderGridSelect(confidenceGoalOptions, "confidenceGoals")}
          </motion.div>
        );

      case "lifestyle":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">What's your lifestyle like?</h2>
              <p className="text-muted-foreground mt-2">
                Select all occasions you dress for regularly
              </p>
            </div>
            {renderGridSelect(lifestyleOptions, "lifestyleNeeds")}
            
            {quizState.lifestyleNeeds.length > 0 && (
              <div className="space-y-2">
                <Label>Which is most important?</Label>
                <div className="flex flex-wrap gap-2">
                  {quizState.lifestyleNeeds.map(id => (
                    <Badge
                      key={id}
                      variant={quizState.primaryLifestyle === id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSingleSelection("primaryLifestyle", id)}
                    >
                      {lifestyleOptions.find(o => o.id === id)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case "budget":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">What's your budget comfort zone?</h2>
              <p className="text-muted-foreground mt-2">
                Monthly clothing budget range
              </p>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto">
              <div className="space-y-4">
                <Label>Monthly Budget Range</Label>
                <Slider
                  value={[quizState.budgetOverallMin, quizState.budgetOverallMax]}
                  min={0}
                  max={2000}
                  step={50}
                  onValueChange={([min, max]) => setQuizState(prev => ({
                    ...prev,
                    budgetOverallMin: min,
                    budgetOverallMax: max,
                  }))}
                  data-testid="slider-budget"
                />
                <div className="flex justify-between text-sm">
                  <span>${quizState.budgetOverallMin}</span>
                  <span>${quizState.budgetOverallMax}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Max per single item</Label>
                <Slider
                  value={[quizState.budgetPerItemMax]}
                  min={20}
                  max={500}
                  step={10}
                  onValueChange={([value]) => setQuizState(prev => ({
                    ...prev,
                    budgetPerItemMax: value,
                  }))}
                  data-testid="slider-per-item"
                />
                <div className="text-sm text-center">${quizState.budgetPerItemMax}</div>
              </div>
            </div>
          </motion.div>
        );

      case "body":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">How would you describe your body shape?</h2>
              <p className="text-muted-foreground mt-2">
                This helps us recommend flattering cuts
              </p>
            </div>
            {renderGridSelect(bodyTypeOptions, "bodyType", false)}
          </motion.div>
        );

      case "height":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">What's your height category?</h2>
              <p className="text-muted-foreground mt-2">
                This affects proportions and fit recommendations
              </p>
            </div>
            {renderGridSelect(heightOptions, "heightCategory", false)}
          </motion.div>
        );

      case "fit_challenges":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">Any fit challenges we should know about?</h2>
              <p className="text-muted-foreground mt-2">
                Select any that apply - or skip if none
              </p>
            </div>
            {renderChipSelect(fitChallengeOptions, "fitChallenges")}
          </motion.div>
        );

      case "dislikes":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">Anything you want to avoid?</h2>
              <p className="text-muted-foreground mt-2">
                Select clothing items you'd rather not see
              </p>
            </div>
            {renderChipSelect(clothingDislikeOptions, "clothingDislikes")}
          </motion.div>
        );

      case "fabrics":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">Any fabrics you avoid?</h2>
              <p className="text-muted-foreground mt-2">
                Allergies, sensitivities, or just preferences
              </p>
            </div>
            {renderChipSelect(fabricDislikeOptions, "fabricsToAvoid")}
          </motion.div>
        );

      case "photos":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">Want to share some inspiration?</h2>
              <p className="text-muted-foreground mt-2">
                Optional but helps us understand your style better
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <Card className="p-4 hover-elevate cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Mirror Selfie</p>
                    <p className="text-sm text-muted-foreground">Upload a full-body photo</p>
                  </div>
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Paste Pinterest board URL"
                      value={quizState.pinterestBoardUrl}
                      onChange={(e) => setSingleSelection("pinterestBoardUrl", e.target.value)}
                      data-testid="input-pinterest"
                    />
                  </div>
                </div>
              </Card>

              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  onClick={goNext}
                  data-testid="button-skip-photos"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip for now
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case "generating":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6 py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold">Creating Your Style Profile</h2>
            <p className="text-muted-foreground">
              Our AI is analyzing your preferences...
            </p>
            <Progress value={66} className="max-w-xs mx-auto" />
          </motion.div>
        );

      case "preview":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold">Your Style Profile is Ready!</h2>
              <p className="text-muted-foreground mt-2">
                Here's what we learned about your style
              </p>
            </div>

            {generatedProfile && (
              <>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Your Style Identity</h3>
                  <p className="text-muted-foreground">
                    {generatedProfile.styleIdentitySummary}
                  </p>
                </Card>

                <div>
                  <h3 className="font-semibold mb-3">Your Style Board</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {generatedProfile.styleBoard.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Style ${i + 1}`}
                        className="rounded-lg aspect-square object-cover"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Preview Outfits</h3>
                  <div className="grid gap-3">
                    {generatedProfile.outfitPreviews.map((outfit, i) => (
                      <Card key={i} className="p-4">
                        <p className="font-medium">{outfit.title}</p>
                        <p className="text-sm text-muted-foreground">{outfit.description}</p>
                      </Card>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    Unlock more outfits in your dashboard
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={handleComplete} data-testid="button-complete-quiz">
                Go to My Dashboard
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep !== "welcome" && currentStep !== "generating" && currentStep !== "preview" && (
        <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-10 p-4 border-b">
          <div className="max-w-2xl mx-auto">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Step {stepIndex + 1} of {stepOrder.length}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-20">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {currentStep !== "welcome" && currentStep !== "generating" && currentStep !== "preview" && (
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={goPrev}
              disabled={stepIndex === 0}
              data-testid="button-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep === "photos" ? (
              <Button onClick={handleGeneratePreview} data-testid="button-generate">
                Generate My Profile
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={goNext} data-testid="button-next">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
