import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupplierAuth } from "@/lib/supplier-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Plus } from "lucide-react";

type PortfolioItem = {
  id: string;
  stylistId: string;
  imageUrl: string;
  s3Key: string;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  occasion: string | null;
  clientType: string | null;
  priceRange: string | null;
  styleNotes: string | null;
  uploadedAt: string;
};

type PortfolioFormData = {
  imageUrl: string;
  s3Key: string;
  title: string;
  description: string;
  occasion: string;
  clientType: string;
  priceRange: string;
  styleNotes: string;
  tags: string;
};

export default function AiPortfolio() {
  const { supplier } = useSupplierAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    imageUrl: "",
    s3Key: "",
    title: "",
    description: "",
    occasion: "",
    clientType: "",
    priceRange: "",
    styleNotes: "",
    tags: "",
  });

  const { data: stylistProfile, isLoading: isLoadingProfile } = useQuery<{ id: string; handle: string; displayName: string }>({
    queryKey: [`/api/v1/supplier/${supplier?.id}/stylist-profile`],
    enabled: !!supplier?.id,
  });

  const { data: portfolioItems = [], isLoading: isLoadingPortfolio } = useQuery<PortfolioItem[]>({
    queryKey: [`/api/v1/stylist/${stylistProfile?.id}/portfolio`],
    enabled: !!stylistProfile?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      return apiRequest('POST', `/api/v1/stylist/${stylistProfile!.id}/portfolio`, {
        imageUrl: data.imageUrl,
        s3Key: data.s3Key,
        title: data.title,
        description: data.description,
        occasion: data.occasion,
        clientType: data.clientType,
        priceRange: data.priceRange,
        styleNotes: data.styleNotes,
        tags: data.tags.split(",").map(t => t.trim()).filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/stylist/${stylistProfile?.id}/portfolio`] });
      toast({ title: "Portfolio item added successfully" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest('DELETE', `/api/v1/stylist/portfolio/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/stylist/${stylistProfile?.id}/portfolio`] });
      toast({ title: "Portfolio item deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      imageUrl: "",
      s3Key: "",
      title: "",
      description: "",
      occasion: "",
      clientType: "",
      priceRange: "",
      styleNotes: "",
      tags: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stylistProfile) {
      toast({ title: "Error", description: "Stylist profile not loaded", variant: "destructive" });
      return;
    }
    
    if (!formData.imageUrl || !formData.title) {
      toast({ title: "Error", description: "Image URL and title are required", variant: "destructive" });
      return;
    }

    createMutation.mutate(formData);
  };

  if (!supplier) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Upload</CardTitle>
            <CardDescription>Please log in to manage your portfolio</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoadingProfile || isLoadingPortfolio) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading portfolio...</CardTitle>
            <CardDescription>Please wait while we load your stylist profile and portfolio items.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Training Portfolio</CardTitle>
          <CardDescription>
            Upload 5-10 portfolio items with detailed context to enhance your AI stylist's personality.
            These examples help your AI clone understand your aesthetic and client approach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Current portfolio items: {portfolioItems.length} / 10 recommended
            </p>
          </div>

          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              className="mb-6"
              data-testid="button-add-portfolio"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          )}

          {isAdding && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add Portfolio Item</CardTitle>
                <CardDescription>
                  Upload an image and provide context about this styling work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL *</Label>
                    <Input
                      id="imageUrl"
                      data-testid="input-image-url"
                      placeholder="https://example.com/image.jpg (upload to S3 first)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Note: Image upload to S3 not yet implemented. Use an external image URL for now.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="s3Key">S3 Key *</Label>
                    <Input
                      id="s3Key"
                      data-testid="input-s3-key"
                      placeholder="portfolio/unique-filename.jpg"
                      value={formData.s3Key}
                      onChange={(e) => setFormData({ ...formData, s3Key: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      data-testid="input-title"
                      placeholder="Summer Wedding Look"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      data-testid="textarea-description"
                      placeholder="Brief description of this look"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="occasion">Occasion</Label>
                      <Select
                        value={formData.occasion}
                        onValueChange={(value) => setFormData({ ...formData, occasion: value })}
                      >
                        <SelectTrigger id="occasion" data-testid="select-occasion">
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="prom">Prom</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal Event</SelectItem>
                          <SelectItem value="party">Party</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientType">Client Type</Label>
                      <Select
                        value={formData.clientType}
                        onValueChange={(value) => setFormData({ ...formData, clientType: value })}
                      >
                        <SelectTrigger id="clientType" data-testid="select-client-type">
                          <SelectValue placeholder="Select client type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bride">Bride</SelectItem>
                          <SelectItem value="groom">Groom</SelectItem>
                          <SelectItem value="business-professional">Business Professional</SelectItem>
                          <SelectItem value="young-professional">Young Professional</SelectItem>
                          <SelectItem value="fashion-forward">Fashion-Forward Client</SelectItem>
                          <SelectItem value="minimalist">Minimalist Client</SelectItem>
                          <SelectItem value="classic">Classic Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceRange">Price Range</Label>
                    <Select
                      value={formData.priceRange}
                      onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
                    >
                      <SelectTrigger id="priceRange" data-testid="select-price-range">
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500">Under $500</SelectItem>
                        <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                        <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                        <SelectItem value="2000-5000">$2,000 - $5,000</SelectItem>
                        <SelectItem value="5000-plus">$5,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="styleNotes">Style Notes (for AI Training)</Label>
                    <Textarea
                      id="styleNotes"
                      data-testid="textarea-style-notes"
                      placeholder="What makes this look unique? What problem did you solve? What was your creative approach?"
                      value={formData.styleNotes}
                      onChange={(e) => setFormData({ ...formData, styleNotes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Style Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      data-testid="input-tags"
                      placeholder="minimalist, sustainable, streetwear"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-portfolio"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {createMutation.isPending ? "Adding..." : "Add to Portfolio"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Portfolio item"}
                      className="w-full h-full object-cover"
                      data-testid={`img-portfolio-${item.id}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold" data-testid={`text-title-${item.id}`}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.occasion && (
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {item.occasion}
                      </span>
                    )}
                    {item.clientType && (
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {item.clientType}
                      </span>
                    )}
                    {item.priceRange && (
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {item.priceRange}
                      </span>
                    )}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {portfolioItems.length === 0 && !isAdding && (
            <Card className="p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Portfolio Items Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add 5-10 portfolio items to help train your AI stylist
              </p>
              <Button onClick={() => setIsAdding(true)} data-testid="button-add-first">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
