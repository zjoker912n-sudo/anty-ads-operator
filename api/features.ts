import express from 'express';
import { authenticate, scopeWorkspace, AuthRequest } from '../auth/middleware';
import { AnalysisService } from '../services/analysisService';
import { SpyService } from '../services/spyService';
import { ExecutionService } from '../services/executionService';
import { AuditEngine } from '../services/auditEngine';
import { FunnelService } from '../services/funnelService';
import { db } from '../db/index';
import { campaigns, campaignMetrics } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

router.use(authenticate);
router.use(scopeWorkspace);

// Pre-Funnel Analysis
router.post('/pre-funnel-analysis', async (req: AuthRequest, res) => {
  const { url } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const result = await AnalysisService.performPreFunnelAnalysis(url, workspaceId!);
    res.json(result);
  } catch (error: any) {
    console.error('[Features] Pre-funnel analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Live Market Spy
router.post('/market-spy', async (req: AuthRequest, res) => {
  const { query } = req.body;
  const workspaceId = req.user?.workspaceId;

  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const result = await SpyService.spyOnCompetitor(query, workspaceId!);
    res.json(result);
  } catch (error: any) {
    console.error('[Features] Market spy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Performance Data (Unified Dashboard)
router.get('/performance', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;

  try {
    const campResults = await db.select().from(campaigns).where(eq(campaigns.workspaceId, workspaceId!));
    const metricResults = await db.select().from(campaignMetrics).where(eq(campaignMetrics.workspaceId, workspaceId!)).orderBy(desc(campaignMetrics.date)).limit(100);

    res.json({
      campaigns: campResults,
      metrics: metricResults
    });
  } catch (error: any) {
    console.error('[Features] Performance error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Audit
router.get('/audit/latest', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;
  try {
    const result = await AuditEngine.auditCampaign('latest', workspaceId!);
    res.json(result);
  } catch (err: any) {
    console.error('[Features] Audit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Funnel
router.get('/funnel', async (req: AuthRequest, res) => {
  const workspaceId = req.user?.workspaceId;
  try {
    const result = await FunnelService.getFunnel(workspaceId!);
    res.json(result);
  } catch (err: any) {
    console.error('[Features] Funnel error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

