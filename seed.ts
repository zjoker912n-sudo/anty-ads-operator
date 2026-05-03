import { db } from './db/index.js';
import { workspaces, users, adAccounts, campaigns, campaignMetrics, creatives, optimizationLogs, alerts, funnelSteps, marketIntel } from './db/schema.js';
import crypto from 'crypto';

async function seed() {
  console.log('Seeding database...');
  
  const workspaceId = 'ws-test-001';
  
  // Create Workspace
  await db.insert(workspaces).values({
    id: workspaceId,
    name: 'Operator AI Test Workspace',
    plan: 'enterprise'
  });
  
  // Create User
  await db.insert(users).values({
    id: 'test-user-001',
    email: 'test@operatorai.com',
    passwordHash: 'hashed-password',
    workspaceId: workspaceId,
    role: 'admin'
  });
  
  // Create Ad Account
  const adAccountId = 'test-account';
  await db.insert(adAccounts).values({
    id: adAccountId,
    name: 'Test Ad Account',
    workspaceId: workspaceId,
    accessToken: 'test-token',
    status: 'ACTIVE',
    platform: 'meta'
  });
  
  // Create Campaigns
  const campaignData = [
    { id: 'camp-001', name: 'Scaling - Broad 1', status: 'ACTIVE', objective: 'CONVERSIONS', platform: 'meta', dailyBudget: '500' },
    { id: 'camp-002', name: 'Retargeting - Last 30 Days', status: 'ACTIVE', objective: 'CONVERSIONS', platform: 'meta', dailyBudget: '150' },
    { id: 'camp-003', name: 'Testing - Creatives', status: 'PAUSED', objective: 'TRAFFIC', platform: 'meta', dailyBudget: '50' }
  ];
  
  for (const c of campaignData) {
    await db.insert(campaigns).values({
      id: c.id,
      workspaceId: workspaceId,
      adAccountId: adAccountId,
      name: c.name,
      status: c.status,
      objective: c.objective,
      platform: c.platform,
      dailyBudget: c.dailyBudget
    });
    
    // Add metrics
    await db.insert(campaignMetrics).values({
      id: crypto.randomUUID(),
      campaignId: c.id,
      workspaceId: workspaceId,
      date: new Date(),
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 500) + 50,
      spend: (Math.random() * 200 + 50).toFixed(2),
      conversions: Math.floor(Math.random() * 20) + 1,
      purchaseValue: (Math.random() * 1000 + 100).toFixed(2),
      ctr: (Math.random() * 2 + 1).toFixed(2),
      cpc: (Math.random() * 1.5 + 0.5).toFixed(2),
      cpa: (Math.random() * 20 + 5).toFixed(2),
      roas: (Math.random() * 3 + 1).toFixed(2),
      reach: Math.floor(Math.random() * 8000) + 800,
      frequency: (Math.random() * 1.5 + 1).toFixed(2)
    });
  }
  
  // Create Creatives
  await db.insert(creatives).values({
    id: crypto.randomUUID(),
    workspaceId: workspaceId,
    adAccountId: adAccountId,
    name: 'High Performance Hook',
    imageUrl: 'https://via.placeholder.com/300',
    bodyText: 'Get the best results with Operator AI',
    creativeScore: 92,
    fatigueScore: 15,
    suggestions: { improvements: ['Add more urgency', 'Test a different thumbnail'] }
  });
  
  // Optimization Logs
  await db.insert(optimizationLogs).values({
    id: crypto.randomUUID(),
    workspaceId: workspaceId,
    campaignId: 'camp-001',
    action: 'SCALE',
    reason: 'ROAS > 3.0 consistently over last 3 days',
    beforeState: { dailyBudget: 400 },
    afterState: { dailyBudget: 500 }
  });
  
  // Alerts
  await db.insert(alerts).values({
    id: crypto.randomUUID(),
    workspaceId: workspaceId,
    type: 'CPA_SPIKE',
    message: 'CPA has spiked 40% in campaign Retargeting - Last 30 Days',
    status: 'ACTIVE',
    severity: 'high'
  });
  
  // Funnel Steps
  const funnelData = [
    { stepName: 'ViewContent', count: 5000, dropOffRate: '0' },
    { stepName: 'AddToCart', count: 1200, dropOffRate: '76' },
    { stepName: 'InitiateCheckout', count: 400, dropOffRate: '66.6' },
    { stepName: 'Purchase', count: 85, dropOffRate: '78.75' }
  ];
  
  for (const f of funnelData) {
    await db.insert(funnelSteps).values({
      id: crypto.randomUUID(),
      workspaceId: workspaceId,
      date: new Date(),
      stepName: f.stepName,
      count: f.count,
      dropOffRate: f.dropOffRate
    });
  }
  
  console.log('Database seeded successfully!');
}

seed().catch(err => {
  console.error('Error seeding DB:', err);
  process.exit(1);
});
