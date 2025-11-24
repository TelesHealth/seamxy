import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ShoppingBag, Scissors, DollarSign, Settings, Sparkles, Eye, FileText, Heart, Edit } from "lucide-react";
import { useQuery, useMutation, QueryFunction } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
            <UserManagement />
          </TabsContent>

          <TabsContent value="makers">
            <Card>
              <CardHeader>
                <CardTitle>Maker Management</CardTitle>
                <CardDescription>Approve and manage custom makers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: "1", name: "Savile Modern Tailors", location: "London, UK", status: "Verified", pending: false, email: "savile@tailors.com", rating: "4.9", totalOrders: 156 },
                    { id: "2", name: "Urban Stitch Co.", location: "Los Angeles, USA", status: "Verified", pending: false, email: "urban@stitch.com", rating: "4.7", totalOrders: 89 },
                    { id: "3", name: "Minimal Atelier", location: "Lisbon, PT", status: "Pending Review", pending: true, email: "minimal@atelier.pt", rating: "N/A", totalOrders: 0 },
                  ].map((maker, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover-elevate">
                      <div className="flex-1">
                        <p className="font-600">{maker.name}</p>
                        <p className="text-sm text-muted-foreground">{maker.location}</p>
                      </div>
                      <Badge variant={maker.pending ? "outline" : "secondary"}>{maker.status}</Badge>
                      <Button 
                        variant={maker.pending ? "default" : "ghost"}
                        size="sm" 
                        className="ml-4"
                        onClick={() => setSelectedMaker(maker)}
                        data-testid={`button-maker-action-${i}`}
                      >
                        {maker.pending ? "Review" : "Manage"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            <CreatorsManagement />
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
          <Dialog open={true} onOpenChange={() => setSelectedMaker(null)}>
            <DialogContent data-testid="dialog-maker-details">
              <DialogHeader>
                <DialogTitle>{selectedMaker.name}</DialogTitle>
                <DialogDescription>Maker account details and management</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-600">{selectedMaker.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={selectedMaker.pending ? "outline" : "secondary"}>{selectedMaker.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-600">{selectedMaker.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-600 text-sm">{selectedMaker.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-600">{selectedMaker.rating}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="font-600">{selectedMaker.totalOrders}</p>
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
                <Button variant="outline" onClick={() => setSelectedMaker(null)}>Close</Button>
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
          <Dialog open={true} onOpenChange={() => setSelectedPlan(null)}>
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
                  <Button variant="outline" className="flex-1">Edit Plan</Button>
                  <Button variant="outline" className="flex-1">View Subscribers</Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

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

function UserManagement() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['/api/v1/admin/users'],
    queryFn: adminQueryFn,
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
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              {isLoading ? '...' : data?.total || 0} Users
            </Badge>
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

function CreatorsManagement() {
  const { data, isLoading, error } = useQuery<CreatorsResponse>({
    queryKey: ['/api/v1/admin/creators'],
    queryFn: adminQueryFn,
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Creator Management</CardTitle>
            <CardDescription>Manage Creator Studio accounts and analytics</CardDescription>
          </div>
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            {isLoading ? '...' : data?.creators?.length || 0} Creators
          </Badge>
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
                      {creator.businessName || creator.ownerName || 'Unnamed Creator'}
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
                      @{creator.stylistProfile.handle} • {creator.stylistProfile.tier} tier
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
  );
}
