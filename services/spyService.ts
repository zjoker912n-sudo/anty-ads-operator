import axios from 'axios';
import { ScraperService } from './scraper';

export class SpyService {
  static async spyOnCompetitor(query: string, workspaceId: string) {
    console.log(`[Spy] Spying on: ${query}`);

    try {
      // 1. Try Meta Ads Library API (if credentials exist)
      // Note: Meta Ads Library API requires a specific access token and setup
      // We will implement the scraping fallback as the primary robust method as requested
      
      const ads = await this.scrapeMetaAdsLibrary(query);
      return ads;

    } catch (error: any) {
      console.error(`[Spy] Spy failed: ${error.message}`);
      throw error;
    }
  }

  private static async scrapeMetaAdsLibrary(query: string) {
    const scraper = ScraperService.getInstance();
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(query)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all`;

    console.log(`[Spy] Scraping Meta Ads Library for: ${query}`);

    try {
      const result = await scraper.scrape(url, {
        waitForSelector: 'div[role="main"]',
        screenshot: true,
      });

      // Simple extraction logic for demonstration
      // In a real production app, we would use sophisticated CSS selectors
      // to extract 'Started running on', 'ID', 'Platforms', etc.
      
      const adsCount = (result.content.match(/Started running on/g) || []).length;
      console.log(`[Spy] Detected ~${adsCount} ads in the library for "${query}"`);

      return {
        query,
        url,
        adsFound: adsCount,
        screenshot: result.screenshot,
        timestamp: new Date().toISOString(),
        rawInsight: result.content.substring(0, 3000) // First 3k chars for AI context
      };
    } catch (error: any) {
      console.error(`[Spy] Scraping Meta Ads Library failed: ${error.message}`);
      throw new Error(`Failed to spy on ads: ${error.message}`);
    }
  }
}
