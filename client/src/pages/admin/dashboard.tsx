import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ShoppingBag, Scissors, DollarSign, Settings } from "lucide-react";

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
        </Tabs>
      </div>
    </div>
  );
}
