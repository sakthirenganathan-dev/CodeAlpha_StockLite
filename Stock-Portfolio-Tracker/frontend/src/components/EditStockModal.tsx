import React, { useState, useEffect } from 'react';
import type { CalculatedHolding } from '../types/portfolio';
import { X, Edit3, AlertCircle } from 'lucide-react';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: CalculatedHolding | null;
  onSave: (symbol: string, quantity: number, purchasePrice: number) => void;
}

export const EditStockModal: React.FC<EditStockModalProps> = ({
  isOpen,
  onClose,
  holding,
  onSave,
}) => {
  const [quantityStr, setQuantityStr] = useState('');
  const [purchasePriceStr, setPurchasePriceStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (holding) {
      setQuantityStr(holding.quantity.toString());
      setPurchasePriceStr(holding.purchasePrice.toString());
      setError(null);
    }
  }, [holding]);

  if (!isOpen || !holding) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = parseInt(quantityStr, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be a positive whole number greater than 0.');
      return;
    }

    const price = parseFloat(purchasePriceStr);
    if (isNaN(price) || price <= 0) {
      setError('Purchase price must be a number greater than 0.');
      return;
    }

    onSave(holding.symbol, qty, price);
    onClose();
  };

  const parsedQty = parseInt(quantityStr, 10) || 0;
  const parsedPrice = parseFloat(purchasePriceStr) || 0;
  const newInvested = parsedQty * parsedPrice;
  const newCurrent = parsedQty * holding.currentPrice;
  const newPnL = newCurrent - newInvested;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-navy-850 border border-navy-700/80 shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-navy-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Edit Position: {holding.symbol}</h3>
              <p className="text-xs text-slate-400">{holding.name}</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Shares Owned
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
              className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white font-mono text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Purchase Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Average Purchase Price per Share (₹)
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={purchasePriceStr}
              onChange={(e) => {
                setPurchasePriceStr(e.target.value);
                setError(null);
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white font-mono text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Updated Preview */}
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-700/60 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-300 border-b border-navy-700/50 pb-1">
              Updated Position Summary
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Invested Capital:</span>
              <span className="font-mono text-white font-semibold">
                ₹ {newInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Valuation (@ ₹{holding.currentPrice}):</span>
              <span className="font-mono text-white font-semibold">
                ₹ {newCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-navy-700/40">
              <span>Updated P&L:</span>
              <span
                className={`font-mono font-bold ${
                  newPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {newPnL >= 0 ? '+' : ''}₹{' '}
                {newPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
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
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
