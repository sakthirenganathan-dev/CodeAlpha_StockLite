# Stock Portfolio Tracker — Full-Stack Fintech Web Application

A modern, deployment-ready financial analytics dashboard and portfolio tracker built with **React**, **TypeScript**, **Tailwind CSS**, and **Python FastAPI**.

---

## 🌟 1. Project Overview & Architecture
The **Stock Portfolio Tracker** transforms basic investment calculations into an interactive, high-performance financial web application. Users can record and track stock holdings, monitor capital invested versus current valuation, analyze asset allocations with dynamic charts, view profit and loss in Indian Rupees (₹), and export records to CSV.

### Architecture Highlights
- **Client (Frontend):** React 19 + TypeScript + Vite + Tailwind CSS + Recharts + Lucide Icons.
- **Service Layer:** Python FastAPI calculation and stock metadata engine with strict Pydantic schemas and CORS validation.
- **Dual-Engine Resilience:** If the FastAPI backend is offline or disconnected, the frontend automatically falls back to an internal client calculation engine so users can always interact with their portfolio seamlessly.
- **Persistence:** LocalStorage persistence keeps holdings and transaction history saved directly in the browser across sessions.

> ⚠️ **Important Demo Data Disclaimer:**  
> Stock market prices used in this application (`AAPL: ₹180`, `TSLA: ₹250`, `GOOGL: ₹170`, `MSFT: ₹420`, `AMZN: ₹190`) are **illustrative sample reference values** in Indian Rupees (₹) designed for demonstration and educational testing. They do not represent live market data feeds.

---

## 🛠️ 2. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS (Dark Navy Fintech Theme) |
| **Data Visualization** | Recharts (Donut Allocation Chart & Bar Valuation Comparison) |
| **Icons** | Lucide React |
| **Backend API** | Python 3, FastAPI, Uvicorn, Pydantic |
| **Client Storage** | Browser LocalStorage (`portfolio_tracker_holdings_v1`) |
| **Deployment Targets** | Vercel (Frontend SPA) + Render (Backend Web Service) |

---

## 📁 3. Project Directory Structure

```text
stock-portfolio-tracker/
├── frontend/                       # React + TypeScript + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Top navigation bar with status badges & CTAs
│   │   │   ├── Sidebar.tsx         # Sidebar navigation with mobile drawer support
│   │   │   ├── MetricCard.tsx      # KPI stat cards with gain/loss indicators
│   │   │   ├── AllocationChart.tsx # Recharts Donut & Valuation comparison charts
│   │   │   ├── HoldingsTable.tsx   # Searchable, sortable holdings table
│   │   │   ├── AddStockModal.tsx   # Add position modal with live preview
│   │   │   ├── EditStockModal.tsx  # Edit position shares & purchase price
│   │   │   ├── ActivityLogView.tsx # Audit log of portfolio transactions
│   │   │   └── ApiReferenceView.tsx# API docs & reference price directory
│   │   ├── services/
│   │   │   ├── api.ts              # FastAPI client, calculation & CSV export
│   │   │   └── storage.ts          # LocalStorage persistence & sample data
│   │   ├── types/
│   │   │   └── portfolio.ts        # TypeScript data contracts & models
│   │   ├── App.tsx                 # Core application controller & views
│   │   ├── index.css               # Tailwind directives & dark theme styling
│   │   └── main.tsx                # React DOM mount point
│   ├── .env.example                # Frontend environment configuration template
│   ├── tailwind.config.js          # Fintech palette (Navy, Emerald, Rose)
│   ├── vercel.json                 # Vercel SPA routing configuration
│   └── package.json
│
├── backend/                        # Python FastAPI backend
│   ├── main.py                     # FastAPI routes, schemas, calculations & CORS
│   ├── test_main.py                # Pytest unit & integration test suite
│   ├── requirements.txt            # Python dependencies
│   ├── render.yaml                 # Render infrastructure-as-code deployment blueprint
│   └── .env.example                # Backend environment variable template
│
├── .gitignore                      # Git exclusion rules
└── README.md                       # Comprehensive documentation
```

---

## 🚀 4. Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher recommended; v20/v22 tested)
- **Python** (3.9 to 3.14+)
- **pip** and **npm**

---

### Step 1: Running the Python FastAPI Backend

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd stock-portfolio-tracker/backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
5. Verify the backend is running:
   - Health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
   - Interactive Swagger API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step 2: Running the React Frontend

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd stock-portfolio-tracker/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up local environment variables:
   ```bash
   # Copy example environment file
   cp .env.example .env
   ```
   Ensure `.env` contains:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at [http://localhost:5173](http://localhost:5173). The top bar will display a green pulsing **FastAPI Connected** badge.

---

## 🧪 5. Automated Backend Testing

Run the test suite using `pytest` inside the `backend` directory:
```bash
cd stock-portfolio-tracker/backend
pytest test_main.py -v
```

### Tested Scenarios:
- `test_health_endpoint`: Asserts HTTP 200 and healthy status response.
- `test_get_stocks_endpoint`: Asserts all 5 benchmark symbols are present with correct INR reference prices.
- `test_calculate_portfolio_valid`: Validates math for invested capital, current valuation, and P&L.
- `test_calculate_portfolio_duplicate_aggregation`: Validates automatic accumulation and weighted-average buy price for repeated tickers.
- `test_calculate_invalid_symbol`: Asserts rejection of unknown tickers with HTTP 422.
- `test_calculate_zero_quantity`: Asserts rejection of quantity = 0 with HTTP 422.
- `test_calculate_negative_quantity`: Asserts rejection of negative quantity with HTTP 422.
- `test_calculate_negative_purchase_price`: Asserts rejection of negative buy price with HTTP 422.
- `test_calculate_empty_items`: Asserts rejection of empty item arrays with HTTP 400.

---

## 🌐 6. Production Deployment Guide

### A. Deploying the Backend on Render

1. Push your repository to **GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name:** `stock-portfolio-backend`
   - **Root Directory:** `stock-portfolio-tracker/backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add the following **Environment Variables**:
   - `CORS_ORIGINS`: Set to your production Vercel URL (e.g. `https://your-portfolio.vercel.app`)
   - `PYTHON_VERSION`: `3.11.0`
7. Click **Create Web Service**.
8. Note your public Render URL (e.g., `https://stock-portfolio-backend.onrender.com`).
9. Verify health check by visiting `https://your-backend.onrender.com/api/health`.

---

### B. Deploying the Frontend on Vercel

1. Log into [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. In the project configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click edit and select `stock-portfolio-tracker/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://stock-portfolio-backend.onrender.com`)
6. Click **Deploy**.
7. Once deployed, copy your production Vercel domain and update the `CORS_ORIGINS` variable in your Render dashboard if necessary.

---

## 💾 7. Persistence & Data Scope
- **Browser LocalStorage:** Portfolio holdings are persisted locally within the client browser under the key `portfolio_tracker_holdings_v1`.
- **Scope:** Data remains in the browser on that specific machine. It is not synchronized across different devices or user accounts.
- **Reset & Sample Options:** You can reset to sample demo data or clear all holdings at any time directly from the top dashboard actions.

---

## 📄 License
MIT License. Built for academic, demonstration, and portfolio tracking purposes.
