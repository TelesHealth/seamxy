import { Home, Package, Palette, Scissors, Plug, MessageSquare, ShoppingCart, BarChart3, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useSupplierAuth } from '@/lib/supplier-auth';
import { Badge } from '@/components/ui/badge';

export function SupplierSidebar() {
  const [location] = useLocation();
  const { supplier, logout } = useSupplierAuth();

  const retailerItems = [
    { title: 'Dashboard', url: '/supplier/dashboard', icon: Home },
    { title: 'Products', url: '/supplier/products', icon: Package },
    { title: 'Integrations', url: '/supplier/integrations', icon: Plug },
    { title: 'Orders', url: '/supplier/orders', icon: ShoppingCart },
    { title: 'Analytics', url: '/supplier/analytics', icon: BarChart3 },
    { title: 'Messages', url: '/supplier/messages', icon: MessageSquare }
  ];

  const tailorItems = [
    { title: 'Dashboard', url: '/supplier/dashboard', icon: Home },
    { title: 'Portfolio', url: '/supplier/portfolio', icon: Scissors },
    { title: 'Custom Requests', url: '/supplier/requests', icon: MessageSquare },
    { title: 'Orders', url: '/supplier/orders', icon: ShoppingCart },
    { title: 'Analytics', url: '/supplier/analytics', icon: BarChart3 },
    { title: 'Messages', url: '/supplier/messages', icon: MessageSquare }
  ];

  const designerItems = [
    { title: 'Dashboard', url: '/supplier/dashboard', icon: Home },
    { title: 'Collections', url: '/supplier/collections', icon: Palette },
    { title: 'Orders', url: '/supplier/orders', icon: ShoppingCart },
    { title: 'Analytics', url: '/supplier/analytics', icon: BarChart3 },
    { title: 'Messages', url: '/supplier/messages', icon: MessageSquare }
  ];

  const menuItems = supplier?.role === 'retailer' 
    ? retailerItems 
    : supplier?.role === 'tailor' 
    ? tailorItems 
    : designerItems;

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-secondary';
      case 'pro': return 'bg-blue-500';
      case 'enterprise': return 'bg-purple-500';
      default: return 'bg-secondary';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{supplier?.businessName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs capitalize">
                {supplier?.role}
              </Badge>
              <Badge className={`text-xs ${getTierBadgeColor(supplier?.tier || 'basic')}`}>
                {supplier?.tier}
              </Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <div className="flex items-center gap-3" data-testid={`link-${item.title.toLowerCase()}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/supplier/profile">
                  <SidebarMenuButton asChild>
                    <div className="flex items-center gap-3" data-testid="link-profile">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
