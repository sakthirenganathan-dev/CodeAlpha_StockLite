import { useState, useEffect, useCallback } from 'react';
import type { 
  StockHolding, 
  CalculatedHolding, 
  PortfolioTotals, 
  StockReference, 
  ActivityItem 
} from './types/portfolio';
import { 
  checkBackendHealth, 
  getAvailableStocks, 
  calculatePortfolio, 
  exportPortfolioToCSV,
  FALLBACK_STOCKS 
} from './services/api';
import { 
  loadStoredHoldings, 
  saveStoredHoldings, 
  loadStoredActivity, 
  saveStoredActivity,
  INITIAL_HOLDINGS 
} from './services/storage';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import type { ActiveTab } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { AllocationChart } from './components/AllocationChart';
import { HoldingsTable } from './components/HoldingsTable';
import { AddStockModal } from './components/AddStockModal';
import { EditStockModal } from './components/EditStockModal';
import { ActivityLogView } from './components/ActivityLogView';
import { ApiReferenceView } from './components/ApiReferenceView';

import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  Percent, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Plus
} from 'lucide-react';

export function App() {
  const [holdings, setHoldings] = useState<StockHolding[]>(() => loadStoredHoldings());
  const [activity, setActivity] = useState<ActivityItem[]>(() => loadStoredActivity());
  const [calculatedHoldings, setCalculatedHoldings] = useState<CalculatedHolding[]>([]);
  const [totals, setTotals] = useState<PortfolioTotals>({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalReturnPercent: 0,
    holdingsCount: 0,
  });

  const [availableStocks, setAvailableStocks] = useState<StockReference[]>(FALLBACK_STOCKS);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingHolding, setEditingHolding] = useState<CalculatedHolding | null>(null);

  // Notifications / Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Log an activity
  const recordActivity = (action: ActivityItem['action'], symbol: string, quantity: number, details: string, price?: number) => {
    const newItem: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      symbol,
      quantity,
      price,
      timestamp: new Date().toISOString(),
      details,
    };
    const updated = [newItem, ...activity].slice(0, 50);
    setActivity(updated);
    saveStoredActivity(updated);
  };

  // Initial setup: check backend health and fetch reference stocks
  useEffect(() => {
    async function init() {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);

      const stocks = await getAvailableStocks();
      setAvailableStocks(stocks);
    }
    init();

    // Re-check backend health periodically (every 30s)
    const interval = setInterval(async () => {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Recalculate portfolio whenever holdings or available stocks change
  const runCalculation = useCallback(async () => {
    const result = await calculatePortfolio(holdings, availableStocks);
    setCalculatedHoldings(result.holdings);
    setTotals(result.totals);
  }, [holdings, availableStocks]);

  useEffect(() => {
    runCalculation();
    saveStoredHoldings(holdings);
  }, [holdings, runCalculation]);

  // Handler: Add Stock
  const handleAddStock = (symbol: string, quantity: number, purchasePrice: number) => {
    const cleanSymbol = symbol.toUpperCase().trim();
    const existingIndex = holdings.findIndex((h) => h.symbol === cleanSymbol);

    let updated: StockHolding[];
    if (existingIndex >= 0) {
      // Accumulate existing stock: compute weighted average purchase price
      const existing = holdings[existingIndex];
      const totalShares = existing.quantity + quantity;
      const totalCost = (existing.quantity * existing.purchasePrice) + (quantity * purchasePrice);
      const weightedAvgPrice = Number((totalCost / totalShares).toFixed(2));

      updated = [...holdings];
      updated[existingIndex] = {
        ...existing,
        quantity: totalShares,
        purchasePrice: weightedAvgPrice,
      };

      recordActivity(
        'ADD',
        cleanSymbol,
        quantity,
        `Added ${quantity} shares to existing holding. Total: ${totalShares} @ avg ₹${weightedAvgPrice.toFixed(2)}`,
        purchasePrice
      );
      showAlert(`Added ${quantity} shares of ${cleanSymbol}. Position updated to ${totalShares} shares.`);
    } else {
      // New position
      const newHolding: StockHolding = {
        id: `hold-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        symbol: cleanSymbol,
        quantity,
        purchasePrice,
        addedAt: new Date().toISOString(),
      };
      updated = [...holdings, newHolding];

      recordActivity(
        'ADD',
        cleanSymbol,
        quantity,
        `Opened new position: ${quantity} shares @ ₹${purchasePrice.toFixed(2)}`,
        purchasePrice
      );
      showAlert(`Opened new position for ${cleanSymbol} with ${quantity} shares @ ₹${purchasePrice.toFixed(2)}`);
    }

    setHoldings(updated);
  };

  // Handler: Edit Stock
  const handleSaveEdit = (symbol: string, newQuantity: number, newPurchasePrice: number) => {
    const updated = holdings.map((h) => {
      if (h.symbol === symbol) {
        return {
          ...h,
          quantity: newQuantity,
          purchasePrice: newPurchasePrice,
        };
      }
      return h;
    });

    setHoldings(updated);
    recordActivity(
      'EDIT',
      symbol,
      newQuantity,
      `Updated position to ${newQuantity} shares @ ₹${newPurchasePrice.toFixed(2)}`,
      newPurchasePrice
    );
    showAlert(`Updated ${symbol} position successfully.`);
  };

  // Handler: Delete Stock
  const handleDeleteStock = (symbol: string) => {
    const target = holdings.find((h) => h.symbol === symbol);
    if (!target) return;

    if (window.confirm(`Are you sure you want to remove ${symbol} (${target.quantity} shares) from your portfolio?`)) {
      const updated = holdings.filter((h) => h.symbol !== symbol);
      setHoldings(updated);
      recordActivity('DELETE', symbol, target.quantity, `Closed and removed position (${target.quantity} shares)`);
      showAlert(`Removed ${symbol} from portfolio.`, 'info');
    }
  };

  // Handler: Reset Portfolio to sample demo data
  const handleResetToSample = () => {
    if (window.confirm('Reset portfolio to sample demo holdings? This will restore sample positions.')) {
      setHoldings(INITIAL_HOLDINGS);
      recordActivity('RESET', 'ALL', 0, 'Restored sample demonstration portfolio holdings');
      showAlert('Restored sample demonstration portfolio.', 'info');
    }
  };

  // Handler: Clear All Holdings
  const handleClearAll = () => {
    if (window.confirm('Clear all stocks from your portfolio?')) {
      setHoldings([]);
      recordActivity('RESET', 'ALL', 0, 'Cleared all portfolio holdings');
      showAlert('All holdings cleared from portfolio.', 'info');
    }
  };

  // Handler: Export CSV
  const handleExportCSV = () => {
    if (calculatedHoldings.length === 0) {
      showAlert('Cannot export empty portfolio. Please add stocks first.', 'error');
      return;
    }
    exportPortfolioToCSV(calculatedHoldings, totals);
    showAlert('Portfolio summary successfully exported to CSV file.');
  };

  const isProfit = totals.totalProfitLoss >= 0;

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        backendOnline={backendOnline}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCSV={handleExportCSV}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          holdingsCount={holdings.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          
          {/* Toast / Alert Banner */}
          {alert && (
            <div
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
                alert.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : alert.type === 'error'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-brand-500/15 border-brand-500/30 text-brand-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.type === 'success' ? (
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle size={18} className="shrink-0 text-rose-400" />
                )}
                <span>{alert.message}</span>
              </div>
              <button
                onClick={() => setAlert(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header Greeting & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Portfolio Overview
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Real-time valuation, net profit & loss, and asset distribution
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={handleResetToSample}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-700 transition-colors"
                    title="Load sample holdings for testing"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Demo Data</span>
                  </button>
                  {holdings.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Clear all portfolio holdings"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Primary KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Invested Capital */}
                <MetricCard
                  title="Total Invested"
                  value={`₹ ${totals.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  subtitle="Cumulative capital invested"
                  icon={Wallet}
                  variant="brand"
                  tooltip="Sum of (Purchase Price × Quantity) across all positions"
                />

                {/* 2. Current Portfolio Value */}
                <MetricCard
                  title="Current Value"
                  value={`₹ ${totals.totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  subtitle={`${totals.holdingsCount} active position${totals.holdingsCount !== 1 ? 's' : ''}`}
                  icon={Coins}
                  variant={isProfit ? 'profit' : 'loss'}
                  badge={{
                    text: `${totals.totalReturnPercent >= 0 ? '+' : ''}${totals.totalReturnPercent.toFixed(2)}%`,
                    positive: isProfit,
                  }}
                  tooltip="Sum of (Demo Market Price × Quantity)"
                />

                {/* 3. Total Profit / Loss */}
                <MetricCard
                  title="Total Profit / Loss"
                  value={`${isProfit ? '+' : '-'}₹ ${Math.abs(totals.totalProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  subtitle="Unrealized net returns"
                  icon={TrendingUp}
                  variant={isProfit ? 'profit' : 'loss'}
                  badge={{
                    text: isProfit ? 'IN PROFIT' : 'IN LOSS',
                    positive: isProfit,
                  }}
                  tooltip="Current Portfolio Value minus Total Invested Capital"
                />

                {/* 4. Portfolio Return % */}
                <MetricCard
                  title="Portfolio Return"
                  value={`${totals.totalReturnPercent >= 0 ? '+' : ''}${totals.totalReturnPercent.toFixed(2)}%`}
                  subtitle="Weighted ROI percentage"
                  icon={Percent}
                  variant={isProfit ? 'profit' : 'loss'}
                  badge={{
                    text: isProfit ? 'OUTPERFORMING' : 'UNDERPERFORMING',
                    positive: isProfit,
                  }}
                  tooltip="(Total Profit or Loss ÷ Total Invested) × 100"
                />

              </div>

              {/* Charts & Asset Allocation */}
              <AllocationChart
                holdings={calculatedHoldings}
                totalValue={totals.totalCurrentValue}
              />

              {/* Holdings Table */}
              <HoldingsTable
                holdings={calculatedHoldings}
                onEdit={(h) => setEditingHolding(h)}
                onDelete={handleDeleteStock}
                onAddStock={() => setIsAddModalOpen(true)}
                onExportCSV={handleExportCSV}
              />

              {/* Recent Activity Mini-Widget */}
              {activity.length > 0 && (
                <div className="rounded-2xl bg-navy-850/90 border border-navy-700/60 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      Recent Portfolio Events
                    </h3>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                    >
                      View Full History →
                    </button>
                  </div>
                  <div className="divide-y divide-navy-700/40">
                    {activity.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{item.symbol}</span>
                          <span className="text-slate-400">{item.details}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: HOLDINGS VIEW */}
          {activeTab === 'holdings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Stock Holdings
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Detailed inventory of all active stock positions
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-navy-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Add Stock</span>
                </button>
              </div>

              <HoldingsTable
                holdings={calculatedHoldings}
                onEdit={(h) => setEditingHolding(h)}
                onDelete={handleDeleteStock}
                onAddStock={() => setIsAddModalOpen(true)}
                onExportCSV={handleExportCSV}
              />
            </div>
          )}

          {/* TAB 3: ASSET ALLOCATION */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Asset Allocation & Valuation
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Portfolio weight distributions and capital allocation analysis
                </p>
              </div>

              <AllocationChart
                holdings={calculatedHoldings}
                totalValue={totals.totalCurrentValue}
              />
            </div>
          )}

          {/* TAB 4: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <ActivityLogView
                activity={activity}
                onClearActivity={() => {
                  setActivity([]);
                  saveStoredActivity([]);
                  showAlert('Activity log cleared.', 'info');
                }}
              />
            </div>
          )}

          {/* TAB 5: API & REFERENCE VIEW */}
          {activeTab === 'api-docs' && (
            <div className="space-y-6">
              <ApiReferenceView
                availableStocks={availableStocks}
                backendOnline={backendOnline}
              />
            </div>
          )}

        </main>
      </div>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStock={handleAddStock}
        availableStocks={availableStocks}
      />

      {/* Edit Stock Modal */}
      <EditStockModal
        isOpen={editingHolding !== null}
        onClose={() => setEditingHolding(null)}
        holding={editingHolding}
        onSave={handleSaveEdit}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-navy-700/60 bg-navy-950/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Stock Portfolio Tracker • Modern Fintech Dashboard & Python FastAPI Backend
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Illustrative INR Demo Data</span>
            <span>•</span>
            <span>Local Storage Persistence</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
