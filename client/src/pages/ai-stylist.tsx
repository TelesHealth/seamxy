import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useCustomerAuth } from "@/lib/customer-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Video, Crown } from "lucide-react";

import aidenPortrait from "@assets/generated_images/Aiden_minimalist_professional_stylist_568ee488.png";
import lucaPortrait from "@assets/generated_images/Luca_trendy_streetwear_expert_b5c705d3.png";
import evelynPortrait from "@assets/generated_images/Evelyn_luxury_fashion_consultant_15d7a89e.png";
import kaiPortrait from "@assets/generated_images/Kai_budget-conscious_style_coach_f50d0d31.png";
import meiPortrait from "@assets/generated_images/Asian_female_fashion_stylist_portrait_58c0f6e3.png";
import marcusPortrait from "@assets/generated_images/Black_male_fashion_stylist_portrait_7ce47f5b.png";
import sofiaPortrait from "@assets/generated_images/Hispanic_female_fashion_stylist_portrait_219a5f62.png";
import eduardoPortrait from "@assets/generated_images/Distinguished_Hispanic_older_gentleman_stylist_95ce41f9.png";
import elenaPortrait from "@assets/generated_images/Elena_Rose_avatar_portrait_7f7f635f.png";

const personas = [
  {
    id: "aiden",
    name: "Aiden",
    description: "Modern minimalist stylist for professionals",
    tone: "Confident, calm, and polished",
    specialty: "Smart-casual & Business",
    avatarUrl: aidenPortrait,
  },
  {
    id: "luca",
    name: "Luca",
    description: "Trendy streetwear expert",
    tone: "Energetic, witty, urban",
    specialty: "Streetwear & Sneakers",
    avatarUrl: lucaPortrait,
  },
  {
    id: "evelyn",
    name: "Evelyn",
    description: "Luxury fashion guide",
    tone: "Elegant, warm, sophisticated",
    specialty: "Luxury & Formal",
    avatarUrl: evelynPortrait,
  },
  {
    id: "kai",
    name: "Kai",
    description: "Budget-conscious style coach",
    tone: "Friendly, practical, down-to-earth",
    specialty: "Budget & Everyday",
    avatarUrl: kaiPortrait,
  },
  {
    id: "mei",
    name: "Mei Chen",
    description: "East-meets-West fusion expert",
    tone: "Thoughtful, cultured, balanced",
    specialty: "Minimalist & Cultural Fusion",
    avatarUrl: meiPortrait,
  },
  {
    id: "marcus",
    name: "Marcus Thompson",
    description: "Bold contemporary fashion innovator",
    tone: "Confident, creative, authentic",
    specialty: "Contemporary & Pattern Mixing",
    avatarUrl: marcusPortrait,
  },
  {
    id: "sofia",
    name: "Sofia Rodriguez",
    description: "Vibrant Latin fashion specialist",
    tone: "Warm, energetic, passionate",
    specialty: "Color & Latin Fashion",
    avatarUrl: sofiaPortrait,
  },
  {
    id: "eduardo",
    name: "Eduardo Morales",
    description: "Distinguished classic style expert",
    tone: "Refined, warm, knowledgeable",
    specialty: "Classic & Timeless Elegance",
    avatarUrl: eduardoPortrait,
  },
  {
    id: "elena-wedding",
    name: "Elena Rose",
    description: "Wedding & Prom Concierge",
    tone: "Warm, excited, detail-oriented, supportive",
    specialty: "Weddings, Proms & Formal Events",
    avatarUrl: elenaPortrait,
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiPersona {
  id: string;
  name: string;
  description: string;
  tone: string;
  specialty: string;
  avatarUrl: string;
}

interface ChatSession {
  id: string;
  userId: string;
  personaId: string;
  messages: Message[];
  userContext: any;
}

export default function AiStylist() {
  const { customer } = useCustomerAuth();
  const userId = customer?.id || null;
  const [selectedPersona, setSelectedPersona] = useState(personas[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isPro, setIsPro] = useState(false);

  // Fetch AI personas from API
  const { data: apiPersonas = [] } = useQuery<AiPersona[]>({
    queryKey: ["/api/v1/ai-personas"],
  });

  // Merge API personas with local AI-generated avatars
  const availablePersonas = Array.isArray(apiPersonas) && apiPersonas.length > 0 
    ? apiPersonas.map((apiPersona) => {
        const localPersona = personas.find(p => p.id === apiPersona.id);
        return {
          ...apiPersona,
          avatarUrl: localPersona?.avatarUrl || apiPersona.avatarUrl
        };
      })
    : personas;

  // Create chat session when persona is selected
  const createSessionMutation = useMutation({
    mutationFn: async (personaId: string) => {
      if (!userId) return null;
      const res = await apiRequest("POST", "/api/v1/ai-sessions", {
        userId,
        personaId,
        messages: [],
        userContext: {}
      });
      return res.json();
    },
    onSuccess: (session: any) => {
      if (session) {
        setSessionId(session.id);
      }
    }
  });

  // Send message to AI
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!sessionId || !userId) return null;
      const res = await apiRequest("POST", `/api/v1/ai-sessions/${sessionId}/messages`, {
        message,
        userId
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/ai-sessions", sessionId] });
    }
  });

  // Get current session
  const { data: session } = useQuery<ChatSession>({
    queryKey: ["/api/v1/ai-sessions", sessionId],
    enabled: !!sessionId
  });

  const messages = session?.messages || [];

  // Create session when persona changes
  useEffect(() => {
    if (userId && selectedPersona) {
      createSessionMutation.mutate(selectedPersona.id);
    }
  }, [selectedPersona.id, userId]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || !userId) return;

    const messageText = input;
    setInput("");

    await sendMessageMutation.mutateAsync(messageText);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-4xl font-700 text-foreground mb-2">
                <Sparkles className="inline w-8 h-8 mr-2 text-primary" />
                AI Personal Stylist
              </h1>
              <p className="text-lg text-muted-foreground">
                Your virtual fashion consultant, powered by AI
              </p>
            </div>
            {!isPro && (
              <Button variant="outline" className="gap-2" data-testid="button-upgrade-pro">
                <Crown className="w-4 h-4" />
                Upgrade to Pro
                <Badge variant="secondary" className="ml-2">$9.99/mo</Badge>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Persona Selector */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Your Stylist</CardTitle>
                <CardDescription>Each has their own expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availablePersonas.map((persona: any) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors hover-elevate ${
                      selectedPersona.id === persona.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    data-testid={`button-persona-${persona.id}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={persona.avatarUrl} />
                        <AvatarFallback>{persona.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-600">{persona.name}</p>
                        <p className="text-xs text-muted-foreground">{persona.specialty}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Pro Features */}
            {!isPro && (
              <Card className="mt-4 border-primary/50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Crown className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-600 mb-2">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unlock video consultations and voice chat
                    </p>
                    <ul className="text-sm space-y-2 text-left mb-4">
                      <li className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span>Video avatar responses</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Voice conversations</span>
                      </li>
                    </ul>
                    <Button className="w-full" size="sm">
                      Try Free for 7 Days
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedPersona.avatarUrl} />
                    <AvatarFallback>{selectedPersona.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedPersona.name}</CardTitle>
                    <CardDescription>{selectedPersona.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      data-testid={`message-${i}`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedPersona.avatarUrl} />
                          <AvatarFallback>{selectedPersona.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Ask ${selectedPersona.name} for style advice...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sendMessageMutation.isPending && handleSend()}
                    disabled={sendMessageMutation.isPending || !userId}
                    data-testid="input-chat-message"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={sendMessageMutation.isPending || !input.trim() || !userId}
                    data-testid="button-send-message"
                  >
                    {sendMessageMutation.isPending ? "..." : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
