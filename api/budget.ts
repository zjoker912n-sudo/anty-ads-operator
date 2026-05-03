import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { BudgetOrchestration } from '../services/budgetService';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const plan = await BudgetOrchestration.suggestRedistribution(workspaceId!);
    res.json(plan);
  } catch (error: any) {
    console.error('[Budget] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
