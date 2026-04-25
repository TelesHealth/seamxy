# SeamXY — Make Virtual Try-On More Prominent
## Replit Agent Instructions: Surface TryFit Throughout the App

These instructions make the virtual try-on feature more visible and prominent
across SeamXY. Follow each phase in order.

---

## PHASE 1: Add Try-On Section to Homepage

Open `client/src/pages/home.tsx` (the anonymous homepage with the situational
styling engine — the file that has the "Know exactly what to wear" headline).

Find the section after the "How it works" three-card grid and BEFORE the
bottom CTA section. Add this new section between them:

```tsx
{/* Virtual Try-On Feature Section */}
<section className="py-16 px-4 bg-muted/30">
  <div className="max-w-4xl mx-auto">
    <div className="grid md:grid-cols-2 gap-10 items-center">
      {/* Left: Text */}
      <div>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <span>✨</span>
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
        <a
          href="/upload"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Try It On Now
        </a>
        <p className="text-xs text-muted-foreground mt-3">
          No account needed to start
        </p>
      </div>

      {/* Right: Visual mockup */}
      <div className="relative">
        <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl">
          <div className="bg-gray-800 rounded-2xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-center relative">
            {/* Simulated try-on canvas */}
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
            {/* Floating size badge */}
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
          {/* Bottom controls */}
          <div className="flex justify-center gap-4 mt-3">
            {["Tops", "Bottoms", "Dresses"].map((cat) => (
              <div key={cat} className="text-gray-400 text-xs">{cat}</div>
            ))}
          </div>
        </div>
        {/* Decorative badge */}
        <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-bold shadow-lg">
          AI-Powered
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## PHASE 2: Add Try-On to Navigation

Open `client/src/components/header.tsx`.

Find the logged-in navigation items array. It currently has items like
Dashboard, Shop, Closet, My Requests, AI Stylist, etc.

Add "Try On" as a nav item for logged-in users:

```tsx
{ label: "Try On", href: "/upload", icon: Camera }
```

Make sure to import `Camera` from `lucide-react` if it isn't already imported.

For logged-OUT users (the anonymous nav), also add it after "Get Outfit Ideas":

```tsx
{ label: "Try On", href: "/upload" }
```

---

## PHASE 3: Make Try-On Button More Visible on Product Cards

Open the product card component (likely `client/src/components/product-card.tsx`
or wherever the shop product cards are rendered).

Find the "Try On" button on each product card. Currently it's likely small and
secondary. Update it to be more prominent:

```tsx
{/* Make Try On the PRIMARY button, Quick Buy secondary */}
<div className="flex gap-2 mt-3">
  <button
    onClick={handleTryOn}
    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
  >
    <Camera className="w-4 h-4" />
    Try On
  </button>
  <a
    href={product.externalUrl || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-1 bg-muted text-foreground px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
  >
    Buy
  </a>
</div>
```

If the current button layout is different, adapt this to match the existing
structure — the key change is making "Try On" the visually dominant action.

---

## PHASE 4: Add Try-On Quick Action to Style Dashboard

Open `client/src/pages/style-dashboard.tsx` (or `dashboard.tsx`).

Find the quick action cards section near the top of the dashboard. Add a
"Try Something On" card:

```tsx
<a
  href="/upload"
  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all group"
>
  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
    <Camera className="w-6 h-6 text-primary" />
  </div>
  <div>
    <p className="font-semibold">Virtual Try-On</p>
    <p className="text-sm text-muted-foreground">See clothes on your body</p>
  </div>
  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
</a>
```

Import `Camera` and `ChevronRight` from `lucide-react` if not already imported.

---

## PHASE 5: Add Try-On Entry Point to Shop Page Header

Open `client/src/pages/shop.tsx`.

Find the page header section (the "Shop Perfect Fits" headline area). Add a
small Try-On banner below the headline:

```tsx
<div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6">
  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
    <Camera className="w-4 h-4 text-primary" />
  </div>
  <p className="text-sm">
    <span className="font-medium">Want to see how it looks on you?</span>
    <span className="text-muted-foreground"> Click "Try On" on any item below.</span>
  </p>
  <a href="/upload" className="ml-auto text-sm text-primary font-medium whitespace-nowrap hover:underline">
    Upload Photo →
  </a>
</div>
```

---

## PHASE 6: TypeScript Check and Push

```bash
npm run check
```

Fix any TypeScript errors. Then commit and push:

```bash
git add .
git commit -m "feat: make virtual try-on more prominent across SeamXY"
git push origin main
```

---

## Summary of Files Modified

| File | Change |
|---|---|
| `client/src/pages/home.tsx` | Added Try-On feature section with visual mockup |
| `client/src/components/header.tsx` | Added Try-On nav link for logged-in and logged-out users |
| `client/src/components/product-card.tsx` | Made Try-On the primary CTA on product cards |
| `client/src/pages/style-dashboard.tsx` | Added Try-On quick action card |
| `client/src/pages/shop.tsx` | Added Try-On banner to shop page header |

## Do Not Touch
- `client/src/lib/tpsWarp.ts`
- `server/services/anthropic.ts`
- `vercel.json`
- Any file in the `Z` folder
