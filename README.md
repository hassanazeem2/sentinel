# Sentinel AI — B2B Deal Risk Intelligence

A full-stack **deal risk and pipeline intelligence** dashboard. Analyze B2B deals for behavioral, psychological, and structural risk; get intervention plans and forecast recommendations.

> **Note:** This is a **portfolio / demo project**. Use it to learn, fork, or extend. Not intended as production software for critical business decisions without additional hardening.


<img width="1512" height="750" alt="sentinel" src="https://github.com/user-attachments/assets/db19bf33-0190-44de-83f0-110ff553a42c" />

---

## Features

- **Risk dashboard** — Pipeline value, revenue at risk, avg risk score, critical deal count
- **Deal pipeline** — Filter by stage/rep/risk, sort, search; click a deal for full analysis
- **Alerts** — Critical and high-risk deals with primary risk indicator and revenue at risk
- **Analytics** — Risk distribution, pipeline by stage, momentum, competitive threat, stakeholder coverage
- **Team** — Performance by rep; click a rep to see their deals
- **Reports** — Executive summary and key metrics table
- **Export** — Download deals as CSV or JSON
- **Settings** — Load demo from API or paste your own deal JSON; engine configuration

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Backend  | Python 3, FastAPI, Pydantic, Uvicorn |
| Frontend | React, Vite, D3.js |
| API      | REST (JSON); CORS enabled for local dev |

---

## Quick start

### 1. Clone and open the project

```bash
git clone https://github.com/YOUR_USERNAME/sentinel-ai-deal-risk.git
cd sentinel-ai-deal-risk
```

*(Replace `YOUR_USERNAME` with your GitHub username.)*

### 2. Backend (API)

```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python files/main.py
```

API runs at **http://localhost:8000**  
- Docs: http://localhost:8000/docs  
- Demo deals: http://localhost:8000/api/demo-deals  

### 3. Frontend (dashboard)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Load data

- In the dashboard, go to **Settings**.
- Click **Load demo from API** (with backend running), or paste your own deal JSON and click **Analyze & load deals**.

---

## Project structure

```
sentinel-ai-deal-risk/
├── files/
│   ├── main.py          # FastAPI app + risk engine
│   └── SentinelAI.jsx   # Original React component (reference)
├── frontend/
│   ├── src/
│   │   ├── SentinelAI.jsx   # Main dashboard app
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── requirements.txt
├── README.md
├── LICENSE
└── .gitignore
```

---

## Deal data format

Minimum fields for each deal (JSON):

```json
{
  "deal_id": "D-001",
  "deal_name": "Acme — Platform Deal",
  "deal_value": 75000,
  "deal_stage": "proposal",
  "deal_age_days": 45,
  "expected_close_date": "2026-04-15",
  "rep_name": "Jane Smith"
}
```

Optional: `company_profile`, `stakeholders`, `activity`, `sentiment`. See the API docs at **http://localhost:8000/docs** for full schema.

---

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/demo-deals` | GET | Pre-built demo deals (analyzed) |
| `/api/analyze` | POST | Analyze one deal |
| `/api/analyze-deals` | POST | Analyze a list of deals |

---

## License

MIT — see [LICENSE](LICENSE).
