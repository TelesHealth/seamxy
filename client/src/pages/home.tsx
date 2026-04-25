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

      {/* Virtual Try-On Feature Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Virtual Try-On</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                See it on you before you buy
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Upload a photo and try on any item from our shop. See exactly how
                it fits your body — no guessing, no returns.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Upload your photo or use a pre-built model",
                  "Try on tops, bottoms, dresses and more",
                  "See size recommendations based on your measurements",
                  "Share your looks and get feedback from friends",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/upload">
                <Button size="lg" data-testid="button-tryon-homepage">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Try It On Now
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                No account needed to start
              </p>
            </div>

            {/* Right: Visual mockup */}
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl">
                <div className="bg-gray-800 rounded-2xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900" />
                  <div className="relative z-10 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-white/60 text-sm">Upload your photo</p>
                    <p className="text-white/40 text-xs mt-1">or choose a model</p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-medium">Recommended Size</span>
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <div className="mt-1 h-1 bg-white/20 rounded-full">
                      <div className="h-1 bg-green-400 rounded-full" style={{ width: "88%" }} />
                    </div>
                    <p className="text-white/60 text-xs mt-1">88% confidence · Great fit</p>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-3">
                  {["Tops", "Bottoms", "Dresses"].map((cat) => (
                    <div key={cat} className="text-gray-400 text-xs">{cat}</div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-bold shadow-lg">
                AI-Powered
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
