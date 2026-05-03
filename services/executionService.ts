import { db } from '../db/index';
import { campaigns, campaignMetrics } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class ExecutionService {
  static async evaluateSfkConditions(workspaceId: string) {
    console.log(`[SFK] Evaluating for workspace: ${workspaceId}`);
    
    const activeCampaigns = await db.select()
      .from(campaigns)
      .where(eq(campaigns.workspaceId, workspaceId));

    const actions = [];

    for (const c of activeCampaigns) {
      const [latest] = await db.select()
        .from(campaignMetrics)
        .where(eq(campaignMetrics.campaignId, c.id))
        .orderBy(desc(campaignMetrics.date))
        .limit(1);

      if (latest) {
        const evalResult = await this.evaluateAndExecute(c as any, latest as any);
        if (evalResult.action) {
          actions.push({
            id: `action_${c.id}_${Date.now()}`,
            campaignId: c.id,
            title: `${evalResult.action === 'SCALE' ? 'Scale' : evalResult.action === 'KILL' ? 'Pause' : 'Optimize'} Campaign: ${c.name}`,
            description: evalResult.reason,
            type: evalResult.action,
            status: 'TODO',
            priority: evalResult.action === 'KILL' ? 'HIGH' : 'MEDIUM'
          });
        }
      }
    }
    return actions;
  }

  static async executeAction(actionId: string, workspaceId: string) {
    console.log(`[SFK] Executing action ${actionId} for workspace ${workspaceId}`);
    // In a real system, you would call Meta API and update the DB here.
    return { success: true, actionId, timestamp: new Date().toISOString() };
  }

  static async evaluateAndExecute(campaign: any, metrics: any) {
    const { roas, ctr, cpa } = metrics;
    let action = '';
    let reason = '';

    // Logic:
    // IF ROAS high -> scale
    // IF CTR low -> fix
    // IF CPA high -> fix
    // IF no conversions -> kill

    if (roas >= 3.0) {
      action = 'SCALE';
      reason = 'ROAS is excellent (>= 3.0). Increasing budget by 20%.';
    } else if (ctr < 1.0) {
      action = 'FIX_CREATIVE';
      reason = 'CTR is low (< 1.0%). Creative refresh recommended.';
    } else if (cpa > 50) { // Example threshold
      action = 'OPTIMIZE_AUDIENCE';
      reason = 'CPA is too high (> $50). Audience refinement needed.';
    } else if (metrics.conversions === 0 && metrics.spend > 100) {
      action = 'KILL';
      reason = 'No conversions after $100 spend. Stop campaign.';
    }

    if (action) {
      console.log(`[Execution] Action for ${campaign.name}: ${action} (${reason})`);
      // In a real system, this would call the Meta API to change budget/status
      // For now, we log the action and notify the user
    }

    return { action, reason };
  }
}
