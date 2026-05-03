import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, CheckCircle2, XCircle, Plus, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { operatorApi } from '../lib/operatorApi';
import { motion, AnimatePresence } from 'framer-motion';

interface AdAccount {
  id: string;
  name: string;
  status: string;
  lastSyncedAt: string;
}

export function Settings() {
  const { user, logout } = useAuth();
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await operatorApi.get('/meta/ad-accounts');
      setAdAccounts(response.data);
    } catch (err) {
      console.error('Failed to fetch ad accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to backend OAuth initiator
    window.location.href = '/api/meta/connect';
  };

  const handleSync = async (accountId: string) => {
    try {
      await operatorApi.post(`/meta/sync/${accountId}`);
      alert('Sync started in background');
      fetchAccounts();
    } catch (err) {
      alert('Sync failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Operator Settings</h1>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-1">Terminal Configuration & Security</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all font-bold text-xs uppercase"
        >
          <LogOut className="w-4 h-4" /> Terminate Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 mb-6">
                <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-2xl font-black text-white border-4 border-[#0B0F19]">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">{user?.email?.split('@')[0]}</h2>
              <p className="text-gray-500 text-xs font-medium mt-1">{user?.email}</p>
              
              <div className="mt-6 w-full pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-green-400 bg-green-400/5 py-3 rounded-2xl border border-green-400/10">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Operator Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Accounts Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white">Linked Ad Accounts</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Meta Graph API Nodes</p>
              </div>
              <button 
                onClick={() => handleConnect('meta')}
                disabled={!!connecting}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xs uppercase shadow-[0_10px_20px_rgba(37,99,235,0.2)] disabled:opacity-50"
              >
                {connecting === 'meta' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Link Meta Account
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {adAccounts.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-gray-600 text-sm font-medium italic">No active data nodes connected.</p>
                  </div>
                ) : (
                  adAccounts.map((account) => (
                    <motion.div 
                      key={account.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 font-black">
                          {account.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{account.name}</div>
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">ID: {account.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleSync(account.id)}
                          className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          title="Manual Force Sync"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
