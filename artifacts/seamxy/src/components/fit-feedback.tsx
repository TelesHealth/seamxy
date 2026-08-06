import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Ruler,
  ThumbsUp,
  ThumbsDown,
  Shirt,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ShoppingBag,
  Info
} from "lucide-react";

interface FitFeedbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultId: string;
  productId: string;
  productName: string;
  brand: string;
  size: string;
  userId?: string;
}

type FitRating = 'too_small' | 'slightly_small' | 'perfect' | 'slightly_large' | 'too_large';

const fitOptions: { value: FitRating; label: string; icon: any; description: string }[] = [
  { value: 'too_small', label: 'Too Small', icon: TrendingDown, description: 'Much tighter than expected' },
  { value: 'slightly_small', label: 'Slightly Small', icon: TrendingDown, description: 'A bit snug' },
  { value: 'perfect', label: 'Perfect Fit', icon: CheckCircle, description: 'Just right' },
  { value: 'slightly_large', label: 'Slightly Large', icon: TrendingUp, description: 'A bit loose' },
  { value: 'too_large', label: 'Too Large', icon: TrendingUp, description: 'Much looser than expected' },
];

export function FitFeedback({ 
  open, 
  onOpenChange, 
  resultId,
  productId,
  productName,
  brand,
  size,
  userId 
}: FitFeedbackProps) {
  const { toast } = useToast();
  const [fitRating, setFitRating] = useState<FitRating | null>(null);
  const [wouldBuyAgain, setWouldBuyAgain] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  
  const { data: brandPreference } = useQuery<{ brand: string; sizeAdjustment: number; totalPurchases: number }>({
    queryKey: ["/api/v1/try-on/brand-preferences", brand],
    enabled: open && !!userId && !!brand
  });
  
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: {
      resultId: string;
      productId: string;
      brand: string;
      size: string;
      fitRating: FitRating;
      wouldBuyAgain: boolean;
      notes?: string;
    }) => {
      const response = await apiRequest("POST", "/api/v1/try-on/fit-feedback", feedback);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted!",
        description: "Your fit preferences will help with future size recommendations."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/try-on/brand-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/try-on/fit-feedback"] });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to submit",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const resetForm = () => {
    setFitRating(null);
    setWouldBuyAgain(null);
    setNotes("");
  };
  
  const handleSubmit = () => {
    if (!fitRating || wouldBuyAgain === null) {
      toast({
        title: "Incomplete feedback",
        description: "Please answer all questions.",
        variant: "destructive"
      });
      return;
    }
    
    submitFeedbackMutation.mutate({
      resultId,
      productId,
      brand,
      size,
      fitRating,
      wouldBuyAgain,
      notes: notes || undefined
    });
  };
  
  const getSizeAdjustmentText = (adjustment: number) => {
    if (adjustment > 0.5) return "You typically need to size up with this brand";
    if (adjustment < -0.5) return "You typically need to size down with this brand";
    if (adjustment > 0) return "This brand may run slightly small for you";
    if (adjustment < 0) return "This brand may run slightly large for you";
    return "This brand typically fits you true to size";
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            How Did It Fit?
          </DialogTitle>
          <DialogDescription>
            Help us learn your size preferences for {brand}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center">
                  <Shirt className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{productName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{brand}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">Size {size}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {brandPreference && brandPreference.totalPurchases > 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Your {brand} Fit Profile
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                  {getSizeAdjustmentText(brandPreference.sizeAdjustment)}
                  <span className="text-muted-foreground ml-1">
                    (based on {brandPreference.totalPurchases} items)
                  </span>
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Label className="text-base font-medium">How did this item fit?</Label>
            <div className="grid grid-cols-5 gap-2">
              {fitOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = fitRating === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    onClick={() => setFitRating(option.value)}
                    data-testid={`fit-${option.value}`}
                  >
                    <Icon className={`h-5 w-5 mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium text-center leading-tight">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {fitRating && (
              <p className="text-sm text-muted-foreground text-center">
                {fitOptions.find(o => o.value === fitRating)?.description}
              </p>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-base font-medium">Would you buy this size again?</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={wouldBuyAgain === true ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setWouldBuyAgain(true)}
                data-testid="button-would-buy-yes"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldBuyAgain === false ? "destructive" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setWouldBuyAgain(false)}
                data-testid="button-would-buy-no"
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm text-muted-foreground">
              Additional notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., Arms were a bit tight, length was perfect..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
              data-testid="textarea-notes"
            />
          </div>
          
          <Button 
            className="w-full gap-2" 
            onClick={handleSubmit}
            disabled={!fitRating || wouldBuyAgain === null || submitFeedbackMutation.isPending}
            data-testid="button-submit-feedback"
          >
            {submitFeedbackMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface BrandPreferencesCardProps {
  userId?: string;
}

export function BrandPreferencesCard({ userId }: BrandPreferencesCardProps) {
  const { data: preferences = [], isLoading } = useQuery<Array<{
    id: string;
    brand: string;
    sizeAdjustment: string;
    avgFitRating: string;
    totalPurchases: number;
  }>>({
    queryKey: ["/api/v1/try-on/brand-preferences"],
    enabled: !!userId
  });
  
  if (!userId) return null;
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (preferences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5" />
            Your Brand Fit Preferences
          </CardTitle>
          <CardDescription>
            No fit data yet. Try on items and provide feedback to build your profile.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const getSizeIndicator = (adjustment: number) => {
    if (adjustment > 0.5) return { text: "Size Up", color: "text-orange-600", icon: TrendingUp };
    if (adjustment < -0.5) return { text: "Size Down", color: "text-blue-600", icon: TrendingDown };
    return { text: "True to Size", color: "text-green-600", icon: Minus };
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="h-5 w-5" />
          Your Brand Fit Preferences
        </CardTitle>
        <CardDescription>
          Based on your purchase history and feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {preferences.map((pref) => {
          const adjustment = parseFloat(pref.sizeAdjustment) || 0;
          const indicator = getSizeIndicator(adjustment);
          const Icon = indicator.icon;
          
          return (
            <div 
              key={pref.id} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              data-testid={`brand-pref-${pref.brand.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center font-semibold text-lg">
                  {pref.brand.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{pref.brand}</p>
                  <p className="text-xs text-muted-foreground">
                    {pref.totalPurchases} item{pref.totalPurchases !== 1 ? 's' : ''} reviewed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${indicator.color}`} />
                <Badge variant="secondary" className="text-xs">
                  {indicator.text}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
