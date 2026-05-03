import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { db } from '../db/index';
import { campaigns } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

// List Campaigns
router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;
  const { adAccountId } = req.query;

  try {
    const whereClause = adAccountId 
      ? and(eq(campaigns.workspaceId, workspaceId!), eq(campaigns.adAccountId, adAccountId as string))
      : eq(campaigns.workspaceId, workspaceId!);

    const results = await db.select().from(campaigns).where(whereClause);
    res.json({ campaigns: results });
  } catch (error: any) {
    console.error('[Campaigns] List error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Campaign (e.g. Pause/Scale)
router.post('/update', async (req: AuthRequest, res) => {
  const { campaignId, status, dailyBudget } = req.body;
  const workspaceId = req.user?.workspaceId;

  try {
    const [campaign] = await db.select()
      .from(campaigns)
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.workspaceId, workspaceId!)))
      .limit(1);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (dailyBudget) updates.dailyBudget = dailyBudget.toString();

    await db.update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, campaignId));

    // In a real system, here we would also call Meta Graph API to apply the change
    console.log(`[Campaigns] Applied updates to ${campaignId}:`, updates);

    res.json({ success: true, message: 'Campaign updated successfully' });
  } catch (error: any) {
    console.error('[Campaigns] Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

