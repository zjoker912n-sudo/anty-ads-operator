import cron from 'node-cron';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { REDIS_URL, REDIS_OPTIONS } from '../queue/queue';
import { MetaSyncService } from '../services/metaSyncService';

const connection = new IORedis(REDIS_URL!, REDIS_OPTIONS);
const syncQueue = new Queue('jobs', { connection });

export function startMetaSyncScheduler() {
  console.log('[Scheduler] 🕒 Initializing Meta Sync Scheduler (Every 10 minutes)');

  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('[Scheduler] 🔄 Triggering global sync for all active workspaces...');
    
    try {
      const accounts = await MetaSyncService.getWorkspacesToSync();
      
      for (const account of accounts) {
        await syncQueue.add('sync_campaigns', {
          workspace_id: account.id,
          ad_account_id: account.meta_account_id,
          access_token: account.access_token
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        });
      }
      
      console.log(`[Scheduler] ✅ Successfully queued sync for ${accounts.length} accounts`);
    } catch (error: any) {
      console.error('[Scheduler] ❌ Failed to trigger sync:', error.message);
    }
  });

  // Also run smart alerts scan every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] 🔔 Triggering Smart Alerts scan...');
    // ... logic to queue smart_alerts_scan
  });
}
