import { db } from '../db/index';
import { funnelSteps } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class FunnelService {
  /**
   * Fetches data from GA4 (mocked for demonstration)
   */
  static async syncGA4Data(workspaceId: string, propertyId: string) {
    console.log(`[FunnelService] Syncing GA4 data for property ${propertyId}`);

    // Steps:
    // 1. Authenticate with Google
    // 2. Fetch events: session_start, add_to_cart, begin_checkout, purchase
    
    const mockData = [
      { step: 'Session Start', count: 10000 },
      { step: 'Add To Cart', count: 1500 },
      { step: 'Begin Checkout', count: 800 },
      { step: 'Purchase', count: 350 },
    ];

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < mockData.length; i++) {
      const current = mockData[i];
      const previous = i > 0 ? mockData[i-1] : null;
      const dropOffRate = previous ? (1 - (current.count / previous.count)) * 100 : 0;

      await db.insert(funnelSteps).values({
        workspaceId,
        date: today,
        stepName: current.step,
        count: current.count,
        dropOffRate: dropOffRate.toFixed(2),
      });
    }

    return { success: true, steps: mockData.length };
  }

  static async getFunnel(workspaceId: string) {
    return db.select().from(funnelSteps).where(eq(funnelSteps.workspaceId, workspaceId));
  }
}
