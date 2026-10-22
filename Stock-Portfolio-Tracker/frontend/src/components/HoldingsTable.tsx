import React, { useState, useMemo } from 'react';
import type { CalculatedHolding } from '../types/portfolio';
import { 
  Search, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileDown,
  Layers
} from 'lucide-react';

interface HoldingsTableProps {
  holdings: CalculatedHolding[];
  onEdit: (holding: CalculatedHolding) => void;
  onDelete: (symbol: string) => void;
  onAddStock: () => void;
  onExportCSV: () => void;
}

type SortField = 'symbol' | 'quantity' | 'investedValue' | 'currentValue' | 'profitLoss' | 'profitLossPercent';
type SortDirection = 'asc' | 'desc';

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  onEdit,
  onDelete,
  onAddStock,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('currentValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered and sorted holdings
  const filteredHoldings = useMemo(() => {
    return holdings
      .filter((h) => {
        const query = searchQuery.toLowerCase().trim();
        return (
          h.symbol.toLowerCase().includes(query) ||
          h.name.toLowerCase().includes(query) ||
          h.sector.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [holdings, searchQuery, sortField, sortDirection]);

  return (
    <div className="rounded-2xl bg-navy-850/90 backdrop-blur-sm border border-navy-700/60 overflow-hidden shadow-xl">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-navy-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Portfolio Holdings</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-navy-800 text-slate-300 border border-navy-700">
              {holdings.length} {holdings.length === 1 ? 'Position' : 'Positions'}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your positions, average purchase costs, and calculated returns
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticker or name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Export CSV button */}
          <button
            onClick={onExportCSV}
            disabled={holdings.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-navy-900 hover:bg-navy-750 text-slate-300 border border-navy-700 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Export holdings table to CSV"
          >
            <FileDown size={14} />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Add Stock CTA */}
          <button
            onClick={onAddStock}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-navy-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Table Body / View */}
      {filteredHoldings.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-500 mb-3">
            <Layers size={24} />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">
            {searchQuery ? 'No Matching Stocks Found' : 'No Stocks in Portfolio Yet'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {searchQuery
              ? `No holdings match "${searchQuery}". Try searching for another ticker or clear the filter.`
              : 'Start tracking your investments by adding your first stock holding with quantity and purchase price.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAddStock}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-navy-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Your First Holding</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-900/60 border-b border-navy-700/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-white select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asset / Company</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white select-none transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Shares</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Avg Buy Price (₹)</th>
                <th className="py-3 px-4 text-right">Demo Price (₹)</th>
                <th
                  onClick={() => handleSort('investedValue')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white select-none transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Invested (₹)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentValue')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white select-none transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Current Value (₹)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('profitLoss')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white select-none transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Profit / Loss</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40 text-xs">
              {filteredHoldings.map((h) => {
                const isPositive = h.profitLoss >= 0;

                return (
                  <tr
                    key={h.symbol}
                    className="hover:bg-navy-800/40 transition-colors group"
                  >
                    {/* Symbol & Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 font-mono font-bold text-xs flex items-center justify-center text-emerald-400 shrink-0">
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{h.symbol}</span>
                            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-navy-800 text-slate-400 border border-navy-700">
                              {h.sector}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                            {h.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Shares Owned */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-200">
                      {h.quantity.toLocaleString()}
                    </td>

                    {/* Avg Purchase Price */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      ₹ {h.purchasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Current Demo Market Price */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                      ₹ {h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Total Invested */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      ₹ {h.investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Current Market Value */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                      ₹ {h.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Profit / Loss */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <div
                          className={`inline-flex items-center gap-1 font-mono font-semibold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>
                            {isPositive ? '+' : ''}₹{' '}
                            {Math.abs(h.profitLoss).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isPositive
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {h.profitLossPercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(h)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-750 transition-colors"
                          title="Edit holding"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(h.symbol)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove holding"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer with Summary Stats */}
      {filteredHoldings.length > 0 && (
        <div className="p-3 bg-navy-900/40 border-t border-navy-700/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            Showing <span className="text-white font-medium">{filteredHoldings.length}</span> of{' '}
            <span className="text-white font-medium">{holdings.length}</span> positions
          </div>
          <div className="text-[11px] text-slate-500">
            Click column headers to sort assets
          </div>
        </div>
      )}
    </div>
  );
};
