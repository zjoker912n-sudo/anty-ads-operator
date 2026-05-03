import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { TestingEngine } from '../services/testingEngine';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const tests = await TestingEngine.evaluateTests(workspaceId!);
    res.json({ tests });
  } catch (error: any) {
    console.error('[Testing] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
