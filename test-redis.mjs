import dotenv from 'dotenv';
dotenv.config();

// Test the REAL Upstash Redis that IS configured
const redisUrl = process.env.REDIS_URL;
console.log('REDIS_URL:', redisUrl ? redisUrl.replace(/:[^:@]+@/, ':***@') : 'MISSING');

if (!redisUrl) {
  console.log('❌ No REDIS_URL found');
  process.exit(1);
}

// Test Redis connection
import IORedis from 'ioredis';

const client = new IORedis(redisUrl, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  connectTimeout: 10000,
  lazyConnect: false
});

console.log('\nConnecting to Upstash Redis...');

client.on('connect', async () => {
  console.log('✅ Redis CONNECTED!');
  
  try {
    // PING test
    const pong = await client.ping();
    console.log('PING:', pong);
    
    // Write test data
    await client.set('test:operator_ai', JSON.stringify({
      timestamp: new Date().toISOString(),
      test: 'validation',
      status: 'LIVE'
    }), 'EX', 300);
    
    const data = await client.get('test:operator_ai');
    console.log('\n✅ WRITE + READ test:');
    console.log(JSON.parse(data));
    
    // Check existing keys
    const keys = await client.keys('*');
    console.log(`\nExisting keys in Redis: ${keys.length}`);
    keys.slice(0, 20).forEach(k => console.log(' -', k));
    
    await client.quit();
    console.log('\n✅ REDIS VALIDATION COMPLETE');
  } catch (err) {
    console.error('Redis operation error:', err.message);
    await client.quit();
  }
});

client.on('error', (err) => {
  console.error('❌ Redis ERROR:', err.message);
});

// Timeout fallback
setTimeout(() => {
  console.log('❌ Connection timed out');
  process.exit(1);
}, 15000);
