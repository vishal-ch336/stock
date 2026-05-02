import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';

/**
 * Apply Clerk middleware to parse & attach auth state to every request.
 * Mount this in index.ts before all routes.
 */
export const clerkAuth = clerkMiddleware();

/**
 * Requires that the request comes from a signed-in Clerk user.
 * Returns 401 if not authenticated.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ message: 'Authentication required. Please sign in.' });
    return;
  }

  next();
};

/**
 * Requires that the signed-in user has { role: "manager" } in their
 * Clerk publicMetadata. Returns 403 if role is missing.
 */
export const requireManager = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({ message: 'Authentication required. Please sign in.' });
    return;
  }

  const role = (auth.sessionClaims?.publicMetadata as Record<string, string> | undefined)?.role;

  if (role !== 'manager') {
    res.status(403).json({ message: 'Manager access required for this action.' });
    return;
  }

  next();
};
