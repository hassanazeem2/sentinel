# Sentinel AI — B2B Deal Risk Intelligence

A full-stack **deal risk and pipeline intelligence** dashboard. Analyze B2B deals for behavioral, psychological, and structural risk; get intervention plans and forecast recommendations. Ready for production deployment.

**After you push to GitHub** (or deploy anywhere), use the **[Production deployment](#production-deployment)** section below to run it for real users (Docker or build + run, env vars, HTTPS).

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
| API      | REST (JSON); configurable CORS |

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

## Production deployment

For release to users, use one of the following.

### Option A: Docker (recommended)

Single image serves API and frontend on one port.

```bash
docker build -t sentinel-ai .
docker run -p 8000:8000 -e ENVIRONMENT=production -e CORS_ORIGINS=https://yourdomain.com sentinel-ai
```

Then open **http://localhost:8000** (or your server URL). No separate frontend server.

### Option B: Build frontend, then run backend

Backend serves the built frontend when `frontend/dist` exists.

```bash
# Build frontend (API will use same origin)
cd frontend && npm ci && npm run build && cd ..

# Run backend (set env for production)
export ENVIRONMENT=production
export CORS_ORIGINS=https://yourdomain.com   # your public app URL(s)
python files/main.py
```

Open **http://localhost:8000**. API and UI are on the same host.

### Environment variables (production)

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | Set to `production` for stricter CORS and doc paths |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | Port |
| `CORS_ORIGINS` | — | Comma-separated allowed origins, e.g. `https://app.yourdomain.com` |
| `MAX_DEALS_PER_REQUEST` | `500` | Max deals per `/api/analyze-deals` request |

Copy `.env.example` to `.env` and adjust. Do not commit `.env`.

### Production checklist

- Set `ENVIRONMENT=production`.
- Set `CORS_ORIGINS` to your public app URL(s).
- Run behind HTTPS (reverse proxy e.g. nginx, or your host’s TLS).
- Use a process manager (e.g. systemd, Docker) so the app restarts on failure.

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
├── Dockerfile
├── .env.example
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
| `/api/analyze-deals` | POST | Analyze a list of deals (max 500 per request) |

---

## License

MIT — see [LICENSE](LICENSE).
