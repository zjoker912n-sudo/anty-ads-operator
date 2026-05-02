"use client";

import { useState } from "react";

export default function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gemini");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate API call for now
    setTimeout(() => {
      setResult(`## Generated Ad Copy (${model.toUpperCase()})

**Headline:** Unlock Your Potential with Anty Ads 🚀

**Primary Text:**
Stop wasting budget on underperforming ads. Our AI-powered operator analyzes your data in real-time to deliver maximum ROAS. Join the future of marketing automation today.

**Call to Action:** Learn More`);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold gradient-text">AI Ad Generator</h1>
        <p className="text-gray-400 mt-2">Generate high-converting ad copy and creatives in seconds.</p>
      </header>

      <div className="premium-card flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-400">Select Model</label>
          <div className="grid grid-cols-3 gap-3">
            {['gemini', 'openai', 'anthropic'].map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`p-3 rounded-xl border transition-all ${
                  model === m 
                    ? 'border-blue-500 bg-blue-500/10 text-white' 
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-400">What are you promoting?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A new line of eco-friendly running shoes targeting marathon athletes..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 focus:border-blue-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !prompt}
          className={`btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 ${
            (generating || !prompt) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {generating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Strategy...
            </>
          ) : (
            'Generate Content'
          )}
        </button>
      </div>

      {result && (
        <div className="premium-card bg-blue-500/5 border-blue-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Result</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300">Copy to Clipboard</button>
          </div>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
