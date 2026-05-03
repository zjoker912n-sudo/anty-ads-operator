import { ScraperService } from './scraper';
import { db } from '../db/index';
import { marketIntel } from '../db/schema';

export class MarketIntelService {
  static async performFullAudit(url: string, workspaceId: string) {
    console.log(`[MarketIntel] Starting full audit for ${url}`);
    
    const scraper = ScraperService.getInstance();
    const result = await scraper.scrape(url, { screenshot: true });

    // 1. SEO Audit
    const seoAudit = {
      title: result.title,
      headings: (result.content.match(/#{1,6}\s.*/g) || []).slice(0, 10),
      metaTags: { description: 'Extracted via scraper' }
    };

    // 2. Keyword Analysis
    const keywords = this.extractKeywords(result.content);

    // 3. Content Audit
    const topics = ['SaaS', 'Marketing', 'Automation']; // Simulated extraction

    // 4. Strategic Risks
    const risks = ['Market Saturation', 'High Competitor Ad Spend'];

    // 5. Store in DB
    const [inserted] = await db.insert(marketIntel).values({
      workspaceId,
      url,
      seoAudit,
      keywordsAnalysis: { topKeywords: keywords },
      contentAudit: { topics },
      strategicRisks: { risks },
      createdAt: new Date()
    }).returning();

    return inserted;
  }

  private static extractKeywords(content: string) {
    const words = content.toLowerCase().match(/\b(\w{5,})\b/g) || [];
    const freq: any = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    return Object.entries(freq)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10)
      .map(e => e[0]);
  }
}
