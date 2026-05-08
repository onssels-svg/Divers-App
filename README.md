# Divers 🤿

**Deep Dive Investment Analysis** — a professional KPI dashboard that lets anyone analyse a company like a real analyst.

---

## Features

| Feature | Description |
|---------|-------------|
| **Company Search** | Search any publicly listed stock by name or ticker |
| **PDF Upload** | Drag-and-drop an annual report PDF — data extracted in-browser |
| **19 KPI Cards** | Profitability, Valuation, Financial Health, Efficiency — each with colour indicator and plain-English tooltip |
| **AI Recommendation** | Buy / Hold / Sell analysis with confidence score, bull & bear cases |
| **Press Research** | Latest news headlines + analyst consensus bar + AI press summary |
| **Export** | Download the full dashboard as PDF or Excel |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API keys to `.env`

Open the `.env` file in the project root and replace the placeholder values:

```
VITE_FMP_API_KEY=your_fmp_api_key_here
NEWS_API_KEY=your_newsapi_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Start the app
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Where to get each API key

### Financial Modeling Prep (FMP) — Required for company search
Used for live financial data (income statement, balance sheet, cash flows, market data).

1. Go to [financialmodelingprep.com/developer/docs](https://financialmodelingprep.com/developer/docs)
2. Click **Get my API Key** → sign up for a free account
3. Copy your API key from the dashboard
4. Paste it as `VITE_FMP_API_KEY=` in `.env`

**Free tier**: 250 requests/day · No credit card required

---

### NewsAPI — Required for press research headlines
Used to fetch recent news articles about the company.

1. Go to [newsapi.org/register](https://newsapi.org/register)
2. Sign up with your email → your API key is shown immediately
3. Paste it as `NEWS_API_KEY=` in `.env`

**Free tier**: 100 requests/day · Developer plan · Works on localhost

---

### Anthropic API — Required for AI recommendation & press summary
Used to generate AI investment analysis and press summaries via Claude.

> ⚠️ **This is a pay-per-use API** (separate from your Claude Code subscription).
> A typical session (1 analysis + 1 press summary) costs approximately **$0.05–0.20**.
> The app works without this key — AI features will show an info card instead.

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Sign in or create an Anthropic account
3. Click **Create Key** → copy it
4. Go to [console.anthropic.com/billing](https://console.anthropic.com/billing) and add a payment method
5. Paste the key as `ANTHROPIC_API_KEY=` in `.env`

---

## Security notes

- API keys in `.env` are **never committed** to version control (`.env` is gitignored)
- `NEWS_API_KEY` and `ANTHROPIC_API_KEY` are **server-side only** — they never reach your browser
- `VITE_FMP_API_KEY` is browser-accessible (needed for live data calls) — FMP is a read-only data API
- PDF files are parsed **entirely in your browser** — nothing is uploaded to any server

---

## Project structure

```
src/
  components/      React UI components
  services/        API integrations
  utils/           KPI config, calculations, PDF parser
server/
  index.js         Express proxy server (Anthropic + NewsAPI)
.env               Your API keys (never commit this)
```

---

## Tech stack

React 18 · Vite · Express.js · pdfjs-dist · jsPDF · html2canvas · SheetJS · Anthropic Claude
