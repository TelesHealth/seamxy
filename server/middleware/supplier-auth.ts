import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { storage } from '../storage';

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      supplierId?: string;
      supplierRole?: 'retailer' | 'tailor' | 'designer';
      supplierTier?: 'basic' | 'pro' | 'enterprise';
    }
  }
}

// Extend session data
declare module 'express-session' {
  interface SessionData {
    supplierId?: string;
    userId?: string;
    adminId?: string;
  }
}

/**
 * Authenticate supplier and attach supplier data to request
 * This middleware should be used for all supplier portal routes
 */
export async function authenticateSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if session middleware is configured
    // @ts-ignore
    if (!req.session) {
      console.error('Session middleware not configured. Supplier authentication requires express-session.');
      return res.status(500).json({ 
        error: 'Session not configured',
        details: 'Server configuration error. Contact administrator.'
      });
    }
    
    // @ts-ignore
    const supplierId = req.session.supplierId;
    
    if (!supplierId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const supplier = await storage.getSupplierAccount(supplierId);
    
    if (!supplier) {
      return res.status(401).json({ error: 'Invalid supplier account' });
    }
    
    if (!supplier.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Attach supplier data to request
    req.supplierId = supplier.id;
    req.supplierRole = supplier.role;
    req.supplierTier = supplier.tier;
    
    next();
  } catch (error) {
    console.error('Supplier authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Require specific supplier role(s)
 * @param allowedRoles Array of allowed roles
 */
export function requireRole(...allowedRoles: Array<'retailer' | 'tailor' | 'designer'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.supplierRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.supplierRole)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
}

/**
 * Require specific supplier tier(s)
 * @param allowedTiers Array of allowed tiers
 */
export function requireTier(...allowedTiers: Array<'basic' | 'pro' | 'enterprise'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.supplierTier) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedTiers.includes(req.supplierTier)) {
      return res.status(403).json({ 
        error: `Upgrade required. Required tiers: ${allowedTiers.join(', ')}` 
      });
    }
    
    next();
  };
}

/**
 * Require verified supplier account
 */
export async function requireVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.supplierId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const supplier = await storage.getSupplierAccount(req.supplierId);
  
  if (!supplier?.isVerified) {
    return res.status(403).json({ 
      error: 'Account verification required. Please complete verification process.' 
    });
  }
  
  next();
}

/**
 * Require completed onboarding
 */
export async function requireOnboarding(req: Request, res: Response, next: NextFunction) {
  if (!req.supplierId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const supplier = await storage.getSupplierAccount(req.supplierId);
  
  if (!supplier?.onboardingCompleted) {
    return res.status(403).json({ 
      error: 'Onboarding incomplete. Please complete your profile setup.' 
    });
  }
  
  next();
}

/**
 * Hash password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 * @param password Plain text password
 * @param hash Bcrypt hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with isValid and errors array
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
