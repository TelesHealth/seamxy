import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TryOnModel {
  id: string;
  name: string;
  photoUrl: string;
  thumbnailUrl?: string | null;
  height?: string | null;
  bodyType?: string | null;
  skinTone?: string | null;
}

interface ModelCardProps {
  model: TryOnModel;
  isSelected?: boolean;
  onClick?: (model: TryOnModel) => void;
}

export function ModelCard({ model, isSelected, onClick }: ModelCardProps) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onClick?.(model)}
      data-testid={`card-model-${model.id}`}
    >
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={model.thumbnailUrl || model.photoUrl}
          alt={model.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium truncate">{model.name}</p>
        <div className="flex flex-wrap gap-1">
          {model.height && <Badge variant="secondary" className="text-xs">{model.height}</Badge>}
          {model.bodyType && (
            <Badge variant="secondary" className="text-xs capitalize">
              {model.bodyType.replace("_", " ")}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
