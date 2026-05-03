import { Campaign, CampaignMetrics } from '../models';
import { MetaSyncService } from './metaSyncService';

export class ExecutionService {
  static async evaluateAndExecute(campaign: Campaign, metrics: CampaignMetrics) {
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
