import React, { useState } from 'react';
import type { StockReference } from '../types/portfolio';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (symbol: string, quantity: number, purchasePrice: number) => void;
  availableStocks: StockReference[];
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onAddStock,
  availableStocks,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(availableStocks[0]?.symbol || 'AAPL');
  const [quantityStr, setQuantityStr] = useState('');
  const [purchasePriceStr, setPurchasePriceStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStock = availableStocks.find((s) => s.symbol === selectedSymbol) || availableStocks[0];
  const demoPrice = currentStock ? currentStock.price : 180;

  // Handle Symbol Change: auto-fill demo price into purchase price placeholder
  const handleSymbolChange = (sym: string) => {
    setSelectedSymbol(sym);
    setError(null);
  };

  // Calculations for real-time preview
  const parsedQty = parseInt(quantityStr, 10);
  const qty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 0;
  const parsedPrice = parseFloat(purchasePriceStr);
  const effectivePrice = !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : demoPrice;

  const previewInvested = qty * effectivePrice;
  const previewCurrent = qty * demoPrice;
  const previewPnL = previewCurrent - previewInvested;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate symbol
    if (!selectedSymbol) {
      setError('Please select a stock symbol.');
      return;
    }

    // Validate quantity
    if (!quantityStr.trim()) {
      setError('Please enter the number of shares owned.');
      return;
    }

    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Share quantity must be a positive whole number greater than 0.');
      return;
    }

    // Validate purchase price
    let purchasePrice = demoPrice;
    if (purchasePriceStr.trim()) {
      const priceVal = parseFloat(purchasePriceStr);
      if (isNaN(priceVal) || priceVal <= 0) {
        setError('Purchase price must be a valid number greater than 0.');
        return;
      }
      purchasePrice = priceVal;
    }

    onAddStock(selectedSymbol, quantity, purchasePrice);
    // Reset form
    setQuantityStr('');
    setPurchasePriceStr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-navy-850 border border-navy-700/80 shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-navy-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add Stock Position</h3>
              <p className="text-xs text-slate-400">Add shares to your portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Stock Symbol Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Select Stock Ticker</span>
              <span className="text-[11px] text-emerald-400 font-mono">Demo Price: ₹{demoPrice}</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {availableStocks.map((stock) => (
                <button
                  type="button"
                  key={stock.symbol}
                  onClick={() => handleSymbolChange(stock.symbol)}
                  className={`py-2 px-1 rounded-xl text-center border font-mono text-xs font-bold transition-all ${
                    selectedSymbol === stock.symbol
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                      : 'bg-navy-900 border-navy-700 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
            {currentStock && (
              <p className="text-[11px] text-slate-400 mt-1">
                {currentStock.name} • {currentStock.sector}
              </p>
            )}
          </div>

          {/* Share Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Quantity of Shares Owned <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantityStr}
              onChange={(e) => {
                setQuantityStr(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 10"
              className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              autoFocus
            />
          </div>

          {/* Purchase Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Purchase Price per Share (₹)
              </label>
              <button
                type="button"
                onClick={() => setPurchasePriceStr(demoPrice.toString())}
                className="text-[11px] text-brand-400 hover:text-brand-300 underline"
              >
                Use Demo Price (₹{demoPrice})
              </button>
            </div>
            <input
              type="number"
              min="0.01"
              step="any"
              value={purchasePriceStr}
              onChange={(e) => {
                setPurchasePriceStr(e.target.value);
                setError(null);
              }}
              placeholder={`Defaults to ₹${demoPrice}.00`}
              className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Leave blank to automatically assume purchase at current demo price.
            </p>
          </div>

          {/* Live Calculation Preview */}
          {qty > 0 && (
            <div className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-700/60 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-300 border-b border-navy-700/50 pb-1 flex items-center justify-between">
                <span>Position Preview</span>
                <span className="font-mono text-emerald-400">{selectedSymbol}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Capital Invested:</span>
                <span className="font-mono text-white font-semibold">
                  ₹ {previewInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Market Value (@ ₹{demoPrice}):</span>
                <span className="font-mono text-white font-semibold">
                  ₹ {previewCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-navy-700/40">
                <span>Projected P&L:</span>
                <span
                  className={`font-mono font-bold ${
                    previewPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {previewPnL >= 0 ? '+' : ''}₹{' '}
                  {previewPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-navy-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              Add Holding
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
