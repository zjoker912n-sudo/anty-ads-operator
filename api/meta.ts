import express from 'express';
import { db } from '../db/index';
import { adAccounts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { jobsQueue, JOB_TYPES } from '../queue/queue';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

// Connect Meta Ad Account
router.post('/connect', async (req: AuthRequest, res) => {
  const { accessToken, adAccountId, name } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!accessToken || !adAccountId) {
    return res.status(400).json({ error: 'Access token and Ad Account ID are required' });
  }

  try {
    // Upsert Ad Account in Postgres
    await db.insert(adAccounts).values({
      id: adAccountId,
      name: name || 'Meta Ad Account',
      workspaceId: workspaceId!,
      accessToken: accessToken,
      status: 'ACTIVE',
      platform: 'meta',
      lastSyncedAt: new Date()
    }).onConflictDoUpdate({
      target: adAccounts.id,
      set: {
        accessToken: accessToken,
        name: name || 'Meta Ad Account',
        status: 'ACTIVE',
        lastSyncedAt: new Date()
      }
    });

    // Trigger initial sync
    await jobsQueue.add(JOB_TYPES.SYNC_CAMPAIGNS, {
      workspace_id: workspaceId,
      ad_account_id: adAccountId,
      access_token: accessToken
    });

    res.json({ success: true, message: 'Account connected and sync started' });
  } catch (error: any) {
    console.error('[Meta] Connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List Connected Accounts
router.get('/accounts', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const accounts = await db.select()
      .from(adAccounts)
      .where(eq(adAccounts.workspaceId, workspaceId!));
    
    res.json(accounts);
  } catch (error: any) {
    console.error('[Meta] List accounts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual Sync Trigger
router.post('/sync', async (req: AuthRequest, res) => {
  const { adAccountId } = req.body;
  const workspaceId = req.user?.workspaceId;

  try {
    const [account] = await db.select()
      .from(adAccounts)
      .where(and(
        eq(adAccounts.id, adAccountId),
        eq(adAccounts.workspaceId, workspaceId!)
      ))
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: 'Ad account not found' });
    }

    await jobsQueue.add(JOB_TYPES.SYNC_CAMPAIGNS, {
      workspace_id: workspaceId,
      ad_account_id: adAccountId,
      access_token: account.accessToken
    });

    res.json({ success: true, message: 'Sync queued' });
  } catch (error: any) {
    console.error('[Meta] Sync trigger error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

