import { db } from './db/index.js';
import { campaigns } from './db/schema.js';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    const res = await db.select().from(campaigns).where(eq(campaigns.workspaceId, 'ws-test-001'));
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
