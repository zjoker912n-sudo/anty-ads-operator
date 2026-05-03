import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { db } from '../db/index';
import { users, workspaces, optimizationLogs } from '../db/schema';
import { count } from 'drizzle-orm';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import { REDIS_URL, REDIS_OPTIONS } from '../queue/queue';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [userCount] = await db.select({ value: count() }).from(users);
    const [workspaceCount] = await db.select({ value: count() }).from(workspaces);
    const [logCount] = await db.select({ value: count() }).from(optimizationLogs);

    // Queue status
    let waiting = 0, active = 0, failed = 0;
    if (REDIS_URL) {
      const connection = new IORedis(REDIS_URL, REDIS_OPTIONS);
      const syncQueue = new Queue('jobs', { connection });
      waiting = await syncQueue.getWaitingCount();
      active = await syncQueue.getActiveCount();
      failed = await syncQueue.getFailedCount();
      await connection.quit();
    }

    res.json({
      users: userCount.value,
      workspaces: workspaceCount.value,
      logs: logCount.value,
      queue: {
        waiting,
        active,
        failed
      }
    });
  } catch (error: any) {
    console.error('[Admin] API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
