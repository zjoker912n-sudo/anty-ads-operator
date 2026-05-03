import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index';
import { users, workspaces } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../auth/jwt';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, workspaceName } = req.body;

  if (!email || !password || !workspaceName) {
    return res.status(400).json({ error: 'Email, password, and workspace name are required' });
  }

  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create Workspace
    const [workspace] = await db.insert(workspaces).values({
      name: workspaceName,
      plan: 'free',
    }).returning();

    // Create User
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      workspaceId: workspace.id,
      role: 'admin',
    }).returning();

    const token = generateToken({ 
      userId: user.id, 
      workspaceId: workspace.id, 
      role: 'admin' 
    });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        workspaceId: workspace.id, 
        role: 'admin' 
      } 
    });
  } catch (error: any) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ 
      userId: user.id, 
      workspaceId: user.workspaceId || '', 
      role: user.role as any
    });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        workspaceId: user.workspaceId, 
        role: user.role 
      } 
    });
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

