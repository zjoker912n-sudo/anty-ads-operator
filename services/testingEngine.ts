export class TestingEngine {
  /**
   * Compares two variants using a simplified Bayesian/Frequentist approach
   */
  static compareVariants(v1: { clicks: number, impressions: number }, v2: { clicks: number, impressions: number }) {
    const ctr1 = v1.clicks / v1.impressions;
    const ctr2 = v2.clicks / v2.impressions;

    // Simple Standard Error calculation
    const se1 = Math.sqrt((ctr1 * (1 - ctr1)) / v1.impressions);
    const se2 = Math.sqrt((ctr2 * (1 - ctr2)) / v2.impressions);

    // Z-score calculation
    const zScore = Math.abs(ctr1 - ctr2) / Math.sqrt(se1 ** 2 + se2 ** 2);
    
    // Confidence Score (Simplified mapping)
    let confidence = 0;
    if (zScore > 1.96) confidence = 95;
    else if (zScore > 1.64) confidence = 90;
    else if (zScore > 1.28) confidence = 80;
    else confidence = 50;

    const winner = ctr1 > ctr2 ? 'Variant A' : 'Variant B';

    return {
      winner,
      confidenceScore: confidence,
      ctrA: (ctr1 * 100).toFixed(2) + '%',
      ctrB: (ctr2 * 100).toFixed(2) + '%',
      isStatisticallySignificant: confidence >= 95
    };
  }
}
