import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/lib/customer-auth";

/** Sticky bottom-right CTA card — used on every inner page.
 *  Guests see "Build your style profile / Request Access".
 *  Logged-in members see "Start a chat with your concierge". */
export function StyleCTA() {
  const { customer, isLoading } = useCustomerAuth();

  // Don't render anything while auth state is resolving
  if (isLoading) return null;

  if (customer) {
    return (
      <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-5 w-56 z-40">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Your concierge</p>
        <p className="font-display text-xl font-600 text-foreground mb-3 leading-tight">Ready to help you.</p>
        <Link href="/ai-stylist">
          <Button className="w-full rounded-full bg-[#2236E8] hover:bg-[#2236E8]/90 text-white text-xs tracking-widest uppercase py-4">
            Start a Chat
          </Button>
        </Link>
      </div>
    );
  }

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
