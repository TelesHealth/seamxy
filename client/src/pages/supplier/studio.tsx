import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupplierAuth } from "@/lib/supplier-auth";
import { Plus, Edit, Trash2, Crown, DollarSign, Heart, MessageSquare, TrendingUp, Users, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StylistProfile {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
}

interface CreatorTier {
  id: string;
  stylistId: string;
  name: string;
  description: string;
  priceCents: number;
  features: string[];
  subscriberCount: number;
}

interface CreatorPost {
  id: string;
  stylistId: string;
  contentType: "text" | "image" | "video" | "portfolio";
  content: string;
  caption: string;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

interface CreatorTip {
  id: string;
  userId: string;
  stylistId: string;
  amountCents: number;
  message: string;
  createdAt: string;
}

interface CreatorCustomRequest {
  id: string;
  userId: string;
  stylistId: string;
  description: string;
  budgetCents: number;
  quotePriceCents?: number;
  quoteNotes?: string;
  status: "pending" | "quoted" | "accepted" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
}

export default function CreatorStudio() {
  const { toast } = useToast();
  const { supplier } = useSupplierAuth();
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<CreatorTier | null>(null);
  const [editingPost, setEditingPost] = useState<CreatorPost | null>(null);
  
  // Tier form state
  const [tierName, setTierName] = useState("");
  const [tierDescription, setTierDescription] = useState("");
  const [tierPrice, setTierPrice] = useState("");
  const [tierFeatures, setTierFeatures] = useState<string[]>([""]);
  
  // Post form state
  const [postContentType, setPostContentType] = useState<"text" | "image" | "video" | "portfolio">("text");
  const [postContent, setPostContent] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postIsPublic, setPostIsPublic] = useState(true);
  
  // Load stylist profile
  const { data: profile } = useQuery<StylistProfile>({
    queryKey: [`/api/v1/supplier/${supplier?.id}/stylist-profile`],
    enabled: !!supplier?.id,
  });
  
  // Load tiers
  const { data: tiers = [] } = useQuery<CreatorTier[]>({
    queryKey: [`/api/v1/creators/${profile?.id}/tiers`],
    enabled: !!profile?.id,
  });
  
  // Load posts
  const { data: posts = [] } = useQuery<CreatorPost[]>({
    queryKey: [`/api/v1/creators/${profile?.id}/posts`],
    enabled: !!profile?.id,
  });
  
  // Load tips
  const { data: tips = [] } = useQuery<CreatorTip[]>({
    queryKey: [`/api/v1/creators/${profile?.id}/tips`],
    enabled: !!profile?.id,
  });
  
  // Load custom requests
  const { data: requests = [] } = useQuery<CreatorCustomRequest[]>({
    queryKey: [`/api/v1/creators/${profile?.id}/requests`],
    enabled: !!profile?.id,
  });
  
  // Calculate analytics
  const totalSubscribers = tiers.reduce((sum, tier) => sum + tier.subscriberCount, 0);
  const totalTips = tips.reduce((sum, tip) => sum + tip.amountCents, 0) / 100;
  const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);
  
  // Create tier mutation
  const createTierMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/v1/creators/${profile?.id}/tiers`, {
        name: tierName,
        description: tierDescription,
        priceCents: Math.round(parseFloat(tierPrice) * 100),
        features: tierFeatures.filter(f => f.trim()),
      });
    },
    onSuccess: () => {
      toast({ title: "Tier Created", description: "Your membership tier has been created" });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${profile?.id}/tiers`] });
      setShowTierDialog(false);
      resetTierForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Update tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', `/api/v1/creators/tiers/${editingTier?.id}`, {
        name: tierName,
        description: tierDescription,
        priceCents: Math.round(parseFloat(tierPrice) * 100),
        features: tierFeatures.filter(f => f.trim()),
      });
    },
    onSuccess: () => {
      toast({ title: "Tier Updated", description: "Your membership tier has been updated" });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${profile?.id}/tiers`] });
      setShowTierDialog(false);
      resetTierForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Delete tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: async (tierId: string) => {
      return apiRequest('DELETE', `/api/v1/creators/tiers/${tierId}`);
    },
    onSuccess: () => {
      toast({ title: "Tier Deleted", description: "Membership tier has been deleted" });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${profile?.id}/tiers`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/v1/creators/${profile?.id}/posts`, {
        contentType: postContentType,
        content: postContent,
        caption: postCaption,
        isPublic: postIsPublic,
      });
    },
    onSuccess: () => {
      toast({ title: "Post Created", description: "Your post has been published" });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${profile?.id}/posts`] });
      setShowPostDialog(false);
      resetPostForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', `/api/v1/creators/posts/${editingPost?.id}`, {
        contentType: postContentType,
        content: postContent,
        caption: postCaption,
        isPublic: postIsPublic,
      });
    },
    onSuccess: () => {
      toast({ title: "Post Updated", description: "Your post has been updated" });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${profile?.id}/posts`] });
      setShowPostDialog(false);
      resetPostForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest('DELETE', `/api/v1/creators/posts/${postId}`);
    },
    onSuccess: () => {
      toast({ title: "Post Deleted", description: "Your post has been deleted" });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${profile?.id}/posts`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Update request quote mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, quotePriceCents, quoteNotes }: { requestId: string; quotePriceCents: number; quoteNotes: string }) => {
      return apiRequest('PATCH', `/api/v1/requests/${requestId}`, {
        quotePriceCents,
        quoteNotes,
      });
    },
    onSuccess: () => {
      toast({ title: "Quote Sent", description: "Your quote has been sent to the customer" });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${profile?.id}/requests`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const resetTierForm = () => {
    setTierName("");
    setTierDescription("");
    setTierPrice("");
    setTierFeatures([""]);
    setEditingTier(null);
  };
  
  const resetPostForm = () => {
    setPostContentType("text");
    setPostContent("");
    setPostCaption("");
    setPostIsPublic(true);
    setEditingPost(null);
  };
  
  const handleEditTier = (tier: CreatorTier) => {
    setEditingTier(tier);
    setTierName(tier.name);
    setTierDescription(tier.description);
    setTierPrice((tier.priceCents / 100).toFixed(2));
    setTierFeatures(tier.features.length > 0 ? tier.features : [""]);
    setShowTierDialog(true);
  };
  
  const handleEditPost = (post: CreatorPost) => {
    setEditingPost(post);
    setPostContentType(post.contentType);
    setPostContent(post.content);
    setPostCaption(post.caption);
    setPostIsPublic(post.isPublic);
    setShowPostDialog(true);
  };
  
  const addFeatureField = () => {
    setTierFeatures([...tierFeatures, ""]);
  };
  
  const updateFeature = (index: number, value: string) => {
    const updated = [...tierFeatures];
    updated[index] = value;
    setTierFeatures(updated);
  };
  
  const removeFeature = (index: number) => {
    setTierFeatures(tierFeatures.filter((_, i) => i !== index));
  };
  
  if (!profile) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Alert>
              <AlertDescription>
                You need to complete your AI Stylist profile first to access Creator Studio
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-studio-header">Creator Studio</h1>
        <p className="text-muted-foreground">Manage your subscriptions, content, and monetization</p>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-subscribers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">Active paying subscribers</p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-tips">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tips Received</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTips.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {tips.length} supporters</p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-views">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-requests">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">{requests.filter(r => r.status === 'pending').length} pending</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Content Tabs */}
      <Tabs defaultValue="tiers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tiers" data-testid="tab-tiers">Membership Tiers</TabsTrigger>
          <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
          <TabsTrigger value="tips" data-testid="tab-tips">Tips</TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-requests">Custom Requests</TabsTrigger>
        </TabsList>
        
        {/* Tiers Tab */}
        <TabsContent value="tiers" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Membership Tiers</h2>
            <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetTierForm} data-testid="button-create-tier">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="dialog-tier">
                <DialogHeader>
                  <DialogTitle>{editingTier ? "Edit" : "Create"} Membership Tier</DialogTitle>
                  <DialogDescription>
                    Set up a subscription tier for your subscribers
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="tier-name">Tier Name</Label>
                    <Input
                      id="tier-name"
                      value={tierName}
                      onChange={(e) => setTierName(e.target.value)}
                      placeholder="e.g., Basic, Premium, VIP"
                      data-testid="input-tier-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tier-description">Description</Label>
                    <Textarea
                      id="tier-description"
                      value={tierDescription}
                      onChange={(e) => setTierDescription(e.target.value)}
                      placeholder="Describe what subscribers get..."
                      rows={3}
                      data-testid="input-tier-description"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tier-price">Monthly Price ($)</Label>
                    <Input
                      id="tier-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tierPrice}
                      onChange={(e) => setTierPrice(e.target.value)}
                      placeholder="9.99"
                      data-testid="input-tier-price"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Features</Label>
                      <Button size="sm" variant="outline" onClick={addFeatureField} data-testid="button-add-feature">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {tierFeatures.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder="Feature description"
                            data-testid={`input-feature-${index}`}
                          />
                          {tierFeatures.length > 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFeature(index)}
                              data-testid={`button-remove-feature-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowTierDialog(false);
                    resetTierForm();
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => editingTier ? updateTierMutation.mutate() : createTierMutation.mutate()}
                    disabled={!tierName || !tierPrice || createTierMutation.isPending || updateTierMutation.isPending}
                    data-testid="button-save-tier"
                  >
                    {editingTier ? "Update" : "Create"} Tier
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.id} data-testid={`card-tier-${tier.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{tier.name}</span>
                    <Badge variant="secondary">{tier.subscriberCount} subs</Badge>
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">${(tier.priceCents / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Crown className="w-3 h-3 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditTier(tier)} data-testid={`button-edit-tier-${tier.id}`}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTierMutation.mutate(tier.id)}
                    disabled={deleteTierMutation.isPending}
                    data-testid={`button-delete-tier-${tier.id}`}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {tiers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No membership tiers yet. Create your first tier to start earning from subscriptions!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Posts</h2>
            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetPostForm} data-testid="button-create-post">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="dialog-post">
                <DialogHeader>
                  <DialogTitle>{editingPost ? "Edit" : "Create"} Post</DialogTitle>
                  <DialogDescription>
                    Share content with your subscribers
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="post-type">Content Type</Label>
                    <Select value={postContentType} onValueChange={(value: any) => setPostContentType(value)}>
                      <SelectTrigger id="post-type" data-testid="select-post-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="post-content">Content ({postContentType === 'text' ? 'Text' : 'URL'})</Label>
                    <Textarea
                      id="post-content"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder={postContentType === 'text' ? 'Write your post...' : 'Enter URL...'}
                      rows={5}
                      data-testid="input-post-content"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="post-caption">Caption</Label>
                    <Textarea
                      id="post-caption"
                      value={postCaption}
                      onChange={(e) => setPostCaption(e.target.value)}
                      placeholder="Add a caption..."
                      rows={2}
                      data-testid="input-post-caption"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="post-public"
                      checked={postIsPublic}
                      onChange={(e) => setPostIsPublic(e.target.checked)}
                      className="h-4 w-4"
                      data-testid="checkbox-post-public"
                    />
                    <Label htmlFor="post-public">Make this post public (visible to non-subscribers)</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowPostDialog(false);
                    resetPostForm();
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => editingPost ? updatePostMutation.mutate() : createPostMutation.mutate()}
                    disabled={!postContent || !postCaption || createPostMutation.isPending || updatePostMutation.isPending}
                    data-testid="button-save-post"
                  >
                    {editingPost ? "Update" : "Publish"} Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={post.isPublic ? "secondary" : "default"}>
                      {post.isPublic ? "Public" : "Subscribers Only"}
                    </Badge>
                    <Badge variant="outline">{post.contentType}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{post.caption}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likeCount}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditPost(post)} data-testid={`button-edit-post-${post.id}`}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePostMutation.mutate(post.id)}
                    disabled={deletePostMutation.isPending}
                    data-testid={`button-delete-post-${post.id}`}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {posts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No posts yet. Create your first post to engage with your subscribers!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Tips Tab */}
        <TabsContent value="tips" className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Tips Received</h2>
          
          <div className="space-y-4">
            {tips.map((tip) => (
              <Card key={tip.id} data-testid={`card-tip-${tip.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        ${(tip.amountCents / 100).toFixed(2)}
                      </CardTitle>
                      <CardDescription>{new Date(tip.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {tip.message && (
                  <CardContent>
                    <p className="text-sm italic">"{tip.message}"</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          {tips.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tips received yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Custom Requests</h2>
          
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} data-testid={`card-request-${request.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">Custom Request</CardTitle>
                      <CardDescription>{new Date(request.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge>{request.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Budget: ${(request.budgetCents / 100).toFixed(2)}</p>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label>Send Quote</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Quote amount"
                          onBlur={(e) => {
                            if (e.target.value) {
                              const quotePriceCents = Math.round(parseFloat(e.target.value) * 100);
                              const quoteNotes = "Custom quote for your request";
                              updateRequestMutation.mutate({ requestId: request.id, quotePriceCents, quoteNotes });
                            }
                          }}
                          data-testid={`input-quote-${request.id}`}
                        />
                      </div>
                    </div>
                  )}
                  
                  {request.quotePriceCents && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium">Your Quote: ${(request.quotePriceCents / 100).toFixed(2)}</p>
                      {request.quoteNotes && (
                        <p className="text-sm text-muted-foreground mt-1">{request.quoteNotes}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {requests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No custom requests yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
