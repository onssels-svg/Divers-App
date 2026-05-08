# CLAUDE.md — Divers: Deep Dive Investment Dashboard

This file provides guidance to Claude Code when working with this codebase.

## Quick Start

```bash
npm install        # first time only
npm run dev        # starts Vite (port 5173) + Express proxy (port 3001) together
```

Open: http://localhost:5173

Individual processes:
```bash
npm run client   # Vite frontend only
npm run server   # Express proxy only
npm run build    # Production build
npm run preview  # Preview production build
```

## Environment (.env)

```
VITE_FMP_API_KEY=your_key      # browser-accessible; free at financialmodelingprep.com
NEWS_API_KEY=your_key          # server-only; free at newsapi.org
ANTHROPIC_API_KEY=your_key     # server-only; pay-per-use at console.anthropic.com
```

AI features (recommendation, press summary) degrade gracefully when ANTHROPIC_API_KEY is absent — a friendly info card is shown instead.

## Architecture

**Frontend**: React 18 + Vite. `src/main.jsx` → `src/App.jsx` (all state) → components.

**Backend**: Express at `server/index.js` (port 3001). Proxies CORS-restricted APIs:
- `POST /api/anthropic` → Anthropic Claude API
- `GET /api/news?q=...&pageSize=...` → NewsAPI
- `GET /api/health` → returns `{ anthropicConfigured: bool }`

**Vite proxy**: All `/api/*` from the Vite dev server forwards to `http://localhost:3001`.

```
src/
  App.jsx                    Root state machine (all state here, no Redux)
  utils/kpiConfig.js         19 KPI definitions — thresholds, tooltips, colour logic
  utils/kpiCalculations.js   calculateKPIs(financial, market) → 19 values
  utils/pdfParser.js         pdfjs-dist in-browser PDF parsing + regex extraction
  services/fmpService.js     FMP API (direct browser calls; CORS supported)
  services/newsService.js    NewsAPI via /api/news proxy
  services/anthropicService.js  Claude via /api/anthropic proxy
  components/Header.jsx      Sticky top bar — logo, company info, export buttons
  components/InputSection.jsx   PDF drag-drop + company name/ticker search
  components/KPIDashboard.jsx   4 KPI sections rendered from kpiConfig
  components/KPICard.jsx        Single metric card with colour dot + hover tooltip
  components/AIRecommendation.jsx  Buy/Sell/Hold badge, confidence, bull/bear cases
  components/PressResearch.jsx     News headlines + analyst bar + AI press summary
  components/ExportButtons.jsx     PDF (jsPDF + html2canvas) + Excel (SheetJS)
server/index.js              Express proxy
```

## Design System

All styles in `src/App.css` — do not use inline styles or external CSS libraries.

Key tokens (CSS custom properties):
- `--bg: #0f0f0f` — page background
- `--gold: #c9a84c` — primary accent (headings, borders, CTAs)
- `--text: #e8e0d0` — body text
- `--border: rgba(201,168,76,0.15)` — card borders
- Status: `--green`, `--amber`, `--red` for KPI traffic lights

KPI card colours follow `getColor(value)` functions in `kpiConfig.js`.

## Adding a new KPI

1. Add metric object to the right section in `src/utils/kpiConfig.js`
2. Add calculation to `calculateKPIs()` in `src/utils/kpiCalculations.js`
3. Map the FMP API field in `src/services/fmpService.js` if needed

## PDF parsing notes

`pdfParser.js` extracts raw text via pdfjs-dist v5 (CDN worker at `.mjs` URL) and uses regex to find financial line items. Auto-detects scale (millions/billions). Works well for major company annual reports; may be incomplete for non-standard layouts. Missing fields return `null` — displayed as N/A.

pdfjs v5 note: `getTextContent()` returns mixed `TextItem` and `TextMarkedContent` objects. Only items with `typeof item.str === 'string'` are used.

## Package versions & security status

| Package | Version | Notes |
|---------|---------|-------|
| jspdf | 4.2.1 | Upgraded from v2 — fixes DOMPurify XSS (GHSA-vhxf-7vqr-mrjg) |
| pdfjs-dist | 5.7.284 | Upgraded from v3 — fixes malicious PDF code execution (GHSA-wgrm-67xf-hhpq) |
| xlsx | 0.18.5 | Write-only use — prototype pollution CVE doesn't apply; no upstream fix available |
| vite | 5.x | esbuild moderate vuln (GHSA-67mh-4wv8-2f99) — dev server only, local use acceptable |

Run `npm audit` to see current status. To upgrade Vite to v8 (fixes esbuild), update `vite` in `package.json` and `@vitejs/plugin-react` to v5, then test for breaking changes.

## Cost reference

- FMP API: free, 250 req/day
- NewsAPI: free developer tier, 100 req/day, localhost only
- Anthropic API: ~$0.003–0.015 per 1K tokens. A typical session (AI analysis + press summary) ≈ $0.05–0.20
