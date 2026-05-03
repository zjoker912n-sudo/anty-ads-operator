import express from 'express';
import { db } from '../db/index';
import { alerts, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

/**
 * GET /api/alerts
 * Fetch all alerts for the user's current workspace.
 */
router.get('/', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;
  const { status } = req.query;

  try {
    let whereClause = eq(alerts.workspaceId, workspaceId!);
    
    if (status) {
      whereClause = and(whereClause, eq(alerts.status, status as string)) as any;
    }

    const results = await db.select()
      .from(alerts)
      .where(whereClause)
      .orderBy(desc(alerts.createdAt));

    res.json(results);
  } catch (error: any) {
    console.error(`[API] Error fetching alerts:`, error.message);
    res.status(500).json({ error: 'Internal server error while fetching alerts' });
  }
});

/**
 * PATCH /api/alerts/:alertId
 * Update alert status (e.g., mark as closed).
 */
router.patch('/:alertId', async (req: AuthRequest, res) => {
  const { alertId } = req.params;
  const { status } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const [alert] = await db.select()
      .from(alerts)
      .where(and(eq(alerts.id, alertId), eq(alerts.workspaceId, workspaceId!)))
      .limit(1);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found or unauthorized' });
    }

    await db.update(alerts)
      .set({
        status,
        // Assuming there might be an updated_at in the future, but currently schema only has createdAt
      })
      .where(eq(alerts.id, alertId));

    res.json({ success: true });
  } catch (error: any) {
    console.error(`[API] Error updating alert:`, error.message);
    res.status(500).json({ error: 'Internal server error while updating alert' });
  }
});

export default router;

