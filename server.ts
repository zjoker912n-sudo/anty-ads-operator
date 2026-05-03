import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import cookieParser from 'cookie-parser';
import './queue/worker.ts';
import { startMetaSyncScheduler } from './scheduler/metaSync.ts';

// Routes
import authRouter from './api/auth.ts';
import intelligenceRouter from './api/intelligence.ts';
import metaRouter from './api/meta.ts';
import alertsRouter from './api/alerts.ts';
import featuresRouter from './api/features.ts';
import campaignsRouter from './api/campaigns.ts';
import performanceRouter from './api/performance.ts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://anty-ads-operator.vercel.app', 
    'http://localhost:5173',
    process.env.FRONTEND_URL || '*'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Operator AI' });
});

// Register Routes
app.use('/api/auth', authRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/meta', metaRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/features', featuresRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/performance', performanceRouter);

// Start Background Processes
startMetaSyncScheduler();

app.listen(PORT, () => {
  console.log(`[Server] 🚀 Operator AI running on port ${PORT}`);
});

export default app;
