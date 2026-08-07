import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useCustomerAuth } from "@/lib/customer-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Lock } from "lucide-react";
import { StyleCTA } from "@/components/StyleCTA";

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

const quickPrompts = [
  "What should I wear to a job interview?",
  "Outfit ideas for a first date",
  "What works for a summer wedding?",
  "Help me build a capsule wardrobe",
  "Smart-casual for a Friday office look",
  "What to wear to a rooftop dinner?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Simulated preview replies for guest quick-prompts
const guestPreviewReplies: Record<string, string> = {
  "What should I wear to a job interview?":
    "For most interviews, a tailored blazer over a crisp shirt or blouse signals confidence without overdressing. Stick to neutrals — navy, charcoal, or white — and make sure everything is well-fitted and wrinkle-free.",
  "Outfit ideas for a first date":
    "Go for something that feels like a slightly elevated version of your everyday style — you want to feel like yourself, just polished. A great pair of dark jeans with a fitted top or a midi dress both work beautifully.",
  "What works for a summer wedding?":
    "A floral midi dress or a linen suit in a light pastel hits the perfect note. Avoid white (guest rule!), and choose breathable fabrics. Block-heeled sandals are your best friend on grass.",
  "Help me build a capsule wardrobe":
    "Start with five neutrals: white tee, black trousers, dark denim, a blazer, and a versatile dress or chino. From there, add 3–4 statement pieces in colours you love. Everything should mix and match.",
  "Smart-casual for a Friday office look":
    "Dark slim chinos + a merino crewneck + clean leather sneakers or loafers. Swap the sneakers for Chelsea boots if you want a sharper edge. Keep accessories minimal.",
  "What to wear to a rooftop dinner?":
    "Think elevated but effortless — a silk slip dress, wide-leg trousers with a fitted top, or linen separates. Add a light layer for when the breeze picks up after sunset.",
};

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

  // Guest preview state
  const [guestMessages, setGuestMessages] = useState<Message[]>([]);
  const [guestTyping, setGuestTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI personas from API
  const { data: apiPersonas = [] } = useQuery<AiPersona[]>({
    queryKey: ["/api/v1/ai-personas"],
  });

  // Merge API personas with local AI-generated avatars
  const availablePersonas = Array.isArray(apiPersonas) && apiPersonas.length > 0
    ? apiPersonas.map((apiPersona) => {
        const localPersona = personas.find(p => p.id === apiPersona.id);
        return { ...apiPersona, avatarUrl: localPersona?.avatarUrl || apiPersona.avatarUrl };
      })
    : personas;

  const createSessionMutation = useMutation({
    mutationFn: async (personaId: string) => {
      if (!userId) return null;
      const res = await apiRequest("POST", "/api/v1/ai-sessions", {
        userId, personaId, messages: [], userContext: {}
      });
      return res.json();
    },
    onSuccess: (session: any) => {
      if (session) setSessionId(session.id);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!sessionId || !userId) return null;
      const res = await apiRequest("POST", `/api/v1/ai-sessions/${sessionId}/messages`, {
        message, userId
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/ai-sessions", sessionId] });
    }
  });

  const { data: session } = useQuery<ChatSession>({
    queryKey: ["/api/v1/ai-sessions", sessionId],
    enabled: !!sessionId
  });

  const messages = session?.messages || [];

  useEffect(() => {
    if (userId && selectedPersona) {
      createSessionMutation.mutate(selectedPersona.id);
    }
  }, [selectedPersona.id, userId]);

  const handleGuestPrompt = (prompt: string) => {
    const userMsg: Message = { role: "user", content: prompt, timestamp: new Date() };
    setGuestMessages([userMsg]);
    setGuestTyping(true);
    setTimeout(() => {
      const replyText =
        guestPreviewReplies[prompt] ||
        "Great question! I'd love to help you put together the perfect look for that.";
      const replyMsg: Message = { role: "assistant", content: replyText, timestamp: new Date() };
      const nudgeMsg: Message = {
        role: "assistant",
        content: "✨ Sign in to continue this conversation and get personalised recommendations tailored to your wardrobe and style.",
        timestamp: new Date(),
      };
      setGuestMessages([userMsg, replyMsg, nudgeMsg]);
      setGuestTyping(false);
    }, 1200);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    if (!userId) {
      handleGuestPrompt(messageText);
      return;
    }
    if (!sessionId) return;
    setInput("");
    await sendMessageMutation.mutateAsync(messageText);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, guestMessages, guestTyping]);

  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      {/* ── HERO ── */}
      <section className="px-6 md:px-10 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
            {/* Left: hero copy + chat */}
            <div>
              <p className="text-[10px] tracking-[0.2em] text-foreground/50 uppercase mb-5 flex items-center gap-3">
                <span className="w-8 h-px bg-foreground/30 inline-block" />
                Concierge
              </p>
              <h1
                className="font-display font-600 leading-[0.9] text-foreground mb-3"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
              >
                Ask what<br />
                to wear.
              </h1>
              <p className="text-foreground/50 text-base lg:text-lg mb-6 max-w-sm leading-relaxed">
                Your AI style advisor, on call. Pick a stylist and start a conversation.
              </p>

              {/* Mobile: compact horizontal stylist picker */}
              <div className="lg:hidden mb-6">
                <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-3">Choose Stylist</p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                  {availablePersonas.map((persona: any) => (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona)}
                      className={`flex-shrink-0 rounded-2xl px-3 py-2 transition-all flex items-center gap-2 border ${
                        selectedPersona.id === persona.id
                          ? "bg-[#0B1340] text-white border-transparent shadow-md"
                          : "bg-white text-foreground border-foreground/8 hover:shadow-sm"
                      }`}
                    >
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        <AvatarImage src={persona.avatarUrl} />
                        <AvatarFallback className={selectedPersona.id === persona.id ? "bg-white/10 text-white text-xs" : "text-xs"}>
                          {persona.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`text-xs font-600 whitespace-nowrap ${selectedPersona.id === persona.id ? "text-white" : "text-foreground"}`}>
                        {persona.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick prompt pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={!!userId && !sessionId}
                    className="bg-white rounded-full px-4 py-2 text-xs text-foreground/70 hover:text-foreground border border-foreground/10 hover:border-foreground/20 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat window */}
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col" style={{ height: 440 }}>
                {/* Chat header */}
                <div className="bg-[#0B1340] px-6 py-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-white/20">
                    <AvatarImage src={selectedPersona.avatarUrl} />
                    <AvatarFallback className="bg-white/10 text-white">{selectedPersona.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display font-600 text-white text-base leading-tight">{selectedPersona.name}</p>
                    <p className="text-xs text-white/50">{selectedPersona.specialty}</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-6 py-4">
                  {(() => {
                    const displayMessages = userId ? messages : guestMessages;
                    if (displayMessages.length === 0 && !guestTyping) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center py-8">
                          <div className="w-12 h-12 rounded-full bg-[#2236E8]/10 flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-[#2236E8]" />
                          </div>
                          <p className="text-sm text-foreground/50 max-w-xs">
                            {userId
                              ? `Hi! I'm ${selectedPersona.name}. Ask me anything about style, outfits, or what to wear.`
                              : "Tap a style question above to see what your AI stylist would say."}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-4">
                        {displayMessages.map((message, i) => {
                          const isNudge = !userId && message.role === "assistant" && i === displayMessages.length - 1 && message.content.startsWith("✨");
                          return (
                            <div
                              key={i}
                              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                              data-testid={`message-${i}`}
                            >
                              {message.role === 'assistant' && (
                                <Avatar className="w-7 h-7 flex-shrink-0">
                                  <AvatarImage src={selectedPersona.avatarUrl} />
                                  <AvatarFallback>{selectedPersona.name[0]}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                                {isNudge ? (
                                  <div className="bg-[#0B1340] rounded-2xl px-4 py-3 text-sm text-white">
                                    <p className="mb-3">{message.content}</p>
                                    <a
                                      href="/login?returnTo=/ai-stylist"
                                      className="inline-flex items-center gap-1.5 bg-white text-[#0B1340] text-xs font-600 tracking-widest uppercase rounded-full px-4 py-2 hover:bg-white/90 transition-colors"
                                    >
                                      <Lock className="w-3 h-3" />
                                      Sign in to continue
                                    </a>
                                  </div>
                                ) : (
                                  <>
                                    <div className={`inline-block px-4 py-3 rounded-2xl text-sm ${
                                      message.role === 'user'
                                        ? 'bg-[#0B1340] text-white'
                                        : 'bg-foreground/5 text-foreground'
                                    }`}>
                                      {message.content}
                                    </div>
                                    <p className="text-[10px] text-foreground/30 mt-1">
                                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* Typing indicator for guest preview */}
                        {guestTyping && (
                          <div className="flex gap-3">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                              <AvatarImage src={selectedPersona.avatarUrl} />
                              <AvatarFallback>{selectedPersona.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="bg-foreground/5 rounded-2xl px-4 py-3 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    );
                  })()}
                </ScrollArea>

                {/* Input */}
                <div className="px-4 py-4 border-t border-foreground/5">
                  {userId ? (
                    <div className="flex gap-2 bg-foreground/4 rounded-full px-4 py-2">
                      <Input
                        placeholder={`Ask ${selectedPersona.name} for style advice…`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sendMessageMutation.isPending && handleSend()}
                        disabled={sendMessageMutation.isPending}
                        className="border-0 shadow-none bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-foreground/30"
                        data-testid="input-chat-message"
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={sendMessageMutation.isPending || !input.trim()}
                        className="w-8 h-8 rounded-full bg-[#2236E8] hover:bg-[#2236E8]/90 disabled:opacity-40 transition-colors flex items-center justify-center flex-shrink-0"
                        data-testid="button-send-message"
                      >
                        {sendMessageMutation.isPending
                          ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          : <Send className="w-3.5 h-3.5 text-white" />
                        }
                      </button>
                    </div>
                  ) : (
                    <a
                      href="/login?returnTo=/ai-stylist"
                      className="flex items-center justify-center gap-2 w-full bg-[#0B1340] hover:bg-[#0B1340]/90 text-white text-xs font-600 tracking-widest uppercase rounded-full px-4 py-3 transition-colors"
                      data-testid="guest-signin-cta"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Sign in to chat with your stylist
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: stylist selector */}
            <div>
              <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-4">Choose Your Stylist</p>
              <div className="space-y-2">
                {availablePersonas.map((persona: any) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona)}
                    className={`w-full text-left rounded-2xl px-4 py-3 transition-all flex items-center gap-3 ${
                      selectedPersona.id === persona.id
                        ? 'bg-[#0B1340] text-white shadow-md'
                        : 'bg-white text-foreground hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                    data-testid={`button-persona-${persona.id}`}
                  >
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarImage src={persona.avatarUrl} />
                      <AvatarFallback className={selectedPersona.id === persona.id ? 'bg-white/10 text-white' : ''}>
                        {persona.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={`font-600 text-sm leading-tight ${selectedPersona.id === persona.id ? 'text-white' : 'text-foreground'}`}>
                        {persona.name}
                      </p>
                      <p className={`text-xs truncate ${selectedPersona.id === persona.id ? 'text-white/50' : 'text-foreground/40'}`}>
                        {persona.specialty}
                      </p>
                    </div>
                    {selectedPersona.id === persona.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2236E8] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Sign-in nudge for logged-out users */}
              {!userId && (
                <div className="mt-5 bg-[#0B1340] rounded-2xl p-5 text-white">
                  <p className="text-[9px] text-white/40 tracking-widest uppercase mb-2">Unlock the full experience</p>
                  <p className="font-display font-600 text-base mb-3 leading-tight">Sign in to start chatting with your personal stylist.</p>
                  <a href="/login?returnTo=/ai-stylist">
                    <Button className="w-full rounded-full bg-white text-[#0B1340] text-xs tracking-widest uppercase hover:bg-white/90">
                      Sign in
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <StyleCTA />
    </div>
  );
}
