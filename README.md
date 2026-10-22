# CodeAlpha_StockLite

Stock Portfolio Tracker application developed for the CodeAlpha internship task.

## 📌 Project Overview
This repository features two implementations of the **Stock Portfolio Tracker**:
1. **Interactive CLI Application (`Stock-Portfolio-Tracker/main.py`)**: A pure Python 3 command-line tool with stock price calculation, input validation, and CSV export.
2. **Modern Full-Stack Web Application (`Stock-Portfolio-Tracker/frontend/` & `backend/`)**: A responsive fintech dashboard built with **React**, **TypeScript**, **Tailwind CSS**, **Recharts**, and a **Python FastAPI** backend service.

---

## 🚀 Quick Start

### 1. Python CLI Application
```bash
cd Stock-Portfolio-Tracker
python main.py
```

### 2. Full-Stack Web Application

#### Backend (FastAPI):
```bash
cd Stock-Portfolio-Tracker/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### Frontend (React + Vite + Tailwind):
```bash
cd Stock-Portfolio-Tracker/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend:** Python 3, FastAPI, Uvicorn, Pydantic
- **Testing:** Pytest (9 passing test cases)
- **Persistence:** Browser LocalStorage
- **Deployment Ready:** Vercel (Frontend) & Render (Backend)

---

## 📄 License
MIT License
