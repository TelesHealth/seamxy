import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Send, RefreshCw, CheckCircle2, AlertCircle, Bot, User } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupplierAuth } from "@/lib/supplier-auth";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StylistPrompt {
  id: string;
  stylistId: string;
  systemPrompt: string;
  promptVersion: number;
  trainingCompletedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function AiPreview() {
  const { toast } = useToast();
  const { supplier, profile } = useSupplierAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  
  // Load stylist profile to get handle
  const { data: stylistProfile, isLoading: isLoadingProfile } = useQuery<any>({
    queryKey: [`/api/v1/supplier/${supplier?.id}/stylist-profile`],
    enabled: !!supplier?.id,
  });
  
  const stylistId = stylistProfile?.id;
  const stylistHandle = stylistProfile?.handle;
  
  // Load AI prompt
  const { data: prompt, isLoading, error } = useQuery<StylistPrompt>({
    queryKey: [`/api/v1/stylist/${stylistId}/prompt`],
    enabled: !!stylistId,
  });
  
  // Test AI mutation
  const testAiMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!stylistHandle) {
        throw new Error("Stylist handle not found");
      }
      const response = await apiRequest('POST', `/api/v1/stylists/${stylistHandle}/chat`, {
        userId: "test-preview-user",
        message
      });
      return response;
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content,
        timestamp: new Date(data.timestamp)
      }]);
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    }
  });
  
  // Regenerate prompt mutation
  const regeneratePromptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/v1/stylist/${stylistId}/generate-prompt`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/stylist/${stylistId}/prompt`] });
      toast({
        title: "Prompt Regenerated",
        description: "Your AI clone has been updated with the latest training data.",
      });
      setMessages([]);
    },
    onError: (error: any) => {
      toast({
        title: "Regeneration Failed",
        description: error.message || "Failed to regenerate prompt",
        variant: "destructive"
      });
    }
  });
  
  const handleSendMessage = async () => {
    if (!input.trim() || !prompt) return;
    
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    await testAiMutation.mutateAsync(input);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (isLoadingProfile) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading stylist profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!stylistId || !stylistHandle) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Required</AlertTitle>
          <AlertDescription>
            Please complete your stylist profile setup first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading your AI clone...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !prompt) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Not Trained</AlertTitle>
          <AlertDescription>
            Please complete the training questionnaire first to generate your AI clone.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Info Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your AI Clone
            </CardTitle>
            <CardDescription>
              Version {prompt.promptVersion}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {prompt.isActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <Badge variant="default" data-testid="badge-status-active">Active</Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <Badge variant="secondary" data-testid="badge-status-inactive">Inactive</Badge>
                </>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Training Completed</p>
                <p className="font-medium">{new Date(prompt.trainingCompletedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{new Date(prompt.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => regeneratePromptMutation.mutate()}
                disabled={regeneratePromptMutation.isPending}
                data-testid="button-regenerate"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {regeneratePromptMutation.isPending ? "Regenerating..." : "Regenerate AI"}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMessages([])}
                data-testid="button-clear-chat"
              >
                Clear Chat
              </Button>
            </div>
            
            <Alert className="bg-muted/50 border-muted">
              <AlertDescription className="text-sm">
                💡 Test your AI clone by asking styling questions. See how it responds and adjust your training if needed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        {/* Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
          <CardHeader>
            <CardTitle>Test Your AI Clone</CardTitle>
            <CardDescription>
              Ask styling questions to see how your AI responds
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bot className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Try asking: "Help me style a first date outfit" or "What shoes go with wide-leg trousers?"
                  </p>
                </div>
              ) : (
                <div className="space-y-4" data-testid="chat-messages">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${msg.role}-${idx}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {testAiMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <div className="flex gap-2 w-full">
              <Input
                placeholder="Ask a styling question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={testAiMutation.isPending}
                className="flex-1"
                data-testid="input-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || testAiMutation.isPending}
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
