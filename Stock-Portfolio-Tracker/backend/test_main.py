"""
Unit and Integration Tests for Stock Portfolio Tracker Backend
"""

import pytest
from fastapi.testclient import TestClient
from main import app, DEMO_STOCK_PRICES

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint returns status 200 and ok status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["available_stocks_count"] == len(DEMO_STOCK_PRICES)


def test_get_stocks_endpoint():
    """Verify stock catalogue contains all required demo symbols and correct prices."""
    response = client.get("/api/stocks")
    assert response.status_code == 200
    stocks = response.json()
    assert len(stocks) == 5

    symbols = {s["symbol"] for s in stocks}
    assert symbols == {"AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"}

    for stock in stocks:
        sym = stock["symbol"]
        assert stock["price"] == DEMO_STOCK_PRICES[sym]
        assert stock["currency"] == "INR"
        assert stock["is_demo"] is True


def test_calculate_portfolio_valid():
    """Test standard portfolio calculation with custom purchase prices."""
    payload = {
        "items": [
            {"symbol": "AAPL", "quantity": 10, "purchase_price": 160.0},
            {"symbol": "TSLA", "quantity": 4, "purchase_price": 250.0}
        ]
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    # AAPL: 10 * 160 = 1600 invested, 10 * 180 = 1800 current -> PnL +200
    # TSLA: 4 * 250 = 1000 invested, 4 * 250 = 1000 current -> PnL 0
    # Total Invested: 2600
    # Total Current: 2800
    # Total Profit: +200
    assert data["total_invested"] == 2600.0
    assert data["total_current_value"] == 2800.0
    assert data["total_profit_loss"] == 200.0
    assert data["total_return_percent"] == round((200.0 / 2600.0) * 100, 2)
    assert data["holdings_count"] == 2


def test_calculate_portfolio_duplicate_aggregation():
    """Test duplicate ticker entries are merged and weighted-average cost is computed."""
    payload = {
        "items": [
            {"symbol": "AAPL", "quantity": 10, "purchase_price": 160.0},
            {"symbol": "AAPL", "quantity": 10, "purchase_price": 180.0}
        ]
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["holdings_count"] == 1
    aapl = data["holdings"][0]
    assert aapl["symbol"] == "AAPL"
    assert aapl["quantity"] == 20
    assert aapl["purchase_price"] == 170.0  # (1600 + 1800) / 20 = 170
    assert aapl["invested_value"] == 3400.0
    assert aapl["current_value"] == 3600.0  # 20 * 180 = 3600
    assert aapl["profit_loss"] == 200.0


def test_calculate_invalid_symbol():
    """Test invalid symbol triggers 422 validation error."""
    payload = {
        "items": [
            {"symbol": "INVALID_CO", "quantity": 5}
        ]
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 422


def test_calculate_zero_quantity():
    """Test zero quantity triggers 422 validation error."""
    payload = {
        "items": [
            {"symbol": "AAPL", "quantity": 0}
        ]
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 422


def test_calculate_negative_quantity():
    """Test negative quantity triggers 422 validation error."""
    payload = {
        "items": [
            {"symbol": "AAPL", "quantity": -5}
        ]
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 422


def test_calculate_negative_purchase_price():
    """Test negative purchase price triggers 422 validation error."""
    payload = {
        "items": [
            {"symbol": "AAPL", "quantity": 5, "purchase_price": -100.0}
        ]
    }
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 422


def test_calculate_empty_items():
    """Test empty portfolio list returns 400 Bad Request."""
    payload = {"items": []}
    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 400
