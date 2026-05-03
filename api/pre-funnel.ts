import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { AnalysisService } from '../services/analysisService';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.post('/', async (req: AuthRequest, res) => {
  const { url } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const result = await AnalysisService.performPreFunnelAnalysis(url, workspaceId!);
    res.json(result);
  } catch (error: any) {
    console.error('[PreFunnel] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
