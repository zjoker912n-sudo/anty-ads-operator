import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;
console.log('JWT_SECRET present:', !!secret);
if (secret) {
  console.log('JWT_SECRET prefix:', secret.slice(0, 30) + '...');
} else {
  console.log('Using fallback: operator-ai-secret-key-123');
}

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL prefix:', process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[0].replace(/:([^:@]+)@/, ':***@') : 'MISSING');
