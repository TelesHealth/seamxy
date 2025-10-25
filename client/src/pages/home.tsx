import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Scissors, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Hero Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
            alt="Fashion Hero"
            className="w-full h-full object-cover"
          />
          {/* Dark wash gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-800 text-white mb-6">
            Find Clothes That
            <br />
            <span className="text-primary-foreground">Actually Fit</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12">
            AI-powered personal styling meets precision fit matching. Shop ready-to-wear or connect with custom makers for perfectly tailored clothing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg backdrop-blur-md bg-white/90 text-foreground hover:bg-white border border-white/20"
                data-testid="button-shop-now"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
            </Link>
            <Link href="/makers">
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg backdrop-blur-md bg-black/20 text-white hover:bg-black/30 border border-white/30"
                data-testid="button-find-maker"
              >
                <Scissors className="w-5 h-5 mr-2" />
                Find a Maker
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
              How PerfectFit Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to perfectly fitting clothes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-12 h-12" />,
                title: "Measure & Describe",
                description: "Enter your measurements and tell us your style in your own words. Our AI understands exactly what you're looking for.",
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "Smart Matching",
                description: "Get scored recommendations based on fit (50%), style (30%), and budget (20%). Every item shows exactly how well it matches you.",
              },
              {
                icon: <ShoppingBag className="w-12 h-12" />,
                title: "Buy or Custom Order",
                description: "Quick Buy from top retailers with one tap, or request custom-made pieces from verified tailors worldwide.",
              },
            ].map((step, i) => (
              <Card key={i} className="p-8 text-center hover-elevate">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                  {step.icon}
                </div>
                <h3 className="font-display text-2xl font-600 text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demographics Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
              For Everyone
            </h2>
            <p className="text-lg text-muted-foreground">
              Personalized fit matching for every demographic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { demo: "men", title: "Men", image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80" },
              { demo: "women", title: "Women", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" },
              { demo: "young_adults", title: "Young Adults", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80" },
              { demo: "children", title: "Children", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80" },
            ].map((cat) => (
              <Link key={cat.demo} href={`/shop?demographic=${cat.demo}`}>
                <Card className="overflow-hidden hover-elevate cursor-pointer group">
                  <div className="aspect-[3/4] relative">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <h3 className="font-display text-3xl font-700 text-white p-6">
                        {cat.title}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-700 mb-6">
            Ready to Find Your Perfect Fit?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands who've stopped guessing sizes and started wearing clothes that actually fit.
          </p>
          <Link href="/onboarding">
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8 py-6 text-lg"
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
