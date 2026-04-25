import { useMutation } from "@tanstack/react-query";
import { Ruler, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useTryOnStore } from "@/store/tryOnStore";

interface SizeRecommendationProps {
  productId: string;
  brand: string;
}

interface SizeResult {
  recommendedSize: string;
  confidence: number;
  notes?: string;
}

export function SizeRecommendation({ productId, brand }: SizeRecommendationProps) {
  const { bodyLandmarks } = useTryOnStore();

  const { mutate, data, isPending, isError } = useMutation<SizeResult>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/v1/try-on/size-recommendation", {
        productId,
        brand,
        bodyLandmarks,
      });
      return res.json();
    },
  });

  if (!data && !isPending && !isError) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => mutate()}
        data-testid="button-get-size-recommendation"
      >
        <Ruler className="w-4 h-4" />
        Get Size Recommendation
      </Button>
    );
  }

  if (isPending) {
    return (
      <Card className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Calculating your size...
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-3 text-sm text-destructive">
        Could not calculate size. Try again.
      </Card>
    );
  }

  return (
    <Card className="p-3 space-y-1" data-testid="card-size-recommendation">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Recommended Size</span>
        <Badge variant="secondary" data-testid="badge-recommended-size">
          {data.recommendedSize}
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <div
          className="h-1.5 bg-primary rounded-full"
          style={{ width: `${Math.round(data.confidence * 100)}%` }}
        />
        <span className="text-xs text-muted-foreground ml-1">
          {Math.round(data.confidence * 100)}% confidence
        </span>
      </div>
      {data.notes && (
        <p className="text-xs text-muted-foreground">{data.notes}</p>
      )}
    </Card>
  );
}
