import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Shield, LogOut, LogIn, Briefcase, Menu, Shirt, HelpCircle, ShoppingBag, LayoutDashboard, Scissors, Package, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import seamxyLogo from "@assets/Seamxy_1761527023424.png";
import { useCustomerAuth } from "@/lib/customer-auth";

export function Header() {
  const [location] = useLocation();
  const { customer, logout } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loggedOutNavItems = [
    { href: "/get-outfit-ideas", label: "Get Outfit Ideas", icon: <Shirt className="w-4 h-4 mr-2" /> },
    { href: "/how-it-works", label: "How It Works", icon: <HelpCircle className="w-4 h-4 mr-2" /> },
  ];

  const loggedInNavItems = [
    { href: "/get-outfit-ideas", label: "Get Outfit Ideas", icon: <Shirt className="w-4 h-4 mr-2" /> },
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { href: "/shop", label: "Shop", icon: <ShoppingBag className="w-4 h-4 mr-2" /> },
    { href: "/closet", label: "My Closet", icon: <Scissors className="w-4 h-4 mr-2" /> },
    { href: "/my-requests", label: "My Requests", icon: <Package className="w-4 h-4 mr-2" /> },
  ];

  const navItems = customer ? loggedInNavItems : loggedOutNavItems;

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <span className="flex items-center hover-elevate px-3 py-2 rounded-lg cursor-pointer">
              <img src={seamxyLogo} alt="SeamXY" className="h-8" />
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="gap-2"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {customer && (
              <>
                <Link href="/supplier/login">
                  <Button variant="ghost" size="sm" data-testid="nav-supplier">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Supplier Portal
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="ghost" size="icon" data-testid="nav-admin">
                    <Shield className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            )}

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
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login-header">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={location === item.href ? "secondary" : "ghost"}
                          className="w-full justify-start gap-2"
                          onClick={handleNavClick}
                          data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {item.icon}
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t" />

                  {customer && (
                    <>
                      <div className="flex flex-col gap-2">
                        <Link href="/ai-stylist">
                          <Button variant="ghost" className="w-full justify-start" onClick={handleNavClick} data-testid="nav-mobile-ai-stylist">
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Stylist
                          </Button>
                        </Link>
                        <Link href="/style-quiz">
                          <Button variant="ghost" className="w-full justify-start" onClick={handleNavClick} data-testid="nav-mobile-style-quiz">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Style Quiz
                          </Button>
                        </Link>
                        <Link href="/makers">
                          <Button variant="ghost" className="w-full justify-start" onClick={handleNavClick} data-testid="nav-mobile-makers">
                            <Scissors className="w-4 h-4 mr-2" />
                            Makers
                          </Button>
                        </Link>
                        <Link href="/for-creators">
                          <Button variant="ghost" className="w-full justify-start" onClick={handleNavClick} data-testid="nav-mobile-for-creators">
                            <Sparkles className="w-4 h-4 mr-2" />
                            For Creators
                          </Button>
                        </Link>
                      </div>

                      <div className="border-t" />

                      <div className="flex flex-col gap-2">
                        <Link href="/supplier/login">
                          <Button variant="ghost" className="w-full justify-start" onClick={handleNavClick} data-testid="nav-mobile-supplier">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Supplier Portal
                          </Button>
                        </Link>
                        <Link href="/admin/login">
                          <Button variant="ghost" className="w-full justify-start" onClick={handleNavClick} data-testid="nav-mobile-admin">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Portal
                          </Button>
                        </Link>
                      </div>

                      <div className="border-t" />
                    </>
                  )}

                  {customer ? (
                    <div className="flex flex-col gap-2">
                      <Link href="/onboarding">
                        <Button variant="outline" className="w-full justify-start" onClick={handleNavClick} data-testid="nav-mobile-profile">
                          <User className="w-4 h-4 mr-2" />
                          {customer.name}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logout();
                          handleNavClick();
                        }}
                        className="w-full justify-start"
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login">
                        <Button variant="ghost" className="w-full justify-start" onClick={handleNavClick} data-testid="button-mobile-login">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
