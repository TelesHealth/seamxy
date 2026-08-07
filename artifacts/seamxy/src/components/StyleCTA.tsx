import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/** Sticky bottom-right "Build your style profile." CTA card — used on every inner page */
export function StyleCTA() {
  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-5 w-56 z-40">
      <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Ready when you are</p>
      <p className="font-display text-xl font-600 text-foreground mb-3 leading-tight">Build your style profile.</p>
      <Link href="/signup">
        <Button className="w-full rounded-full bg-[#CC1519] hover:bg-[#CC1519]/90 text-white text-xs tracking-widest uppercase py-4">
          Request Access
        </Button>
      </Link>
    </div>
  );
}
