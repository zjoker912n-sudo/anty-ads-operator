import { db } from '../db/index';
import { optimizationLogs } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class LogService {
  static async logAction(data: {
    workspaceId: string;
    campaignId: string;
    action: string;
    reason: string;
    beforeState?: any;
    afterState?: any;
  }) {
    console.log(`[LogService] Logging action: ${data.action} for campaign ${data.campaignId}`);
    try {
      await db.insert(optimizationLogs).values({
        workspaceId: data.workspaceId,
        campaignId: data.campaignId,
        action: data.action,
        reason: data.reason,
        beforeState: data.beforeState,
        afterState: data.afterState,
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error(`[LogService] Failed to log action: ${error.message}`);
    }
  }

  static async getLogs(workspaceId: string, campaignId?: string) {
    let query = db.select().from(optimizationLogs).where(
      campaignId 
        ? and(eq(optimizationLogs.workspaceId, workspaceId), eq(optimizationLogs.campaignId, campaignId))
        : eq(optimizationLogs.workspaceId, workspaceId)
    ).orderBy(desc(optimizationLogs.timestamp));

    const results = await query;
    return results;
  }
}
