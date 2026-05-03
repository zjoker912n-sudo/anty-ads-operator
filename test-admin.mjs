import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: 'test-user-001', workspaceId: 'ws-test-001', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const res = await fetch('http://localhost:3000/api/admin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await res.json());
