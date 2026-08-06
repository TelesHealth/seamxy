import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupplierAuth } from '@/lib/supplier-auth';
import { Plug, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { SiShopify, SiWoo } from 'react-icons/si';

export default function SupplierIntegrations() {
  const { supplier } = useSupplierAuth();
  const { toast } = useToast();

  const { data: integrations, isLoading } = useQuery<any[]>({
    queryKey: ['/api/v1/supplier/integrations'],
    enabled: supplier?.tier === 'pro' || supplier?.tier === 'enterprise'
  });

  const platforms = [
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Sync products from your Shopify store',
      icon: SiShopify,
      color: 'text-green-600',
      status: integrations?.some((i: any) => i.platform === 'shopify') ? 'connected' : 'available',
      docs: 'https://help.shopify.com/en/api'
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      description: 'Connect your WooCommerce website',
      icon: SiWoo,
      color: 'text-purple-600',
      status: integrations?.some((i: any) => i.platform === 'woocommerce') ? 'connected' : 'available',
      docs: 'https://woocommerce.com/document/woocommerce-rest-api/'
    },
    {
      id: 'bigcommerce',
      name: 'BigCommerce',
      description: 'Integrate with BigCommerce',
      icon: Plug,
      color: 'text-blue-600',
      status: integrations?.some((i: any) => i.platform === 'bigcommerce') ? 'connected' : 'available',
      docs: 'https://developer.bigcommerce.com/'
    },
    {
      id: 'amazon',
      name: 'Amazon Seller',
      description: 'Amazon SP-API integration',
      icon: Plug,
      color: 'text-orange-600',
      status: 'coming-soon',
      docs: null
    }
  ];

  const handleConnect = (platformId: string) => {
    if (platformId === 'amazon') {
      toast({
        title: 'Coming Soon',
        description: 'Amazon integration is currently in development. Please use Shopify, WooCommerce, or BigCommerce.',
        variant: 'default'
      });
      return;
    }

    toast({
      title: 'Integration Setup',
      description: 'This feature requires API credentials from your platform. Contact support for setup assistance.',
      variant: 'default'
    });
  };

  if (supplier?.tier === 'basic') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">E-Commerce Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your online store to sync products automatically
          </p>
        </div>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="text-orange-900 dark:text-orange-100">
              Upgrade Required
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              E-commerce integrations are available on Pro and Enterprise plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button data-testid="button-upgrade-for-integrations">
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-integrations-title">
          E-Commerce Integrations
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect your online store to sync products automatically
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {platforms.map((platform) => (
          <Card key={platform.id} data-testid={`card-integration-${platform.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center`}>
                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </div>
                </div>
                {platform.status === 'connected' && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {platform.status === 'coming-soon' && (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Coming Soon
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {platform.status === 'connected' ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    Last synced: Just now
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {platform.docs && (
                    <a
                      href={platform.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      View API Documentation
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    disabled={platform.status === 'coming-soon'}
                    className="w-full"
                    data-testid={`button-connect-${platform.id}`}
                  >
                    {platform.status === 'coming-soon' ? 'Coming Soon' : 'Connect'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Help</CardTitle>
          <CardDescription>Need assistance setting up your integrations?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To connect your e-commerce platform, you'll need:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>API credentials from your platform</li>
            <li>Store URL or domain</li>
            <li>Admin access to your store</li>
          </ul>
          <div className="pt-4">
            <Button variant="outline" data-testid="button-contact-support">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
