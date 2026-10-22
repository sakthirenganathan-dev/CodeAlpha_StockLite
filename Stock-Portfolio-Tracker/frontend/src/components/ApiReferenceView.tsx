import React from 'react';
import type { StockReference } from '../types/portfolio';
import { Database, Server, AlertTriangle, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface ApiReferenceViewProps {
  availableStocks: StockReference[];
  backendOnline: boolean;
}

export const ApiReferenceView: React.FC<ApiReferenceViewProps> = ({
  availableStocks,
  backendOnline,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/health',
      desc: 'System health check & availability verification',
      example: `curl -X GET "${API_BASE_URL}/api/health"`,
    },
    {
      method: 'GET',
      path: '/api/stocks',
      desc: 'Retrieve available reference stocks, metadata, and illustrative INR prices',
      example: `curl -X GET "${API_BASE_URL}/api/stocks"`,
    },
    {
      method: 'POST',
      path: '/api/portfolio/calculate',
      desc: 'Evaluate holdings, compute invested capital, current valuation, and P&L percentages',
      example: `curl -X POST "${API_BASE_URL}/api/portfolio/calculate" \\
  -H "Content-Type: application/json" \\
  -d '{"items": [{"symbol": "AAPL", "quantity": 10, "purchase_price": 175.0}]}'`,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Demo Data Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle size={16} />
          <span>ILLUSTRATIVE DEMO DATA SPECIFICATION</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The prices used in this application are strictly illustrative reference values in Indian Rupees (₹)
          defined for academic and demonstration purposes. They do not represent live market feeds.
          The modular service architecture is designed so a real-time exchange API (such as AlphaVantage, Yahoo Finance, or polygon.io) can be plugged in without refactoring the UI.
        </p>
      </div>

      {/* Available Reference Stocks Table */}
      <div className="rounded-2xl bg-navy-850/90 backdrop-blur-sm border border-navy-700/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Database size={18} className="text-emerald-400" />
              <span>Configured Reference Stock Dictionary</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hardcoded illustrative benchmark assets used for validation and valuations
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-navy-900 border border-navy-700 text-slate-300">
            {availableStocks.length} Assets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="p-3.5 rounded-xl bg-navy-900 border border-navy-700/60 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-800 text-slate-400 border border-navy-700">
                    {stock.sector}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Unit Price</div>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  ₹ {stock.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FastAPI Endpoints */}
      <div className="rounded-2xl bg-navy-850/90 backdrop-blur-sm border border-navy-700/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Server size={18} className="text-brand-400" />
              <span>FastAPI Backend Service Endpoints</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current API Base: <code className="text-brand-300 font-mono">{API_BASE_URL}</code>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className={backendOnline ? 'text-emerald-300' : 'text-slate-400'}>
              {backendOnline ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {endpoints.map((ep, idx) => (
            <div
              key={ep.path}
              className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-700/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      ep.method === 'GET'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-white font-bold">{ep.path}</span>
                </div>

                <button
                  onClick={() => copyToClipboard(ep.example, idx)}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                  title="Copy curl command"
                >
                  {copiedIndex === idx ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span className="text-[10px]">curl</span>
                </button>
              </div>

              <p className="text-xs text-slate-400">{ep.desc}</p>

              <pre className="p-2.5 rounded-lg bg-navy-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-navy-800">
                {ep.example}
              </pre>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
