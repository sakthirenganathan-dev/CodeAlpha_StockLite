"""
Stock Portfolio Tracker - FastAPI Backend
==========================================
Provides endpoints to fetch available reference stocks, validate holdings,
and calculate portfolio valuations, profit/loss, and asset allocations.
"""

import os
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Configuration & Constants
# ---------------------------------------------------------------------------

# Predefined illustrative stock prices (INR reference values)
DEMO_STOCK_PRICES: Dict[str, float] = {
    "AAPL": 180.0,
    "TSLA": 250.0,
    "GOOGL": 170.0,
    "MSFT": 420.0,
    "AMZN": 190.0
}

STOCK_METADATA = {
    "AAPL": {"name": "Apple Inc.", "sector": "Technology"},
    "TSLA": {"name": "Tesla Inc.", "sector": "Automotive & Clean Energy"},
    "GOOGL": {"name": "Alphabet Inc.", "sector": "Technology & Communication"},
    "MSFT": {"name": "Microsoft Corporation", "sector": "Technology & Cloud"},
    "AMZN": {"name": "Amazon.com Inc.", "sector": "E-Commerce & Cloud"}
}

# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class StockInfo(BaseModel):
    symbol: str
    name: str
    sector: str
    price: float
    currency: str = "INR"
    is_demo: bool = True


class PortfolioItemInput(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol (e.g., AAPL)")
    quantity: int = Field(..., description="Number of shares owned (must be > 0)")
    purchase_price: Optional[float] = Field(
        None, description="Average purchase price in INR per share (must be > 0). If omitted, defaults to demo market price."
    )

    @field_validator("symbol")
    @classmethod
    def validate_symbol(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("Stock symbol cannot be empty.")
        if cleaned not in DEMO_STOCK_PRICES:
            supported = ", ".join(DEMO_STOCK_PRICES.keys())
            raise ValueError(f"Unknown stock symbol '{cleaned}'. Supported symbols: {supported}")
        return cleaned

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be a positive integer greater than zero.")
        return v

    @field_validator("purchase_price")
    @classmethod
    def validate_purchase_price(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Purchase price must be greater than zero.")
        return v


class PortfolioCalculateRequest(BaseModel):
    items: List[PortfolioItemInput] = Field(..., description="List of stock holdings to evaluate")


class CalculatedStockItem(BaseModel):
    symbol: str
    name: str
    sector: str
    quantity: int
    purchase_price: float
    current_price: float
    invested_value: float
    current_value: float
    profit_loss: float
    profit_loss_percent: float
    allocation_percent: float


class PortfolioSummaryResponse(BaseModel):
    holdings: List[CalculatedStockItem]
    total_invested: float
    total_current_value: float
    total_profit_loss: float
    total_return_percent: float
    holdings_count: int
    currency: str = "INR"
    is_demo_data: bool = True
    disclaimer: str = "Stock prices are illustrative sample values in INR (₹) and not live exchange market data."


# ---------------------------------------------------------------------------
# Application Initialization & Middleware
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Stock Portfolio Tracker API",
    description="Backend calculation and stock data service for Stock Portfolio Tracker",
    version="1.0.0"
)

# CORS configuration
raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
origins = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]
# If configured with '*' or in Render deployment:
if "*" in origins or os.getenv("ALLOW_ALL_CORS", "false").lower() == "true":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def read_root():
    """Root status and API metadata."""
    return {
        "app": "Stock Portfolio Tracker API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "demo_data": True
    }


@app.get("/api/health")
def get_health():
    """System health check endpoint."""
    return {
        "status": "ok",
        "service": "portfolio-api",
        "available_stocks_count": len(DEMO_STOCK_PRICES)
    }


@app.get("/api/stocks", response_model=List[StockInfo])
def get_stocks():
    """Returns available reference stocks with their illustrative market prices."""
    stocks = []
    for symbol, price in DEMO_STOCK_PRICES.items():
        meta = STOCK_METADATA.get(symbol, {"name": symbol, "sector": "General"})
        stocks.append(
            StockInfo(
                symbol=symbol,
                name=meta["name"],
                sector=meta["sector"],
                price=price,
                currency="INR",
                is_demo=True
            )
        )
    return stocks


@app.post("/api/portfolio/calculate", response_model=PortfolioSummaryResponse)
def calculate_portfolio(payload: PortfolioCalculateRequest):
    """
    Validates submitted holdings, aggregates duplicate tickers,
    and calculates individual valuations, profit/loss, allocations, and totals.
    """
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Portfolio items list cannot be empty."
        )

    # Aggregate holdings by ticker symbol to support multiple additions
    # Tracks total shares and weighted purchase cost
    aggregated: Dict[str, Dict[str, float]] = {}

    for item in payload.items:
        sym = item.symbol
        market_price = DEMO_STOCK_PRICES[sym]
        cost_price = item.purchase_price if item.purchase_price is not None else market_price

        if sym not in aggregated:
            aggregated[sym] = {
                "quantity": 0,
                "total_cost": 0.0,
                "market_price": market_price
            }

        aggregated[sym]["quantity"] += item.quantity
        aggregated[sym]["total_cost"] += (cost_price * item.quantity)

    # Calculate overall total current value first for allocation percentages
    total_invested = sum(data["total_cost"] for data in aggregated.values())
    total_current_value = sum(data["quantity"] * data["market_price"] for data in aggregated.values())

    calculated_items: List[CalculatedStockItem] = []

    for sym, data in aggregated.items():
        qty = int(data["quantity"])
        invested = round(data["total_cost"], 2)
        avg_cost = round(invested / qty, 2)
        curr_price = data["market_price"]
        current_val = round(qty * curr_price, 2)
        pnl = round(current_val - invested, 2)
        pnl_pct = round((pnl / invested) * 100, 2) if invested > 0 else 0.0

        allocation_pct = round((current_val / total_current_value) * 100, 2) if total_current_value > 0 else 0.0

        meta = STOCK_METADATA.get(sym, {"name": sym, "sector": "General"})

        calculated_items.append(
            CalculatedStockItem(
                symbol=sym,
                name=meta["name"],
                sector=meta["sector"],
                quantity=qty,
                purchase_price=avg_cost,
                current_price=curr_price,
                invested_value=invested,
                current_value=current_val,
                profit_loss=pnl,
                profit_loss_percent=pnl_pct,
                allocation_percent=allocation_pct
            )
        )

    # Sort holdings descending by current value
    calculated_items.sort(key=lambda x: x.current_value, reverse=True)

    total_profit_loss = round(total_current_value - total_invested, 2)
    total_return_pct = round((total_profit_loss / total_invested) * 100, 2) if total_invested > 0 else 0.0

    return PortfolioSummaryResponse(
        holdings=calculated_items,
        total_invested=round(total_invested, 2),
        total_current_value=round(total_current_value, 2),
        total_profit_loss=total_profit_loss,
        total_return_percent=total_return_pct,
        holdings_count=len(calculated_items),
        currency="INR",
        is_demo_data=True
    )
