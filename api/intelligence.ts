import express from 'express';
import { IntelligenceService } from '../services/intelligenceService';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.post('/audit', async (req: AuthRequest, res) => {
  const { url } = req.body;
  const userId = req.user?.userId;
  
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const intelService = IntelligenceService.getInstance();
    const auditData = await intelService.fullAudit(url, userId!);
    res.json(auditData);
  } catch (error: any) {
    console.error('[Intelligence] Audit failed:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/advanced-analysis', async (req: AuthRequest, res) => {
  const { prompt, model } = req.body;
  
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const intelService = IntelligenceService.getInstance();
    
    let result;
    if (!model || model === 'gemini') {
      result = await intelService.collaborativeAnalyze(prompt);
    } else {
      result = await intelService.analyzeWithAI(prompt, model as any);
    }
    
    res.json({ result });
  } catch (error: any) {
    console.error('[Intelligence] AI analysis failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
