import { MetaSyncService } from '../services/metaSyncService';
import dotenv from 'dotenv';
dotenv.config();

async function testSync() {
  const workspaceId = process.env.TEST_WORKSPACE_ID;
  const adAccountId = process.env.TEST_AD_ACCOUNT_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!workspaceId || !adAccountId || !accessToken) {
    console.error('❌ Missing TEST_WORKSPACE_ID, TEST_AD_ACCOUNT_ID or META_ACCESS_TOKEN in env');
    process.exit(1);
  }

  console.log(`🚀 [Production Test] Starting manual sync for ${adAccountId}...`);
  
  try {
    const result = await MetaSyncService.syncAdsForAccount(workspaceId, adAccountId, accessToken);
    if (result.success) {
      console.log('✅ [Production Test] Meta Sync successful. KPIs calculated and stored.');
    }
  } catch (err: any) {
    console.error('❌ [Production Test] Meta Sync failed:', err.message);
  }
}

testSync();
