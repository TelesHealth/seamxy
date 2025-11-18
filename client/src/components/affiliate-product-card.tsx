import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Tag, TruckIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AffiliateProductCardProps {
  externalId: string;
  retailer: 'amazon' | 'ebay' | 'rakuten';
  title: string;
  brand?: string;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  imageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  shippingCost?: number;
  deliveryDays?: number;
  userId?: string;
}

const retailerColors = {
  amazon: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  ebay: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  rakuten: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
};

const retailerNames = {
  amazon: 'Amazon',
  ebay: 'eBay',
  rakuten: 'Rakuten',
};

export function AffiliateProductCard({
  externalId,
  retailer,
  title,
  brand,
  currentPrice,
  originalPrice,
  currency,
  imageUrl,
  productUrl,
  affiliateUrl,
  shippingCost,
  deliveryDays,
  userId,
}: AffiliateProductCardProps) {
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  const handleShopNow = async () => {
    // Track affiliate click
    if (userId) {
      try {
        await apiRequest('POST', '/api/v1/affiliate-click', {
          userId,
          externalProductId: externalId,
          retailer,
          affiliateUrl: affiliateUrl || productUrl,
        });
      } catch (error) {
        console.error('Failed to track affiliate click:', error);
      }
    }

    // Open product in new tab
    window.open(affiliateUrl || productUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="group overflow-hidden hover-elevate" 
      data-testid={`card-affiliate-product-${externalId}`}
    >
      <div className="flex gap-4 p-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <img
            src={imageUrl || `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80`}
            alt={title}
            className="w-full h-full object-cover"
            data-testid={`img-product-${externalId}`}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Retailer Badge */}
          <Badge 
            variant="outline" 
            className={`mb-2 ${retailerColors[retailer]}`}
            data-testid={`badge-retailer-${externalId}`}
          >
            {retailerNames[retailer]}
          </Badge>

          {/* Brand & Title */}
          {brand && (
            <p className="text-xs text-muted-foreground mb-1" data-testid={`text-brand-${externalId}`}>
              {brand}
            </p>
          )}
          <h4 className="text-sm font-600 text-foreground line-clamp-2 mb-2" data-testid={`text-title-${externalId}`}>
            {title}
          </h4>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <span className="font-display text-lg font-700 text-foreground" data-testid={`text-price-${externalId}`}>
              {currency === 'USD' ? '$' : currency}{currentPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${externalId}`}>
                  {currency === 'USD' ? '$' : currency}{originalPrice.toFixed(2)}
                </span>
                <Badge variant="secondary" className="text-xs" data-testid={`badge-discount-${externalId}`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {discountPercent}% off
                </Badge>
              </>
            )}
          </div>

          {/* Shipping Info */}
          {(shippingCost !== undefined || deliveryDays) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <TruckIcon className="w-3 h-3" />
              {shippingCost === 0 ? (
                <span>Free shipping</span>
              ) : shippingCost ? (
                <span>+{currency === 'USD' ? '$' : currency}{shippingCost} shipping</span>
              ) : null}
              {deliveryDays && (
                <span> • {deliveryDays} days</span>
              )}
            </div>
          )}

          {/* Shop Now Button */}
          <Button 
            size="sm"
            onClick={handleShopNow}
            data-testid={`button-shop-now-${externalId}`}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Shop Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
