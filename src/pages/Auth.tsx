import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { Target, Zap, ArrowRight, Shield, Mail, Lock, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginWithEmail, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await register(email, password, workspaceName);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl bg-white/[0.02] backdrop-blur-3xl">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Operator AI</h1>
            <p className="text-gray-500 text-sm font-bold tracking-widest mt-2 uppercase">Access Terminal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Workspace Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. My Agency"
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Enter Terminal' : 'Initialize Workspace'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-500 text-xs font-bold hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Create Workspace" : "Already have an account? Login"}
            </button>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secure Protocol</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Zero-Trust Auth</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
