import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Heart, DollarSign, Star, MapPin, Calendar, Lock, Eye, MessageSquare, Crown, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCustomerAuth } from "@/lib/customer-auth";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface StylistProfile {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  bio: string;
  styleSpecialties: string[];
  location: string;
  avatarUrl: string;
  coverImageUrl: string;
  totalFollowers: number;
  totalLikes: number;
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

interface CreatorSubscription {
  id: string;
  userId: string;
  stylistId: string;
  tierId: string;
  status: "active" | "cancelled" | "past_due" | "expired";
}

function SubscribeDialogContent({ tier, stylistId, onClose }: { tier: CreatorTier; stylistId: string; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) {
        throw new Error("Stripe not initialized");
      }
      
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Subscribed Successfully!",
        description: `You're now subscribed to ${tier.name}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/my-subscriptions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/creators/${stylistId}/posts`] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to complete payment",
        variant: "destructive",
      });
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{tier.name}</h3>
            <p className="text-sm text-muted-foreground">{tier.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${(tier.priceCents / 100).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">/month</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {(tier.perks as string[] || []).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4 text-primary" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <Alert>
          <AlertDescription className="text-xs">
            💡 80% of your subscription goes directly to support this creator
          </AlertDescription>
        </Alert>
      </div>
      
      <PaymentElement />
      
      <Button
        className="w-full"
        onClick={() => confirmPaymentMutation.mutate()}
        disabled={confirmPaymentMutation.isPending || !stripe || !elements}
        data-testid="button-complete-subscription"
      >
        {confirmPaymentMutation.isPending ? "Processing..." : `Subscribe for $${(tier.priceCents / 100).toFixed(2)}/mo`}
      </Button>
    </div>
  );
}

