import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { VirtualTryOn } from "./virtual-try-on";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  fitScore?: number;
  styleMatch?: number;
  budgetMatch?: number;
  totalScore?: number;
  affiliateUrl?: string;
  sizes?: string[];
  sizeChart?: Record<string, any> | null;
  onQuickBuy?: () => void;
  userId?: string;
  showTryOn?: boolean;
}

export function ProductCard({
  id,
  name,
  brand,
  price,
  imageUrl,
  fitScore = 0,
  styleMatch = 0,
  budgetMatch = 0,
  totalScore = 0,
  affiliateUrl,
  sizes = [],
  sizeChart = null,
  onQuickBuy,
  userId,
  showTryOn = true,
}: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const productForTryOn = {
    id,
    name,
    brand,
    price: String(price),
    imageUrl: imageUrl || null,
    affiliateUrl: affiliateUrl || null,
    sizes: sizes || null,
    sizeChart: sizeChart || null,
  };

  const handleQuickBuy = () => {
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }
    onQuickBuy?.();
    setTimeout(() => {
      toast({
        title: "Need it altered?",
        description: "Find a local seamstress or tailor to get the perfect fit.",
        action: (
          <Button size="sm" variant="outline" onClick={() => setLocation("/gig/post-job")}>
            Find Help
          </Button>
        ),
      });
    }, 2000);
  };

  return (
    <Card className="group overflow-hidden hover-elevate" data-testid={`card-product-${id}`}>
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={imageUrl || `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80`}
          alt={name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        {/* Wishlist Button */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2"
          data-testid={`button-wishlist-${id}`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
        </button>
      </div>

      <CardContent className="p-6">
        {/* Brand & Name */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1" data-testid={`text-brand-${id}`}>{brand}</p>
          <h3 className="text-lg font-600 text-foreground line-clamp-2" data-testid={`text-name-${id}`}>
            {name}
          </h3>
        </div>

        {/* Price */}
        <p className="font-display text-xl font-700 text-foreground mb-4" data-testid={`text-price-${id}`}>
          ${price.toFixed(2)}
        </p>

        {/* Scores */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge variant="secondary" className="text-xs" data-testid={`badge-fit-${id}`}>
            {Math.round(fitScore * 100)}% Fit
          </Badge>
          <Badge variant="secondary" className="text-xs" data-testid={`badge-style-${id}`}>
            {Math.round(styleMatch * 100)}% Style
          </Badge>
          {budgetMatch >= 0.8 && (
            <Badge variant="secondary" className="text-xs" data-testid={`badge-budget-${id}`}>
              Budget ✓
            </Badge>
          )}
        </div>

        {/* Total Score */}
        {totalScore > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-500 text-muted-foreground">Match Score</span>
              <span className="font-display text-2xl font-700 text-primary" data-testid={`text-score-${id}`}>
                {Math.round(totalScore * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {showTryOn && (
            <Button 
              variant="outline"
              className="w-full" 
              onClick={() => setTryOnOpen(true)}
              data-testid={`button-tryon-${id}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try On
            </Button>
          )}
          <Button 
            className="w-full" 
            onClick={handleQuickBuy}
            data-testid={`button-quickbuy-${id}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Quick Buy
          </Button>
        </div>
      </CardContent>
      
      {showTryOn && (
        <VirtualTryOn 
          product={productForTryOn}
          open={tryOnOpen}
          onOpenChange={setTryOnOpen}
          userId={userId}
        />
      )}
    </Card>
  );
}
