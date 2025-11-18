import { useSupplierAuth } from '@/lib/supplier-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart, MessageSquare, TrendingUp, DollarSign, Users, MousePointerClick, CheckCircle2, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function SupplierDashboard() {
  const { supplier, profile } = useSupplierAuth();

  const { data: analytics } = useQuery({
    queryKey: ['/api/v1/supplier/analytics'],
    enabled: !!supplier
  });

  const { data: affiliateAnalytics } = useQuery({
    queryKey: ['/api/v1/supplier/affiliate-analytics'],
    enabled: !!supplier
  });

  const stats = [
    {
      title: 'Total Products',
      value: analytics?.productCount || '0',
      icon: Package,
      description: 'Active listings',
      color: 'text-blue-500'
    },
    {
      title: 'Orders',
      value: analytics?.orderCount || '0',
      icon: ShoppingCart,
      description: 'This month',
      color: 'text-green-500'
    },
    {
      title: 'Messages',
      value: analytics?.unreadMessages || '0',
      icon: MessageSquare,
      description: 'Unread',
      color: 'text-orange-500'
    },
    {
      title: 'Revenue',
      value: `$${analytics?.revenue || '0'}`,
      icon: DollarSign,
      description: 'This month',
      color: 'text-emerald-500'
    }
  ];

  const getWelcomeMessage = () => {
    switch (supplier?.role) {
      case 'retailer':
        return 'Manage your product catalog and e-commerce integrations';
      case 'tailor':
        return 'View custom requests and manage your portfolio';
      case 'designer':
        return 'Showcase your collections and manage orders';
      default:
        return 'Welcome to your supplier dashboard';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-dashboard-title">
          Welcome back, {supplier?.businessName}
        </h1>
        <p className="text-muted-foreground mt-2">
          {getWelcomeMessage()}
        </p>
      </div>

      {!supplier?.onboardingCompleted && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="text-orange-900 dark:text-orange-100">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Add your business details to start receiving orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/supplier/profile"
              className="text-sm font-medium text-orange-900 dark:text-orange-100 hover:underline"
              data-testid="link-complete-profile"
            >
              Complete profile →
            </a>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Affiliate Marketing Analytics - Only show for designers with AI stylists */}
      {supplier?.role === 'designer' && affiliateAnalytics && (
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-display font-bold" data-testid="text-affiliate-section-title">
              Affiliate Marketing Performance
            </h2>
            <p className="text-muted-foreground mt-1">
              Track your AI stylist's product recommendations and commissions
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clicks
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-affiliate-total-clicks">
                  {affiliateAnalytics.totalClicks}
                </div>
                <p className="text-xs text-muted-foreground">
                  Product recommendations clicked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversions
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-affiliate-conversions">
                  {affiliateAnalytics.totalConversions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Purchases completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commission Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-affiliate-revenue">
                  ${affiliateAnalytics.totalRevenue}
                </div>
                <p className="text-xs text-muted-foreground">
                  4-10% commission earned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-affiliate-conversion-rate">
                  {affiliateAnalytics.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Clicks to purchases
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Products Table */}
          {affiliateAnalytics.topProducts && affiliateAnalytics.topProducts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Top Recommended Products</CardTitle>
                <CardDescription>
                  Your AI stylist's most clicked product recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Retailer</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">CVR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliateAnalytics.topProducts.map((product: any) => (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                            )}
                            <div>
                              <div className="line-clamp-1">{product.name}</div>
                              {product.category && (
                                <div className="text-xs text-muted-foreground">
                                  {product.category}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            product.retailer === 'amazon' ? 'border-orange-500 text-orange-700' :
                            product.retailer === 'ebay' ? 'border-blue-500 text-blue-700' :
                            product.retailer === 'rakuten' ? 'border-red-500 text-red-700' :
                            ''
                          }>
                            {product.retailer}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.priceCents ? (product.priceCents / 100).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-clicks-${product.id}`}>
                          {product.clicks || 0}
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-conversions-${product.id}`}>
                          {product.conversions || 0}
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-cvr-${product.id}`}>
                          {product.conversionRate ? product.conversionRate.toFixed(1) : '0.0'}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {supplier?.role === 'retailer' && (
              <>
                <a
                  href="/supplier/products"
                  className="block p-3 rounded-md hover-elevate active-elevate-2 border"
                  data-testid="link-add-product"
                >
                  <div className="font-medium">Add Products</div>
                  <div className="text-sm text-muted-foreground">List new items in your catalog</div>
                </a>
                <a
                  href="/supplier/integrations"
                  className="block p-3 rounded-md hover-elevate active-elevate-2 border"
                  data-testid="link-connect-store"
                >
                  <div className="font-medium">Connect Store</div>
                  <div className="text-sm text-muted-foreground">Sync with Shopify, WooCommerce, or BigCommerce</div>
                </a>
              </>
            )}
            {supplier?.role === 'tailor' && (
              <>
                <a
                  href="/supplier/portfolio"
                  className="block p-3 rounded-md hover-elevate active-elevate-2 border"
                  data-testid="link-update-portfolio"
                >
                  <div className="font-medium">Update Portfolio</div>
                  <div className="text-sm text-muted-foreground">Showcase your best work</div>
                </a>
                <a
                  href="/supplier/requests"
                  className="block p-3 rounded-md hover-elevate active-elevate-2 border"
                  data-testid="link-view-requests"
                >
                  <div className="font-medium">View Custom Requests</div>
                  <div className="text-sm text-muted-foreground">See new project opportunities</div>
                </a>
              </>
            )}
            {supplier?.role === 'designer' && (
              <>
                <a
                  href="/supplier/collections"
                  className="block p-3 rounded-md hover-elevate active-elevate-2 border"
                  data-testid="link-create-collection"
                >
                  <div className="font-medium">Create Collection</div>
                  <div className="text-sm text-muted-foreground">Launch a new made-to-measure line</div>
                </a>
              </>
            )}
            <a
              href="/supplier/messages"
              className="block p-3 rounded-md hover-elevate active-elevate-2 border"
              data-testid="link-check-messages"
            >
              <div className="font-medium">Check Messages</div>
              <div className="text-sm text-muted-foreground">Respond to customer inquiries</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your subscription and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Plan</span>
                <span className="text-sm capitalize font-bold">{supplier?.tier}</span>
              </div>
              {supplier?.tier === 'basic' && (
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro for unlimited products and advanced integrations
                </p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Status</span>
                <span className={`text-sm font-medium ${supplier?.isVerified ? 'text-green-500' : 'text-orange-500'}`}>
                  {supplier?.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              {!supplier?.isVerified && (
                <p className="text-xs text-muted-foreground">
                  Complete your profile to get verified
                </p>
              )}
            </div>

            {supplier?.tier === 'basic' && (
              <a
                href="/supplier/upgrade"
                className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover-elevate active-elevate-2"
                data-testid="button-upgrade"
              >
                Upgrade to Pro
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
