import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { LogService } from '../services/logService';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const logs = await LogService.getLogs(workspaceId!);
    res.json({ logs });
  } catch (error: any) {
    console.error('[Logs] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
