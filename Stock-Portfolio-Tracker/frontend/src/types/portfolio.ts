export interface StockHolding {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  addedAt: string;
}

export interface CalculatedHolding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  allocationPercent: number;
}

export interface PortfolioTotals {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalReturnPercent: number;
  holdingsCount: number;
}

export interface StockReference {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  currency: string;
  is_demo: boolean;
}

export interface ActivityItem {
  id: string;
  action: 'ADD' | 'EDIT' | 'DELETE' | 'RESET';
  symbol: string;
  quantity: number;
  price?: number;
  timestamp: string;
  details: string;
}
