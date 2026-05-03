import { db } from '../db/index';
import { campaignMetrics, campaigns } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class BudgetOrchestration {
  static async suggestRedistribution(workspaceId: string) {
    console.log(`[Budget] Orchestrating budgets for workspace ${workspaceId}`);

    // 1. Fetch all active campaigns with recent metrics
    // Simplified logic: Find top 20% and bottom 20% by ROAS
    const allCampaigns = await db.select().from(campaigns).where(eq(campaigns.workspaceId, workspaceId));
    
    const suggestions = [];

    // This would typically involve complex SQL to get aggregated ROAS over 7 days
    // For now, let's assume we have a list of campaigns with their 7d ROAS
    const campaignsWithRoas = allCampaigns.map(c => ({
      ...c,
      avgRoas: Math.random() * 5 // Mocking
    }));

    const winners = campaignsWithRoas.filter(c => c.avgRoas > 3);
    const losers = campaignsWithRoas.filter(c => c.avgRoas < 1.5);

    for (const loser of losers) {
      if (parseFloat(loser.dailyBudget as string) > 0) {
        suggestions.push({
          campaignId: loser.id,
          campaignName: loser.name,
          action: 'REDUCE',
          amount: parseFloat(loser.dailyBudget as string) * 0.2,
          reason: `Low ROAS (${loser.avgRoas.toFixed(2)}) detected.`
        });
      }
    }

    for (const winner of winners) {
      suggestions.push({
        campaignId: winner.id,
        campaignName: winner.name,
        action: 'INCREASE',
        amount: 20, // $20 or 20%
        reason: `Excellent ROAS (${winner.avgRoas.toFixed(2)}). Scaling for growth.`
      });
    }

    return {
      timestamp: new Date().toISOString(),
      workspaceId,
      suggestions
    };
  }
}
