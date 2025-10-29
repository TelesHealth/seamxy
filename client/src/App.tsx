import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { SupplierAuthProvider } from "@/lib/supplier-auth";
import { CustomerAuthProvider } from "@/lib/customer-auth";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Onboarding from "@/pages/onboarding";
import Shop from "@/pages/shop";
import Makers from "@/pages/makers";
import AiStylist from "@/pages/ai-stylist";
import CustomRequest from "@/pages/custom-request";
import MyRequests from "@/pages/my-requests";
import MakerDashboard from "@/pages/maker-dashboard";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

// How It Works Pages
import MeasureDescribe from "@/pages/measure-describe";
import SmartMatching from "@/pages/smart-matching";
import BuyCustomOrder from "@/pages/buy-custom-order";

// Supplier Portal Pages
import SupplierLogin from "@/pages/supplier/login";
import SupplierRegister from "@/pages/supplier/register";
import SupplierDashboard from "@/pages/supplier/dashboard";
import SupplierProducts from "@/pages/supplier/products";
import SupplierIntegrations from "@/pages/supplier/integrations";
import SupplierOrders from "@/pages/supplier/orders";
import SupplierAnalytics from "@/pages/supplier/analytics";
import SupplierMessages from "@/pages/supplier/messages";
import SupplierPortfolio from "@/pages/supplier/portfolio";
import SupplierCollections from "@/pages/supplier/collections";
import SupplierRequests from "@/pages/supplier/requests";
import { SupplierLayout } from "@/pages/supplier/layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/shop" component={Shop} />
      <Route path="/makers" component={Makers} />
      <Route path="/custom-request" component={CustomRequest} />
      <Route path="/my-requests" component={MyRequests} />
      <Route path="/maker-dashboard" component={MakerDashboard} />
      <Route path="/ai-stylist" component={AiStylist} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      {/* How It Works Pages */}
      <Route path="/how-it-works/measure-describe" component={MeasureDescribe} />
      <Route path="/how-it-works/smart-matching" component={SmartMatching} />
      <Route path="/how-it-works/buy-custom-order" component={BuyCustomOrder} />
      
      {/* Supplier Portal Routes (No Header) */}
      <Route path="/supplier/login" component={SupplierLogin} />
      <Route path="/supplier/register" component={SupplierRegister} />
      <Route path="/supplier/dashboard">
        <SupplierLayout><SupplierDashboard /></SupplierLayout>
      </Route>
      <Route path="/supplier/products">
        <SupplierLayout><SupplierProducts /></SupplierLayout>
      </Route>
      <Route path="/supplier/integrations">
        <SupplierLayout><SupplierIntegrations /></SupplierLayout>
      </Route>
      <Route path="/supplier/orders">
        <SupplierLayout><SupplierOrders /></SupplierLayout>
      </Route>
      <Route path="/supplier/analytics">
        <SupplierLayout><SupplierAnalytics /></SupplierLayout>
      </Route>
      <Route path="/supplier/messages">
        <SupplierLayout><SupplierMessages /></SupplierLayout>
      </Route>
      <Route path="/supplier/portfolio">
        <SupplierLayout><SupplierPortfolio /></SupplierLayout>
      </Route>
      <Route path="/supplier/collections">
        <SupplierLayout><SupplierCollections /></SupplierLayout>
      </Route>
      <Route path="/supplier/requests">
        <SupplierLayout><SupplierRequests /></SupplierLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerAuthProvider>
        <SupplierAuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Header />
              <main>
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </SupplierAuthProvider>
      </CustomerAuthProvider>
    </QueryClientProvider>
  );
}
