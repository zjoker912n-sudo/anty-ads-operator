export default function Platforms() {
  const platforms = [
    { name: "Meta Ads", icon: "M", color: "bg-blue-600", status: "Connected", id: "1984316142437697" },
    { name: "Google Ads", icon: "G", color: "bg-red-500", status: "Connected", id: "697710140060-dcj92..." },
    { name: "TikTok Ads", icon: "T", color: "bg-black", status: "Action Required", id: null },
    { name: "Snapchat Ads", icon: "S", color: "bg-yellow-400", status: "Action Required", id: null },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold gradient-text">Ad Platforms</h1>
        <p className="text-gray-400 mt-2">Manage your connections and API configurations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((p) => (
          <div key={p.name} className="premium-card flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${p.color} flex items-center justify-center font-bold text-xl`}>
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="text-sm text-gray-400">{p.id ? `App ID: ${p.id}` : 'Not configured'}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                p.status === 'Connected' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {p.status}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">API Health</span>
                <span className="text-green-400">99.9%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[99%]"></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                Settings
              </button>
              <button className="flex-1 py-2 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-400 hover:bg-blue-600/30 transition-colors text-sm font-medium">
                Sync Data
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card bg-orange-500/5 border-orange-500/20">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h4 className="font-bold text-orange-400">Missing TikTok & Snapchat Credentials</h4>
            <p className="text-sm text-gray-400 mt-1">
              Some platforms are missing Client IDs or Secrets in your .env file. Please update them to enable full automation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
