import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SERVICE_TYPES = [
  { value: "hemming", label: "Hemming — shorten or lengthen" },
  { value: "taking_in", label: "Taking in — make it smaller" },
  { value: "letting_out", label: "Letting out — make it larger" },
  { value: "zipper_repair", label: "Zipper repair" },
  { value: "zipper_replacement", label: "Zipper replacement" },
  { value: "button_repair", label: "Button repair or replacement" },
  { value: "dress_fitting", label: "Dress fitting" },
  { value: "suit_alterations", label: "Suit alterations" },
  { value: "general_alterations", label: "General alterations" },
  { value: "clothing_repair", label: "Clothing repair" },
  { value: "custom_embroidery", label: "Custom embroidery" },
  { value: "other", label: "Something else" },
];

const DELIVERY_OPTIONS = [
  { value: "drop_off", label: "I'll drop it off" },
  { value: "home_visit", label: "Home visit" },
  { value: "shipping", label: "Ship it" },
];

export default function GigPostJobPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    serviceType: "",
    garmentDescription: "",
    alterationDetails: "",
    deliveryMethod: "drop_off",
    budgetMax: "",
    customerCity: "",
    neededBy: "",
  });

  const { mutate: postJob, isPending } = useMutation({
    mutationFn: () => apiRequest("POST", "/api/v1/gig/jobs", {
      ...form,
      budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : undefined,
      neededBy: form.neededBy || undefined,
    }),
    onSuccess: () => {
      toast({ title: "Job posted!", description: "Local providers will send you quotes." });
      setLocation("/gig");
    },
    onError: () => {
      toast({ title: "Error posting job", variant: "destructive" });
    },
  });

  const isValid = form.serviceType && form.garmentDescription && form.alterationDetails && form.customerCity;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Get Alteration Help</h1>
      <p className="text-muted-foreground mb-6">
        Describe what you need and local specialists will send you quotes.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">What do you need done? *</label>
          <div className="grid grid-cols-1 gap-2">
            {SERVICE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setForm(f => ({ ...f, serviceType: t.value }))}
                className={`text-left px-4 py-3 rounded-md border text-sm transition-colors ${
                  form.serviceType === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
                data-testid={`button-service-type-${t.value}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Describe the garment *</label>
          <Input
            placeholder="e.g. Black wool blazer, size 10"
            value={form.garmentDescription}
            onChange={(e) => setForm(f => ({ ...f, garmentDescription: e.target.value }))}
            data-testid="input-garment-description"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Alteration details *</label>
          <Textarea
            placeholder="e.g. Sleeves are 2 inches too long. Need them shortened to wrist length."
            value={form.alterationDetails}
            onChange={(e) => setForm(f => ({ ...f, alterationDetails: e.target.value }))}
            className="h-24"
            data-testid="input-alteration-details"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Your city *</label>
          <Input
            placeholder="Chicago"
            value={form.customerCity}
            onChange={(e) => setForm(f => ({ ...f, customerCity: e.target.value }))}
            data-testid="input-customer-city"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">How would you prefer to hand it over?</label>
          <div className="flex flex-wrap gap-2">
            {DELIVERY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm(f => ({ ...f, deliveryMethod: opt.value }))}
                className={`flex-1 py-2 rounded-md border text-sm transition-colors ${
                  form.deliveryMethod === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
                data-testid={`button-delivery-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Max budget ($)</label>
            <Input
              type="number"
              placeholder="50"
              value={form.budgetMax}
              onChange={(e) => setForm(f => ({ ...f, budgetMax: e.target.value }))}
              data-testid="input-budget-max"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Needed by</label>
            <Input
              type="date"
              value={form.neededBy}
              onChange={(e) => setForm(f => ({ ...f, neededBy: e.target.value }))}
              data-testid="input-needed-by"
            />
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!isValid || isPending}
          onClick={() => postJob()}
          data-testid="button-post-job"
        >
          {isPending ? "Posting..." : "Post Job — Get Quotes"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Free to post. You only pay when you accept a quote.
        </p>
      </div>
    </div>
  );
}
