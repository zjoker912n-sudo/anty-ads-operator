import jwt from 'jsonwebtoken';
import { Role } from './permissions';

const JWT_SECRET = process.env.JWT_SECRET || 'operator-ai-secret-key-123';

export interface TokenPayload {
  userId: string;
  workspaceId: string;
  role: Role;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
