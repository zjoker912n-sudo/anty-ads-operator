import axios from 'axios';
import { db } from '../db/index';
import { campaigns, campaignMetrics, creatives, adAccounts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { KPIService } from './kpiService';

export class MetaSyncService {
  static async syncAdsForAccount(workspaceId: string, adAccountId: string, accessToken: string) {
    console.log(`[MetaSync] 🔄 Starting full sync for ${adAccountId} in workspace ${workspaceId}`);

    try {
      // 1. Fetch Campaigns
      const campaignsResponse = await axios.get(`https://graph.facebook.com/v21.0/${adAccountId}/campaigns`, {
        params: {
          fields: 'id,name,status,objective,daily_budget',
          access_token: accessToken,
          limit: 100
        }
      });

      const fbCampaigns = campaignsResponse.data.data;

      for (const camp of fbCampaigns) {
        // Upsert Campaign
        await db.insert(campaigns).values({
          id: camp.id,
          workspaceId,
          adAccountId,
          name: camp.name,
          status: camp.status,
          objective: camp.objective,
          platform: 'meta',
          dailyBudget: camp.daily_budget ? (parseFloat(camp.daily_budget) / 100).toString() : '0' // Meta budget is in cents usually, but API might return string
        }).onConflictDoUpdate({
          target: campaigns.id,
          set: {
            name: camp.name,
            status: camp.status,
            objective: camp.objective,
            dailyBudget: camp.daily_budget ? (parseFloat(camp.daily_budget) / 100).toString() : '0'
          }
        });

        // 2. Fetch Insights for Campaign
        const insightsResponse = await axios.get(`https://graph.facebook.com/v21.0/${camp.id}/insights`, {
          params: {
            fields: 'impressions,clicks,spend,conversions,purchase_roas,action_values,reach,frequency',
            access_token: accessToken,
            date_preset: 'last_30d'
          }
        });

        const insights = insightsResponse.data.data?.[0] || {};
        const purchaseValue = this.extractPurchaseValue(insights.action_values);

        const calculatedMetrics = KPIService.calculateMetrics(
          parseFloat(insights.spend || 0),
          parseInt(insights.impressions || 0),
          parseInt(insights.clicks || 0),
          this.extractConversions(insights.conversions),
          purchaseValue
        );

        // Store Metrics
        await db.insert(campaignMetrics).values({
          campaignId: camp.id,
          workspaceId,
          date: new Date(), // Using current date for the sync point
          impressions: parseInt(insights.impressions || 0),
          clicks: parseInt(insights.clicks || 0),
          spend: (insights.spend || '0').toString(),
          conversions: this.extractConversions(insights.conversions),
          purchaseValue: purchaseValue.toString(),
          ctr: calculatedMetrics.ctr.toString(),
          cpc: calculatedMetrics.cpc.toString(),
          cpa: calculatedMetrics.cpa.toString(),
          roas: calculatedMetrics.roas.toString(),
          reach: parseInt(insights.reach || 0),
          frequency: (insights.frequency || '1').toString()
        });
      }

      // 3. Fetch Creatives
      const adsResponse = await axios.get(`https://graph.facebook.com/v21.0/${adAccountId}/ads`, {
        params: {
          fields: 'id,name,creative{id,body,image_url,video_id}',
          access_token: accessToken,
          limit: 100
        }
      });

      const ads = adsResponse.data.data;
      for (const ad of ads) {
        if (ad.creative) {
          await db.insert(creatives).values({
            id: ad.creative.id,
            workspaceId,
            adAccountId,
            name: ad.name,
            imageUrl: ad.creative.image_url || '',
            bodyText: ad.creative.body || '',
            creativeScore: 0,
            fatigueScore: 0
          }).onConflictDoUpdate({
            target: creatives.id,
            set: {
              name: ad.name,
              imageUrl: ad.creative.image_url || '',
              bodyText: ad.creative.body || ''
            }
          });
        }
      }

      // Update last synced
      await db.update(adAccounts)
        .set({ lastSyncedAt: new Date() })
        .where(eq(adAccounts.id, adAccountId));

      console.log(`[MetaSync] ✅ Sync complete for ${adAccountId}`);
      return { success: true };

    } catch (error: any) {
      console.error(`[MetaSync] ❌ Sync failed:`, error.response?.data || error.message);
      throw error;
    }
  }

  private static extractPurchaseValue(actionValues: any[]): number {
    if (!actionValues) return 0;
    const purchaseValue = actionValues.find((v: any) => v.action_type === 'purchase' || v.action_type === 'offsite_conversion.fb_pixel_purchase');
    return purchaseValue ? parseFloat(purchaseValue.value) : 0;
  }

  private static extractConversions(conversions: any): number {
    if (!conversions) return 0;
    if (typeof conversions === 'number') return conversions;
    if (Array.isArray(conversions)) {
      const purchaseAction = conversions.find((c: any) => c.action_type === 'purchase' || c.action_type === 'offsite_conversion.fb_pixel_purchase');
      return purchaseAction ? parseInt(purchaseAction.value) : 0;
    }
    return 0;
  }

  /**
   * Identifies all active workspace ad accounts that need syncing.
   */
  static async getWorkspacesToSync() {
    console.log('[MetaSync] 🔍 Fetching all accounts for sync from Postgres...');
    try {
      const accounts = await db.select()
        .from(adAccounts)
        .where(eq(adAccounts.status, 'ACTIVE'));
      
      return accounts.map(acc => ({
        id: acc.workspaceId,
        meta_account_id: acc.id,
        access_token: acc.accessToken
      }));
    } catch (err: any) {
      console.error('[MetaSync] ❌ Failed to fetch accounts for sync:', err.message);
      return [];
    }
  }
}

