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

  // Intelligence
  getPerformance: () => api.get('/features/performance'),
  runPreFunnelAnalysis: (url: string) => api.post('/features/pre-funnel-analysis', { url }),
  runMarketSpy: (query: string) => api.post('/features/market-spy', { query }),
  
  // Intelligence Service (Direct AI Calls)
  runAudit: (url: string) => api.post('/intelligence/audit', { url }),
  runAIAnalysis: (prompt: string, model?: string) => api.post('/intelligence/advanced-analysis', { prompt, model }),
};

export default operatorApi;
