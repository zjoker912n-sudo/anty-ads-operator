import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index';
import { users, workspaces, adAccounts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { generateToken } from '../auth/jwt';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { encrypt, decrypt } from '../utils/crypto';
import { authenticate, AuthRequest } from '../auth/middleware';

const router = express.Router();

// Google OAuth Setup
const googleClient = new OAuth2Client(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  `${process.env.APP_URL}/api/auth/google/callback`
);

// Meta OAuth Setup
const META_CLIENT_ID = process.env.META_CLIENT_ID;
const META_CLIENT_SECRET = process.env.META_CLIENT_SECRET;
const META_REDIRECT_URI = `${process.env.APP_URL}/api/meta/callback`;

/**
 * GET /api/auth/google
 * Redirects to Google OAuth 2.0 Login
 */
router.get('/google', (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  });
  res.redirect(url);
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await googleClient.getToken(code as string);
    googleClient.setCredentials(tokens);

    // Get user info
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_ADS_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error('Google authentication failed: No payload');
    }

    const { email, name, sub: googleId } = payload;

    // 1. Check if user exists
    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      // 2. Create Workspace
      const [workspace] = await db.insert(workspaces).values({
        name: `${name}'s Workspace`,
        plan: 'free',
      }).returning();

      // 3. Create User
      [user] = await db.insert(users).values({
        email,
        name,
        googleId,
        workspaceId: workspace.id,
        role: 'admin',
      }).returning();
    } else if (!user.googleId) {
      // Link existing email-based user to Google ID
      await db.update(users).set({ googleId, name }).where(eq(users.id, user.id));
    }

    // 4. Generate JWT
    const token = generateToken({
      userId: user.id,
      workspaceId: user.workspaceId!,
      role: user.role as any,
    });

    // 5. Redirect back to frontend with token
    res.redirect(`${process.env.APP_URL}/auth?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceId: user.workspaceId,
      role: user.role
    }))}`);
  } catch (error: any) {
    console.error('[Google Auth] Error:', error.message);
    res.redirect(`${process.env.APP_URL}/auth?error=Authentication failed`);
  }
});

/**
 * POST /api/auth/register (Standard Email)
 */
router.post('/register', async (req, res) => {
  const { email, password, workspaceName } = req.body;

  if (!email || !password || !workspaceName) {
    return res.status(400).json({ error: 'Email, password, and workspace name are required' });
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const [workspace] = await db.insert(workspaces).values({
      name: workspaceName,
      plan: 'free',
    }).returning();

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

/**
 * POST /api/auth/login (Standard Email)
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials or login via Google' });
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
