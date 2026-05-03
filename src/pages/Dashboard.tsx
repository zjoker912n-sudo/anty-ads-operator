import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  ArrowUpRight, ArrowDownRight, Filter, 
  Calendar, Download, LayoutGrid, List
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { operatorApi } from '../lib/operatorApi';
import { motion } from 'framer-motion';

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await operatorApi.get('/performance/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Initializing Dashboard</p>
        </div>
      </div>
    );
  }

  const totals = data?.totals || { totalSpend: 0, totalConversions: 0, avgRoas: 0, totalClicks: 0 };

  return (
    <div className="min-h-screen bg-[#030712] p-8 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Command Terminal</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-400/5 px-3 py-1 rounded-full border border-blue-400/10">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Live Data Pipeline
            </span>
            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
              Last Synced: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex">
            <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl transition-all shadow-xl">
              Overview
            </button>
            <button className="px-4 py-2 text-gray-500 text-xs font-bold rounded-xl hover:text-white transition-all">
              Analysis
            </button>
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ad Spend', value: `$${parseFloat(totals.totalSpend).toLocaleString()}`, icon: DollarSign, color: 'blue' },
          { label: 'Revenue (Est)', value: `$${(parseFloat(totals.totalSpend) * parseFloat(totals.avgRoas || 0)).toLocaleString()}`, icon: TrendingUp, color: 'indigo' },
          { label: 'ROAS', value: `${parseFloat(totals.avgRoas || 0).toFixed(2)}x`, icon: ArrowUpRight, color: 'green' },
          { label: 'Conversions', value: totals.totalConversions.toLocaleString(), icon: Users, color: 'purple' },
        ].map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/10 blur-[40px] rounded-full translate-x-12 -translate-y-12 transition-all group-hover:scale-150`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${kpi.color}-500/10 rounded-2xl`}>
                  <kpi.icon className={`w-5 h-5 text-${kpi.color}-400`} />
                </div>
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">+12.5%</span>
              </div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-10 rounded-[3rem] border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Yield Trajectory</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Daily Spend & ROAS Dynamics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ROAS</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeSeries}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 glass-panel p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">Campaign Tree</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Top Performing Assets</p>
          </div>

          <div className="space-y-6 flex-1">
            {data?.topCampaigns?.map((camp: any, idx: number) => (
              <div key={idx} className="group p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{camp.platform}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{camp.name}</h4>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Budget</span>
                    <span className="text-xs font-bold text-white">${parseFloat(camp.dailyBudget || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Status</span>
                    <span className="text-xs font-bold text-white uppercase">{camp.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
            View All Campaigns
          </button>
        </div>
      </div>
    </div>
  );
}
