import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { CalculatedHolding } from '../types/portfolio';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface AllocationChartProps {
  holdings: CalculatedHolding[];
  totalValue: number;
}

const FINTECH_COLORS = [
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#38bdf8', // Sky Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
];

export const AllocationChart: React.FC<AllocationChartProps> = ({ holdings, totalValue }) => {
  const [chartMode, setChartMode] = useState<'donut' | 'bar'>('donut');

  if (holdings.length === 0) {
    return (
      <div className="rounded-2xl bg-navy-850/90 border border-navy-700/60 p-8 flex flex-col items-center justify-center text-center">
        <PieIcon className="w-12 h-12 text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">No Asset Data</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Add stocks to your portfolio to view real-time asset allocation and valuation distributions.
        </p>
      </div>
    );
  }

  // Data for Donut Chart
  const pieData = holdings.map((h) => ({
    name: h.symbol,
    fullName: h.name,
    value: h.currentValue,
    percent: h.allocationPercent,
  }));

  // Data for Comparison Bar Chart
  const barData = holdings.map((h) => ({
    symbol: h.symbol,
    'Invested Value': h.investedValue,
    'Current Value': h.currentValue,
  }));

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-950 border border-navy-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="font-bold text-white flex items-center justify-between gap-4">
            <span>{data.name}</span>
            <span className="text-slate-400 font-normal">{data.fullName}</span>
          </div>
          <div className="text-emerald-400 font-mono font-semibold">
            ₹ {data.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-slate-400">
            Allocation: <span className="text-white font-mono">{data.percent}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-950 border border-navy-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5">
          <div className="font-bold text-white border-b border-navy-800 pb-1">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-mono text-white">
                ₹ {entry.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-navy-850/90 backdrop-blur-sm border border-navy-700/60 p-5 space-y-5">
      
      {/* Header and Chart Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-700/50">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Portfolio Allocation & Exposure</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown of capital deployment across {holdings.length} asset{holdings.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-navy-900 rounded-xl border border-navy-700/70 self-start sm:self-auto">
          <button
            onClick={() => setChartMode('donut')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              chartMode === 'donut'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon size={14} />
            <span>Allocation</span>
          </button>
          <button
            onClick={() => setChartMode('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              chartMode === 'bar'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Valuation Compare</span>
          </button>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <div className="lg:col-span-7 h-64 sm:h-72">
          {chartMode === 'donut' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FINTECH_COLORS[index % FINTECH_COLORS.length]}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="symbol" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  iconType="circle"
                />
                <Bar dataKey="Invested Value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Current Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Breakdown Legend List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Holdings Distribution
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {holdings.map((h, idx) => {
              const color = FINTECH_COLORS[idx % FINTECH_COLORS.length];
              return (
                <div
                  key={h.symbol}
                  className="flex items-center justify-between p-2 rounded-xl bg-navy-900/60 border border-navy-700/40 hover:border-navy-600 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{h.symbol}</span>
                        <span className="text-[10px] font-normal text-slate-400 truncate max-w-[100px]">
                          {h.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {h.quantity} shares @ ₹{h.currentPrice.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-white">
                      ₹ {h.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      {h.allocationPercent}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-navy-700/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Portfolio Net Worth:</span>
            <span className="text-white font-bold">
              ₹ {totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
