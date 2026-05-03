import { adminDb } from '../firebase-config';
import { db } from '../db/index';
import { users, workspaces, adAccounts, campaigns } from '../db/schema';

async function migrate() {
  console.log('[Migration] 🚀 Starting Firestore to PostgreSQL migration...');

  try {
    // 1. Migrate Workspaces
    const wsSnapshot = await adminDb.collection('workspaces').get();
    for (const wsDoc of wsSnapshot.docs) {
      const data = wsDoc.data();
      await db.insert(workspaces).values({
        id: wsDoc.id as any,
        name: data.name || 'Untitled Workspace',
        plan: data.plan || 'free',
      }).onConflictDoNothing();
      console.log(`[Migration] Migrated workspace: ${wsDoc.id}`);
    }

    // 2. Migrate Users
    const usersSnapshot = await adminDb.collection('users').get();
    for (const uDoc of usersSnapshot.docs) {
      const data = uDoc.data();
      await db.insert(users).values({
        id: uDoc.id as any,
        email: data.email,
        passwordHash: data.passwordHash || '',
        workspaceId: data.workspaceId,
        role: data.role || 'manager',
      }).onConflictDoNothing();
    }

    // 3. Migrate Campaigns
    // This could be large, so we do it workspace by workspace
    for (const wsDoc of wsSnapshot.docs) {
      const campSnapshot = await adminDb.collection('workspaces').doc(wsDoc.id).collection('campaigns').get();
      for (const cDoc of campSnapshot.docs) {
        const data = cDoc.data();
        await db.insert(campaigns).values({
          id: cDoc.id,
          workspaceId: wsDoc.id as any,
          adAccountId: data.adAccountId,
          name: data.name,
          status: data.status,
          objective: data.objective,
          platform: data.platform || 'meta',
        }).onConflictDoNothing();
      }
    }

    console.log('[Migration] ✅ Migration completed successfully.');
  } catch (error: any) {
    console.error('[Migration] ❌ Migration failed:', error.message);
  }
}

migrate();
