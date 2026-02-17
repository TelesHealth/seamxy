import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shirt, ChevronRight, Calendar, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
            alt="Fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-800 text-white mb-6 leading-tight">
            Know exactly what to wear
            <br />
            <span className="text-white/90">for any moment</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-4">
            Get outfit ideas for real situations. No account needed. No guesswork.
          </p>
          <p className="text-sm text-white/60 mb-10">
            Try it — takes 30 seconds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/get-outfit-ideas">
              <Button
                size="lg"
                className="px-8 py-6 text-lg backdrop-blur-md bg-white/90 text-foreground border border-white/20"
                data-testid="button-get-outfit-ideas"
              >
                <Shirt className="w-5 h-5 mr-2" />
                Get Outfit Ideas
              </Button>
            </Link>
          </div>
          <div className="mt-6">
            <Link href="/for-creators">
              <span className="text-white/60 text-sm underline underline-offset-4 cursor-pointer hover:text-white/80 transition-colors" data-testid="link-makers-creators">
                For Makers & Creators
                <ChevronRight className="w-3 h-3 inline ml-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-700 text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No sign-ups, no measurements, no quizzes upfront. Just pick a situation and see what works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-10 h-10" />,
                step: "1",
                title: "Pick a situation",
                description: "Date night, work meeting, weekend brunch — tell us what you're dressing for.",
              },
              {
                icon: <Sparkles className="w-10 h-10" />,
                step: "2",
                title: "Choose your vibe",
                description: "Polished, bold, relaxed — or skip this and we'll show you a mix.",
              },
              {
                icon: <Shirt className="w-10 h-10" />,
                step: "3",
                title: "See outfits that work",
                description: "Get complete outfit ideas with styling tips and the reasoning behind each look.",
              },
            ].map((item, i) => (
              <Card key={i} className="p-8 text-center" data-testid={`card-step-${i}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-600 text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/get-outfit-ideas">
              <Button size="lg" data-testid="button-get-started-bottom">
                Get Outfit Ideas
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              No account needed to get started
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
