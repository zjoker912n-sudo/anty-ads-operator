import cron from 'node-cron';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { REDIS_URL, REDIS_OPTIONS, isRedisAvailable } from '../queue/queue';
import { MetaSyncService } from '../services/metaSyncService';

export function startMetaSyncScheduler() {
  console.log('[Scheduler] 🕒 Initializing Meta Sync Scheduler');

  if (!isRedisAvailable) {
    console.warn('[Scheduler] ⚠️ Redis not available. Scheduler disabled.');
    return;
  }

  let syncQueue: Queue | null = null;
  try {
    const connection = new IORedis(REDIS_URL!, REDIS_OPTIONS);
    connection.on('error', (err) => console.warn('[Scheduler] Redis error (non-fatal):', err.message));
    syncQueue = new Queue('jobs', { connection });
  } catch (err: any) {
    console.warn('[Scheduler] Failed to create queue (non-fatal):', err.message);
    return;
  }

  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    if (!syncQueue) return;
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
          backoff: { type: 'exponential', delay: 5000 }
        });
      }

      console.log(`[Scheduler] ✅ Queued sync for ${accounts.length} accounts`);
    } catch (error: any) {
      console.error('[Scheduler] ❌ Failed to trigger sync:', error.message);
    }
  });

  // Smart alerts scan every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] 🔔 Triggering Smart Alerts scan...');
  });
}
