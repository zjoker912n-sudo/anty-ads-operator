import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { db } from '../db/index';
import { campaignMetrics, campaigns } from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

// Dashboard Aggregated Stats
router.get('/dashboard', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    // 1. Overall Totals (Last 30 days)
    const totals = await db.select({
      totalSpend: sql`SUM(${campaignMetrics.spend})`,
      totalConversions: sql`SUM(${campaignMetrics.conversions})`,
      avgRoas: sql`AVG(${campaignMetrics.roas})`,
      totalClicks: sql`SUM(${campaignMetrics.clicks})`,
      totalImpressions: sql`SUM(${campaignMetrics.impressions})`,
    })
    .from(campaignMetrics)
    .where(eq(campaignMetrics.workspaceId, workspaceId!));

    // 2. Time Series Data (Daily Spend & ROAS)
    const timeSeries = await db.select({
      date: campaignMetrics.date,
      spend: campaignMetrics.spend,
      roas: campaignMetrics.roas,
    })
    .from(campaignMetrics)
    .where(eq(campaignMetrics.workspaceId, workspaceId!))
    .orderBy(desc(campaignMetrics.date))
    .limit(30);

    // 3. Top Campaigns
    const topCampaigns = await db.select()
      .from(campaigns)
      .where(eq(campaigns.workspaceId, workspaceId!))
      .limit(5);

    res.json({
      totals: totals[0],
      timeSeries: timeSeries.reverse(),
      topCampaigns
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
