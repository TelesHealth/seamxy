import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  userId?: string;
}

// Session-based customer authentication middleware
export async function requireUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Check if session middleware is configured
    // @ts-ignore
    if (!req.session) {
      console.error('Session middleware not configured');
      return res.status(500).json({ 
        error: 'Session not configured',
        details: 'Server configuration error. Contact administrator.'
      });
    }
    
    // @ts-ignore
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid user account' });
    }
    
    // Attach user data to request
    req.userId = user.id;
    req.user = { id: user.id, email: user.email };
    
    next();
  } catch (error) {
    console.error('Customer authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const adminId = req.headers['x-admin-id'] as string;
  
  if (!adminId) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  const admin = await storage.getAdminUser(adminId);
  if (!admin || !admin.isActive) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  req.user = { id: admin.id, email: admin.email, role: admin.role };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
