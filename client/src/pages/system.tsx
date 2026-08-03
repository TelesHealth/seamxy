import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import seamxyLogo from "@assets/seamxy-logo.png";

export default function SystemPage() {
  return (
    <div className="min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-8 w-full grid md:grid-cols-2 gap-16 items-center py-20">
        {/* Left */}
        <div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-600 text-foreground leading-[0.9] mb-8">
            Everything needed to get dressed, in one place.
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md leading-relaxed">
            Closet, fit, events, weather, inspiration, shopping gaps, and advisor guidance move together.
          </p>
          <div className="flex gap-4">
            <Link href="/get-outfit-ideas">
              <Button className="rounded-full px-7 py-5 bg-[#0B1340] hover:bg-[#0B1340]/90 text-white text-sm tracking-widest uppercase font-500">
                Try the Finder
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full px-7 py-5 text-sm tracking-widest uppercase font-500 border-foreground/20">
                See Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Feature cards */}
        <div className="relative h-[480px]">
          <div className="absolute top-0 left-0 w-52 h-52 bg-white rounded-3xl shadow-xl flex items-center justify-center">
            <img src={seamxyLogo} alt="SeamXY" className="h-12 opacity-80" />
          </div>
          <div className="absolute top-8 right-0 w-48 h-14 bg-white/80 backdrop-blur rounded-full shadow-lg flex items-center justify-center">
            <span className="text-sm font-500 text-foreground tracking-wide">FIT LOGIC</span>
          </div>
          <div className="absolute bottom-24 right-8 w-52 h-14 bg-white/80 backdrop-blur rounded-full shadow-lg flex items-center justify-center">
            <span className="text-sm font-500 text-foreground tracking-wide">INSPIRATION</span>
          </div>
          <div className="absolute bottom-4 left-8 bg-white rounded-2xl shadow-xl px-5 py-4">
            <span className="text-sm font-600 text-foreground tracking-wide">DIGITAL STYLE CONCIERGE</span>
          </div>
          <div className="absolute top-32 left-16 w-56 h-64 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80"
              alt="Closet"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Build CTA */}
      <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-5 w-56">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Ready when you are</p>
        <p className="font-display text-xl font-600 text-foreground mb-3 leading-tight">Build your style profile.</p>
        <Link href="/signup">
          <Button className="w-full rounded-full bg-[#2236E8] hover:bg-[#2236E8]/90 text-white text-xs tracking-widest uppercase py-4">
            Request Access
          </Button>
        </Link>
      </div>
    </div>
  );
}
