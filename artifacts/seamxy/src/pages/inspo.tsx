import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const editorials = [
  {
    label: "WARDROBE",
    headline: "Start with the pieces that never leave.",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80",
  },
  {
    label: "TEXTURE",
    headline: "Structure, softness — the contrast is the point.",
    img: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&q=80",
  },
  {
    label: "OCCASION",
    headline: "Occasion pieces, made everyday.",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
  },
  {
    label: "WORKWEAR",
    headline: "Structure that moves with you.",
    img: "https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=600&q=80",
  },
  {
    label: "MINIMAL",
    headline: "Less noise. More intention.",
    img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
  },
];

export default function InspoPage() {
  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="font-display text-5xl md:text-6xl font-600 text-foreground leading-tight">
            Style intelligence,<br />
            <em className="text-[#CC1519]">visually.</em>
          </h1>
        </div>

        {/* Horizontal scroll editorial strip */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
          {editorials.map((item, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-56 h-80 rounded-3xl overflow-hidden cursor-pointer group snap-start"
            >
              <img
                src={item.img}
                alt={item.headline}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] text-white/70 tracking-widest uppercase mb-1">{item.label}</p>
                <p className="font-display text-white text-xl font-600 leading-tight">{item.headline}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Curated sections */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2">This week</p>
            <h2 className="font-display text-3xl font-600 text-foreground mb-3">Quiet luxury, revisited.</h2>
            <p className="text-muted-foreground text-sm mb-6">Cream base, black structure, soft trouser, minimal shoe, one chrome accent.</p>
            <Link href="/get-outfit-ideas">
              <Button className="rounded-full bg-[#CC1519] text-white text-xs tracking-widest uppercase px-6">
                Find My Look
              </Button>
            </Link>
          </div>
          <div className="bg-[#111111] rounded-3xl p-8">
            <p className="text-[10px] tracking-widest uppercase text-white/50 mb-2">Trending</p>
            <h2 className="font-display text-3xl font-600 text-white mb-3">Power Workwear moment.</h2>
            <p className="text-white/60 text-sm mb-6">Meetings, travel, and client dinners — one wardrobe that does all three.</p>
            <Link href="/get-outfit-ideas">
              <Button variant="outline" className="rounded-full border-white/30 text-white text-xs tracking-widest uppercase px-6 hover:bg-white/10">
                Explore Looks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Build CTA */}
      <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-5 w-56">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Ready when you are</p>
        <p className="font-display text-xl font-600 text-foreground mb-3 leading-tight">Build your style profile.</p>
        <Link href="/signup">
          <Button className="w-full rounded-full bg-[#CC1519] hover:bg-[#CC1519]/90 text-white text-xs tracking-widest uppercase py-4">
            Request Access
          </Button>
        </Link>
      </div>
    </div>
  );
}
