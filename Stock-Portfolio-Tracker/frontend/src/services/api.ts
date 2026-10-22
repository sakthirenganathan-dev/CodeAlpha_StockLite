import type { StockHolding, CalculatedHolding, PortfolioTotals, StockReference } from '../types/portfolio';

// Read API URL from Vite environment variable with local fallback
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

// Static fallback reference prices (INR) in case backend is offline
export const FALLBACK_STOCKS: StockReference[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 180, currency: 'INR', is_demo: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive & Clean Energy', price: 250, currency: 'INR', is_demo: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology & Communication', price: 170, currency: 'INR', is_demo: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology & Cloud', price: 420, currency: 'INR', is_demo: true },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce & Cloud', price: 190, currency: 'INR', is_demo: true },
];

export const DEMO_PRICES_MAP: Record<string, number> = {
  AAPL: 180,
  TSLA: 250,
  GOOGL: 170,
  MSFT: 420,
  AMZN: 190,
};

/**
 * Check backend API health
 */
export async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return { online: true, message: 'FastAPI Backend Online' };
    }
    return { online: false, message: `Backend responded with HTTP ${response.status}` };
  } catch {
    return { online: false, message: 'FastAPI Backend Disconnected (Operating in Standalone Mode)' };
  }
}

/**
 * Fetch available reference stocks from backend API or fallback
 */
export async function getAvailableStocks(): Promise<StockReference[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/api/stocks`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using static reference stocks:', err);
  }
  return FALLBACK_STOCKS;
}

/**
 * Calculate portfolio totals and individual metrics.
 * Calls FastAPI backend if available, otherwise executes local calculation engine.
 */
export async function calculatePortfolio(
  holdings: StockHolding[],
  availableStocks: StockReference[] = FALLBACK_STOCKS
): Promise<{ holdings: CalculatedHolding[]; totals: PortfolioTotals; source: 'api' | 'local' }> {
  if (holdings.length === 0) {
    return {
      holdings: [],
      totals: {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalReturnPercent: 0,
        holdingsCount: 0,
      },
      source: 'local',
    };
  }

  // Attempt backend calculation first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const payload = {
      items: holdings.map((h) => ({
        symbol: h.symbol,
        quantity: h.quantity,
        purchase_price: h.purchasePrice,
      })),
    };

    const response = await fetch(`${API_BASE_URL}/api/portfolio/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      
      // Map API response to calculated holdings format
      const calculated: CalculatedHolding[] = data.holdings.map((h: any, idx: number) => ({
        id: holdings[idx]?.id || `${h.symbol}-${idx}`,
        symbol: h.symbol,
        name: h.name,
        sector: h.sector,
        quantity: h.quantity,
        purchasePrice: h.purchase_price,
        currentPrice: h.current_price,
        investedValue: h.invested_value,
        currentValue: h.current_value,
        profitLoss: h.profit_loss,
        profitLossPercent: h.profit_loss_percent,
        allocationPercent: h.allocation_percent,
      }));

      return {
        holdings: calculated,
        totals: {
          totalInvested: data.total_invested,
          totalCurrentValue: data.total_current_value,
          totalProfitLoss: data.total_profit_loss,
          totalReturnPercent: data.total_return_percent,
          holdingsCount: data.holdings_count,
        },
        source: 'api',
      };
    }
  } catch (err) {
    console.info('Backend calculation failed or timed out, executing local engine:', err);
  }

  // Fallback Local Calculation Engine
  const priceMap: Record<string, number> = {};
  const metaMap: Record<string, { name: string; sector: string }> = {};

  availableStocks.forEach((s) => {
    priceMap[s.symbol] = s.price;
    metaMap[s.symbol] = { name: s.name, sector: s.sector };
  });

  // Aggregate holdings
  const aggregated: Record<
    string,
    { id: string; quantity: number; totalCost: number; currentPrice: number }
  > = {};

  holdings.forEach((h) => {
    const sym = h.symbol.toUpperCase();
    const currPrice = priceMap[sym] ?? DEMO_PRICES_MAP[sym] ?? 100;
    const cost = h.purchasePrice > 0 ? h.purchasePrice : currPrice;

    if (!aggregated[sym]) {
      aggregated[sym] = {
        id: h.id,
        quantity: 0,
        totalCost: 0,
        currentPrice: currPrice,
      };
    }
    aggregated[sym].quantity += h.quantity;
    aggregated[sym].totalCost += cost * h.quantity;
  });

  const totalCurrentValue = Object.values(aggregated).reduce(
    (acc, item) => acc + item.quantity * item.currentPrice,
    0
  );
  const totalInvested = Object.values(aggregated).reduce((acc, item) => acc + item.totalCost, 0);

  const calculated: CalculatedHolding[] = Object.entries(aggregated).map(([sym, item]) => {
    const meta = metaMap[sym] || { name: sym, sector: 'General' };
    const investedValue = Number(item.totalCost.toFixed(2));
    const avgPrice = Number((item.totalCost / item.quantity).toFixed(2));
    const currentValue = Number((item.quantity * item.currentPrice).toFixed(2));
    const profitLoss = Number((currentValue - investedValue).toFixed(2));
    const profitLossPercent =
      investedValue > 0 ? Number(((profitLoss / investedValue) * 100).toFixed(2)) : 0;
    const allocationPercent =
      totalCurrentValue > 0 ? Number(((currentValue / totalCurrentValue) * 100).toFixed(2)) : 0;

    return {
      id: item.id,
      symbol: sym,
      name: meta.name,
      sector: meta.sector,
      quantity: item.quantity,
      purchasePrice: avgPrice,
      currentPrice: item.currentPrice,
      investedValue,
      currentValue,
      profitLoss,
      profitLossPercent,
      allocationPercent,
    };
  });

  calculated.sort((a, b) => b.currentValue - a.currentValue);

  const totalProfitLoss = Number((totalCurrentValue - totalInvested).toFixed(2));
  const totalReturnPercent =
    totalInvested > 0 ? Number(((totalProfitLoss / totalInvested) * 100).toFixed(2)) : 0;

  return {
    holdings: calculated,
    totals: {
      totalInvested: Number(totalInvested.toFixed(2)),
      totalCurrentValue: Number(totalCurrentValue.toFixed(2)),
      totalProfitLoss,
      totalReturnPercent,
      holdingsCount: calculated.length,
    },
    source: 'local',
  };
}

