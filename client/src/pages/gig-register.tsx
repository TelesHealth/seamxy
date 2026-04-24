import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Scissors, MapPin, DollarSign, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SERVICE_TYPES = [
  { value: "hemming", label: "Hemming" },
  { value: "taking_in", label: "Taking In" },
  { value: "letting_out", label: "Letting Out" },
  { value: "zipper_repair", label: "Zipper Repair" },
  { value: "zipper_replacement", label: "Zipper Replacement" },
  { value: "button_repair", label: "Button Repair" },
  { value: "dress_fitting", label: "Dress Fitting" },
  { value: "suit_alterations", label: "Suit Alterations" },
  { value: "trouser_alterations", label: "Trouser Alterations" },
  { value: "general_alterations", label: "General Alterations" },
  { value: "custom_embroidery", label: "Custom Embroidery" },
  { value: "clothing_repair", label: "Clothing Repair" },
  { value: "other", label: "Other" },
];

interface ServiceEntry {
  serviceType: string;
  priceMin: string;
  priceMax: string;
  turnaroundDaysMin: string;
  turnaroundDaysMax: string;
  description: string;
}

export default function GigRegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    city: "",
    state: "",
    serviceRadiusMiles: "10",
    offersDropOff: true,
    offersHomeVisits: false,
    offersShipping: false,
  });

  const [services, setServices] = useState<ServiceEntry[]>([
    { serviceType: "hemming", priceMin: "15", priceMax: "30", turnaroundDaysMin: "1", turnaroundDaysMax: "3", description: "" }
  ]);

  const { mutate: register, isPending } = useMutation({
    mutationFn: async () => {
      const provider = await apiRequest("POST", "/api/v1/gig/register", profile);
      for (const service of services) {
        if (service.serviceType && service.priceMin && service.priceMax) {
          await apiRequest("POST", "/api/v1/gig/services", {
            ...service,
            priceMin: parseFloat(service.priceMin),
            priceMax: parseFloat(service.priceMax),
            turnaroundDaysMin: parseInt(service.turnaroundDaysMin),
            turnaroundDaysMax: parseInt(service.turnaroundDaysMax),
          });
        }
      }
      return provider;
    },
    onSuccess: () => {
      toast({ title: "You're registered!", description: "Customers in your area can now find you." });
      setLocation("/gig");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addService = () => {
    setServices(prev => [...prev, {
      serviceType: "general_alterations", priceMin: "", priceMax: "",
      turnaroundDaysMin: "1", turnaroundDaysMax: "5", description: ""
    }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceEntry, value: string) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const deliveryOptions = [
    { key: "offersDropOff", label: "Customer drops off" },
    { key: "offersHomeVisits", label: "I visit customer" },
    { key: "offersShipping", label: "Ship items to me" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Offer Your Services</h1>
        </div>
        <p className="text-muted-foreground">
          Join SeamXY's network of local alteration specialists. No monthly fees —
          we take 12% only when you complete a job.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">Your Profile</h2>

        <div>
          <label className="text-sm font-medium mb-1 block">Your Name or Business Name *</label>
          <Input
            placeholder="e.g. Maria's Alterations"
            value={profile.displayName}
            onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
            data-testid="input-display-name"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">About You</label>
          <Textarea
            placeholder="Tell customers about your experience and specialties..."
            value={profile.bio}
            onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
            className="h-24"
            data-testid="input-bio"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">City *</label>
            <Input
              placeholder="Chicago"
              value={profile.city}
              onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
              data-testid="input-city"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">State</label>
            <Input
              placeholder="IL"
              value={profile.state}
              onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))}
              data-testid="input-state"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">How do you work?</label>
          <div className="flex flex-wrap gap-3">
            {deliveryOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setProfile(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                  profile[key as keyof typeof profile]
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
                data-testid={`toggle-${key}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-lg">Your Services</h2>
          <Button variant="outline" size="sm" onClick={addService} data-testid="button-add-service">
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        </div>

        {services.map((service, index) => (
          <Card key={index} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <select
                value={service.serviceType}
                onChange={(e) => updateService(index, "serviceType", e.target.value)}
                className="text-sm font-medium bg-transparent outline-none flex-1"
                data-testid={`select-service-type-${index}`}
              >
                {SERVICE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {services.length > 1 && (
                <button onClick={() => removeService(index)} data-testid={`button-remove-service-${index}`}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Price ($)</label>
                <Input
                  type="number"
                  placeholder="15"
                  value={service.priceMin}
                  onChange={(e) => updateService(index, "priceMin", e.target.value)}
                  data-testid={`input-price-min-${index}`}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Price ($)</label>
                <Input
                  type="number"
                  placeholder="35"
                  value={service.priceMax}
                  onChange={(e) => updateService(index, "priceMax", e.target.value)}
                  data-testid={`input-price-max-${index}`}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Days</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={service.turnaroundDaysMin}
                  onChange={(e) => updateService(index, "turnaroundDaysMin", e.target.value)}
                  data-testid={`input-days-min-${index}`}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Days</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={service.turnaroundDaysMax}
                  onChange={(e) => updateService(index, "turnaroundDaysMax", e.target.value)}
                  data-testid={`input-days-max-${index}`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-muted rounded-md p-4 mb-6 text-sm">
        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">No monthly fees</p>
            <p className="text-muted-foreground">
              SeamXY takes 12% only when you complete a paid job. You keep 88% of every job.
            </p>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!profile.displayName || !profile.city || isPending}
        onClick={() => register()}
        data-testid="button-register-provider"
      >
        {isPending ? "Setting up your profile..." : "Start Offering Services"}
      </Button>
    </div>
  );
}
