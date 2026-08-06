import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

export default function SupplierRequests() {
  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ['/api/v1/supplier/tailor/custom-requests']
  });

  const getBudgetTierColor = (tier: string) => {
    switch (tier) {
      case 'affordable': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100';
      case 'mid_range': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100';
      case 'premium': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100';
      case 'luxury': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-requests-title">
          Custom Requests
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse custom clothing requests from customers
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Loading custom requests...</div>
          </CardContent>
        </Card>
      ) : !requests || requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No custom requests available</h3>
            <p className="text-muted-foreground">
              New customer requests will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request: any) => (
            <Card key={request.id} className="hover-elevate" data-testid={`card-request-${request.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {request.styleDescription || 'Custom Request'}
                  </CardTitle>
                  <Badge className={getBudgetTierColor(request.budgetTier)}>
                    {request.budgetTier?.replace('_', ' ')}
                  </Badge>
                </div>
                <CardDescription>
                  {request.demographic && (
                    <span className="capitalize">{request.demographic}</span>
                  )}
                  {request.demographic && request.category && ' • '}
                  {request.category && (
                    <span className="capitalize">{request.category}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.minBudget && request.maxBudget && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Budget: </span>
                    <span className="font-medium">
                      ${request.minBudget} - ${request.maxBudget}
                    </span>
                  </div>
                )}

                {request.styleDescription && (
                  <div className="text-sm">
                    <p className="text-muted-foreground line-clamp-3">
                      {request.styleDescription}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" data-testid={`button-quote-${request.id}`}>
                    Submit Quote
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-details-${request.id}`}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
