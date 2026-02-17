import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Sparkles, Shirt, Heart, Send, ChevronRight, ArrowLeft } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
              How SeamXY works
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Get outfit ideas that actually make sense for your life. No sign-up needed to start.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                step: "1",
                title: "Pick a situation",
                description: "Tell us what you're dressing for — a work meeting, a date, weekend brunch, or anything else. You can also type in your own situation.",
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                step: "2",
                title: "Choose a vibe (optional)",
                description: "Want to look polished? Bold? Relaxed? Pick the energy you're going for, or skip this and we'll show you a range of options.",
              },
              {
                icon: <Shirt className="w-8 h-8" />,
                step: "3",
                title: "See complete outfits",
                description: "We'll put together full outfit ideas with specific items, styling tips, and an explanation of why each look works for your situation.",
              },
              {
                icon: <Heart className="w-8 h-8" />,
                step: "4",
                title: "Save what you like",
                description: "Heart your favorite looks during your session. Want to keep them? Create a free account and your picks are saved automatically.",
              },
              {
                icon: <Send className="w-8 h-8" />,
                step: "5",
                title: "Get them sent to you",
                description: "Need your outfits on your phone when you're getting ready? We'll email them to you — no account required.",
              },
            ].map((item, i) => (
              <Card key={i} className="p-6" data-testid={`card-how-step-${i}`}>
                <div className="flex gap-5 items-start">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-600 text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/get-outfit-ideas">
              <Button size="lg" data-testid="button-try-it">
                Try It Now
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              No account needed. No measurements required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
