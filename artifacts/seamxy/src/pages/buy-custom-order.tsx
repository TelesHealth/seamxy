import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Zap, Scissors, MessageSquare, ArrowLeft, DollarSign, Truck, Shield } from "lucide-react";

export default function BuyCustomOrder() {
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
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-700 text-foreground mb-6">
              Buy or Custom Order
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose your perfect path: Quick Buy from top retailers with one tap, or commission custom-made pieces from verified tailors worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="px-8" data-testid="button-quick-buy">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Buy
                </Button>
              </Link>
              <Link href="/makers">
                <Button size="lg" variant="outline" className="px-8" data-testid="button-find-makers">
                  <Scissors className="w-5 h-5 mr-2" />
                  Find Makers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-700 text-foreground mb-12 text-center">
            Two Ways to Get Perfectly Fitting Clothes
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Buy Path */}
            <Card className="border-2">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-3xl">Quick Buy</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Shop ready-to-wear from top retailers
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="font-600 text-lg mb-4">Best For:</h3>
                <ul className="space-y-3 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Immediate needs (fast shipping)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Standard sizing with minor adjustments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Budget-conscious shoppers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Popular styles and trends</span>
                  </li>
                </ul>

                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-primary" />
                      <span className="font-600">Fast Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ships within 1-3 days from major retailers
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-600">Competitive Prices</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We compare prices across retailers to find you the best deals
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-600">Easy Returns</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standard retailer return policies apply
                    </p>
                  </div>
                </div>

                <Link href="/shop">
                  <Button className="w-full mt-6" size="lg" data-testid="button-browse-shop">
                    Browse Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Custom Order Path */}
            <Card className="border-2 border-primary/50">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-3xl">Custom Order</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Commission bespoke pieces from verified makers
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="font-600 text-lg mb-4">Best For:</h3>
                <ul className="space-y-3 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Perfect fit guarantee</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Unique designs and personalization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Hard-to-fit body types</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Special occasions (weddings, events)</span>
                  </li>
                </ul>

                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <span className="font-600">Direct Communication</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chat with makers to discuss your vision
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-600">Verified Makers</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All tailors are vetted with portfolios and reviews
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-primary" />
                      <span className="font-600">Timeline: 2-6 weeks</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Timeframe varies by complexity and maker location
                    </p>
                  </div>
                </div>

                <Link href="/makers">
                  <Button className="w-full mt-6" size="lg" data-testid="button-browse-makers">
                    Browse Makers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How Custom Orders Work */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-700 text-foreground mb-12 text-center">
            Custom Order Process
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Browse Makers",
                description: "View portfolios, reviews, and specialties of verified tailors worldwide"
              },
              {
                step: "2",
                title: "Submit Request",
                description: "Describe what you want and share your measurements with selected makers"
              },
              {
                step: "3",
                title: "Review Quotes",
                description: "Receive custom quotes with pricing, timeline, and fabric options"
              },
              {
                step: "4",
                title: "Place Order",
                description: "Approve a quote and work with your maker to create your perfect piece"
              }
            ].map((item) => (
              <Card key={item.step}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-700 mb-4">
                    {item.step}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-700 text-foreground mb-12 text-center">
            Quick Comparison
          </h2>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-4 text-left font-600">Feature</th>
                      <th className="p-4 text-center font-600">Quick Buy</th>
                      <th className="p-4 text-center font-600">Custom Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4">Delivery Time</td>
                      <td className="p-4 text-center">1-3 days</td>
                      <td className="p-4 text-center">2-6 weeks</td>
                    </tr>
                    <tr>
                      <td className="p-4">Price Range</td>
                      <td className="p-4 text-center">$20-$300</td>
                      <td className="p-4 text-center">$100-$1000+</td>
                    </tr>
                    <tr>
                      <td className="p-4">Fit Guarantee</td>
                      <td className="p-4 text-center">AI-predicted</td>
                      <td className="p-4 text-center">100% custom</td>
                    </tr>
                    <tr>
                      <td className="p-4">Personalization</td>
                      <td className="p-4 text-center">Limited</td>
                      <td className="p-4 text-center">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4">Returns</td>
                      <td className="p-4 text-center">Standard policy</td>
                      <td className="p-4 text-center">Alterations included</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-700 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Whether you need something now or want the perfect custom piece, we've got you covered
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8"
                data-testid="button-shop-cta"
              >
                Shop Now
              </Button>
            </Link>
            <Link href="/makers">
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 backdrop-blur-md bg-black/20 text-white hover:bg-black/30 border border-white/30"
                data-testid="button-makers-cta"
              >
                Explore Makers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
