import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Ruler, MessageSquare, Brain, ArrowLeft } from "lucide-react";

export default function MeasureDescribe() {
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
              <Sparkles className="w-12 h-12" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-700 text-foreground mb-6">
              Measure & Describe
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The foundation of your perfect fit journey starts here. Our AI understands your unique measurements and style preferences in your own words.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="px-8" data-testid="button-start-measuring">
                Start Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-700 text-foreground mb-12 text-center">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl">Enter Your Measurements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Provide key body measurements like chest, waist, hips, inseam, and more. Our guided measurement tool makes it easy to capture accurate data.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Step-by-step measurement guide with visual aids</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Metric and imperial unit support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Optional measurements for enhanced accuracy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Save multiple profiles for different fit preferences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl">Describe Your Style</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Tell us what you're looking for in your own words. No fashion jargon required – just describe your ideal clothing naturally.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Use everyday language to describe your preferences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Mention colors, fabrics, occasions, or feelings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Reference styles you love or want to avoid</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Include fit preferences (loose, fitted, oversized)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Understanding */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-700 text-foreground">
                  AI-Powered Understanding
                </h2>
                <p className="text-muted-foreground">
                  GPT-5 analyzes your descriptions to understand exactly what you want
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-600 text-lg text-foreground mb-2">Example Input:</h3>
                    <p className="text-muted-foreground italic bg-muted/50 p-4 rounded-md">
                      "I need a comfortable summer dress, something flowy and breathable. I love earthy tones like terracotta and olive. Not too short, maybe midi length. Perfect for casual weekend brunches."
                    </p>
                  </div>

                  <div>
                    <h3 className="font-600 text-lg text-foreground mb-3">AI Analysis Extracts:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { label: "Category", value: "Dresses" },
                        { label: "Style", value: "Casual, Flowy" },
                        { label: "Season", value: "Summer" },
                        { label: "Colors", value: "Terracotta, Olive, Earth Tones" },
                        { label: "Length", value: "Midi" },
                        { label: "Fabric", value: "Breathable, Light" },
                        { label: "Occasion", value: "Casual, Brunch" },
                        { label: "Fit", value: "Comfortable, Not Fitted" },
                      ].map((item) => (
                        <div key={item.label} className="bg-background/50 p-3 rounded-md">
                          <div className="text-sm text-muted-foreground">{item.label}</div>
                          <div className="font-500 text-foreground">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-700 text-foreground mb-8 text-center">
              Pro Tips for Best Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Be Specific</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The more details you provide about your measurements and preferences, the better our AI can match you with perfect items.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Use Your Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Don't worry about fashion terminology. Describe things the way you naturally would – our AI understands everyday language.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Often</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your style and measurements may change. Keep your profile updated to ensure you always get the most relevant recommendations.
                  </p>
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
            Ready to Create Your Profile?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Start by entering your measurements and style preferences
          </p>
          <Link href="/onboarding">
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8"
              data-testid="button-create-profile"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
