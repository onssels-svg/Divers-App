# My Coding Notes
*Written after building the Divers Investment Dashboard — my second app*

---

## What I built

A web app that takes a company name or PDF annual report and shows financial KPIs (metrics like profit margin, debt ratios) with AI analysis. Stack: React (frontend) + Express (backend proxy) + Vite (build tool).

---

## The big picture: how a web app works

```
You (browser)
    ↕  HTTP requests
Frontend (React / Vite) — port 5173
    ↕  proxied requests (so API keys stay secret)
Backend (Express server) — port 3001
    ↕
External APIs (FMP, Anthropic, NewsAPI)
```

- **Frontend** = everything the user sees (buttons, charts, cards)
- **Backend** = a small server that sits between the browser and paid APIs, so your secret keys are never exposed
- **API** = a service that gives you data in exchange for a key (like a library card)

---

## Folder structure (what lives where)

```
Divers App/
├── src/
│   ├── App.jsx              ← Root: holds ALL the state (data), calls all handlers
│   ├── App.css              ← ALL styles (one file, no exceptions in this project)
│   ├── main.jsx             ← Entry point — just mounts App into index.html
│   ├── components/          ← UI pieces (Header, KPICard, Charts…)
│   ├── services/            ← API calls (fmpService, anthropicService…)
│   └── utils/               ← Pure logic (calculations, PDF parser, config)
├── server/
│   └── index.js             ← Express proxy (hides API keys from browser)
├── public/                  ← Static files (icons, manifest)
├── .env                     ← SECRET keys — NEVER commit this
├── .gitignore               ← Tells Git what to ignore (node_modules, .env…)
├── package.json             ← Project metadata + list of dependencies
├── vite.config.js           ← Build tool config
└── index.html               ← The one HTML page (React fills it in)
```

---

## Running the app locally

```bash
# First time only — installs all packages listed in package.json
npm install

# Every time — starts both frontend (5173) and backend (3001)
npm run dev
```

Then open: http://localhost:5173

### If something goes wrong on startup
- `npm install` failed → delete `node_modules/` folder, run again
- Port already in use → something else is running on 5173 or 3001. Restart your computer.
- Blank screen / errors in browser → open DevTools (Cmd+Option+I), check Console tab

---

## Environment variables (.env file)

This file holds secret API keys. It **never** goes to GitHub.

```
VITE_FMP_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

Rules:
- Variables starting with `VITE_` are accessible in the browser (React)
- Variables WITHOUT `VITE_` are server-only (safer for paid APIs)
- If you delete `.env` or clone the project on a new computer, you must recreate it manually
- `.gitignore` protects it — never remove `.env` from that file

---

## Git & GitHub — the basics

Git is version control: it takes snapshots of your code so you can go back in time.
GitHub is where those snapshots live online.

### The three commands you'll use every day

```bash
git add -A                        # Stage all changed files (prepare the snapshot)
git commit -m "what I changed"   # Take the snapshot with a label
git push                          # Upload the snapshot to GitHub
```

### Setting up a brand-new project on GitHub

1. Create a new repo on github.com (click +, New repository)
2. Do NOT tick "Add README" — your project already has one
3. Run this in your project folder (only once):

```bash
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Pushing future changes

```bash
git add -A
git commit -m "describe what changed"
git push
```

### Why didn't I need a password the second time?

macOS saved your GitHub token in its Keychain after the first project. Git finds it automatically. If you ever get a password prompt again, use a Personal Access Token (not your GitHub password) — generate one at github.com → Settings → Developer settings → Personal access tokens.

### Useful Git commands

```bash
git status          # See what files have changed
git log             # See your commit history
git diff            # See exactly what lines changed
```

---

## Installing new packages

Packages are pre-built code libraries other people wrote.

```bash
npm install package-name          # Add a package
npm install                       # Install everything in package.json (e.g. after cloning)
```

When you install a package:
- It gets added to `node_modules/` (never commit this folder — it's huge)
- It gets listed in `package.json` (this IS committed — it's the shopping list)
- `package-lock.json` locks the exact versions (also committed)

---

## React basics (what I used in this project)

React builds UIs from **components** — reusable pieces that return HTML-like code (called JSX).

```jsx
// A simple component
export default function MyCard({ title, value }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{value}</p>
    </div>
  );
}

// Using it somewhere else
<MyCard title="Revenue" value="$1.2B" />
```

### State — data that can change

```jsx
const [count, setCount] = useState(0);  // starts at 0
setCount(5);                             // update it → component re-renders
```

### useEffect — run code when something changes

```jsx
useEffect(() => {
  // runs once when the component first appears
  fetchData();
}, []);  // empty array = "only on first render"
```

### Props — passing data down to child components

Parent passes data as attributes; child receives them as a `props` object (or destructured).

---

## CSS in this project

All styles live in `src/App.css`. No other CSS files, no external libraries.

Key design tokens (CSS variables):
```css
--bg: #080912        /* page background */
--gold: #3b82f6      /* primary accent colour */
--text: #e8e0d0      /* body text */
--green / --amber / --red   /* traffic light colours for KPIs */
```

Use `className` in JSX (not `class` — that's HTML):
```jsx
<div className="kpi-card">...</div>
```

---

## APIs used in this project

| API | What it does | Free tier |
|-----|-------------|-----------|
| FMP (financialmodelingprep.com) | Stock prices, financial statements | 250 req/day |
| Anthropic (claude.ai) | AI analysis of KPIs + press summaries | Pay per use (~$0.05–0.20/session) |
| NewsAPI (newsapi.org) | News headlines about a company | 100 req/day, localhost only |

---

## Things that tripped me up (and how to fix them)

**"Module not found" error**
→ You imported something that doesn't exist yet, or the path is wrong. Check spelling and that the file exists.

**Blank page with no errors**
→ Open browser DevTools (Cmd+Option+I) → Console tab. The real error is there.

**Changes not showing up**
→ Vite should hot-reload automatically. If not, save the file again or restart `npm run dev`.

**API returns no data / 402 error**
→ Free plan limit. FMP free tier only supports NYSE/NASDAQ stocks. Exotic exchanges (Thai, Saudi, etc.) need a paid plan.

**"Port already in use" on startup**
→ Another process is using port 5173 or 3001. Either kill it or restart your Mac.

**Git says "nothing to commit"**
→ You haven't changed any files since your last commit. That's fine.

**GitHub push rejected**
→ Someone else pushed changes since your last pull. Run `git pull` first, then push again.

---

## Workflow for making a change

1. Edit the code in VS Code (or similar)
2. See the change instantly at http://localhost:5173 (Vite hot-reloads)
3. When happy:
   ```bash
   git add -A
   git commit -m "brief description of what I changed"
   git push
   ```
4. Check github.com to confirm it's there

---

## Mental model: what happens when a user searches a ticker

1. User types "AAPL" and hits Enter
2. `handleSearch()` in App.jsx fires
3. It calls `getFinancialData('AAPL')` in fmpService.js
4. That makes an HTTP request to FMP's API → returns JSON
5. The JSON is mapped into a `financial` object + `market` object
6. `calculateKPIs(financial, market)` computes 19 ratios
7. State updates: `setKpis(computed)`, `setView('dashboard')`
8. React re-renders → KPI cards appear with the new numbers

---

*Last updated: May 2026 — after building Divers v1.0*
