import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { ExecutionService } from '../services/executionService';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const actions = await ExecutionService.evaluateSfkConditions(workspaceId!);
    res.json({ actions });
  } catch (error: any) {
    console.error('[SFK] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/execute', async (req: AuthRequest, res) => {
  const { actionId } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!actionId) return res.status(400).json({ error: 'actionId is required' });

  try {
    const result = await ExecutionService.executeAction(actionId, workspaceId!);
    res.json(result);
  } catch (error: any) {
    console.error('[SFK] Execute error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
