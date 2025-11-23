import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ShoppingBag, Scissors, DollarSign, Settings, Sparkles, Eye, FileText, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function AdminDashboard() {
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
          {[
            { label: "Total Users", value: "2,543", icon: <Users className="w-5 h-5" />, trend: "+12%" },
            { label: "Active Makers", value: "127", icon: <Scissors className="w-5 h-5" />, trend: "+8%" },
            { label: "Orders (30d)", value: "1,891", icon: <ShoppingBag className="w-5 h-5" />, trend: "+23%" },
            { label: "Revenue (30d)", value: "$47,892", icon: <DollarSign className="w-5 h-5" />, trend: "+18%" },
          ].map((kpi, i) => (
            <Card key={i}>
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
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="makers" data-testid="tab-makers">Makers</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
            <TabsTrigger value="monetization" data-testid="tab-monetization">Monetization</TabsTrigger>
            <TabsTrigger value="creators" data-testid="tab-creators">Creators</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User table placeholder */}
                  {[
                    { name: "John Smith", email: "john@example.com", orders: 12, status: "Active" },
                    { name: "Sarah Johnson", email: "sarah@example.com", orders: 7, status: "Active" },
                    { name: "Mike Chen", email: "mike@example.com", orders: 3, status: "Active" },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover-elevate">
                      <div className="flex-1">
                        <p className="font-600">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground mr-4">{user.orders} orders</div>
                      <Badge variant="secondary">{user.status}</Badge>
                      <Button variant="ghost" size="sm" className="ml-4">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                    { name: "Savile Modern Tailors", location: "London, UK", status: "Verified", pending: false },
                    { name: "Urban Stitch Co.", location: "Los Angeles, USA", status: "Verified", pending: false },
                    { name: "Minimal Atelier", location: "Lisbon, PT", status: "Pending Review", pending: true },
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
                    { type: "Retail", amount: "$128.00", commission: "$6.40", user: "John S.", date: "Today" },
                    { type: "Bespoke", amount: "$890.00", commission: "$89.00", user: "Sarah J.", date: "Today" },
                    { type: "Retail", amount: "$49.00", commission: "$2.45", user: "Mike C.", date: "Yesterday" },
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
                      <Button variant="ghost" size="sm">
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
                    { partner: "Default Rate", rate: "5%" },
                    { partner: "Premium Partners", rate: "7%" },
                    { partner: "Luxury Brands", rate: "4%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-500">{item.partner}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-600">{item.rate}</span>
                        <Button variant="ghost" size="sm">
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
                    { plan: "Maker Basic", price: "$0/mo", active: 47 },
                    { plan: "Maker Pro", price: "$29/mo", active: 53 },
                    { plan: "Maker Elite", price: "$99/mo", active: 27 },
                    { plan: "AI Stylist Pro", price: "$9.99/mo", active: 312 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
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
      </div>
    </div>
  );
}

function CreatorsManagement() {
  const { data, isLoading, error } = useQuery<CreatorsResponse>({
    queryKey: ['/api/v1/admin/creators'],
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
