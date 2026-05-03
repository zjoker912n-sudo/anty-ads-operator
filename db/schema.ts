import { pgTable, text, timestamp, integer, boolean, numeric, uuid, jsonb, primaryKey } from 'drizzle-orm/pg-core';

// Workspaces
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  plan: text('plan', { enum: ['free', 'pro', 'enterprise'] }).default('free'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  googleId: text('google_id').unique(),
  passwordHash: text('password_hash'), // Nullable for OAuth users
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  role: text('role', { enum: ['admin', 'manager', 'viewer'] }).default('manager'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Ad Accounts
export const adAccounts = pgTable('ad_accounts', {
  id: text('id').primaryKey(), // Meta act_...
  name: text('name').notNull(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  accessToken: text('access_token').notNull(), // Should be encrypted
  status: text('status').default('PENDING'),
  platform: text('platform').default('meta'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Campaigns
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  adAccountId: text('ad_account_id').references(() => adAccounts.id),
  name: text('name').notNull(),
  status: text('status').notNull(),
  objective: text('objective'),
  platform: text('platform').notNull(),
  dailyBudget: numeric('daily_budget'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Campaign Metrics (Daily)
export const campaignMetrics = pgTable('campaign_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: text('campaign_id').references(() => campaigns.id),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  date: timestamp('date').notNull(),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  spend: numeric('spend').default('0'),
  conversions: integer('conversions').default(0),
  purchaseValue: numeric('purchase_value').default('0'),
  ctr: numeric('ctr').default('0'),
  cpc: numeric('cpc').default('0'),
  cpa: numeric('cpa').default('0'),
  roas: numeric('roas').default('0'),
  reach: integer('reach').default(0),
  frequency: numeric('frequency').default('1'),
});

// Creatives
export const creatives = pgTable('creatives', {
  id: text('id').primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  adAccountId: text('ad_account_id').references(() => adAccounts.id),
  name: text('name').notNull(),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  bodyText: text('body_text'),
  creativeScore: integer('creative_score').default(0),
  fatigueScore: integer('fatigue_score').default(0),
  suggestions: jsonb('suggestions'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Optimization Logs
export const optimizationLogs = pgTable('optimization_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  campaignId: text('campaign_id').references(() => campaigns.id),
  action: text('action').notNull(), // SCALE, KILL, BUDGET_CHANGE
  reason: text('reason').notNull(),
  beforeState: jsonb('before_state'),
  afterState: jsonb('after_state'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Alerts
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  type: text('type').notNull(), // CTR_DROP, CPA_SPIKE, ANOMALY
  message: text('message').notNull(),
  status: text('status').default('ACTIVE'),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Funnel Steps (GA4 Integration)
export const funnelSteps = pgTable('funnel_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  date: timestamp('date').notNull(),
  stepName: text('step_name').notNull(), // click, ATC, checkout, purchase
  count: integer('count').default(0),
  dropOffRate: numeric('drop_off_rate'),
});

// Market Intel
export const marketIntel = pgTable('market_intel', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id),
  url: text('url'),
  keyword: text('keyword'),
  seoAudit: jsonb('seo_audit'),
  keywords: jsonb('keywords_analysis'),
  contentAudit: jsonb('content_audit'),
  paidStrategy: jsonb('paid_strategy'),
  strategicRisks: jsonb('strategic_risks'),
  marketRivals: jsonb('market_rivals'),
  growthRoadmap: jsonb('growth_roadmap'),
  createdAt: timestamp('created_at').defaultNow(),
});
