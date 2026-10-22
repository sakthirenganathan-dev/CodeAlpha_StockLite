"""
Stock Portfolio Tracker
=======================
A beginner-friendly Python command-line application that calculates
individual stock investment values and total portfolio value based on
defined illustrative stock prices, with CSV export capabilities.
"""

import csv
import os
import sys

# Ensure UTF-8 output encoding for terminals supporting unicode currency symbols (₹)
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Hardcoded dictionary of stock prices (Illustrative prices in INR)
STOCK_PRICES = {
    "AAPL": 180,
    "TSLA": 250,
    "GOOGL": 170,
    "MSFT": 420,
    "AMZN": 190
}


def display_header():
    """Prints the application banner and disclaimer."""
    print("=" * 65)
    print("                 STOCK PORTFOLIO TRACKER")
    print("=" * 65)
    print(" * Note: Displayed prices are illustrative reference values in INR (₹)")
    print("   and do not represent real-time live market data.")
    print("=" * 65)


def display_available_stocks(stock_prices):
    """Displays the list of supported stocks and their unit prices."""
    print("\nAvailable Stocks for Tracking:")
    print("-" * 35)
    print(f"{'Symbol':<10} | {'Unit Price (INR)':>18}")
    print("-" * 35)
    for symbol, price in stock_prices.items():
        print(f"{symbol:<10} | ₹ {price:>15,.2f}")
    print("-" * 35)


def get_valid_stock_symbol(stock_prices):
    """
    Prompts the user to enter a stock symbol.
    Validates that the entered symbol exists in the stock_prices dictionary.
    Handles case-insensitivity.
    """
    while True:
        raw_symbol = input("\nEnter Stock Symbol (e.g., AAPL, TSLA): ").strip()
        symbol = raw_symbol.upper()

        if not symbol:
            print("[!] Error: Stock symbol cannot be empty. Please enter a symbol.")
            continue

        if symbol in stock_prices:
            return symbol

        print(f"[!] Error: '{raw_symbol}' is not recognized. Please choose from: {', '.join(stock_prices.keys())}")


def get_valid_quantity(symbol):
    """
    Prompts the user to enter share quantity.
    Gracefully validates:
      - Non-numeric input
      - Zero quantity
      - Negative quantity
    Returns a valid positive integer.
    """
    while True:
        raw_qty = input(f"Enter quantity of shares owned for {symbol}: ").strip()

        # Handle non-numeric input
        try:
            quantity = int(raw_qty)
        except ValueError:
            print(f"[!] Error: '{raw_qty}' is not a valid number. Please enter a whole positive number.")
            continue

        # Handle zero and negative quantities
        if quantity == 0:
            print("[!] Error: Share quantity cannot be zero (0). Please enter at least 1 share.")
            continue
        elif quantity < 0:
            print(f"[!] Error: Share quantity cannot be negative ({quantity}). Please enter a positive number.")
            continue

        return quantity


def calculate_investment_value(price, quantity):
    """Calculates investment value for a stock: price * quantity."""
    return price * quantity


def get_yes_no_choice(prompt_message):
    """
    Asks the user a yes/no question and returns True for yes, False for no.
    Re-prompts on invalid input.
    """
    while True:
        choice = input(prompt_message).strip().lower()
        if choice in ["y", "yes"]:
            return True
        elif choice in ["n", "no"]:
            return False
        else:
            print("[!] Please enter 'y' for yes or 'n' for no.")


