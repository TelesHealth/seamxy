import { useQuery } from "@tanstack/react-query";
import { Sparkles, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTryOnStore } from "@/store/tryOnStore";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
}

interface CompleteTheLookProps {
  productId: string;
}

export function CompleteTheLook({ productId }: CompleteTheLookProps) {
  const { addClothingLayer, clothingLayers } = useTryOnStore();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/v1/products", { limit: 4 }],
    select: (all: Product[]) =>
      (all as Product[])
        .filter((p) => p.id !== productId)
        .slice(0, 4),
  });

  const handleTryOn = (product: Product) => {
    addClothingLayer({
      productId: product.id,
      imageUrl: product.imageUrl ?? "",
      category: product.category ?? "tops",
      name: product.name,
      position: { x: 0.5, y: 0.4 },
      scale: 1,
      rotation: 0,
    });
  };

  if (isLoading || products.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm">Complete the Look</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {products.map((product) => {
            const alreadyAdded = clothingLayers.some((l) => l.productId === product.id);
            return (
              <div
                key={product.id}
                className="rounded-lg overflow-hidden border"
                data-testid={`card-complete-look-${product.id}`}
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">${(product.price / 100).toFixed(2)}</p>
                  <Button
                    size="sm"
                    variant={alreadyAdded ? "secondary" : "outline"}
                    className="w-full text-xs"
                    onClick={() => handleTryOn(product)}
                    disabled={alreadyAdded}
                    data-testid={`button-add-to-look-${product.id}`}
                  >
                    {alreadyAdded ? "Added" : "Try On"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/shop">
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
            Browse more in Shop
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
