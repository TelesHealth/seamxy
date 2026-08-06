import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { User, Ruler, MessageSquare, DollarSign, Check } from "lucide-react";

type Step = "demographic" | "measurements" | "style" | "budget" | "complete";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("demographic");
  const [userId, setUserId] = useState<string>("");
  const [demographic, setDemographic] = useState<string>("");
  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hips: "",
    sleeve: "",
    inseam: "",
    height: "",
    shoeSize: "",
  });
  const [styleText, setStyleText] = useState("");
  const [budgetRange, setBudgetRange] = useState([50, 200]);
  const [budgetTier, setBudgetTier] = useState("");

  // Mutation to create user
  const createUserMutation = useMutation({
    mutationFn: async () => {
      if (!demographic) {
        throw new Error("Please select a demographic");
      }
      const res = await apiRequest("POST", "/api/v1/users", {
        email: `user_${Date.now()}@seamxy.com`,
        password: "temporary",
        name: "New User",
        demographic,
        budgetMin: budgetRange[0],
        budgetMax: budgetRange[1],
        budgetTier: budgetTier || "mid_range"
      });
      return res.json();
    },
    onSuccess: (user: any) => {
      setUserId(user.id);
    }
  });

  // Mutation to save measurements
  const saveMeasurementsMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const res = await apiRequest("POST", "/api/v1/measurements", {
        userId,
        chest: measurements.chest || null,
        waist: measurements.waist || null,
        hips: measurements.hips || null,
        sleeve: measurements.sleeve || null,
        inseam: measurements.inseam || null,
        height: measurements.height || null,
        shoeSize: measurements.shoeSize || null,
        unit: "inches"
      });
      return res.json();
    }
  });

  // Mutation to analyze style
  const analyzeStyleMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const res = await apiRequest("POST", `/api/v1/users/${userId}/analyze-style`, {
        description: styleText
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Style analyzed!",
        description: "Your preferences have been saved."
      });
    }
  });

  // Mutation to update budget
  const updateBudgetMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const res = await apiRequest("PATCH", `/api/v1/users/${userId}`, {
        budgetMin: budgetRange[0],
        budgetMax: budgetRange[1],
        budgetTier: budgetTier || "mid_range"
      });
      return res.json();
    }
  });

  const steps: { id: Step; title: string; icon: React.ReactNode }[] = [
    { id: "demographic", title: "Who are you shopping for?", icon: <User className="w-5 h-5" /> },
    { id: "measurements", title: "Your measurements", icon: <Ruler className="w-5 h-5" /> },
    { id: "style", title: "Describe your style", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "budget", title: "Set your budget", icon: <DollarSign className="w-5 h-5" /> },
    { id: "complete", title: "Complete", icon: <Check className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = async () => {
    const stepOrder: Step[] = ["demographic", "measurements", "style", "budget", "complete"];
    const currentIndex = stepOrder.indexOf(step);
    
    // Save data at each step
    try {
      if (step === "demographic" && !userId) {
        await createUserMutation.mutateAsync();
      } else if (step === "measurements" && userId) {
        await saveMeasurementsMutation.mutateAsync();
      } else if (step === "style" && userId) {
        await analyzeStyleMutation.mutateAsync();
      } else if (step === "budget" && userId) {
        await updateBudgetMutation.mutateAsync();
      }
    } catch (error: any) {
      toast({
        title: "Error saving data",
        description: error.message || "Please try again",
        variant: "destructive"
      });
      return;
    }
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < stepOrder.length) {
      setStep(stepOrder[nextIndex]);
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ["demographic", "measurements", "style", "budget"];
    const prevIndex = stepOrder.indexOf(step) - 1;
    if (prevIndex >= 0) {
      setStep(stepOrder[prevIndex]);
    }
  };

  const handleComplete = () => {
    // Store userId in localStorage for future use
    if (userId) {
      localStorage.setItem('seamxy_user_id', userId);
    }
    setLocation("/shop");
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div 
                key={s.id} 
                className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  i <= currentStepIndex ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground'
                }`}>
                  {s.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    i < currentStepIndex ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-3xl">
              {steps[currentStepIndex]?.title}
            </CardTitle>
            <CardDescription>
              Step {currentStepIndex + 1} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Demographic */}
            {step === "demographic" && (
              <div className="space-y-6">
                <RadioGroup value={demographic} onValueChange={setDemographic}>
                  {[
                    { value: "men", label: "Men", desc: "Men's clothing and fits" },
                    { value: "women", label: "Women", desc: "Women's clothing and fits" },
                    { value: "young_adults", label: "Young Adults", desc: "Trendy styles for teens and young adults" },
                    { value: "children", label: "Children", desc: "Kids' clothing with growing room" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover-elevate">
                      <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-${option.value}`} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        <div className="font-600">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Measurements */}
            {step === "measurements" && (
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Enter your measurements to get perfectly matched clothing recommendations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "chest", label: "Chest", placeholder: "38" },
                    { key: "waist", label: "Waist", placeholder: "32" },
                    { key: "hips", label: "Hips", placeholder: "38" },
                    { key: "sleeve", label: "Sleeve", placeholder: "33" },
                    { key: "inseam", label: "Inseam", placeholder: "30" },
                    { key: "height", label: "Height", placeholder: "70" },
                    { key: "shoeSize", label: "Shoe Size (US)", placeholder: "10" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>
                        {field.label} {field.key !== "shoeSize" && "(inches)"}
                      </Label>
                      <Input
                        id={field.key}
                        type="number"
                        step={field.key === "shoeSize" ? "0.5" : "1"}
                        placeholder={field.placeholder}
                        value={measurements[field.key as keyof typeof measurements]}
                        onChange={(e) => setMeasurements({ ...measurements, [field.key]: e.target.value })}
                        data-testid={`input-${field.key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Style Description */}
            {step === "style" && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="style-text" className="text-base mb-2 block">
                    Tell us about your style in your own words
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI will analyze your description to understand your preferences.
                    For example: "I'm a 28-year-old professional who likes minimalist, smart-casual clothing for the office and weekends."
                  </p>
                  <Textarea
                    id="style-text"
                    placeholder="Describe your style, lifestyle, and clothing preferences..."
                    value={styleText}
                    onChange={(e) => setStyleText(e.target.value)}
                    className="min-h-[150px] resize-none"
                    data-testid="input-style-description"
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    {styleText.length} characters
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Budget */}
            {step === "budget" && (
              <div className="space-y-8">
                <div>
                  <Label className="text-base mb-4 block">
                    What's your typical budget per item?
                  </Label>
                  <div className="space-y-4">
                    <div className="px-2">
                      <Slider
                        min={0}
                        max={500}
                        step={10}
                        value={budgetRange}
                        onValueChange={setBudgetRange}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm font-600">
                        <span>${budgetRange[0]}</span>
                        <span className="text-muted-foreground">to</span>
                        <span>${budgetRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base mb-3 block">Or choose a budget tier</Label>
                  <RadioGroup value={budgetTier} onValueChange={setBudgetTier}>
                    {[
                      { value: "affordable", label: "Affordable ($)", desc: "Under $50 per item" },
                      { value: "mid_range", label: "Mid-range ($$)", desc: "$50-$150 per item" },
                      { value: "premium", label: "Premium ($$$)", desc: "$150-$400 per item" },
                      { value: "luxury", label: "Luxury ($$$$)", desc: "$400+ per item" },
                    ].map((tier) => (
                      <div key={tier.value} className="flex items-center space-x-3 p-4 rounded-lg border hover-elevate">
                        <RadioGroupItem value={tier.value} id={tier.value} data-testid={`radio-${tier.value}`} />
                        <Label htmlFor={tier.value} className="flex-1 cursor-pointer">
                          <div className="font-600">{tier.label}</div>
                          <div className="text-sm text-muted-foreground">{tier.desc}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 5: Complete */}
            {step === "complete" && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-700 mb-4">
                  Profile Complete!
                </h3>
                <p className="text-muted-foreground mb-8">
                  Your personalized shopping experience is ready. Start exploring products matched to your exact measurements, style, and budget.
                </p>
                <Button size="lg" onClick={handleComplete} data-testid="button-start-shopping">
                  Start Shopping
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            {step !== "complete" && (
              <div className="flex gap-3 mt-8 pt-6 border-t">
                {currentStepIndex > 0 && (
                  <Button variant="outline" onClick={handleBack} data-testid="button-back">
                    Back
                  </Button>
                )}
                <Button 
                  className="ml-auto" 
                  onClick={handleNext}
                  disabled={
                    (step === "demographic" && !demographic) ||
                    (step === "style" && !styleText.trim()) ||
                    createUserMutation.isPending ||
                    saveMeasurementsMutation.isPending ||
                    analyzeStyleMutation.isPending ||
                    updateBudgetMutation.isPending
                  }
                  data-testid="button-next"
                >
                  {createUserMutation.isPending || saveMeasurementsMutation.isPending || analyzeStyleMutation.isPending || updateBudgetMutation.isPending
                    ? "Saving..."
                    : currentStepIndex === steps.length - 2 ? "Complete" : "Next"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
