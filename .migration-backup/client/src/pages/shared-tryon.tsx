import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Heart,
  ThumbsUp,
  Meh,
  Share2,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Users,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

interface TryonShare {
  id: string;
  resultId: string;
  shareCode: string;
  title: string;
  voteCount: { love: number; like: number; meh: number };
  isActive: boolean;
  createdAt: string;
}

interface TryonResult {
  id: string;
  sessionId: string;
  garmentId: string;
  resultImageUrl: string | null;
  poseLandmarks: any;
  garmentPosition: any;
  sizeRecommendation: string | null;
  createdAt: string;
}

export default function SharedTryOnPage() {
  const { toast } = useToast();
  const [, params] = useRoute("/try-on/shared/:shareCode");
  const shareCode = params?.shareCode;
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  
  const { data, isLoading, isError, error } = useQuery<{ share: TryonShare; result: TryonResult | null }>({
    queryKey: ["/api/v1/try-on/shares", shareCode],
    enabled: !!shareCode
  });
  
  useEffect(() => {
    const voted = localStorage.getItem(`tryon_voted_${shareCode}`);
    if (voted) {
      setHasVoted(true);
      setSelectedVote(voted);
    }
  }, [shareCode]);
  
  const voteMutation = useMutation({
    mutationFn: async (vote: string) => {
      const response = await apiRequest("POST", `/api/v1/try-on/shares/${data?.share.id}/vote`, { vote });
      return response.json();
    },
    onSuccess: (_, vote) => {
      setHasVoted(true);
      setSelectedVote(vote);
      localStorage.setItem(`tryon_voted_${shareCode}`, vote);
      toast({
        title: "Vote recorded!",
        description: "Thanks for sharing your opinion."
      });
    },
    onError: (err: any) => {
      if (err.message?.includes("Already voted")) {
        setHasVoted(true);
        toast({
          title: "Already voted",
          description: "You've already shared your opinion on this look.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Vote failed",
          description: "Could not record your vote. Please try again.",
          variant: "destructive"
        });
      }
    }
  });
  
  const handleVote = (vote: string) => {
    if (hasVoted) return;
    voteMutation.mutate(vote);
  };
  
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share this link with your friends."
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading try-on look...</p>
        </div>
      </div>
    );
  }
  
  if (isError || !data?.share) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <Meh className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Look not found</h2>
            <p className="text-muted-foreground">
              This try-on look may have been removed or the link is invalid.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { share, result } = data;
  const voteCount = share.voteCount || { love: 0, like: 0, meh: 0 };
  const totalVotes = voteCount.love + voteCount.like + voteCount.meh;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container max-w-2xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <Badge variant="secondary">Virtual Try-On</Badge>
            </div>
            <CardTitle className="text-2xl">{share.title || "Check out this look!"}</CardTitle>
            <CardDescription>
              Help decide if this style is a hit!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {result?.resultImageUrl ? (
                <img 
                  src={result.resultImageUrl} 
                  alt="Try-on result"
                  className="w-full h-full object-contain"
                  data-testid="img-tryon-result"
                />
              ) : (
                <div className="text-center p-8">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Preview image coming soon
                  </p>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">
                  {hasVoted ? "Thanks for voting!" : "What do you think?"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasVoted 
                    ? "See how others feel about this look" 
                    : "Cast your vote anonymously"
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3" data-testid="voting-buttons">
                <Button
                  variant={selectedVote === 'love' ? 'default' : 'outline'}
                  className="flex-col py-6 gap-2 h-auto"
                  onClick={() => handleVote('love')}
                  disabled={hasVoted || voteMutation.isPending}
                  data-testid="button-vote-love"
                >
                  <Heart className={`h-8 w-8 ${selectedVote === 'love' ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Love it!</span>
                  {hasVoted && (
                    <Badge variant="secondary" className="text-xs">
                      {voteCount.love}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant={selectedVote === 'like' ? 'default' : 'outline'}
                  className="flex-col py-6 gap-2 h-auto"
                  onClick={() => handleVote('like')}
                  disabled={hasVoted || voteMutation.isPending}
                  data-testid="button-vote-like"
                >
                  <ThumbsUp className={`h-8 w-8 ${selectedVote === 'like' ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Nice!</span>
                  {hasVoted && (
                    <Badge variant="secondary" className="text-xs">
                      {voteCount.like}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant={selectedVote === 'meh' ? 'default' : 'outline'}
                  className="flex-col py-6 gap-2 h-auto"
                  onClick={() => handleVote('meh')}
                  disabled={hasVoted || voteMutation.isPending}
                  data-testid="button-vote-meh"
                >
                  <Meh className={`h-8 w-8 ${selectedVote === 'meh' ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Meh</span>
                  {hasVoted && (
                    <Badge variant="secondary" className="text-xs">
                      {voteCount.meh}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {hasVoted && totalVotes > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total votes
                      </span>
                      <span className="font-medium">{totalVotes}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <Progress 
                          value={totalVotes > 0 ? (voteCount.love / totalVotes) * 100 : 0} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {totalVotes > 0 ? Math.round((voteCount.love / totalVotes) * 100) : 0}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                        <Progress 
                          value={totalVotes > 0 ? (voteCount.like / totalVotes) * 100 : 0} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {totalVotes > 0 ? Math.round((voteCount.like / totalVotes) * 100) : 0}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Meh className="h-4 w-4 text-gray-500" />
                        <Progress 
                          value={totalVotes > 0 ? (voteCount.meh / totalVotes) * 100 : 0} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {totalVotes > 0 ? Math.round((voteCount.meh / totalVotes) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Separator />
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Want to try on clothes yourself?
              </p>
              <Link href="/shop">
                <Button className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Explore SeamXY Shop
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>Powered by SeamXY Virtual Try-On</p>
          <p className="mt-1">AI-powered fashion technology</p>
        </div>
      </div>
    </div>
  );
}
