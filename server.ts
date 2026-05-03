import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startMetaSyncScheduler } from './scheduler/metaSync.ts';

// Routes
import authRouter from './api/auth.ts';
import intelligenceRouter from './api/intelligence.ts';
import metaRouter from './api/meta.ts';
import alertsRouter from './api/alerts.ts';
import featuresRouter from './api/features.ts';
import campaignsRouter from './api/campaigns.ts';
import performanceRouter from './api/performance.ts';
import marketSpyRouter from './api/market-spy.ts';
import creativeAnalysisRouter from './api/creative-analysis.ts';
import auditRouter from './api/audit.ts';
import sfkRouter from './api/sfk.ts';
import budgetRouter from './api/budget.ts';
import testingRouter from './api/testing.ts';
import funnelRouter from './api/funnel.ts';
import marketIntelRouter from './api/market-intel.ts';
import preFunnelRouter from './api/pre-funnel.ts';
import logsRouter from './api/logs.ts';
import adminRouter from './api/admin.ts';

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
app.use('/api/market-spy', marketSpyRouter);
app.use('/api/creative-analysis', creativeAnalysisRouter);
app.use('/api/audit', auditRouter);
app.use('/api/sfk', sfkRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/testing', testingRouter);
app.use('/api/funnel', funnelRouter);
app.use('/api/market-intel', marketIntelRouter);
app.use('/api/pre-funnel', preFunnelRouter);
app.use('/api/logs', logsRouter);
app.use('/api/admin', adminRouter);

// Start Background Processes
try {
  startMetaSyncScheduler();
} catch (e: any) {
  console.warn('[Server] Scheduler start skipped:', e.message);
}

app.listen(PORT, () => {
  console.log(`[Server] 🚀 Operator AI running on port ${PORT}`);
});

export default app;
