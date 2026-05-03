import express from 'express';
import { db } from '../db/index';
import { adAccounts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { jobsQueue, JOB_TYPES } from '../queue/queue';
import axios from 'axios';
import { CryptoUtils } from '../utils/crypto';

const router = express.Router();

const META_APP_ID = process.env.META_CLIENT_ID;
const META_APP_SECRET = process.env.META_CLIENT_SECRET;
const META_REDIRECT_URI = `${process.env.APP_URL}/api/meta/callback`;

/**
 * GET /api/meta/connect
 * Redirects to Meta OAuth
 */
router.get('/connect', authenticate, (req: AuthRequest, res) => {
  const scope = ['ads_read', 'ads_management', 'business_management'].join(',');
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&scope=${scope}&state=${req.user?.userId}`;
  res.redirect(url);
});

/**
 * GET /api/meta/callback
 * Meta OAuth callback
 */
router.get('/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code) {
    return res.redirect(`${process.env.APP_URL}/settings?error=Meta connection cancelled`);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: META_REDIRECT_URI,
        code,
      }
    });

    const { access_token } = tokenRes.data;

    // 2. Fetch User and Workspace
    const [user] = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);
    if (!user) throw new Error('User not found');

    const workspaceId = user.workspaceId;

    // 3. Fetch Ad Accounts from Meta
    const accountsRes = await axios.get('https://graph.facebook.com/v19.0/me/adaccounts', {
      params: {
        fields: 'name,account_id,id',
        access_token,
      }
    });

    const metaAccounts = accountsRes.data.data;

    // 4. Encrypt token
    const encryptedToken = CryptoUtils.encrypt(access_token);

    // 5. Store Ad Accounts
    for (const account of metaAccounts) {
      await db.insert(adAccounts).values({
        id: account.id, // act_...
        name: account.name,
        workspaceId: workspaceId!,
        accessToken: encryptedToken,
        status: 'ACTIVE',
        platform: 'meta',
        lastSyncedAt: new Date()
      }).onConflictDoUpdate({
        target: adAccounts.id,
        set: {
          accessToken: encryptedToken,
          name: account.name,
          status: 'ACTIVE',
          lastSyncedAt: new Date()
        }
      });

      // 6. Trigger initial sync for each account
      await jobsQueue.add(JOB_TYPES.SYNC_CAMPAIGNS, {
        workspace_id: workspaceId,
        ad_account_id: account.id,
        access_token: access_token // Pass raw token to worker (worker should decrypt if it pulls from DB, but here we pass raw for immediate start)
      });
    }

    res.redirect(`${process.env.APP_URL}/settings?success=Meta connected`);
  } catch (error: any) {
    console.error('[Meta Callback] Error:', error.response?.data || error.message);
    res.redirect(`${process.env.APP_URL}/settings?error=Failed to connect Meta`);
  }
});

/**
 * GET /api/meta/ad-accounts
 * List connected accounts for the current workspace
 */
router.get('/ad-accounts', authenticate, scopeWorkspace, async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const accounts = await db.select()
      .from(adAccounts)
      .where(eq(adAccounts.workspaceId, workspaceId!));
    
    // Do NOT return encrypted tokens to frontend
    const safeAccounts = accounts.map(a => ({
      id: a.id,
      name: a.name,
      status: a.status,
      lastSyncedAt: a.lastSyncedAt
    }));

    res.json(safeAccounts);
  } catch (error: any) {
    console.error('[Meta] List accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import users for callback context (needed because I used it above)
import { users } from '../db/schema';

export default router;
