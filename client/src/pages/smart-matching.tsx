import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Ruler, Palette, DollarSign, ArrowLeft, Target, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SmartMatching() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-6">
              <TrendingUp className="w-12 h-12" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-700 text-foreground mb-6">
              Smart Matching
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Our AI-powered scoring system analyzes every product against your unique profile, giving you transparent scores so you know exactly how well each item matches your needs.
            </p>
            <Link href="/shop">
              <Button size="lg" className="px-8" data-testid="button-browse-products">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Scoring Algorithm */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-700 text-foreground mb-12 text-center">
            Three-Part Scoring System
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl">Fit Score</CardTitle>
                </div>
                <div className="text-4xl font-700 text-primary">50%</div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The most important factor. We compare the item's size chart against your measurements to predict how well it will fit your body.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Chest/Bust</span>
                    <span className="text-foreground">±2cm tolerance</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waist</span>
                    <span className="text-foreground">±3cm tolerance</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hips</span>
                    <span className="text-foreground">±3cm tolerance</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Length</span>
                    <span className="text-foreground">±2cm tolerance</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Palette className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl">Style Match</CardTitle>
                </div>
                <div className="text-4xl font-700 text-primary">30%</div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI analyzes how well the product aligns with your style description, considering aesthetics, occasion, and preferences.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Color palette matching</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Design style alignment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Occasion suitability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Fabric preferences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl">Budget Match</CardTitle>
                </div>
                <div className="text-4xl font-700 text-primary">20%</div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  How well the item's price fits within your specified budget range for this category.
                </p>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex justify-between mb-1 text-muted-foreground">
                      <span>Perfect Match</span>
                      <span className="text-foreground">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Within your ideal range</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-muted-foreground">
                      <span>Good Value</span>
                      <span className="text-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Slightly outside range</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-muted-foreground">
                      <span>Premium</span>
                      <span className="text-foreground">50%</span>
                    </div>
                    <Progress value={50} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Above budget but worth it</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Example Score Calculation */}
          <Card className="bg-muted/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Example Score Calculation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-background p-6 rounded-lg">
                  <h4 className="font-600 text-lg mb-4">Product: Classic Cotton T-Shirt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Fit Score</span>
                        <span className="font-600">92/100</span>
                      </div>
                      <Progress value={92} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">Perfect chest & shoulder fit</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Style Match</span>
                        <span className="font-600">85/100</span>
                      </div>
                      <Progress value={85} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">Matches casual preference</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Budget Match</span>
                        <span className="font-600">100/100</span>
                      </div>
                      <Progress value={100} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">Within budget range</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-600">Overall Match Score</span>
                      <span className="text-3xl font-700 text-primary">
                        {Math.round(92 * 0.5 + 85 * 0.3 + 100 * 0.2)}/100
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      = (92 × 50%) + (85 × 30%) + (100 × 20%)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why It Works */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-700 text-foreground">
                  Why This Works Better
                </h2>
                <p className="text-muted-foreground">
                  Traditional online shopping vs. SeamXY's approach
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-destructive">Traditional Shopping</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-destructive mr-2">✗</span>
                      <span>Generic size labels (S, M, L) vary by brand</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-destructive mr-2">✗</span>
                      <span>No way to know if style matches your taste</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-destructive mr-2">✗</span>
                      <span>Guessing if price is worth it</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-destructive mr-2">✗</span>
                      <span>High return rates (30-40%)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-destructive mr-2">✗</span>
                      <span>Time wasted browsing unsuitable items</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-primary">SeamXY Smart Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Precise fit prediction based on your measurements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>AI-powered style matching to your preferences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Transparent budget alignment scoring</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Dramatically reduced returns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Only see items that actually work for you</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-700 mb-6">
            Experience Smart Matching
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            See personalized scores for every item in our catalog
          </p>
          <Link href="/shop">
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8"
              data-testid="button-start-shopping"
            >
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
