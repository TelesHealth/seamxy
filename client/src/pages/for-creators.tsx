import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  BarChart, 
  Zap,
  Heart,
  Bot,
  ChevronRight
} from "lucide-react";

export default function ForCreators() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea1c8347?w=1920&q=80"
            alt="Fashion Creator"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Badge className="mb-6 text-base bg-primary/20 text-white border-white/30 backdrop-blur-sm" data-testid="badge-creator-studio">
            Creator Studio
          </Badge>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-800 text-white mb-6">
            Turn Your Fashion Expertise
            <br />
            <span className="text-primary-foreground">Into Recurring Revenue</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12">
            Join SeamXY's Creator Studio and monetize your style expertise through subscriptions, tips, custom requests, and AI-powered stylist clones that work 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/supplier/register">
              <Button 
                size="lg" 
                className="text-lg backdrop-blur-md bg-white/90 text-foreground border border-white/20"
                data-testid="button-join-now"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Join as Creator
              </Button>
            </Link>
            <Link href="/creators">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg backdrop-blur-md bg-black/20 text-white border border-white/30"
                data-testid="button-browse-creators"
              >
                <Users className="w-5 h-5 mr-2" />
                Browse Creators
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { value: "80%", label: "Revenue Split (You Keep)" },
              { value: "4", label: "Income Streams" },
              { value: "24/7", label: "AI Clone Working" },
            ].map((stat, i) => (
              <div key={i} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6" data-testid={`stat-${i}`}>
                <div className="text-4xl font-800 text-white mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
              Why Creators Choose SeamXY
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete monetization platform built specifically for fashion professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "80/20 Revenue Split",
                description: "You keep 80% of all earnings. Industry-leading creator compensation with transparent payouts.",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Multiple Income Streams",
                description: "Earn from subscriptions ($4.99-$14.99/mo), tips, custom styling requests, and AI consultations.",
              },
              {
                icon: <Bot className="w-8 h-8" />,
                title: "AI Stylist Clone",
                description: "Create a personalized AI version of yourself that chats with clients 24/7, earning while you sleep.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Subscription Tiers",
                description: "Create multiple tiers with exclusive content, benefits, and pricing to match your audience.",
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Tips & Donations",
                description: "Let your biggest fans support you directly with one-time tips and recurring donations.",
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Custom Requests",
                description: "Accept personalized styling requests, set your own prices, and deliver premium consultations.",
              },
              {
                icon: <BarChart className="w-8 h-8" />,
                title: "Analytics Dashboard",
                description: "Track subscribers, revenue, engagement, and growth with detailed analytics and insights.",
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Public Profile",
                description: "Beautiful creator profiles with your portfolio, tiers, and content - all discoverable by shoppers.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Payouts",
                description: "Automated monthly payouts via Stripe. No minimum balance, no hidden fees.",
              },
            ].map((benefit, i) => (
              <Card key={i} className="p-6 hover-elevate" data-testid={`benefit-card-${i}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-display text-xl font-600 text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
              Start Earning in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              Get your creator studio up and running in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up as a designer, complete your profile, and showcase your portfolio. It's free to start.",
              },
              {
                step: "02",
                title: "Set Up Your Tiers",
                description: "Create subscription tiers with your pricing ($4.99-$14.99/mo), benefits, and exclusive content.",
              },
              {
                step: "03",
                title: "Start Earning",
                description: "Share your creator link, build your audience, and watch the recurring revenue roll in automatically.",
              },
            ].map((step, i) => (
              <div key={i} className="relative" data-testid={`step-${i}`}>
                <Card className="p-8 h-full">
                  <div className="text-6xl font-800 text-primary/20 mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-display text-2xl font-600 text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income Potential */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-700 text-foreground mb-4">
              Your Earning Potential
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what creators are earning with different subscription models
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                tier: "Starter",
                price: "$4.99",
                subscribers: "100",
                monthly: "$399",
                yearly: "$4,788",
                description: "Great for building your initial audience",
              },
              {
                tier: "Professional",
                price: "$9.99",
                subscribers: "250",
                monthly: "$1,998",
                yearly: "$23,976",
                description: "The sweet spot for most creators",
                featured: true,
              },
              {
                tier: "Premium",
                price: "$14.99",
                subscribers: "500",
                monthly: "$5,996",
                yearly: "$71,952",
                description: "Top-tier creators with loyal followings",
              },
            ].map((example, i) => (
              <Card 
                key={i} 
                className={`p-8 ${example.featured ? 'border-primary border-2 shadow-lg' : ''}`}
                data-testid={`income-example-${i}`}
              >
                {example.featured && (
                  <Badge className="mb-4 bg-primary text-primary-foreground">Most Popular</Badge>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-display text-2xl font-600 text-foreground mb-2">
                    {example.tier}
                  </h3>
                  <div className="text-4xl font-800 text-primary mb-1">
                    {example.price}<span className="text-lg text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{example.subscribers} subscribers</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground">Monthly (80%)</span>
                    <span className="font-600 text-foreground">{example.monthly}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground">Yearly (80%)</span>
                    <span className="font-700 text-lg text-foreground">{example.yearly}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center border-t pt-4">
                  {example.description}
                </p>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
            * Earnings shown reflect 80% creator split from subscriptions only. Additional income from tips, custom requests, and AI consultations not included.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-700 mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join hundreds of fashion creators building sustainable income on SeamXY. It's free to start, and you can begin earning from day one.
          </p>
          <Link href="/supplier/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg"
              data-testid="button-join-creator-studio"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Join Creator Studio Now
            </Button>
          </Link>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>80% revenue share</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
