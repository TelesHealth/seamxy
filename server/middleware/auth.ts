import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

// Simple auth middleware (in production, use JWT tokens)
export async function requireUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // For now, we'll use a simple email in header approach
  // In production, implement proper JWT authentication
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ error: "Invalid user" });
  }

  req.user = { id: user.id, email: user.email };
  next();
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
