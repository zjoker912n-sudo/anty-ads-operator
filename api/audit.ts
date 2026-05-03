import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { AuditEngine } from '../services/auditEngine';
import { db } from '../db/index';
import { campaigns } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    // Audit all active campaigns for the workspace
    const activeCampaigns = await db.select().from(campaigns).where(eq(campaigns.workspaceId, workspaceId!));
    const audits = [];
    
    for (const campaign of activeCampaigns) {
      const audit = await AuditEngine.auditCampaign(campaign.id, workspaceId!);
      audits.push(audit);
    }
    
    res.json({ audits });
  } catch (error: any) {
    console.error('[Audit] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
