export interface User {
  id: string;
  email: string;
  passwordHash: string;
  workspaceId: string;
  role: 'admin' | 'manager' | 'viewer';
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface AdAccount {
  id: string; // Meta account_id (act_...)
  name: string;
  workspaceId: string;
  accessToken: string;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING';
  lastSyncedAt: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  adAccountId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  objective: string;
  platform: 'meta' | 'google' | 'tiktok';
}

export interface CampaignMetrics {
  id: string;
  campaignId: string;
  workspaceId: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  purchaseValue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface Creative {
  id: string;
  workspaceId: string;
  adAccountId: string;
  name: string;
  imageUrl: string;
  videoUrl?: string;
  bodyText: string;
  metrics: {
    ctr: number;
    fatigue: number; // 0-100
  };
}

export interface AIInsight {
  id: string;
  workspaceId: string;
  type: 'STRATEGY' | 'CREATIVE' | 'AUDIT' | 'BUDGET';
  content: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  workspaceId: string;
  type: 'CTR_DROP' | 'CPA_SPIKE' | 'ANOMALY';
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
}

export interface OptimizationLog {
  id: string;
  workspaceId: string;
  campaignId: string;
  action: string;
  reason: string;
  timestamp: string;
}