/**
 * Export portfolio summary to CSV file
 */
export function exportPortfolioToCSV(holdings: CalculatedHolding[], totals: PortfolioTotals): void {
  const headers = [
    'Stock Symbol',
    'Company Name',
    'Sector',
    'Shares Owned',
    'Avg Purchase Price (INR)',
    'Demo Market Price (INR)',
    'Total Invested (INR)',
    'Current Value (INR)',
    'Profit/Loss (INR)',
    'Return (%)',
    'Portfolio Allocation (%)',
  ];

  const rows = holdings.map((h) => [
    h.symbol,
    `"${h.name}"`,
    `"${h.sector}"`,
    h.quantity,
    h.purchasePrice.toFixed(2),
    h.currentPrice.toFixed(2),
    h.investedValue.toFixed(2),
    h.currentValue.toFixed(2),
    h.profitLoss.toFixed(2),
    `${h.profitLossPercent.toFixed(2)}%`,
    `${h.allocationPercent.toFixed(2)}%`,
  ]);

  const summaryRows = [
    [],
    ['PORTFOLIO SUMMARY'],
    ['Total Invested (INR)', '', '', '', '', '', totals.totalInvested.toFixed(2)],
    ['Total Current Value (INR)', '', '', '', '', '', totals.totalCurrentValue.toFixed(2)],
    ['Total Profit / Loss (INR)', '', '', '', '', '', totals.totalProfitLoss.toFixed(2)],
    ['Total Portfolio Return (%)', '', '', '', '', '', `${totals.totalReturnPercent.toFixed(2)}%`],
    ['Total Active Holdings', '', '', '', '', '', totals.holdingsCount],
    ['Note: Prices are illustrative demo reference values in INR and not live market data.'],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    ...summaryRows.map((r) => r.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `portfolio_summary_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
