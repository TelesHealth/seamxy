import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/** Sticky CTA — bottom bar on mobile, corner card on desktop */
export function StyleCTA() {
  return (
    <>
      {/* Mobile: slim full-width bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-foreground/8 shadow-lg px-5 py-3 z-40 flex items-center justify-between gap-4">
        <p className="font-display text-sm font-600 text-foreground leading-tight">Build your style profile.</p>
        <Link href="/signup">
          <Button className="rounded-full bg-[#2236E8] hover:bg-[#2236E8]/90 text-white text-xs tracking-widest uppercase px-5 py-2 flex-shrink-0">
            Request Access
          </Button>
        </Link>
      </div>

      {/* Desktop: corner card */}
      <div className="hidden sm:block fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-5 w-56 z-40">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Ready when you are</p>
        <p className="font-display text-xl font-600 text-foreground mb-3 leading-tight">Build your style profile.</p>
        <Link href="/signup">
          <Button className="w-full rounded-full bg-[#2236E8] hover:bg-[#2236E8]/90 text-white text-xs tracking-widest uppercase py-4">
            Request Access
          </Button>
        </Link>
      </div>
    </>
  );
}
