import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Star, MapPin, Calendar, Send, Sparkles, Crown, Zap, ShoppingBag } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCustomerAuth } from "@/lib/customer-auth";
import { AffiliateProductCard } from "@/components/affiliate-product-card";

interface StylistProfile {
  id: string;
  userId: string;
  handle: string;
  bio: string;
  specialties: string[];
  yearsExperience: number;
  hourlyRate: number;
  averageRating: string;
  totalReviews: number;
  location: string;
  avatar: string;
  portfolioImages: string[];
}

interface RetailerProduct {
  externalId: string;
  retailer: 'amazon' | 'ebay' | 'rakuten';
  title: string;
  brand?: string;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  imageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  shippingCost?: number;
  deliveryDays?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  creditsRemaining?: number;
  creditMessage?: string;
  isSubscribed?: boolean;
  productRecommendations?: RetailerProduct[];
}

interface CreditInfo {
  hasCredits: boolean;
  creditsRemaining: number;
  periodEnd: Date;
  isSubscribed: boolean;
  resetDate?: Date;
  requiresUpgrade: boolean;
}

export default function StylistProfile() {
  const [, params] = useRoute("/stylists/:handle");
  const handle = params?.handle || "";
  const { toast } = useToast();
  const { customer } = useCustomerAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  
  const userId = customer?.id || "guest-user";
  
  // Load stylist profile
  const { data: stylist, isLoading } = useQuery<StylistProfile>({
    queryKey: [`/api/v1/stylists/${handle}`],
  });
  
  // Load credit info
  const { data: credits, refetch: refetchCredits } = useQuery<CreditInfo>({
    queryKey: [`/api/v1/users/${userId}/stylists/${stylist?.id}/credits`],
    enabled: !!stylist?.id,
  });
  
  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('POST', `/api/v1/stylists/${handle}/chat`, { userId, message });
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content,
        timestamp: new Date(data.timestamp),
        creditsRemaining: data.creditsRemaining,
        creditMessage: data.creditMessage,
        isSubscribed: data.isSubscribed,
        productRecommendations: data.productRecommendations || []
      }]);
      refetchCredits();
    },
    onError: (error: any) => {
      if (error.message?.includes("No credits remaining") || error.status === 402) {
        setShowSubscribeDialog(true);
      } else {
        toast({
          title: "Chat Failed",
          description: error.message || "Failed to send message",
          variant: "destructive"
        });
      }
    }
  });
  
  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/v1/users/${userId}/stylists/${stylist?.id}/subscribe`);
    },
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "You now have unlimited messages with this stylist's AI.",
      });
      setShowSubscribeDialog(false);
      refetchCredits();
      queryClient.invalidateQueries({ queryKey: [`/api/v1/users/${userId}/ai-subscriptions`] });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe",
        variant: "destructive"
      });
    }
  });
  
  const handleSendMessage = async () => {
    if (!input.trim() || !stylist) return;
    
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    await chatMutation.mutateAsync(input);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (isLoading || !stylist) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading stylist profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/5" />
        <CardContent className="relative -mt-20 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={stylist.avatar} alt={stylist.handle} />
              <AvatarFallback className="text-3xl">
                {stylist.handle.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold" data-testid="text-stylist-name">@{stylist.handle}</h1>
                <Badge variant="default" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Available
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{stylist.averageRating}</span>
                  <span>({stylist.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{stylist.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{stylist.yearsExperience} years experience</span>
                </div>
              </div>
              
              <p className="text-base mb-4">{stylist.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {stylist.specialties.map((specialty, idx) => (
                  <Badge key={idx} variant="secondary">{specialty}</Badge>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button size="lg" data-testid="button-book-consultation">
                  Book Consultation
                  <span className="ml-2">${stylist.hourlyRate}/hr</span>
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('ai-chat-tab')?.click()} data-testid="button-chat-ai">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with AI
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Content Tabs */}
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" data-testid="tab-portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
          <TabsTrigger value="chat" id="ai-chat-tab" data-testid="tab-chat">AI Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stylist.portfolioImages.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={img}
                  alt={`Portfolio ${idx + 1}`}
                  className="w-full h-full object-cover hover-elevate"
                  data-testid={`img-portfolio-${idx}`}
                />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About {stylist.handle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-muted-foreground">{stylist.bio}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {stylist.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Credit Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Credits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {credits?.isSubscribed ? (
                  <div className="text-center py-4">
                    <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <p className="font-medium">Premium Member</p>
                    <p className="text-sm text-muted-foreground">Unlimited messages</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold" data-testid="text-credits-remaining">
                        {credits?.creditsRemaining || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">messages remaining</p>
                    </div>
                    
                    {credits && credits.creditsRemaining < 3 && (
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Running low! Upgrade to premium for unlimited messages at $9.99/month.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Button
                      className="w-full"
                      onClick={() => setShowSubscribeDialog(true)}
                      data-testid="button-upgrade"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Chat Interface */}
            <Card className="lg:col-span-2 flex flex-col" style={{ height: '600px' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Chat with {stylist.handle}'s AI
                </CardTitle>
                <CardDescription>
                  Get instant styling advice powered by their expertise
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Ask for styling advice, outfit ideas, or fashion tips!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6" data-testid="chat-messages">
                      {messages.map((msg, idx) => (
                        <div key={idx}>
                          <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={stylist.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                                <span>{msg.timestamp.toLocaleTimeString()}</span>
                                {msg.creditMessage && (
                                  <Badge variant="secondary" className="text-xs">
                                    {msg.creditsRemaining} left
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Product Recommendations */}
                          {msg.role === 'assistant' && msg.productRecommendations && msg.productRecommendations.length > 0 && (
                            <div className="ml-11 mt-3 space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <ShoppingBag className="w-4 h-4" />
                                <span>Recommended Products ({msg.productRecommendations.length})</span>
                              </div>
                              <div className="space-y-2">
                                {msg.productRecommendations.map((product) => (
                                  <AffiliateProductCard
                                    key={product.externalId}
                                    {...product}
                                    userId={userId}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {chatMutation.isPending && (
                        <div className="flex gap-3 justify-start">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={stylist.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary animate-pulse text-xs">
                              AI
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                <div className="flex gap-2 w-full">
                  <Input
                    placeholder="Ask for styling advice..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={chatMutation.isPending || (credits && !credits.hasCredits && !credits.isSubscribed)}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || chatMutation.isPending || (credits && !credits.hasCredits && !credits.isSubscribed)}
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent data-testid="dialog-subscribe">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Get unlimited AI styling messages for just $9.99/month
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Premium Access</p>
                    <p className="text-sm text-muted-foreground">Unlimited messages with {stylist.handle}'s AI</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$9.99</p>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Unlimited AI styling messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>24/7 instant responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Support independent stylists (80% goes to stylist)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <AlertDescription className="text-sm">
                💡 This subscription is for {stylist.handle}'s AI only. You can subscribe to multiple stylists.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)} data-testid="button-cancel-subscribe">
              Maybe Later
            </Button>
            <Button
              onClick={() => subscribeMutation.mutate()}
              disabled={subscribeMutation.isPending}
              data-testid="button-confirm-subscribe"
            >
              {subscribeMutation.isPending ? "Processing..." : "Subscribe Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
