import { CampaignMetrics } from '../models';

export class KPIService {
  static calculateMetrics(
    spend: number, 
    impressions: number, 
    clicks: number, 
    conversions: number, 
    purchaseValue: number
  ): Partial<CampaignMetrics> {
    return {
      spend,
      impressions,
      clicks,
      conversions,
      purchaseValue,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpa: conversions > 0 ? spend / conversions : 0,
      roas: spend > 0 ? purchaseValue / spend : 0
    };
  }

  static handleNulls(value: any): number {
    return value || 0;
  }
}
