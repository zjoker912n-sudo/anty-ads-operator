import { db } from '../db/index';
import { campaignMetrics, campaigns } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class AuditEngine {
  static async auditCampaign(campaignId: string, workspaceId: string) {
    console.log(`[AuditEngine] Auditing campaign ${campaignId}`);

    // 1. Get latest metrics
    const [latestMetrics] = await db.select()
      .from(campaignMetrics)
      .where(eq(campaignMetrics.campaignId, campaignId))
      .orderBy(desc(campaignMetrics.date))
      .limit(1);

    if (!latestMetrics) return { status: 'NO_DATA' };

    const issues = [];
    const { roas, cpa, ctr, spend } = latestMetrics;

    // Rule 1: CPA Spike
    if (parseFloat(cpa as string) > 50) { // Example threshold
      issues.push({
        problem: 'High Acquisition Cost',
        cause: 'Audience fatigue or landing page friction.',
        fix: 'Test a broader audience or refresh the landing page offer.'
      });
    }

    // Rule 2: Low CTR
    if (parseFloat(ctr as string) < 0.01) { // < 1%
      issues.push({
        problem: 'Low Ad Relevance (CTR)',
        cause: 'The creative hook is not resonating with the target audience.',
        fix: 'Switch to a different visual format (e.g., UGC video vs static image).'
      });
    }

    // Rule 3: Spend without conversions
    if (parseFloat(spend as string) > 100 && latestMetrics.conversions === 0) {
      issues.push({
        problem: 'Zero Conversion Drain',
        cause: 'Complete disconnect between ad and purchase intent.',
        fix: 'Kill this campaign immediately and re-evaluate the funnel.'
      });
    }

    return {
      campaignId,
      auditTimestamp: new Date().toISOString(),
      performanceScore: roas && parseFloat(roas as string) > 2 ? 'HEALTHY' : 'NEEDS_ATTENTION',
      issues
    };
  }
}
