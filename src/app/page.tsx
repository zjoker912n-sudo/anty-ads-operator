export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold gradient-text">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back. Here's what's happening across your ad accounts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Spend" value="$12,450.80" change="+12.5%" trend="up" />
        <StatsCard title="Conversions" value="842" change="+5.2%" trend="up" />
        <StatsCard title="Avg. CPC" value="$1.48" change="-2.1%" trend="down" />
        <StatsCard title="ROAS" value="4.2x" change="+0.8%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 premium-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Performance Analytics</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs glass-panel">7D</button>
              <button className="px-3 py-1 text-xs glass-panel bg-white/10">30D</button>
              <button className="px-3 py-1 text-xs glass-panel">90D</button>
            </div>
          </div>
          <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_0%,_transparent_70%)]"></div>
            <p className="text-gray-500 font-mono text-sm">CHART_VISUALIZATION_READY</p>
          </div>
        </div>

        <div className="premium-card flex flex-col gap-4">
          <h2 className="text-xl font-bold">Platform Distribution</h2>
          <div className="flex flex-col gap-4">
            <PlatformProgress name="Meta Ads" value={45} color="bg-blue-500" />
            <PlatformProgress name="Google Ads" value={30} color="bg-red-500" />
            <PlatformProgress name="TikTok Ads" value={15} color="bg-cyan-400" />
            <PlatformProgress name="Snapchat Ads" value={10} color="bg-yellow-400" />
          </div>
        </div>
      </div>

      <div className="premium-card">
        <h2 className="text-xl font-bold mb-4">Recent AI Generations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-gray-400 font-medium">Campaign Name</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Model</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Date</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 font-medium">Summer Sale 2026</td>
                <td className="py-4 px-4">Gemini 1.5 Pro</td>
                <td className="py-4 px-4 text-gray-400">May 2, 2026</td>
                <td className="py-4 px-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Completed</span></td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 font-medium">New Arrival Launch</td>
                <td className="py-4 px-4">GPT-4o</td>
                <td className="py-4 px-4 text-gray-400">May 1, 2026</td>
                <td className="py-4 px-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, trend }: any) {
  return (
    <div className="premium-card flex flex-col gap-2">
      <span className="text-gray-400 text-sm">{title}</span>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold">{value}</span>
        <span className={`text-xs font-bold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

function PlatformProgress({ name, value, color }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span>{name}</span>
        <span className="text-gray-400">{value}%</span>
      </div>
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
