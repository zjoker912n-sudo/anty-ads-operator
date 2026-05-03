import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const BASE = 'http://localhost:3000';

const token = jwt.sign(
  { userId: 'test-user-001', workspaceId: 'ws-test-001', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('\n=== JWT TOKEN (using real .env secret) ===');
console.log(token.slice(0, 60) + '...');
console.log(`\nTimestamp: ${new Date().toISOString()}\n`);

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

let passed = 0;
let failed = 0;

async function call(label, url, opts = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[TEST] ${label}`);
  console.log(`METHOD: ${opts.method || 'GET'} ${url}`);
  try {
    const res = await fetch(url, { headers, ...opts });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 200) }; }
    const status = res.status;
    const ok = status >= 200 && status < 300;
    console.log(`STATUS: ${status} ${ok ? '✅ PASS' : '❌ FAIL'}`);
    console.log('RESPONSE:\n' + JSON.stringify(json, null, 2).slice(0, 2500));
    if (ok) passed++; else failed++;
    return json;
  } catch (err) {
    console.log(`ERROR: ${err.message} ❌`);
    failed++;
  }
}

// === 1. HEALTH ===
await call('1. /api/health', `${BASE}/api/health`);

// === 2. CAMPAIGNS ===
await call('2. /api/campaigns', `${BASE}/api/campaigns?adAccountId=test-account&platform=meta`);

// === 3. ALERTS ===
await call('3. /api/alerts', `${BASE}/api/alerts`);

// === 4. OPTIMIZATION LOGS ===
await call('4. /api/logs', `${BASE}/api/logs`);

// === 5. PERFORMANCE ===
await call('5. /api/performance', `${BASE}/api/performance?accountId=test-account&platform=meta&datePreset=last_30d`);

// === 6. CREATIVE ANALYSIS ===
await call('6. /api/creative-analysis', `${BASE}/api/creative-analysis?adAccountId=test-account&platform=meta`);

// === 7. AUDIT ===
await call('7. /api/audit (GET)', `${BASE}/api/audit`);

// === 8. FUNNEL ===
await call('8. /api/funnel (GET)', `${BASE}/api/funnel`);

// === 9. SFK ENGINE ===
await call('9. /api/sfk (GET)', `${BASE}/api/sfk`);

// === 10. BUDGET ===
await call('10. /api/budget', `${BASE}/api/budget?adAccountId=test-account&platform=meta`);

// === 11. TESTING ===
await call('11. /api/testing', `${BASE}/api/testing?adAccountId=test-account&platform=meta`);

// === 12. ADMIN STATS ===
await call('12. /api/admin/stats', `${BASE}/api/admin/stats`);

// === 13. MARKET SPY ===
await call('13. /api/market-spy (POST keyword)', `${BASE}/api/market-spy`, {
  method: 'POST',
  body: JSON.stringify({ query: 'dropshipping ecommerce', platform: 'meta' })
});

// === 14. META SYNC (manual trigger) ===
await call('14. /api/meta/sync-now (POST)', `${BASE}/api/meta/sync-now`, {
  method: 'POST',
  body: JSON.stringify({ adAccountId: 'act_test_account' })
});

console.log(`\n${'='.repeat(60)}`);
console.log(`FINAL RESULTS: ${passed} PASSED / ${failed} FAILED`);
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`${'='.repeat(60)}\n`);
