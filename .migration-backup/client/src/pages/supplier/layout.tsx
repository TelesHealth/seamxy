import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SupplierSidebar } from '@/components/supplier-sidebar';
import { useSupplierAuth } from '@/lib/supplier-auth';
import { Loader2 } from 'lucide-react';

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export function SupplierLayout({ children }: SupplierLayoutProps) {
  const { supplier, isLoading } = useSupplierAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !supplier) {
      setLocation('/supplier/login');
    }
  }, [supplier, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!supplier) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem"
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <SupplierSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {supplier.email}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