def display_portfolio_summary(portfolio, stock_prices):
    """
    Displays a clear tabular breakdown containing:
      - Stock Symbol
      - Share Quantity
      - Unit Price
      - Investment Value
    Along with the Grand Total Portfolio Investment Value.
    """
    print("\n" + "=" * 65)
    print("                    PORTFOLIO SUMMARY")
    print("=" * 65)
    print(f"{'Stock':<8} | {'Shares':>8} | {'Unit Price (₹)':>16} | {'Investment Value (₹)':>22}")
    print("-" * 65)

    total_portfolio_value = 0

    for symbol, quantity in portfolio.items():
        unit_price = stock_prices[symbol]
        investment_value = calculate_investment_value(unit_price, quantity)
        total_portfolio_value += investment_value

        print(
            f"{symbol:<8} | {quantity:>8d} | ₹ {unit_price:>13,.2f} | ₹ {investment_value:>19,.2f}"
        )

    print("-" * 65)
    print(f"{'TOTAL PORTFOLIO VALUE:':<37} | ₹ {total_portfolio_value:>19,.2f}")
    print("=" * 65)

    return total_portfolio_value


def export_portfolio_to_csv(portfolio, stock_prices, filename="portfolio.csv"):
    """
    Exports the portfolio summary to a CSV file using Python's built-in csv module.
    Includes headers, individual stock records, and total portfolio value.
    """
    # Determine export path in the same directory as script if possible
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, filename)

    try:
        with open(file_path, mode="w", newline="", encoding="utf-8-sig") as csvfile:
            writer = csv.writer(csvfile)

            # Write header
            writer.writerow(["Stock Symbol", "Shares Owned", "Unit Price (INR)", "Investment Value (INR)"])

            total_value = 0
            for symbol, quantity in portfolio.items():
                unit_price = stock_prices[symbol]
                inv_val = calculate_investment_value(unit_price, quantity)
                total_value += inv_val
                writer.writerow([symbol, quantity, f"{unit_price:.2f}", f"{inv_val:.2f}"])

            # Write empty row and total row
            writer.writerow([])
            writer.writerow(["TOTAL PORTFOLIO VALUE", "", "", f"{total_value:.2f}"])

        print(f"\n[+] Portfolio summary successfully exported to: {file_path}")
        return True
    except OSError as err:
        print(f"\n[!] Failed to save CSV file due to error: {err}")
        return False


def main():
    """Main application loop."""
    display_header()
    display_available_stocks(STOCK_PRICES)

    # Dictionary to hold the user's portfolio: { "AAPL": 10, ... }
    portfolio = {}

    while True:
        # Step 1: Input and validate stock symbol
        symbol = get_valid_stock_symbol(STOCK_PRICES)

        # Step 2: Input and validate share quantity
        quantity = get_valid_quantity(symbol)

        # Step 3: Add to portfolio (accumulate if already present)
        current_existing_shares = portfolio.get(symbol, 0)
        portfolio[symbol] = current_existing_shares + quantity

        # Step 4: Show immediate calculation for this stock
        unit_price = STOCK_PRICES[symbol]
        curr_addition_val = calculate_investment_value(unit_price, quantity)
        total_stock_val = calculate_investment_value(unit_price, portfolio[symbol])

        print(f"\n--> Added: {quantity} share(s) of {symbol} @ ₹ {unit_price:,.2f} each = ₹ {curr_addition_val:,.2f}")
        if current_existing_shares > 0:
            print(f"    (Updated total for {symbol}: {portfolio[symbol]} shares = ₹ {total_stock_val:,.2f})")

        # Step 5: Ask if the user wants to add another stock
        add_more = get_yes_no_choice("\nDo you want to add another stock? (y/n): ")
        if not add_more:
            break

    # Step 6: Display final summary breakdown and total
    if portfolio:
        display_portfolio_summary(portfolio, STOCK_PRICES)

        # Step 7: Optional CSV export
        export_choice = get_yes_no_choice("\nWould you like to export your portfolio summary to a CSV file? (y/n): ")
        if export_choice:
            export_portfolio_to_csv(portfolio, STOCK_PRICES, "portfolio.csv")
    else:
        print("\nNo stocks were entered. Exiting portfolio tracker.")

    print("\nThank you for using Stock Portfolio Tracker!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[!] Program interrupted by user. Goodbye!")
        sys.exit(0)
