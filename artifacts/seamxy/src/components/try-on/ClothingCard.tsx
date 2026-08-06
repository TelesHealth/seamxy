import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClothingItem {
  id: string | number;
  name: string;
  brand?: string | null;
  price: string | number;
  imageUrl: string;
  thumbnailUrl?: string | null;
  category: string;
}

interface ClothingCardProps {
  item: ClothingItem;
  isFavorite?: boolean;
  onFavoriteToggle?: (item: ClothingItem) => void;
  onClick?: (item: ClothingItem) => void;
}

export function ClothingCard({ item, isFavorite = false, onFavoriteToggle, onClick }: ClothingCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer group"
      onClick={() => onClick?.(item)}
      data-testid={`card-clothing-${item.id}`}
    >
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onFavoriteToggle?.(item); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
          data-testid={`button-favorite-${item.id}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
        {item.brand && (
          <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs bg-background/80 backdrop-blur-sm">
            {item.brand}
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium truncate">{item.name}</h3>
        <p className="text-sm font-semibold text-primary mt-1">
          ${parseFloat(String(item.price)).toFixed(2)}
        </p>
      </div>
    </Card>
  );
}
