import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Zap, Target, Search, 
  ArrowRight, BarChart2, MousePointer2, ShoppingCart, 
  CreditCard, CheckCircle, AlertTriangle
} from 'lucide-react';
import { operatorApi } from '../lib/operatorApi';
import { motion } from 'framer-motion';

export function IntelligenceHub() {
  const [auditData, setAuditData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntel();
  }, []);

  const fetchIntel = async () => {
    try {
      const [auditRes, funnelRes] = await Promise.all([
        operatorApi.get('/features/audit/latest'), // Need to add this endpoint
        operatorApi.get('/features/funnel')       // Need to add this endpoint
      ]);
      setAuditData(auditRes.data);
      setFunnelData(funnelRes.data);
    } catch (err) {
      console.error('Failed to fetch intelligence data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] p-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Intelligence Hub</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Autonomous Audit & Funnel Diagnosis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Intelligent Audit Section */}
        <div className="glass-panel p-10 rounded-[3rem] border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Autonomous Performance Audit</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Rule-Based Issue Detection</p>
            </div>
          </div>

          <div className="space-y-6">
            {auditData?.issues?.map((issue: any, idx: number) => (
              <div key={idx} className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{issue.problem}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cause</p>
                  <p className="text-sm text-white mt-1">{issue.cause}</p>
                </div>
                <div className="pt-4 border-t border-red-500/10">
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Recommended Fix</p>
                  <p className="text-sm text-white mt-1 font-bold italic">"{issue.fix}"</p>
                </div>
              </div>
            )) || (
              <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500 text-sm font-medium">No critical performance issues detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Funnel Diagnosis Section */}
        <div className="glass-panel p-10 rounded-[3rem] border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <BarChart2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Funnel Diagnosis</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">GA4 Acquisition Flow</p>
            </div>
          </div>

          <div className="space-y-4">
            {funnelData.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-2xl relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                      0{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{step.stepName}</div>
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{step.count.toLocaleString()} Events</div>
                    </div>
                  </div>
                  {idx > 0 && (
                    <div className="text-right">
                      <div className="text-red-400 text-xs font-black">-{step.dropOffRate}%</div>
                      <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Drop-off</div>
                    </div>
                  )}
                </div>
                {idx < funnelData.length - 1 && (
                  <div className="flex justify-center -my-2 relative z-0">
                    <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-xs text-blue-400 font-black uppercase tracking-widest mb-2">Deep Insight</p>
            <p className="text-sm text-gray-300 italic leading-relaxed">
              "Major drop-off detected at **Begin Checkout**. Suggests friction in shipping calculations or guest checkout availability."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
