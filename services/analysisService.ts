import { ScraperService } from './scraper';
import { IntelligenceService } from './intelligenceService';
import { db } from '../db/index';
import { campaignMetrics } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export class AnalysisService {
  static async performPreFunnelAnalysis(url: string, workspaceId: string) {
    console.log(`[Analysis] Starting Strategic Roadmap for ${url}`);
    
    const scraper = ScraperService.getInstance();
    const intelService = IntelligenceService.getInstance();

    try {
      // 1. Scrape Content
      const scrapeResult = await scraper.scrape(url, { screenshot: true });

      // 2. Fetch Actual Performance Data (if any)
      const performance = await db.select({
        avgRoas: sql`AVG(${campaignMetrics.roas})`,
        totalSpend: sql`SUM(${campaignMetrics.spend})`
      })
      .from(campaignMetrics)
      .where(eq(campaignMetrics.workspaceId, workspaceId!));

      const stats = performance[0];

      // 3. AI Analysis with REAL DATA
      const prompt = `
        Perform a comprehensive STRATEGIC ROADMAP for ${url}.
        
        CURRENT PERFORMANCE DATA:
        - Avg ROAS: ${stats.avgRoas || 'N/A'}
        - Total Spend: $${stats.totalSpend || '0'}
        
        WEBSITE CONTEXT:
        - Title: ${scrapeResult.title}
        - Content: ${scrapeResult.content.substring(0, 3000)}

        TASK:
        Generate a data-driven 30-day roadmap. 
        Focus on SCALE if ROAS > 2, or FIX if ROAS < 1.
        Provide specific tactical steps, not generic advice.
        Return in JSON format with fields: "roadmap_phase", "action_items", "kpi_targets".
      `;

      const aiResponse = await intelService.analyzeWithAI(prompt, 'gemini');

      return {
        url,
        title: scrapeResult.title,
        analysis: aiResponse,
        performanceStats: stats,
        screenshot: scrapeResult.screenshot
      };

    } catch (error: any) {
      console.error(`[Analysis] Analysis failed: ${error.message}`);
      throw error;
    }
  }
}
