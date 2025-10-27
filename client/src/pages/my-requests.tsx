import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, Clock, Star, MapPin, Calendar, DollarSign, Check } from "lucide-react";
import type { CustomRequest, Quote, Maker } from "@shared/schema";

export default function MyRequests() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem("seamxy_user_id");

  const { data: requests, isLoading } = useQuery<CustomRequest[]>({
    queryKey: ['/api/v1/users', userId, 'custom-requests'],
    enabled: !!userId,
  });

  const acceptQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return apiRequest("POST", `/api/v1/quotes/${quoteId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users', userId, 'custom-requests'] });
      toast({
        title: "Quote Accepted!",
        description: "The maker will start working on your order.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept quote",
        variant: "destructive",
      });
    },
  });

  if (!userId) {
    return (
      <div className="container max-w-4xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please complete onboarding first to view your requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} data-testid="button-go-onboarding">
              Go to Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-8">
        <div className="text-center">Loading your requests...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Custom Requests</h1>
          <p className="text-muted-foreground mt-2">
            Track your requests and review quotes from makers
          </p>
        </div>
        <Button onClick={() => setLocation("/custom-request")} data-testid="button-new-request">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start by submitting a custom request. Verified makers will send you competitive quotes.
            </p>
            <Button onClick={() => setLocation("/custom-request")} data-testid="button-create-first-request">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              userId={userId}
              onAcceptQuote={(quoteId) => acceptQuoteMutation.mutate(quoteId)}
              isAccepting={acceptQuoteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  userId,
  onAcceptQuote,
  isAccepting,
}: {
  request: CustomRequest;
  userId: string;
  onAcceptQuote: (quoteId: string) => void;
  isAccepting: boolean;
}) {
  const { data: quotes } = useQuery<(Quote & { maker?: Maker })[]>({
    queryKey: ['/api/v1/custom-requests', request.id, 'quotes'],
  });

  const statusColors = {
    open: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    quoted: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
    in_progress: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  return (
    <Card data-testid={`request-card-${request.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="capitalize">{request.itemType}</CardTitle>
              <Badge className={statusColors[request.status as keyof typeof statusColors] || ""}>
                {request.status}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {request.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Budget</div>
            <div className="font-semibold text-foreground">
              ${request.budgetMin} - ${request.budgetMax}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Submitted {new Date(request.createdAt).toLocaleDateString()}
          </div>

          {quotes && quotes.length > 0 ? (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">
                  Quotes Received ({quotes.length})
                </h4>
                <div className="space-y-3">
                  {quotes.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      requestStatus={request.status}
                      selectedQuoteId={request.selectedQuoteId}
                      onAccept={() => onAcceptQuote(quote.id)}
                      isAccepting={isAccepting}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waiting for quotes from makers...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuoteCard({
  quote,
  requestStatus,
  selectedQuoteId,
  onAccept,
  isAccepting,
}: {
  quote: Quote & { maker?: Maker };
  requestStatus: string;
  selectedQuoteId: string | null;
  onAccept: () => void;
  isAccepting: boolean;
}) {
  // Fetch maker details
  const { data: maker } = useQuery<Maker>({
    queryKey: ['/api/v1/makers', quote.makerId],
  });

  const isSelected = selectedQuoteId === quote.id;
  const isAccepted = quote.isAccepted;

  return (
    <div
      className={`border rounded-lg p-4 ${
        isSelected ? "border-primary bg-primary/5" : ""
      }`}
      data-testid={`quote-${quote.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold">{maker?.businessName || "Loading..."}</h5>
            {isAccepted && (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                <Check className="w-3 h-3 mr-1" />
                Accepted
              </Badge>
            )}
          </div>
          {maker && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                {maker.rating} ({maker.totalReviews} reviews)
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {maker.location}
              </div>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-2xl font-bold">
            <DollarSign className="w-5 h-5" />
            {quote.price}
          </div>
          <div className="text-sm text-muted-foreground">
            {quote.leadTimeDays} days
          </div>
        </div>
      </div>

      {quote.message && (
        <p className="text-sm text-muted-foreground mb-3">{quote.message}</p>
      )}

      {quote.materials && (
        <div className="text-sm mb-3">
          <span className="font-medium">Materials:</span> {quote.materials}
        </div>
      )}

      {requestStatus === "open" && !isAccepted && (
        <Button
          size="sm"
          onClick={onAccept}
          disabled={isAccepting}
          className="w-full"
          data-testid={`button-accept-quote-${quote.id}`}
        >
          {isAccepting ? "Accepting..." : "Accept Quote"}
        </Button>
      )}
    </div>
  );
}
