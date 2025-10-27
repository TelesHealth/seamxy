import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function SupplierAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/v1/supplier/analytics']
  });

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${analytics?.totalRevenue?.toFixed(2) || '0.00'}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Orders',
      value: analytics?.totalOrders || '0',
      change: '+8.2%',
      icon: Package,
      color: 'text-blue-500'
    },
    {
      title: 'Avg Order Value',
      value: `$${analytics?.avgOrderValue?.toFixed(2) || '0.00'}`,
      change: '+3.1%',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      title: 'Active Products',
      value: analytics?.activeProducts || '0',
      change: '+5',
      icon: BarChart3,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-analytics-title">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your business performance and trends
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Your earnings for the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart visualization coming soon
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best sellers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No sales data available yet
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
