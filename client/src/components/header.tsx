import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Sparkles, Shield, Scissors, Package, LogOut, LogIn } from "lucide-react";
import seamxyLogo from "@assets/Seamxy_1761527023424.png";
import { useCustomerAuth } from "@/lib/customer-auth";

export function Header() {
  const [location] = useLocation();
  const { customer, logout } = useCustomerAuth();

  const navItems = [
    { href: "/", label: "Home", icon: null },
    { href: "/shop", label: "Shop", icon: <ShoppingBag className="w-4 h-4 mr-2" /> },
    { href: "/makers", label: "Makers", icon: <Scissors className="w-4 h-4 mr-2" /> },
    { href: "/my-requests", label: "My Requests", icon: <Package className="w-4 h-4 mr-2" /> },
    { href: "/ai-stylist", label: "AI Stylist", icon: <Sparkles className="w-4 h-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <span className="flex items-center hover-elevate px-3 py-2 rounded-lg cursor-pointer">
              <img src={seamxyLogo} alt="SeamXY" className="h-8" />
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="gap-2"
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Link href="/admin/login">
              <Button variant="ghost" size="icon" data-testid="nav-admin">
                <Shield className="w-5 h-5" />
              </Button>
            </Link>
            
            {customer ? (
              <>
                <Link href="/onboarding">
                  <Button variant="outline" data-testid="nav-profile">
                    <User className="w-4 h-4 mr-2" />
                    {customer.name}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login-header">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" data-testid="button-signup-header">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
