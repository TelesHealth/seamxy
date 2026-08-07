import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, User } from "lucide-react";
import seamxyLogo from "@assets/seamxy-logo.png";
import { useCustomerAuth } from "@/lib/customer-auth";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/system", label: "SYSTEM" },
  { href: "/get-outfit-ideas", label: "FIND LOOK" },
  { href: "/style-quiz", label: "QUIZ" },
  { href: "/inspo", label: "INSPO" },
  { href: "/ai-stylist", label: "CONCIERGE" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/upload", label: "TRY-ON" },
  { href: "/closet", label: "CLOSET" },
];

export function Header() {
  const [location] = useLocation();
  const { customer, logout } = useCustomerAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <>
      {/* Desktop floating nav */}
      <header className="sticky top-0 z-50 px-4 pt-4 hidden md:block">
        <div className="max-w-[1100px] mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] px-4 py-2.5 flex items-center gap-4">
          {/* Logo */}
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <img src={seamxyLogo} alt="SeamXY" className="h-5 opacity-90" />
            </span>
          </Link>

          {/* Nav items */}
          <nav className="flex items-center gap-0.5 mx-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`
                    px-3 py-1.5 rounded-full text-[11px] font-500 tracking-widest cursor-pointer transition-all duration-150
                    ${isActive(item.href)
                      ? "bg-navy text-white"
                      : "text-foreground/60 hover:text-foreground hover:bg-black/5"
                    }
                  `}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {customer ? (
              <>
                <Link href="/onboarding">
                  <span className="text-[11px] text-muted-foreground tracking-widest cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {customer.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-[11px] text-muted-foreground tracking-widest hover:text-foreground transition-colors flex items-center gap-1"
                  data-testid="button-logout"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </>
            ) : (
              <Link href="/login">
                <span className="text-[11px] text-muted-foreground tracking-widest cursor-pointer hover:text-foreground transition-colors mr-1" data-testid="button-login-header">
                  SIGN IN
                </span>
              </Link>
            )}
            <Link href="/signup">
              <span className="bg-navy hover:bg-navy/90 text-white text-[11px] tracking-widest font-500 rounded-full px-5 py-2 cursor-pointer transition-colors" data-testid="button-start-styling">
                START STYLING
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <header className="sticky top-0 z-50 px-3 pt-3 md:hidden">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <img src={seamxyLogo} alt="SeamXY" className="h-4" />
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/signup">
              <span className="bg-navy text-white text-[10px] tracking-widest font-500 rounded-full px-4 py-1.5 cursor-pointer">
                START STYLING
              </span>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1" data-testid="button-mobile-menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-4">
            <div className="grid grid-cols-2 gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    onClick={() => setMobileOpen(false)}
                    className={`
                      block px-3 py-2 rounded-xl text-[11px] font-500 tracking-widest cursor-pointer transition-all
                      ${isActive(item.href)
                        ? "bg-navy text-white"
                        : "text-foreground/60 hover:bg-black/5 hover:text-foreground"
                      }
                    `}
                    data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
            {customer && (
              <div className="border-t mt-3 pt-3 flex items-center justify-between">
                <Link href="/onboarding">
                  <span className="text-xs text-muted-foreground">{customer.name}</span>
                </Link>
                <button onClick={logout} className="text-xs text-muted-foreground flex items-center gap-1" data-testid="button-mobile-logout">
                  <LogOut className="w-3 h-3" /> Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
