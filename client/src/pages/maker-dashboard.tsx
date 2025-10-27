import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertQuoteSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Package, DollarSign, Calendar, Send } from "lucide-react";
import type { CustomRequest, Maker } from "@shared/schema";

const quoteFormSchema = insertQuoteSchema.extend({
  price: z.coerce.number().min(1),
  leadTimeDays: z.coerce.number().min(1),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

export default function MakerDashboard() {
  const { toast } = useToast();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // For demo purposes, using localStorage to store maker ID
  // In production, this would be from authentication
  const makerId = localStorage.getItem("perfectfit_maker_id");

  // Query for available makers
  const { data: makers } = useQuery<Maker[]>({
    queryKey: ['/api/v1/makers'],
    enabled: !makerId,
  });

  const { data: openRequests, isLoading } = useQuery<CustomRequest[]>({
    queryKey: ['/api/v1/custom-requests'],
    enabled: !!makerId,
  });

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      return apiRequest("POST", "/api/v1/quotes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/custom-requests'] });
      setSelectedRequestId(null);
      toast({
        title: "Quote Submitted!",
        description: "The customer will review your quote.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit quote",
        variant: "destructive",
      });
    },
  });

  if (!makerId) {
    const verifiedMakers = makers?.filter((m) => m.isVerified && m.isActive) || [];
    
    return (
      <div className="container max-w-4xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Maker Login Required</CardTitle>
            <CardDescription>
              Please select a maker profile to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verifiedMakers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading makers...</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  For demo purposes, select a maker profile to continue:
                </p>
                {verifiedMakers.map((maker) => (
                  <Button
                    key={maker.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      localStorage.setItem("perfectfit_maker_id", maker.id);
                      window.location.reload();
                    }}
                    data-testid={`button-select-maker-${maker.id}`}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{maker.businessName}</div>
                      <div className="text-xs text-muted-foreground">{maker.ownerName} · {maker.location}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-8">
        <div className="text-center">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Maker Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Browse open requests and submit competitive quotes
        </p>
      </div>

      {!openRequests || openRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No open requests</h3>
            <p className="text-muted-foreground">Check back later for new custom requests.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {openRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              makerId={makerId}
              isSelected={selectedRequestId === request.id}
              onSelect={() => setSelectedRequestId(request.id)}
              onSubmitQuote={(data) => submitQuoteMutation.mutate(data)}
              isSubmitting={submitQuoteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  makerId,
  isSelected,
  onSelect,
  onSubmitQuote,
  isSubmitting,
}: {
  request: CustomRequest;
  makerId: string;
  isSelected: boolean;
  onSelect: () => void;
  onSubmitQuote: (data: QuoteFormData) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      requestId: request.id,
      makerId: makerId,
      price: "",
      leadTimeDays: 14,
      materials: "",
      message: "",
      matchScore: "0.8",
    },
  });

  const onSubmit = (data: QuoteFormData) => {
    onSubmitQuote(data);
  };

  return (
    <Card data-testid={`request-card-${request.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="capitalize">{request.itemType}</CardTitle>
            <CardDescription className="mt-2 line-clamp-3">
              {request.description || "No description provided"}
            </CardDescription>
          </div>
          <Badge variant="outline">
            ${request.budgetMin} - ${request.budgetMax}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Posted {new Date(request.createdAt).toLocaleDateString()}
          </div>

          {!isSelected ? (
            <Button onClick={onSelect} className="w-full" data-testid={`button-submit-quote-${request.id}`}>
              <Send className="w-4 h-4 mr-2" />
              Submit Quote
            </Button>
          ) : (
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-4">Submit Your Quote</h4>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="800"
                              data-testid="input-quote-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leadTimeDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Time (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="14"
                              data-testid="input-lead-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="materials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Materials</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Premium wool, silk lining"
                            data-testid="input-materials"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message to Customer</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Tell them about your approach and expertise..."
                            className="min-h-24"
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedRequestId(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                      data-testid="button-confirm-quote"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Quote"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
