import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { insertCustomRequestSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Scissors, Check } from "lucide-react";

const requestFormSchema = insertCustomRequestSchema.extend({
  budgetMin: z.coerce.number().min(0),
  budgetMax: z.coerce.number().min(0),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"],
});

type RequestFormData = z.infer<typeof requestFormSchema>;

const ITEM_TYPES = [
  { value: "suit", label: "Suit" },
  { value: "dress", label: "Dress" },
  { value: "gown", label: "Gown" },
  { value: "jacket", label: "Jacket" },
  { value: "shirt", label: "Shirt" },
  { value: "pants", label: "Pants" },
  { value: "traditional", label: "Traditional Attire" },
  { value: "other", label: "Other" },
];

export default function CustomRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const userId = localStorage.getItem("seamxy_user_id");

  // Fetch user measurements
  const { data: measurements } = useQuery<any>({
    queryKey: ['/api/v1/measurements', userId],
    enabled: !!userId,
  });

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      userId: userId || "",
      itemType: "",
      description: "",
      styleTags: [],
      budgetMin: 300,
      budgetMax: 1500,
      measurements: {},
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      // Include measurements in the request
      const requestData = {
        ...data,
        measurements: measurements || {},
      };
      return apiRequest("POST", "/api/v1/custom-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users', userId, 'custom-requests'] });
      setSubmitted(true);
      toast({
        title: "Request Submitted!",
        description: "Makers will start sending you quotes soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormData) => {
    createRequestMutation.mutate(data);
  };

  if (!userId) {
    return (
      <div className="container max-w-2xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please complete onboarding first to submit custom requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} data-testid="button-go-onboarding">
              Go to Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container max-w-2xl mx-auto p-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Request Submitted Successfully!</CardTitle>
            <CardDescription>
              Verified makers will review your request and send competitive quotes. You'll be able to compare and choose the best fit.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setLocation("/makers")} data-testid="button-browse-makers">
              Browse Makers
            </Button>
            <Button onClick={() => setLocation("/my-requests")} data-testid="button-view-requests">
              View My Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-8">
      <Button
        variant="ghost"
        onClick={() => setLocation("/shop")}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shop
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Request Custom Design</CardTitle>
              <CardDescription>
                Describe what you're looking for and get quotes from verified makers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-item-type">
                          <SelectValue placeholder="What would you like made?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ITEM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Describe your ideal garment... What's the occasion? Any specific details, fabrics, or style preferences?"
                        className="min-h-32"
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormDescription>
                      Be as detailed as possible to help makers understand your vision
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Budget ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="300"
                          data-testid="input-budget-min"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Budget ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="1500"
                          data-testid="input-budget-max"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {measurements && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your saved measurements will be included with this request
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {measurements.chest && <div>Chest: {measurements.chest}"</div>}
                    {measurements.waist && <div>Waist: {measurements.waist}"</div>}
                    {measurements.hips && <div>Hips: {measurements.hips}"</div>}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={createRequestMutation.isPending}
                data-testid="button-submit-request"
              >
                {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
