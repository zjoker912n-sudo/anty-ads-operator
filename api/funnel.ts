import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { FunnelService } from '../services/funnelService';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const funnelData = await FunnelService.getFunnel(workspaceId!);
    res.json(funnelData);
  } catch (error: any) {
    console.error('[Funnel] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
