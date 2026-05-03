import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from './jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  req.user = payload;
  next();
};

/**
 * Ensures the request is scoped to a specific workspace.
 * If workspaceId is provided in the body or query, it must match the user's workspaceId.
 */
export const scopeWorkspace = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Safely read body — may be undefined on GET requests
  const body = req.body || {};
  const workspaceId = body.workspaceId || req.query.workspaceId || req.params.workspaceId;
  
  if (workspaceId && workspaceId !== req.user?.workspaceId) {
    return res.status(403).json({ error: 'Forbidden: Access to this workspace is denied' });
  }

  // Inject workspaceId into request body if not present
  if (!req.body) req.body = {};
  if (!req.body.workspaceId) {
    req.body.workspaceId = req.user?.workspaceId;
  }

  next();
};
