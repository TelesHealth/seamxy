import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

type Demographic = 'men' | 'women' | 'young_adults' | 'children';

interface Customer {
  id: string;
  email: string;
  name: string;
  demographic: Demographic;
  budgetMin: number;
  budgetMax: number;
  styleTags: string[];
  lifestyle?: string;
  preferredBrands?: string[];
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshCustomer: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  demographic: Demographic;
  budgetMin?: number;
  budgetMax?: number;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const refreshCustomer = async () => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCustomer();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/v1/auth/login', {
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
    setCustomer(data);
  };

  const register = async (data: RegisterData) => {
    const response = await fetch('/api/v1/auth/register', {
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
    setCustomer(responseData);
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server session
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and redirect
      setCustomer(null);
      setLocation('/login');
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{ customer, isLoading, login, register, logout, refreshCustomer }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
