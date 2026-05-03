import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { SpyService } from '../services/spyService';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.post('/', async (req: AuthRequest, res) => {
  const { query } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const result = await SpyService.spyOnCompetitor(query, workspaceId!);
    res.json(result);
  } catch (error: any) {
    console.error('[MarketSpy] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
