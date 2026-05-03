import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('operator_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const operatorApi = {
  // Auth
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),

  // Meta Integration
  connectMetaAccount: (data: any) => api.post('/meta/connect', data),
  getMetaAccounts: () => api.get('/meta/accounts'),
  syncMeta: (adAccountId: string) => api.post('/meta/sync', { adAccountId }),

  // 1. Unified Performance
  getPerformance: () => api.get('/performance/dashboard'),

  // 2. Live Market Spy
  runMarketSpy: (query: string) => api.post('/market-spy', { query }),

  // 3. Creative Intelligence
  getCreativeAnalysis: () => api.get('/creative-analysis'),

  // 4. Intelligent Audit
  getAudit: () => api.get('/audit'),

  // 5. S.F.K Execution Engine
  getSfkActions: () => api.get('/sfk'),
  executeSfkAction: (actionId: string) => api.post('/sfk/execute', { actionId }),

  // 6. Budget Orchestration
  getBudgetPlan: () => api.get('/budget'),

  // 7. Testing Engine
  getTests: () => api.get('/testing'),

  // 8. Funnel Diagnosis
  getFunnel: () => api.get('/funnel'),

  // 9. Market Intel
  getMarketIntel: (url: string) => api.post('/market-intel', { url }),

  // 10. Pre-Funnel Analysis
  runPreFunnelAnalysis: (url: string) => api.post('/pre-funnel', { url }),

  // 11. Smart Alerts
  getAlerts: () => api.get('/alerts'),

  // 12. Optimization Logs
  getLogs: () => api.get('/logs'),

  // 13. Admin Command Panel
  getAdminStats: () => api.get('/admin/stats'),

  // Direct AI Calls (Fallback/Manual)
  runAIAnalysis: (prompt: string, model?: string) => api.post('/intelligence/advanced-analysis', { prompt, model }),
  
  // Raw API
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};

export default operatorApi;
