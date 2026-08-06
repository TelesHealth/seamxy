import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingBag, Gift, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ACTIONS = [
  {
    key: "lend",
    label: "Lend to Friends",
    icon: Heart,
    description: "Offer it to your style group first",
  },
  {
    key: "sell",
    label: "Sell It",
    icon: ShoppingBag,
    description: "List it in a closet sale",
  },
  {
    key: "donate",
    label: "Donate",
    icon: Gift,
    description: "Give it away & log for taxes",
  },
  {
    key: "keep",
    label: "Keep It",
    icon: X,
    description: "I'll hold onto this one",
  },
];

export default function LetItGoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: idleItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/closet/idle"],
  });

  const { mutate: markWorn } = useMutation({
    mutationFn: (itemId: string) => apiRequest("POST", `/api/v1/closet/${itemId}/worn`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/closet/idle"] });
      toast({ title: "Marked as worn!" });
    },
  });

  const { mutate: resolveAlert } = useMutation({
    mutationFn: ({ alertId, action }: { alertId: string; action: string }) =>
      apiRequest("POST", `/api/v1/closet/idle/${alertId}/resolve`, { action }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/closet/idle"] });
      const labels: Record<string, string> = {
        lend: "Listed for lending",
        sell: "Listed for sale",
        donate: "Logged as donated",
        keep: "Keeping it",
      };
      toast({ title: labels[vars.action] ?? "Done!" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Closet Edit</h1>
        <p className="text-muted-foreground">
          These items haven't been worn in 6+ months. Time to decide what stays and what goes.
        </p>
      </div>

      {idleItems.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Your closet is in great shape!</h3>
          <p className="text-muted-foreground text-sm">No items have been idle for 6+ months.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {idleItems.map((item: any) => (
            <div
              key={item.id}
              className="border rounded-xl overflow-hidden"
              data-testid={`card-idle-item-${item.id}`}
            >
              <div className="flex gap-4 p-4">
                {item.imageUrl && (
                  <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img src={item.imageUrl} alt={item.name ?? item.category} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">
                    {item.name ?? ([item.brand, item.subcategory ?? item.category].filter(Boolean).join(" ") || "Closet item")}
                  </p>
                  {item.brand && <p className="text-sm text-muted-foreground">{item.brand}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Not worn 6+ months
                    </Badge>
                    {item.condition && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.condition}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => markWorn(item.id)}
                    data-testid={`button-worn-${item.id}`}
                  >
                    I wore this recently
                  </Button>
                </div>
              </div>

              <div className="border-t grid grid-cols-2 divide-x">
                {ACTIONS.map((action) => (
                  <button
                    key={action.key}
                    className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => resolveAlert({ alertId: item.alertId ?? item.id, action: action.key })}
                    data-testid={`button-action-${action.key}-${item.id}`}
                  >
                    <action.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
