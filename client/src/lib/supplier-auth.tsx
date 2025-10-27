import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

type SupplierRole = 'retailer' | 'tailor' | 'designer';
type SupplierTier = 'basic' | 'pro' | 'enterprise';

interface SupplierAccount {
  id: string;
  email: string;
  businessName: string;
  role: SupplierRole;
  tier: SupplierTier;
  isActive: boolean;
  isVerified: boolean;
  onboardingCompleted: boolean;
}

interface SupplierProfile {
  id: string;
  supplierId: string;
  businessAddress: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  logo: string | null;
  certifications: string[] | null;
  specialties: string[] | null;
  minOrderValue: number | null;
  maxLeadTimeDays: number | null;
}

interface SupplierAuthContextType {
  supplier: SupplierAccount | null;
  profile: SupplierProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSupplier: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  businessName: string;
  role: SupplierRole;
  tier?: SupplierTier;
}

const SupplierAuthContext = createContext<SupplierAuthContextType | undefined>(undefined);

export function SupplierAuthProvider({ children }: { children: ReactNode }) {
  const [supplier, setSupplier] = useState<SupplierAccount | null>(null);
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const refreshSupplier = async () => {
    try {
      const response = await fetch('/api/v1/supplier/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSupplier(data.supplier);
        setProfile(data.profile);
      } else {
        setSupplier(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch supplier:', error);
      setSupplier(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSupplier();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/v1/supplier/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setSupplier(data.supplier);
    await refreshSupplier();
  };

  const register = async (data: RegisterData) => {
    const response = await fetch('/api/v1/supplier/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const responseData = await response.json();
    setSupplier(responseData.supplier);
    await refreshSupplier();
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server session
      await fetch('/api/v1/supplier/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and redirect
      setSupplier(null);
      setProfile(null);
      setLocation('/supplier/login');
    }
  };

  return (
    <SupplierAuthContext.Provider
      value={{ supplier, profile, isLoading, login, register, logout, refreshSupplier }}
    >
      {children}
    </SupplierAuthContext.Provider>
  );
}

export function useSupplierAuth() {
  const context = useContext(SupplierAuthContext);
  if (context === undefined) {
    throw new Error('useSupplierAuth must be used within a SupplierAuthProvider');
  }
  return context;
}
