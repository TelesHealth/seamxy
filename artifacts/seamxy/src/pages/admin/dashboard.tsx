import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ShoppingBag, Scissors, DollarSign, Settings, Sparkles, Eye, FileText, Heart, Edit, Plus } from "lucide-react";
import { useQuery, useMutation, QueryFunction } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { adminFetch, adminApiRequest, setAdminAuth, isAdminAuthenticated } from "@/lib/adminAuth";

interface CreatorStats {
  subscribers: number;
  totalRevenue: number;
  posts: number;
  totalViews: number;
}

interface CreatorData {
  id: string;
  email: string;
  businessName: string | null;
  ownerName: string | null;
  tier: string;
  isActive: boolean;
  isVerified: boolean;
  stylistProfile: {
    id: string;
    handle: string;
    tier: string;
  } | null;
  stats: CreatorStats;
}

interface CreatorsResponse {
  creators: CreatorData[];
}

// Custom query function for admin API calls
const adminQueryFn: QueryFunction<any> = async ({ queryKey }) => {
  const res = await adminFetch(queryKey.join("/") as string);
  
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return await res.json();
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedMaker, setSelectedMaker] = useState<any>(null);
  const [selectedAffiliateRate, setSelectedAffiliateRate] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Maker drill-down states
  const [showMakerOrders, setShowMakerOrders] = useState(false);
  const [showMakerRatings, setShowMakerRatings] = useState(false);
  const [showMakerBusinessInfo, setShowMakerBusinessInfo] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Subscription plan drill-down states
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [showPlanSubscribers, setShowPlanSubscribers] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  
  // Helper functions to close dialogs and reset sub-dialog states
  const closeMakerDialog = () => {
    setSelectedMaker(null);
    setShowMakerOrders(false);
    setShowMakerRatings(false);
    setShowMakerBusinessInfo(false);
    setSelectedOrder(null); // Clear tertiary dialog state
  };
  
  const closePlanDialog = () => {
    setSelectedPlan(null);
    setShowEditPlan(false);
    setShowPlanSubscribers(false);
    setSelectedSubscriber(null); // Clear tertiary dialog state
  };

  // Auto-login for development (in production, would redirect to login page)
  useEffect(() => {
    async function ensureAdminAuth() {
      if (!isAdminAuthenticated()) {
        try {
          // Auto-login with seeded admin account for development
          const response = await fetch('/api/v1/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'admin@example.com',
              password: 'password123'
            })
          });

          if (response.ok) {
            const adminData = await response.json();
            setAdminAuth(adminData);
            setIsAuthReady(true);
          } else {
            console.error('Admin auto-login failed');
            setIsAuthReady(true); // Still set to true to show error state
          }
        } catch (error) {
          console.error('Admin auth error:', error);
          setIsAuthReady(true);
        }
      } else {
        setIsAuthReady(true);
      }
    }

    ensureAdminAuth();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Users", value: "2,543", icon: <Users className="w-5 h-5" />, trend: "+12%", tab: "users" },
    { label: "Active Makers", value: "127", icon: <Scissors className="w-5 h-5" />, trend: "+8%", tab: "makers" },
    { label: "Orders (30d)", value: "1,891", icon: <ShoppingBag className="w-5 h-5" />, trend: "+23%", tab: "transactions" },
    { label: "Revenue (30d)", value: "$47,892", icon: <DollarSign className="w-5 h-5" />, trend: "+18%", tab: "monetization" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-700">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">PerfectFit Platform Management</p>
            </div>
            <Badge variant="outline">Super Admin</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, i) => (
            <Card 
              key={i} 
              className="cursor-pointer hover-elevate active-elevate-2"
              onClick={() => setActiveTab(kpi.tab)}
              data-testid={`card-kpi-${kpi.tab}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {kpi.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {kpi.trend}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                <p className="font-display text-3xl font-700" data-testid={`text-kpi-${i}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="makers" data-testid="tab-makers">Makers</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
            <TabsTrigger value="monetization" data-testid="tab-monetization">Monetization</TabsTrigger>
            <TabsTrigger value="creators" data-testid="tab-creators">Creators</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement isAuthReady={isAuthReady} />
          </TabsContent>

          <TabsContent value="makers">
            <MakersManagement isAuthReady={isAuthReady} />
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Monitor</CardTitle>
                <CardDescription>Track all platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: "TX001", type: "Retail", amount: "$128.00", commission: "$6.40", user: "John S.", email: "john@example.com", date: "Today", status: "Completed", paymentMethod: "Visa ****1234" },
                    { id: "TX002", type: "Bespoke", amount: "$890.00", commission: "$89.00", user: "Sarah J.", email: "sarah@example.com", date: "Today", status: "Completed", paymentMethod: "Mastercard ****5678" },
                    { id: "TX003", type: "Retail", amount: "$49.00", commission: "$2.45", user: "Mike C.", email: "mike@example.com", date: "Yesterday", status: "Completed", paymentMethod: "Amex ****9012" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-600">{tx.user} - {tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-600">{tx.amount}</p>
                        <p className="text-xs text-muted-foreground">Commission: {tx.commission}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedTransaction(tx)}
                        data-testid={`button-transaction-details-${i}`}
                      >
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monetization">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Affiliate Rates</CardTitle>
                  <CardDescription>Commission rates for retail partners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "default", partner: "Default Rate", rate: "5%", description: "Standard commission for all retailers" },
                    { id: "premium", partner: "Premium Partners", rate: "7%", description: "Higher rate for premium retail partners" },
                    { id: "luxury", partner: "Luxury Brands", rate: "4%", description: "Specialized rate for luxury brand partnerships" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-500">{item.partner}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-600">{item.rate}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedAffiliateRate(item)}
                          data-testid={`button-affiliate-settings-${i}`}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Maker and user subscription tiers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "basic", plan: "Maker Basic", price: "$0/mo", active: 47, features: ["Basic listing", "Up to 10 products", "Email support"] },
                    { id: "pro", plan: "Maker Pro", price: "$29/mo", active: 53, features: ["Unlimited listings", "Priority support", "Analytics dashboard"] },
                    { id: "elite", plan: "Maker Elite", price: "$99/mo", active: 27, features: ["All Pro features", "Premium placement", "Dedicated account manager"] },
                    { id: "ai-pro", plan: "AI Stylist Pro", price: "$9.99/mo", active: 312, features: ["Access to AI stylists", "Personalized recommendations", "Style consultations"] },
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover-elevate"
                      onClick={() => setSelectedPlan(item)}
                      data-testid={`card-subscription-plan-${i}`}
                    >
                      <div>
                        <p className="font-500">{item.plan}</p>
                        <p className="text-sm text-muted-foreground">{item.active} active</p>
                      </div>
                      <div className="text-right">
                        <p className="font-600">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="creators">
            <CreatorsManagement isAuthReady={isAuthReady} />
          </TabsContent>
        </Tabs>

        {/* Transaction Details Dialog */}
        {selectedTransaction && (
          <Dialog open={true} onOpenChange={() => setSelectedTransaction(null)}>
            <DialogContent data-testid="dialog-transaction-details">
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDescription>Full transaction information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-600">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge>{selectedTransaction.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-600">{selectedTransaction.user}</p>
                    <p className="text-xs text-muted-foreground">{selectedTransaction.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-600">{selectedTransaction.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-600 text-lg">{selectedTransaction.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="font-600 text-lg text-primary">{selectedTransaction.commission}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="secondary">{selectedTransaction.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-600">{selectedTransaction.paymentMethod}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Maker Details Dialog */}
        {selectedMaker && (
          <Dialog open={true} onOpenChange={() => closeMakerDialog()}>
            <DialogContent data-testid="dialog-maker-details">
              <DialogHeader>
                <DialogTitle>{selectedMaker.name}</DialogTitle>
                <DialogDescription>Maker account details and management</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="p-3 rounded-lg hover-elevate cursor-pointer border"
                    onClick={() => setShowMakerBusinessInfo(true)}
                    data-testid="section-business-name"
                  >
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-600">{selectedMaker.name}</p>
                    <p className="text-xs text-primary mt-1">Click for contact details →</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={selectedMaker.pending ? "outline" : "secondary"}>{selectedMaker.status}</Badge>
                  </div>
                  <div 
                    className="p-3 rounded-lg hover-elevate cursor-pointer border"
                    onClick={() => setShowMakerBusinessInfo(true)}
                    data-testid="section-location"
                  >
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-600">{selectedMaker.location}</p>
                    <p className="text-xs text-primary mt-1">Click for full address →</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-600 text-sm">{selectedMaker.email}</p>
                  </div>
                  <div 
                    className="p-3 rounded-lg hover-elevate cursor-pointer border"
                    onClick={() => setShowMakerRatings(true)}
                    data-testid="section-rating"
                  >
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-600">{selectedMaker.rating}</p>
                    <p className="text-xs text-primary mt-1">Click for reviews →</p>
                  </div>
                  <div 
                    className="p-3 rounded-lg hover-elevate cursor-pointer border"
                    onClick={() => setShowMakerOrders(true)}
                    data-testid="section-total-orders"
                  >
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="font-600">{selectedMaker.totalOrders}</p>
                    <p className="text-xs text-primary mt-1">Click for order details →</p>
                  </div>
                </div>
                {selectedMaker.pending && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="default" className="flex-1">Approve Maker</Button>
                    <Button variant="outline" className="flex-1">Reject</Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => closeMakerDialog()}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Affiliate Rate Settings Dialog */}
        {selectedAffiliateRate && (
          <Dialog open={true} onOpenChange={() => setSelectedAffiliateRate(null)}>
            <DialogContent data-testid="dialog-affiliate-settings">
              <DialogHeader>
                <DialogTitle>Edit Affiliate Rate</DialogTitle>
                <DialogDescription>Configure commission rate for {selectedAffiliateRate.partner}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{selectedAffiliateRate.description}</p>
                </div>
                <div>
                  <label className="text-sm font-500 mb-2 block">Commission Rate (%)</label>
                  <Input 
                    type="number" 
                    defaultValue={selectedAffiliateRate.rate.replace('%', '')}
                    placeholder="Enter rate"
                    data-testid="input-affiliate-rate"
                  />
                </div>
                <div>
                  <label className="text-sm font-500 mb-2 block">Description</label>
                  <Input 
                    defaultValue={selectedAffiliateRate.description}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAffiliateRate(null)}>Cancel</Button>
                <Button data-testid="button-save-affiliate-rate">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Subscription Plan Details Dialog */}
        {selectedPlan && (
          <Dialog open={true} onOpenChange={() => closePlanDialog()}>
            <DialogContent data-testid="dialog-plan-details">
              <DialogHeader>
                <DialogTitle>{selectedPlan.plan}</DialogTitle>
                <DialogDescription>Subscription plan details and management</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-600 text-2xl">{selectedPlan.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Subscribers</p>
                    <p className="font-600 text-2xl">{selectedPlan.active}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-500 mb-2">Features</p>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowEditPlan(true)}
                    data-testid="button-edit-plan"
                  >
                    Edit Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPlanSubscribers(true)}
                    data-testid="button-view-subscribers"
                  >
                    View Subscribers
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => closePlanDialog()}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Maker Orders Sub-Dialog */}
        {showMakerOrders && selectedMaker && (
          <Dialog open={true} onOpenChange={() => setShowMakerOrders(false)}>
            <DialogContent className="max-w-3xl" data-testid="dialog-maker-orders">
              <DialogHeader>
                <DialogTitle>Order History - {selectedMaker.name}</DialogTitle>
                <DialogDescription>All orders placed with this maker</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                  {[
                    { orderId: "#ORD-1234", customer: "Sarah Johnson", item: "Custom Navy Suit", date: "Dec 15, 2024", amount: "$890", status: "Delivered" },
                    { orderId: "#ORD-1189", customer: "Michael Chen", item: "Tailored Shirt", date: "Dec 12, 2024", amount: "$165", status: "In Progress" },
                    { orderId: "#ORD-1156", customer: "Emma Davis", item: "Business Dress", date: "Dec 8, 2024", amount: "$445", status: "Delivered" },
                    { orderId: "#ORD-1098", customer: "Robert Smith", item: "Tuxedo Rental", date: "Nov 28, 2024", amount: "$320", status: "Completed" },
                    { orderId: "#ORD-1034", customer: "Lisa Williams", item: "Custom Blazer", date: "Nov 22, 2024", amount: "$580", status: "Delivered" },
                  ].map((order, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover-elevate">
                      <div className="flex-1">
                        <p className="font-600">{order.orderId} - {order.item}</p>
                        <p className="text-sm text-muted-foreground">{order.customer} • {order.date}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-600">{order.amount}</p>
                        <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        data-testid={`button-view-order-${i}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMakerOrders(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Maker Ratings Sub-Dialog */}
        {showMakerRatings && selectedMaker && (
          <Dialog open={true} onOpenChange={() => setShowMakerRatings(false)}>
            <DialogContent className="max-w-2xl" data-testid="dialog-maker-ratings">
              <DialogHeader>
                <DialogTitle>Ratings & Reviews - {selectedMaker.name}</DialogTitle>
                <DialogDescription>Customer feedback and ratings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-3xl font-700">{selectedMaker.rating}</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-700">142</p>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-700">98%</p>
                    <p className="text-sm text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
                <div className="max-h-[40vh] overflow-y-auto space-y-3">
                  {[
                    { reviewer: "Sarah J.", rating: 5, comment: "Excellent craftsmanship! The suit fits perfectly.", date: "2 days ago" },
                    { reviewer: "Michael C.", rating: 5, comment: "Great attention to detail. Very professional service.", date: "1 week ago" },
                    { reviewer: "Emma D.", rating: 4, comment: "Beautiful work, slight delay but worth the wait.", date: "2 weeks ago" },
                    { reviewer: "Robert S.", rating: 5, comment: "Best tailor in the area. Highly recommended!", date: "3 weeks ago" },
                  ].map((review, i) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-600">{review.reviewer}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(review.rating)].map((_, j) => (
                              <span key={j} className="text-yellow-500">★</span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMakerRatings(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Maker Business Info Sub-Dialog */}
        {showMakerBusinessInfo && selectedMaker && (
          <Dialog open={true} onOpenChange={() => setShowMakerBusinessInfo(false)}>
            <DialogContent data-testid="dialog-maker-business-info">
              <DialogHeader>
                <DialogTitle>Business Information - {selectedMaker.name}</DialogTitle>
                <DialogDescription>Complete contact and business details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-600">{selectedMaker.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Business Type</p>
                    <p className="font-600">Custom Tailoring</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Address</p>
                    <p className="font-600">123 Savile Row</p>
                    <p className="text-sm">{selectedMaker.location}</p>
                    <p className="text-sm">W1S 3PJ</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Phone</p>
                    <p className="font-600">+44 20 7234 5678</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-600 text-sm">{selectedMaker.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p className="font-600 text-sm text-primary">www.savilemodern.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Business Hours</p>
                    <p className="text-sm">Mon-Fri: 9am - 6pm</p>
                    <p className="text-sm">Sat: 10am - 4pm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-600">March 2023</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Verification Documents</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Business License ✓</Badge>
                    <Badge variant="secondary">Tax ID ✓</Badge>
                    <Badge variant="secondary">Insurance ✓</Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMakerBusinessInfo(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Plan Sub-Dialog */}
        {showEditPlan && selectedPlan && (
          <Dialog open={true} onOpenChange={() => setShowEditPlan(false)}>
            <DialogContent data-testid="dialog-edit-plan">
              <DialogHeader>
                <DialogTitle>Edit Subscription Plan</DialogTitle>
                <DialogDescription>Modify plan pricing and features for {selectedPlan.plan}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-500 mb-2 block">Plan Name</label>
                  <Input defaultValue={selectedPlan.plan} data-testid="input-plan-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-500 mb-2 block">Monthly Price ($)</label>
                    <Input 
                      type="number" 
                      defaultValue={selectedPlan.price.replace(/[^0-9.]/g, '')}
                      data-testid="input-plan-price"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-500 mb-2 block">Billing Cycle</label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-500 mb-2 block">Features (one per line)</label>
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border p-2 text-sm"
                    defaultValue={selectedPlan.features.join('\n')}
                    data-testid="input-plan-features"
                  />
                </div>
                <div>
                  <label className="text-sm font-500 mb-2 block">Status</label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditPlan(false)}>Cancel</Button>
                <Button data-testid="button-save-plan">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* View Subscribers Sub-Dialog */}
        {showPlanSubscribers && selectedPlan && (
          <Dialog open={true} onOpenChange={() => setShowPlanSubscribers(false)}>
            <DialogContent className="max-w-3xl" data-testid="dialog-plan-subscribers">
              <DialogHeader>
                <DialogTitle>Subscribers - {selectedPlan.plan}</DialogTitle>
                <DialogDescription>{selectedPlan.active} active subscribers</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                  {[
                    { name: "Urban Stitch Co.", email: "urban@stitch.com", joined: "Dec 1, 2024", status: "Active", nextBilling: "Jan 1, 2025" },
                    { name: "Modern Threads", email: "modern@threads.com", joined: "Nov 28, 2024", status: "Active", nextBilling: "Dec 28, 2024" },
                    { name: "Artisan Apparel", email: "artisan@apparel.com", joined: "Nov 15, 2024", status: "Active", nextBilling: "Dec 15, 2024" },
                    { name: "Elite Tailoring", email: "elite@tailoring.com", joined: "Nov 10, 2024", status: "Expiring Soon", nextBilling: "Dec 10, 2024" },
                    { name: "Fashion Forward", email: "fashion@forward.com", joined: "Nov 5, 2024", status: "Active", nextBilling: "Dec 5, 2024" },
                  ].map((subscriber, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover-elevate">
                      <div className="flex-1">
                        <p className="font-600">{subscriber.name}</p>
                        <p className="text-sm text-muted-foreground">{subscriber.email} • Joined {subscriber.joined}</p>
                      </div>
                      <div className="text-right mr-4">
                        <Badge variant={subscriber.status === "Expiring Soon" ? "outline" : "secondary"}>
                          {subscriber.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Next: {subscriber.nextBilling}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedSubscriber(subscriber)}
                        data-testid={`button-manage-subscriber-${i}`}
                      >
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPlanSubscribers(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={true} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-2xl" data-testid="dialog-order-details">
              <DialogHeader>
                <DialogTitle>Order Details - {selectedOrder.orderId}</DialogTitle>
                <DialogDescription>Complete order information and status</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-600">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="secondary">{selectedOrder.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-600">{selectedOrder.customer}</p>
                    <p className="text-sm">sarah.j@email.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-600">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Item</p>
                    <p className="font-600">{selectedOrder.item}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-600 text-lg">{selectedOrder.amount}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-600">{selectedOrder.customer}</p>
                    <p className="text-sm">123 Main Street, Apt 4B</p>
                    <p className="text-sm">New York, NY 10001</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Payment Information</p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">Method: Credit Card (**** 4242)</p>
                    <p className="text-sm">Transaction ID: TXN-20241215-8934</p>
                    <p className="text-sm">Paid: {selectedOrder.amount}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Order Timeline</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="text-sm font-500">Order Placed</p>
                        <p className="text-xs text-muted-foreground">{selectedOrder.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="text-sm font-500">Payment Confirmed</p>
                        <p className="text-xs text-muted-foreground">{selectedOrder.date}</p>
                      </div>
                    </div>
                    {selectedOrder.status !== "In Progress" && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <p className="text-sm font-500">Processing Complete</p>
                            <p className="text-xs text-muted-foreground">Dec 16, 2024</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <p className="text-sm font-500">{selectedOrder.status}</p>
                            <p className="text-xs text-muted-foreground">Dec 17, 2024</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                <Button variant="default">Contact Customer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Subscriber Management Dialog */}
        {selectedSubscriber && (
          <Dialog open={true} onOpenChange={() => setSelectedSubscriber(null)}>
            <DialogContent data-testid="dialog-subscriber-management">
              <DialogHeader>
                <DialogTitle>Manage Subscriber - {selectedSubscriber.name}</DialogTitle>
                <DialogDescription>Subscription management and billing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-600">{selectedSubscriber.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={selectedSubscriber.status === "Expiring Soon" ? "outline" : "secondary"}>
                      {selectedSubscriber.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-600 text-sm">{selectedSubscriber.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-600">{selectedSubscriber.joined}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="font-600">{selectedPlan?.plan || "Maker Basic"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing</p>
                    <p className="font-600">{selectedSubscriber.nextBilling}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">Credit Card ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Subscription Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" data-testid="button-change-plan">
                      Change Plan
                    </Button>
                    <Button variant="outline" data-testid="button-pause-subscription">
                      Pause Subscription
                    </Button>
                    <Button variant="outline" data-testid="button-update-billing">
                      Update Billing
                    </Button>
                    <Button variant="outline" data-testid="button-cancel-subscription">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Billing History</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {[
                      { date: "Dec 1, 2024", amount: "$0/mo", status: "Paid" },
                      { date: "Nov 1, 2024", amount: "$0/mo", status: "Paid" },
                      { date: "Oct 1, 2024", amount: "$0/mo", status: "Paid" },
                    ].map((bill, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                        <span>{bill.date}</span>
                        <span>{bill.amount}</span>
                        <Badge variant="secondary" className="text-xs">{bill.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSubscriber(null)}>Close</Button>
                <Button variant="default">Send Message</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// User creation schema - for creating new users
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  demographic: z.enum(["men", "women", "young_adults", "children"]),
  age: z.coerce.number().int().positive().optional().or(z.literal('')),
  lifestyle: z.string().optional(),
  budgetMin: z.coerce.number().int().min(0).optional().or(z.literal('')),
  budgetMax: z.coerce.number().int().min(0).optional().or(z.literal('')),
  budgetTier: z.enum(["affordable", "mid_range", "premium", "luxury"]).optional(),
});

// User editing schema - matches backend adminUpdateUserSchema
const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  demographic: z.enum(["men", "women", "young_adults", "children"]),
  age: z.number().int().positive().optional(),
  lifestyle: z.string().optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  budgetTier: z.enum(["affordable", "mid_range", "premium", "luxury"]).optional(),
  preferredBrands: z.array(z.string()).optional(),
});

interface User {
  id: string;
  email: string;
  name: string;
  demographic: string;
  age: number | null;
  lifestyle: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetTier: string | null;
  preferredBrands: string[] | null;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

function UserManagement({ isAuthReady }: { isAuthReady: boolean }) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['/api/v1/admin/users'],
    queryFn: adminQueryFn,
    enabled: isAuthReady,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading users: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage platform users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {isLoading ? '...' : data?.total || 0} Users
              </Badge>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                data-testid="button-create-user"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : !data?.users || data.users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.users.map((user, i) => (
                <div 
                  key={user.id} 
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`user-item-${i}`}
                >
                  <div className="flex-1">
                    <p className="font-600" data-testid={`text-user-name-${i}`}>{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{user.demographic}</Badge>
                      {user.budgetTier && (
                        <Badge variant="secondary" className="text-xs">{user.budgetTier}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      data-testid={`button-edit-user-${i}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
        />
      )}

      {showCreateDialog && (
        <CreateUserDialog 
          onClose={() => setShowCreateDialog(false)}
          onSuccess={(credentials) => {
            setShowCreateDialog(false);
            setCreatedCredentials(credentials);
          }}
        />
      )}

      {createdCredentials && (
        <CredentialsDisplayDialog 
          credentials={createdCredentials}
          onClose={() => setCreatedCredentials(null)}
        />
      )}
    </>
  );
}

interface EditUserDialogProps {
  user: User;
  onClose: () => void;
}

function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      demographic: user.demographic as any,
      age: user.age || undefined,
      lifestyle: user.lifestyle || undefined,
      budgetMin: user.budgetMin || undefined,
      budgetMax: user.budgetMax || undefined,
      budgetTier: user.budgetTier as any || undefined,
      preferredBrands: user.preferredBrands || undefined,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof editUserSchema>) => {
      return adminApiRequest('PATCH', `/api/v1/admin/users/${user.id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/users'] });
      toast({
        title: "User updated",
        description: "User has been successfully updated.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof editUserSchema>) => {
    updateMutation.mutate(values);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-edit-user">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Changes will be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-edit-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} data-testid="input-edit-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demographic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demographic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-demographic">
                        <SelectValue placeholder="Select demographic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="young_adults">Young Adults</SelectItem>
                      <SelectItem value="children">Children</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <FormLabel>Budget Min ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                        data-testid="input-edit-budget-min"
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
                    <FormLabel>Budget Max ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                        data-testid="input-edit-budget-max"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="budgetTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Tier (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-budget-tier">
                        <SelectValue placeholder="Select budget tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="affordable">Affordable</SelectItem>
                      <SelectItem value="mid_range">Mid Range</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lifestyle (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} data-testid="input-edit-lifestyle" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredBrands"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Brands (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const brands = e.target.value
                          .split(',')
                          .map(b => b.trim())
                          .filter(b => b.length > 0);
                        field.onChange(brands.length > 0 ? brands : undefined);
                      }}
                      placeholder="e.g. Nike, Adidas, Zara"
                      data-testid="input-edit-preferred-brands"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Enter comma-separated brand names</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface CreateUserDialogProps {
  onClose: () => void;
  onSuccess: (credentials: { email: string; password: string }) => void;
}

function CreateUserDialog({ onClose, onSuccess }: CreateUserDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      demographic: 'men',
      age: '' as any,
      lifestyle: '',
      budgetMin: '' as any,
      budgetMax: '' as any,
      budgetTier: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createUserSchema>) => {
      const response = await adminApiRequest('POST', '/api/v1/admin/users', values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/users'] });
      toast({
        title: "User created successfully",
        description: `Account created for ${data.credentials.email}`,
      });
      onSuccess(data.credentials);
    },
    onError: (error: Error) => {
      const isEmailConflict = error.message.includes("Email already in use");
      toast({
        title: isEmailConflict ? "Email already exists" : "Failed to create user",
        description: isEmailConflict 
          ? "This email is already registered. Please use a different email address."
          : error.message,
        variant: "destructive",
      });
      
      // Set form error for email field if it's a duplicate email error
      if (isEmailConflict) {
        form.setError("email", {
          type: "manual",
          message: "This email is already registered"
        });
      }
    },
  });

  const onSubmit = (values: z.infer<typeof createUserSchema>) => {
    createMutation.mutate(values);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-create-user">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account. The credentials will be displayed after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-create-name" placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-create-email" placeholder="user@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} data-testid="input-create-password" placeholder="Minimum 8 characters" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demographic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demographic *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-create-demographic">
                        <SelectValue placeholder="Select demographic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="young_adults">Young Adults</SelectItem>
                      <SelectItem value="children">Children</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        data-testid="input-create-age"
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Tier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-budget-tier">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="affordable">Affordable</SelectItem>
                        <SelectItem value="mid_range">Mid Range</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Min ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        data-testid="input-create-budget-min"
                        placeholder="Optional"
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
                    <FormLabel>Budget Max ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        data-testid="input-create-budget-max"
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lifestyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lifestyle</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-create-lifestyle" placeholder="e.g., Business professional, casual, athletic" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create-user">
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface CredentialsDisplayDialogProps {
  credentials: { email: string; password: string };
  onClose: () => void;
}

function CredentialsDisplayDialog({ credentials, onClose }: CredentialsDisplayDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-credentials-display">
        <DialogHeader>
          <DialogTitle>User Account Created</DialogTitle>
          <DialogDescription>
            Save these credentials. They will not be shown again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-600 text-lg" data-testid="text-created-email">{credentials.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Password</p>
              <p className="font-600 text-lg font-mono" data-testid="text-created-password">{credentials.password}</p>
            </div>
          </div>

          <Button 
            onClick={copyToClipboard} 
            variant="outline" 
            className="w-full"
            data-testid="button-copy-credentials"
          >
            {copied ? "Copied!" : "Copy Credentials"}
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={onClose} data-testid="button-close-credentials">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Maker creation schema
const createMakerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  description: z.string().optional(),
  specialties: z.string().optional(), // Comma-separated
  budgetMin: z.coerce.number().int().min(0),
  budgetMax: z.coerce.number().int().min(0),
  location: z.string().min(1, "Location is required"),
  subscriptionTier: z.enum(["basic", "pro", "elite"]).default("basic"),
  isVerified: z.boolean().default(false),
});

interface Maker {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  subscriptionTier: string;
  isVerified: boolean;
  rating: string;
  totalReviews: number;
}

interface MakersResponse {
  makers: Maker[];
}

function MakersManagement({ isAuthReady }: { isAuthReady: boolean }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['/api/v1/makers'],
    enabled: isAuthReady,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maker Management</CardTitle>
          <CardDescription>Manage custom maker accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading makers: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Maker Management</CardTitle>
              <CardDescription>Create and manage custom maker accounts</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-maker">
              <Plus className="w-4 h-4 mr-2" />
              Create Maker
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-500">No makers found</p>
              <p className="text-sm">Create your first maker account to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((maker: Maker, i: number) => (
                <div key={maker.id} className="flex items-center justify-between p-4 rounded-lg border" data-testid={`maker-item-${i}`}>
                  <div className="flex-1">
                    <p className="font-600" data-testid={`text-maker-name-${i}`}>{maker.businessName}</p>
                    <p className="text-sm text-muted-foreground">{maker.location} • {maker.ownerName}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{maker.subscriptionTier}</Badge>
                      {maker.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        ${maker.budgetMin}-${maker.budgetMax}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateDialog && (
        <CreateMakerDialog 
          onClose={() => setShowCreateDialog(false)}
          onSuccess={(credentials) => {
            setShowCreateDialog(false);
            setCreatedCredentials(credentials);
          }}
        />
      )}

      {createdCredentials && (
        <CredentialsDisplayDialog 
          credentials={createdCredentials}
          onClose={() => setCreatedCredentials(null)}
        />
      )}
    </>
  );
}

interface CreateMakerDialogProps {
  onClose: () => void;
  onSuccess: (credentials: { email: string; password: string }) => void;
}

function CreateMakerDialog({ onClose, onSuccess }: CreateMakerDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createMakerSchema>>({
    resolver: zodResolver(createMakerSchema),
    defaultValues: {
      email: '',
      password: '',
      businessName: '',
      ownerName: '',
      description: '',
      specialties: '',
      budgetMin: 100,
      budgetMax: 5000,
      location: '',
      subscriptionTier: 'basic',
      isVerified: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createMakerSchema>) => {
      // Convert specialties string to array
      const payload = {
        ...values,
        specialties: values.specialties ? values.specialties.split(',').map(s => s.trim()) : [],
      };
      const response = await adminApiRequest('POST', '/api/v1/admin/makers', payload);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create maker');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/makers'] });
      toast({
        title: "Maker created successfully",
        description: `Account created for ${data.credentials.email}`,
      });
      onSuccess(data.credentials);
    },
    onError: (error: Error) => {
      const isEmailConflict = error.message.includes("Email already in use");
      toast({
        title: isEmailConflict ? "Email already exists" : "Failed to create maker",
        description: isEmailConflict 
          ? "This email is already registered. Please use a different email address."
          : error.message,
        variant: "destructive",
      });
      
      if (isEmailConflict) {
        form.setError("email", {
          type: "manual",
          message: "This email is already registered"
        });
      }
    },
  });

  const onSubmit = (values: z.infer<typeof createMakerSchema>) => {
    createMutation.mutate(values);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-maker">
        <DialogHeader>
          <DialogTitle>Create New Maker</DialogTitle>
          <DialogDescription>
            Create a new maker account for custom tailoring services.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-create-maker-business-name" placeholder="Elite Tailors" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-create-maker-owner-name" placeholder="John Smith" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-create-maker-email" placeholder="contact@elitetailors.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} data-testid="input-create-maker-password" placeholder="Minimum 8 characters" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-create-maker-location" placeholder="London, UK" />
                  </FormControl>
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
                    <Input {...field} data-testid="input-create-maker-description" placeholder="Luxury bespoke tailoring..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialties (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-create-maker-specialties" placeholder="Suits, Dresses, Alterations" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Min ($) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        data-testid="input-create-maker-budget-min"
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
                    <FormLabel>Budget Max ($) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        data-testid="input-create-maker-budget-max"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscriptionTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-maker-tier">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Verified Maker</FormLabel>
                    <FormDescription>
                      Mark this maker as verified from creation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      data-testid="checkbox-create-maker-verified"
                      className="h-4 w-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create-maker">
                {createMutation.isPending ? "Creating..." : "Create Maker"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CreatorsManagement({ isAuthReady }: { isAuthReady: boolean }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const { data, isLoading, error } = useQuery<CreatorsResponse>({
    queryKey: ['/api/v1/admin/creators'],
    queryFn: adminQueryFn,
    enabled: isAuthReady,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Management</CardTitle>
          <CardDescription>Manage Creator Studio accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading creators: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Creator Management</CardTitle>
              <CardDescription>Create and manage Creator Studio accounts</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-creator">
              <Plus className="w-4 h-4 mr-2" />
              Create Creator
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
        ) : !data?.creators || data.creators.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-500">No creators found</p>
            <p className="text-sm">Designers with AI Stylist profiles will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.creators.map((creator: any, i: number) => (
              <div 
                key={creator.id} 
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border hover-elevate"
                data-testid={`creator-item-${i}`}
              >
                {/* Creator Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-600" data-testid={`text-creator-name-${i}`}>
                      {creator.stylistProfile?.displayName || creator.name || 'Unnamed Creator'}
                    </p>
                    {creator.isVerified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                    {!creator.isActive && (
                      <Badge variant="outline" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{creator.email}</p>
                  
                  {creator.stylistProfile && (
                    <p className="text-xs text-muted-foreground">
                      @{creator.stylistProfile.handle}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Subscribers</p>
                    </div>
                    <p className="font-600" data-testid={`text-subscribers-${i}`}>
                      {creator.stats.subscribers}
                    </p>
                  </div>

                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Tips</p>
                    </div>
                    <p className="font-600" data-testid={`text-revenue-${i}`}>
                      ${(creator.stats.totalRevenue / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <p className="font-600" data-testid={`text-posts-${i}`}>
                      {creator.stats.posts}
                    </p>
                  </div>

                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <p className="font-600" data-testid={`text-views-${i}`}>
                      {creator.stats.totalViews}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {creator.stylistProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`/creator/${creator.stylistProfile.handle}`, '_blank')}
                      data-testid={`button-view-profile-${i}`}
                    >
                      View Profile
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`button-manage-${i}`}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    {showCreateDialog && (
      <CreateCreatorDialog 
        onClose={() => setShowCreateDialog(false)}
        onSuccess={(credentials) => {
          setShowCreateDialog(false);
          setCreatedCredentials(credentials);
        }}
      />
    )}

    {createdCredentials && (
      <CredentialsDisplayDialog 
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />
    )}
  </>
  );
}

// Creator creation schema
const createCreatorSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Full name is required"),
  handle: z.string().min(3, "Handle must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Handle can only contain letters, numbers, underscores, and hyphens"),
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  location: z.string().optional(),
});

interface CreateCreatorDialogProps {
  onClose: () => void;
  onSuccess: (credentials: { email: string; password: string }) => void;
}

function CreateCreatorDialog({ onClose, onSuccess }: CreateCreatorDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createCreatorSchema>>({
    resolver: zodResolver(createCreatorSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      handle: '',
      displayName: '',
      bio: '',
      location: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createCreatorSchema>) => {
      const response = await adminApiRequest('POST', '/api/v1/admin/creators', values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create creator');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/creators'] });
      toast({
        title: "Creator created successfully",
        description: `Creator account created for ${data.credentials.email}`,
      });
      onSuccess(data.credentials);
    },
    onError: (error: Error) => {
      const isEmailConflict = error.message.includes("Email already in use") || error.message.includes("already exists");
      const isHandleConflict = error.message.includes("Handle already in use");
      
      toast({
        title: isEmailConflict ? "Email already exists" : isHandleConflict ? "Handle already taken" : "Failed to create creator",
        description: isEmailConflict 
          ? "This email is already registered. Please use a different email address."
          : isHandleConflict 
            ? "This handle is already taken. Please choose a different handle."
            : error.message,
        variant: "destructive",
      });
      
      if (isEmailConflict) {
        form.setError("email", {
          type: "manual",
          message: "This email is already registered"
        });
      }
      if (isHandleConflict) {
        form.setError("handle", {
          type: "manual",
          message: "This handle is already taken"
        });
      }
    },
  });

  const onSubmit = (values: z.infer<typeof createCreatorSchema>) => {
    createMutation.mutate(values);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-creator">
        <DialogHeader>
          <DialogTitle>Create New Creator</DialogTitle>
          <DialogDescription>
            Create a new Creator Studio account with AI stylist profile.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-create-creator-full-name" placeholder="Jane Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-create-creator-display-name" placeholder="Jane's Style Studio" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-create-creator-email" placeholder="jane@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} data-testid="input-create-creator-password" placeholder="Minimum 8 characters" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle *</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-create-creator-handle" placeholder="jane-style" />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the creator profile URL (e.g., /creator/jane-style)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-create-creator-bio" placeholder="Fashion stylist specializing in..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-create-creator-location" placeholder="New York, USA" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create-creator">
                {createMutation.isPending ? "Creating..." : "Create Creator"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
