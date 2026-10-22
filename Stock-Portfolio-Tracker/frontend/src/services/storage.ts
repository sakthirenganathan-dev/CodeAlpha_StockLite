import type { StockHolding, ActivityItem } from '../types/portfolio';

const HOLDINGS_STORAGE_KEY = 'portfolio_tracker_holdings_v1';
const ACTIVITY_STORAGE_KEY = 'portfolio_tracker_activity_v1';

// Initial sample holdings demonstrating realistic user portfolio with gain and loss
export const INITIAL_HOLDINGS: StockHolding[] = [
  {
    id: 'hold-1',
    symbol: 'AAPL',
    quantity: 15,
    purchasePrice: 165.0, // bought lower -> in profit
    addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'hold-2',
    symbol: 'TSLA',
    quantity: 8,
    purchasePrice: 260.0, // bought higher -> in slight loss
    addedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'hold-3',
    symbol: 'MSFT',
    quantity: 10,
    purchasePrice: 400.0, // in profit
    addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'hold-4',
    symbol: 'GOOGL',
    quantity: 12,
    purchasePrice: 170.0, // break-even
    addedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    action: 'ADD',
    symbol: 'AAPL',
    quantity: 15,
    price: 165.0,
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    details: 'Initial position: 15 shares @ ₹165.00',
  },
  {
    id: 'act-2',
    action: 'ADD',
    symbol: 'TSLA',
    quantity: 8,
    price: 260.0,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    details: 'Initial position: 8 shares @ ₹260.00',
  },
  {
    id: 'act-3',
    action: 'ADD',
    symbol: 'MSFT',
    quantity: 10,
    price: 400.0,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    details: 'Initial position: 10 shares @ ₹400.00',
  },
];

export function loadStoredHoldings(): StockHolding[] {
  try {
    const raw = localStorage.getItem(HOLDINGS_STORAGE_KEY);
    if (!raw) {
      // First time user: save initial sample holdings
      saveStoredHoldings(INITIAL_HOLDINGS);
      return INITIAL_HOLDINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load holdings from localStorage:', err);
    return INITIAL_HOLDINGS;
  }
}

export function saveStoredHoldings(holdings: StockHolding[]): void {
  try {
    localStorage.setItem(HOLDINGS_STORAGE_KEY, JSON.stringify(holdings));
  } catch (err) {
    console.error('Failed to save holdings to localStorage:', err);
  }
}

export function loadStoredActivity(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) {
      saveStoredActivity(INITIAL_ACTIVITY);
      return INITIAL_ACTIVITY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load activity from localStorage:', err);
    return INITIAL_ACTIVITY;
  }
}

export function saveStoredActivity(activity: ActivityItem[]): void {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity.slice(0, 50))); // Keep last 50 activities
  } catch (err) {
    console.error('Failed to save activity to localStorage:', err);
  }
}

export function clearStoredPortfolio(): void {
  try {
    localStorage.removeItem(HOLDINGS_STORAGE_KEY);
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
}
