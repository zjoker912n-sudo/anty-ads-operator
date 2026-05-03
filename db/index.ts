import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('[DB] ⚠️ DATABASE_URL is not set. Database features will not work.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/placeholder',
  ssl: process.env.DATABASE_URL?.includes('railway.app') || process.env.DATABASE_URL?.includes('neon') 
    ? { rejectUnauthorized: false } 
    : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('[DB] Pool error (non-fatal):', err.message);
});

export const db = drizzle(pool, { schema });
