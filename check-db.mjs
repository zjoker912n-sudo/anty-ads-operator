import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Client } = pkg;

const dbUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL:', dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':***@') : 'MISSING');

const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 10000 });

try {
  console.log('Connecting to PostgreSQL...');
  await client.connect();
  console.log('✅ Connected!');
  
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('\nExisting tables:');
  if (res.rows.length === 0) {
    console.log('  (no tables found — database is empty, migration needed)');
  } else {
    res.rows.forEach(r => console.log(' -', r.table_name));
  }

  // Show row counts for key tables
  for (const table of ['campaigns', 'campaign_metrics', 'alerts', 'optimization_logs', 'creatives', 'users', 'workspaces']) {
    try {
      const count = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      console.log(`  ${table}: ${count.rows[0].count} rows`);
    } catch {
      console.log(`  ${table}: NOT FOUND`);
    }
  }

  await client.end();
} catch (err) {
  console.error('❌ DB Connection failed:', err.message);
  process.exit(1);
}