export default function CreatorProfile() {
  const [, params] = useRoute("/creator/:handle");
  const handle = params?.handle || "";
  const { toast } = useToast();
  const { customer } = useCustomerAuth();
  
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CreatorTier | null>(null);
  const [tipAmount, setTipAmount] = useState("5.00");
  const [tipMessage, setTipMessage] = useState("");
  const [customRequestDescription, setCustomRequestDescription] = useState("");
  const [customRequestBudget, setCustomRequestBudget] = useState("");
  
  const userId = customer?.id;
  
  // Load creator profile
  const { data: creator, isLoading } = useQuery<StylistProfile>({
    queryKey: [`/api/v1/stylists/${handle}`],
  });
  
  // Load subscription tiers
  const { data: tiers = [] } = useQuery<CreatorTier[]>({
    queryKey: [`/api/v1/creators/${creator?.id}/tiers`],
    enabled: !!creator?.id,
  });
  
  // Load posts
  const { data: posts = [] } = useQuery<CreatorPost[]>({
    queryKey: [`/api/v1/creators/${creator?.id}/posts`],
    enabled: !!creator?.id,
  });
  
  // Load user's subscription
  const { data: allSubscriptions = [] } = useQuery<CreatorSubscription[]>({
    queryKey: userId ? [`/api/v1/my-subscriptions`] : [],
    enabled: !!userId,
  });
  
  const subscription = allSubscriptions.find((s) => s.stylistId === creator?.id && s.status === 'active');
  
  // Tip mutation
  const tipMutation = useMutation({
    mutationFn: async () => {
      const amountCents = Math.round(parseFloat(tipAmount) * 100);
      return apiRequest('POST', `/api/v1/creators/${creator?.id}/tip`, {
        amountCents,
        message: tipMessage,
      });
    },
    onSuccess: () => {
      toast({
        title: "Tip Sent!",
        description: "Your support means everything to this creator",
      });
      setTipAmount("5.00");
      setTipMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Tip Failed",
        description: error.message || "Failed to send tip",
        variant: "destructive",
      });
    },
  });
  
  // Custom request mutation
  const requestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/v1/creators/${creator?.id}/request`, {
        description: customRequestDescription,
        budgetCents: Math.round(parseFloat(customRequestBudget) * 100),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "The creator will review and send you a quote",
      });
      setCustomRequestDescription("");
      setCustomRequestBudget("");
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });
  
  const handleSubscribe = (tier: CreatorTier) => {
    if (!userId) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }
    setSelectedTier(tier);
    setShowSubscribeDialog(true);
  };
  
  if (isLoading || !creator) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading creator profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isSubscribed = subscription?.status === 'active';
  const publicPosts = posts.filter((p: CreatorPost) => p.isPublic);
  const exclusivePosts = posts.filter((p: CreatorPost) => !p.isPublic);
  
  // Wrapper for Stripe Elements that provides clientSecret
  const SubscribeDialogWrapper = ({ tier, onClose }: { tier: CreatorTier; onClose: () => void }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const { toast } = useToast();
    
    // Fetch client secret when dialog opens
    const { isLoading: isLoadingIntent, error: intentError } = useQuery({
      queryKey: [`/api/v1/creators/${creator.id}/subscribe-intent`, tier.id],
      queryFn: async () => {
        const response = await apiRequest('POST', `/api/v1/creators/${creator.id}/subscribe`, { tierId: tier.id });
        setClientSecret(response.clientSecret);
        return response;
      },
      enabled: !!tier.id && !!creator.id,
      retry: false,
    });
    
    if (intentError) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Setup Failed</AlertTitle>
            <AlertDescription>
              {(intentError as any)?.message || "Failed to initialize payment. Please try again."}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-testid="button-close-error"
          >
            Close
          </Button>
        </div>
      );
    }
    
    if (isLoadingIntent || !clientSecret) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          Setting up payment...
        </div>
      );
    }
    
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <SubscribeDialogContent tier={tier} stylistId={creator.id} onClose={onClose} />
      </Elements>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-primary/5">
        {creator.coverImageUrl && (
          <img src={creator.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                <AvatarImage src={creator.avatarUrl} alt={creator.handle} />
                <AvatarFallback className="text-3xl">
                  {creator.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold" data-testid="text-creator-name">{creator.displayName}</h1>
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    Creator
                  </Badge>
                  {isSubscribed && (
                    <Badge variant="default" className="gap-1 bg-yellow-500 hover:bg-yellow-600">
                      <Crown className="w-3 h-3" />
                      Subscriber
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-2">@{creator.handle}</p>
                
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">{(creator.totalLikes || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground">likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    <span className="font-medium">{(creator.totalFollowers || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground">subscribers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{creator.location}</span>
                  </div>
                </div>
                
                <p className="text-base mb-4">{creator.bio}</p>
                
                <div className="flex flex-wrap gap-2">
                  {creator.styleSpecialties.map((specialty: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
            <TabsTrigger value="tiers" data-testid="tab-tiers">Membership</TabsTrigger>
            <TabsTrigger value="tip" data-testid="tab-tip">Tip</TabsTrigger>
            <TabsTrigger value="request" data-testid="tab-request">Custom Request</TabsTrigger>
          </TabsList>
          
          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6 space-y-6">
            {!isSubscribed && exclusivePosts.length > 0 && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Subscribe to unlock {exclusivePosts.length} exclusive posts
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicPosts.map((post: CreatorPost) => (
                <Card key={post.id} className="overflow-hidden" data-testid={`card-post-${post.id}`}>
                  {post.contentType === 'image' && post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="aspect-square bg-muted">
                      <img src={post.mediaUrls[0]} alt={post.title || 'Post image'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    {post.title && <h3 className="font-semibold mb-2" data-testid={`text-post-title-${post.id}`}>{post.title}</h3>}
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                </Card>
              ))}
              
              {isSubscribed && exclusivePosts.map((post: CreatorPost) => (
                <Card key={post.id} className="overflow-hidden border-primary/50" data-testid={`card-exclusive-post-${post.id}`}>
                  <div className="bg-primary/10 px-3 py-1 flex items-center gap-1 text-xs">
                    <Lock className="w-3 h-3" />
                    <span>Subscriber Only</span>
                  </div>
                  {post.contentType === 'image' && post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="aspect-square bg-muted">
                      <img src={post.mediaUrls[0]} alt={post.title || 'Exclusive post image'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    {post.title && <h3 className="font-semibold mb-2">{post.title}</h3>}
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                </Card>
              ))}
            </div>
            
            {posts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Membership Tiers Tab */}
          <TabsContent value="tiers" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier: CreatorTier) => (
                <Card key={tier.id} className={subscription?.tierId === tier.id ? "border-primary" : ""} data-testid={`card-tier-${tier.id}`}>
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${(tier.priceCents / 100).toFixed(2)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(tier.perks as string[] || []).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Crown className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      {tier.subscriberCount || 0} subscribers
                    </div>
                  </CardContent>
                  <CardFooter>
                    {subscription?.tierId === tier.id ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe(tier)}
                        data-testid={`button-subscribe-${tier.id}`}
                      >
                        Subscribe
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {tiers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No membership tiers available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Tip Tab */}
          <TabsContent value="tip" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Send a Tip
                  </CardTitle>
                  <CardDescription>
                    Show your appreciation and support {creator.displayName}'s work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tip Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(e.target.value)}
                        className="pl-10"
                        placeholder="5.00"
                        data-testid="input-tip-amount"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[5, 10, 20, 50].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setTipAmount(amount.toString())}
                          data-testid={`button-tip-${amount}`}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message (optional)</label>
                    <Textarea
                      value={tipMessage}
                      onChange={(e) => setTipMessage(e.target.value)}
                      placeholder="Leave a kind message..."
                      rows={3}
                      data-testid="input-tip-message"
                    />
                  </div>
                  
                  <Alert>
                    <AlertDescription className="text-xs">
                      💡 80% of your tip goes directly to {creator.displayName}
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => tipMutation.mutate()}
                    disabled={tipMutation.isPending || !tipAmount || parseFloat(tipAmount) < 1}
                    data-testid="button-send-tip"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {tipMutation.isPending ? "Processing..." : `Send $${parseFloat(tipAmount || "0").toFixed(2)} Tip`}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Custom Request Tab */}
          <TabsContent value="request" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Request Custom Work
                  </CardTitle>
                  <CardDescription>
                    Submit a custom request and {creator.displayName} will send you a quote
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={customRequestDescription}
                      onChange={(e) => setCustomRequestDescription(e.target.value)}
                      placeholder="Describe what you're looking for..."
                      rows={5}
                      data-testid="input-request-description"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Budget Range</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="10"
                        value={customRequestBudget}
                        onChange={(e) => setCustomRequestBudget(e.target.value)}
                        className="pl-10"
                        placeholder="100.00"
                        data-testid="input-request-budget"
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertDescription className="text-xs">
                      ℹ️ The creator will review your request and send a custom quote. You'll only pay if you accept.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => requestMutation.mutate()}
                    disabled={requestMutation.isPending || !customRequestDescription || !customRequestBudget}
                    data-testid="button-submit-request"
                  >
                    {requestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Subscribe Dialog with Stripe Elements */}
      {selectedTier && (
        <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
          <DialogContent data-testid="dialog-subscribe">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                Subscribe to {selectedTier.name}
              </DialogTitle>
              <DialogDescription>
                Support {creator.displayName} and unlock exclusive content
              </DialogDescription>
            </DialogHeader>
            
            <SubscribeDialogWrapper tier={selectedTier} onClose={() => setShowSubscribeDialog(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
