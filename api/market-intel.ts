import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { MarketIntelService } from '../services/marketIntelService';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.post('/', async (req: AuthRequest, res) => {
  const { url } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const result = await MarketIntelService.analyzeMarket(url, workspaceId!);
    res.json(result);
  } catch (error: any) {
    console.error('[MarketIntel] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
