import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setJoined(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-[calc(100vh-88px)] flex items-center px-6 md:px-10 py-10">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-[1fr_1.1fr] gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-[10px] tracking-[0.2em] text-foreground/50 uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-foreground/30 inline-block" />
              Fashion Intelligence for Real Life
            </p>
            <h1 className="font-display font-600 leading-[0.88] text-foreground mb-6" style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}>
              Find the outfit.<br />
              Feel the <em className="text-[#2236E8] not-italic" style={{ fontStyle: "italic" }}>shift.</em>
            </h1>
            <p className="text-foreground/60 text-lg mb-8 max-w-sm leading-relaxed">
              SeamXY turns your closet, calendar, fit, and taste into one intelligent style system.
            </p>
            <div className="flex gap-3 mb-8">
              <Link href="/get-outfit-ideas">
                <Button
                  className="rounded-full px-7 py-5 bg-[#0B1340] hover:bg-[#0B1340]/90 text-white text-xs tracking-widest uppercase font-500"
                  data-testid="button-find-my-look"
                >
                  Find My Look
                </Button>
              </Link>
              <Link href="/system">
                <Button
                  variant="outline"
                  className="rounded-full px-7 py-5 text-xs tracking-widest uppercase font-500 border-foreground/20 hover:bg-foreground/5"
                  data-testid="button-enter-seamxy"
                >
                  Enter SeamXY
                </Button>
              </Link>
            </div>
            {/* Email capture */}
            {joined ? (
              <p className="text-sm text-[#2236E8] font-500">You're on the list ✓</p>
            ) : (
              <form onSubmit={handleJoin} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for early access"
                  className="flex-1 bg-white/70 border border-white/60 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#2236E8]/40 placeholder:text-foreground/40"
                />
                <button
                  type="submit"
                  className="bg-[#2236E8] hover:bg-[#2236E8]/90 text-white text-xs tracking-widest uppercase font-500 rounded-full px-5 py-3 transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>

          {/* Right: photo collage */}
          <div className="relative h-[520px] hidden md:block">
            {/* Main tall image */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[260px] h-[420px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80"
                alt="Closet"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Second image offset right */}
            <div className="absolute right-0 bottom-0 w-[200px] h-[340px] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80"
                alt="Style"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-3 right-3">
                <span className="bg-black/60 backdrop-blur text-white text-[9px] tracking-widest uppercase rounded-full px-3 py-1">
                  Style OS
                </span>
                <p className="font-display text-white text-lg font-600 mt-1 leading-tight px-1">Your wardrobe becomes searchable</p>
              </div>
            </div>
            {/* Floating label cards */}
            <div className="absolute top-6 left-0 bg-white rounded-2xl shadow-lg px-4 py-3 w-44">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-[#0B1340] rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-[9px]">S</span>
                </div>
                <div>
                  <div className="w-12 h-1.5 bg-foreground/20 rounded-full mb-1" />
                  <div className="w-8 h-1.5 bg-foreground/10 rounded-full" />
                </div>
              </div>
            </div>
            {/* Closet Intelligence label */}
            <div className="absolute bottom-32 left-0 bg-white/90 backdrop-blur rounded-2xl shadow-lg p-4 w-52">
              <p className="text-[9px] tracking-widest uppercase text-muted-foreground mb-1">Closet Intelligence</p>
              <p className="font-display text-base font-600 text-foreground leading-tight">From overload to outfit in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature slides */}
      <section className="px-6 md:px-10 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                label: "FIT LOGIC",
                title: "Outfits built around how you actually fit.",
                desc: "Your measurements, proportions, and preferences shape every recommendation.",
                href: "/get-outfit-ideas",
                cta: "Find Your Look",
                dark: false,
              },
              {
                label: "CLOSET FIRST",
                title: "Style what you already own first.",
                desc: "Upload your wardrobe and SeamXY shows you what you already have to work with.",
                href: "/closet",
                cta: "Manage Closet",
                dark: true,
              },
              {
                label: "CONCIERGE",
                title: "Ask what to wear. Get a real answer.",
                desc: "Type your situation, your mood, or your event and get a styled response in seconds.",
                href: "/ai-stylist",
                cta: "Ask SeamXY",
                dark: false,
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`rounded-3xl p-8 flex flex-col justify-between min-h-[280px] ${
                  card.dark ? "bg-[#0B1340] text-white" : "bg-white"
                }`}
              >
                <div>
                  <p className={`text-[10px] tracking-widest uppercase mb-4 ${card.dark ? "text-white/40" : "text-foreground/40"}`}>
                    {card.label}
                  </p>
                  <h3 className={`font-display text-2xl font-600 leading-tight mb-3 ${card.dark ? "text-white" : "text-foreground"}`}>
                    {card.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${card.dark ? "text-white/60" : "text-muted-foreground"}`}>
                    {card.desc}
                  </p>
                </div>
                <Link href={card.href}>
                  <Button
                    className={`mt-6 rounded-full text-xs tracking-widest uppercase px-6 ${
                      card.dark
                        ? "bg-white text-[#0B1340] hover:bg-white/90"
                        : "bg-[#0B1340] text-white hover:bg-[#0B1340]/90"
                    }`}
                  >
                    {card.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz promo */}
      <section className="px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1fr] shadow-sm">
            <div className="p-10 flex flex-col justify-center">
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3">Style Quiz</p>
              <h2 className="font-display text-4xl md:text-5xl font-600 text-foreground leading-tight mb-4">
                A quiz that feels like taste, not paperwork.
              </h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Aesthetic, color preferences, fit style, lifestyle — answered in minutes.
              </p>
              <Link href="/style-quiz">
                <Button className="rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase px-7 py-5 w-fit">
                  Take the Quiz
                </Button>
              </Link>
            </div>
            <div className="bg-[#0B1340] p-10 flex flex-col justify-center">
              <div className="bg-white/10 rounded-2xl p-5 mb-4 w-fit">
                <p className="text-[10px] text-white/50 tracking-widest uppercase mb-2">Style Quiz</p>
                <p className="font-display text-white text-lg font-600 mb-4">How should your clothes make you feel?</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Polished", "Magnetic", "Easeful", "Bold"].map((v) => (
                    <span key={v} className="border border-white/20 text-white text-xs text-center rounded-full py-1.5 px-3">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                {["Sign up", "Choose taste", "Add context", "Preview"].map((step, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 flex-1 text-center">
                    <p className="text-white text-xs font-500">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try-On */}
      <section className="px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3">Virtual Try-On</p>
            <h2 className="font-display text-4xl md:text-5xl font-600 text-foreground leading-tight mb-4">
              See it on you before you own it.
            </h2>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs leading-relaxed">
              Upload a photo, try on any item. Three steps: selfie, fit prediction, swap items.
            </p>
            <div className="flex gap-3 mb-6">
              {[["01", "Self", "Preview yourself"], ["02", "Fit", "Use predictions"], ["03", "Swap", "Change the item"]].map(
                ([num, title, desc]) => (
                  <div key={num} className="bg-white rounded-2xl p-4 flex-1 shadow-sm">
                    <p className="text-[9px] text-muted-foreground mb-1">{num}</p>
                    <p className="font-display text-lg font-600 text-foreground">{title}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                )
              )}
            </div>
            <Link href="/upload">
              <Button className="rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase px-7 py-5">
                Try It On
              </Button>
            </Link>
          </div>
          <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
              alt="Try on"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 text-[10px] tracking-widest uppercase font-500 shadow">
              Predicted Fit
            </div>
            <div className="absolute bottom-4 left-4 bg-white rounded-2xl px-4 py-3">
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase mb-1">Swap Item</p>
              <div className="flex gap-2">
                {["#2d2d2d", "#e8d5b0", "#9b8fd6", "#6baad6"].map((c) => (
                  <div key={c} className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closet */}
      <section className="px-6 md:px-10 py-12 pb-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1fr] gap-10 items-center">
          <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-xl order-2 md:order-1">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
              alt="Closet"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B1340]/80 to-transparent p-6">
              <p className="text-[9px] text-white/60 tracking-widest uppercase mb-1">Closet Management</p>
              <p className="font-display text-white text-2xl font-600 leading-tight">Style what they already own first.</p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3">Sustainable Styling</p>
            <h2 className="font-display text-4xl md:text-5xl font-600 text-foreground leading-tight mb-4">
              Your closet. Intelligent.
            </h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs leading-relaxed">
              Upload, tag, and organize everything you own. SeamXY learns what you wear, what you skip, and what you need.
            </p>
            <div className="flex gap-4">
              <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm">
                <p className="text-[9px] text-muted-foreground tracking-widest uppercase mb-2">Free Tier</p>
                <p className="font-display text-xl font-600 text-foreground mb-1">Work With What You Have</p>
                <p className="text-xs text-muted-foreground">Basic outfit ideas, weekly edits, closet gaps.</p>
              </div>
              <div className="bg-[#0B1340] rounded-2xl p-5 flex-1">
                <p className="text-[9px] text-white/50 tracking-widest uppercase mb-2">Premium</p>
                <p className="font-display text-xl font-600 text-white mb-1">Style My Closet</p>
                <p className="text-xs text-white/60">Advisor audit, capsule planning, curated shopping, and consults.</p>
              </div>
            </div>
            <Link href="/closet">
              <Button className="mt-6 rounded-full bg-[#0B1340] text-white text-xs tracking-widest uppercase px-7 py-5">
                Open My Closet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Build CTA sticky */}
      <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-5 w-56 z-40">
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
