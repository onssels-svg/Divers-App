import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ── Company name extraction from first page (largest text items) ──
export async function extractCompanyName(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();

  const items = content.items
    .filter(it => typeof it.str === 'string' && it.str.trim().length > 2)
    .map(it => ({
      text: it.str.trim(),
      size: Math.abs(it.transform[3] || it.transform[0] || 12),
    }))
    .sort((a, b) => b.size - a.size);

  // Prefer text that looks like a legal company name
  for (const { text: t } of items.slice(0, 20)) {
    if (
      /\b(plc|inc\.?|corp\.?|ltd\.?|limited|llc|group|holdings?|s\.a\.|ag|nv|bv)\b/i.test(t) &&
      t.length < 120 &&
      !/\d{4}/.test(t)
    ) return t;
  }

  // Fallback: largest non-trivial, non-boilerplate text block
  for (const { text: t } of items.slice(0, 8)) {
    if (
      t.length > 4 && t.length < 80 &&
      !/^\d+$/.test(t) &&
      !/annual|report|accounts?|financial|welcome|dear|chairman|contents/i.test(t)
    ) return t;
  }
  return null;
}

// ── Text extraction: group items by visual line (y-coordinate) ──
// This preserves the label ↔ number relationship that tables rely on.
async function extractText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items.filter(it => typeof it.str === 'string' && it.str.trim().length > 0);

    // Group by y-coordinate within 3pt tolerance (= same visual row)
    const lineMap = new Map();
    for (const item of items) {
      const y = item.transform[5];
      let placed = false;
      for (const [ky] of lineMap) {
        if (Math.abs(ky - y) <= 3) { lineMap.get(ky).push(item); placed = true; break; }
      }
      if (!placed) lineMap.set(y, [item]);
    }

    // Sort top→bottom, items left→right within each line
    const lines = [...lineMap.entries()]
      .sort(([ya], [yb]) => yb - ya)
      .map(([, its]) =>
        its.sort((a, b) => a.transform[4] - b.transform[4])
           .map(it => it.str).join(' ')
      )
      .filter(l => l.trim());

    fullText += lines.join('\n') + '\n';
  }
  return fullText;
}

// ── Scale detection: search whole document ──
function detectScale(text) {
  if (/in\s+billions|\(billions\)|\$\s*billions/i.test(text)) return 1e9;
  if (/in\s+millions|expressed\s+in\s+millions|\(in\s+millions\)|\(millions\)|millions\s+of\s+(?:dollars|pounds|euros|canadian)|£\s*m\b|€\s*m\b|\$\s*m\b/i.test(text)) return 1e6;
  if (/in\s+thousands|expressed\s+in\s+thousands|\(in\s+thousands\)|\(thousands\)|thousands\s+of\s+(?:dollars|pounds|euros)|£\s*['']?000|£000|\$000|€000/i.test(text)) return 1e3;
  return 1e6; // safe default — annual reports almost always report in millions
}

// ── Number parser: handles commas, spaces, parentheses (negatives) ──
function parseNum(str) {
  if (!str) return null;
  const clean = str.replace(/,/g, '').replace(/\s/g, '');
  const negative = clean.startsWith('(') && clean.endsWith(')');
  const num = parseFloat(clean.replace(/[()$£€]/g, ''));
  if (isNaN(num)) return null;
  return negative ? -num : num;
}

const NUM_CAPTURE = '([\\-\\(]?[\\d,]+(?:\\.\\d+)?\\)?)';

// Search lines for first matching label+number
function findFirst(lines, patterns, scale) {
  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(new RegExp(pat + '[^\\d\\-\\(]{0,80}' + NUM_CAPTURE, 'i'));
      if (m) {
        const n = parseNum(m[1]);
        if (n !== null && n !== 0) return n * scale;
      }
    }
  }
  return null;
}

// Search for LAST match (balance sheet: get closing balance, not opening)
function findLast(lines, patterns, scale) {
  let result = null;
  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(new RegExp(pat + '[^\\d\\-\\(]{0,80}' + NUM_CAPTURE, 'i'));
      if (m) {
        const n = parseNum(m[1]);
        if (n !== null && n !== 0) result = n * scale;
      }
    }
  }
  return result;
}

// ── Main export ──────────────────────────────────────────────────
export async function parsePDF(file) {
  const rawText = await extractText(file);
  const scale   = detectScale(rawText);
  const lines   = rawText.split('\n');

  // ── Income Statement ────────────────────────────────────────
  const revenue = findFirst(lines, [
    'total\\s+net\\s+revenues?',
    'total\\s+revenues?',
    'net\\s+revenues?',
    'revenues?\\s+and\\s+other\\s+income',
    'total\\s+sales',
    'net\\s+sales',
    'sales\\s+revenue',
    'turnover(?:\\s+from\\s+continuing\\s+operations)?',
    '^revenues?$',
  ], scale);

  const cogs = findFirst(lines, [
    'cost\\s+of\\s+(?:goods\\s+sold|revenues?|sales|products?\\s+sold)',
    'cost\\s+of\\s+sales',
    'cost\\s+of\\s+services',
    'costs?\\s+of\\s+sales',
    'direct\\s+costs?',
  ], scale);

  const grossProfit = findFirst(lines, [
    'gross\\s+profit(?!\\s+margin)',
    'gross\\s+margin(?!\\s*%)',
  ], scale);

  const operatingIncome = findFirst(lines, [
    'operating\\s+income(?:\\s*\\(loss\\))?',
    'income\\s+from\\s+operations',
    'operating\\s+profit(?:\\s*\\(loss\\))?',
    'profit\\s+from\\s+operations',
    'operating\\s+earnings',
    '\\bEBIT\\b(?!DA)',
  ], scale);

  const ebitda = findFirst(lines, [
    'adjusted\\s+ebitda',
    '\\bEBITDA\\b(?!\\s+margin)',
  ], scale);

  const netIncome = findFirst(lines, [
    'net\\s+income(?:\\s*\\(loss\\))?(?!\\s+attributable\\s+to\\s+non)',
    'net\\s+earnings(?:\\s*\\(loss\\))?',
    'net\\s+profit(?:\\s*\\(loss\\))?',
    'profit\\s+for\\s+the\\s+(?:financial\\s+)?(?:year|period)',
    'profit\\s+attributable\\s+to\\s+(?:owners|equity\\s+holders|shareholders)',
    'profit\\s+after\\s+(?:income\\s+)?tax(?:ation)?',
    'earnings?\\s+for\\s+the\\s+(?:year|period)',
  ], scale);

  const interestExpense = findFirst(lines, [
    'interest\\s+expense(?:\\s*,?\\s*net)?',
    'interest\\s+and\\s+debt\\s+expense',
    'finance\\s+costs?(?:\\s*,?\\s*net)?',
    'finance\\s+charges?',
    'interest\\s+costs?\\s+expensed',
    'interest\\s+payable',
  ], scale);

  const depreciation = findFirst(lines, [
    'depreciation\\s+and\\s+amortis?ation',
    'depreciation\\s+&\\s+amortis?ation',
    'amortis?ation\\s+and\\s+depreciation',
    'depreciation,?\\s+depletion\\s+and\\s+amortis?ation',
    'depreciation(?:\\s+of\\s+(?:property|right.of.use|tangible))',
  ], scale);

  // ── Balance Sheet ────────────────────────────────────────────
  const totalAssets = findLast(lines, [
    'total\\s+assets',
  ], scale);

  const totalLiabilities = findLast(lines, [
    'total\\s+liabilities(?!\\s+and\\s+(?:stockholders|shareholders|owners|equity))',
    'total\\s+liabilities(?:\\s+and\\s+equity)?(?=\\s)',
  ], scale);

  const totalEquity = findLast(lines, [
    "total\\s+(?:stockholders'?|shareholders'?|owners'?|shareowners'?)\\s+equity",
    "total\\s+equity(?:\\s+attributable)?",
    "equity\\s+attributable\\s+to\\s+(?:owners|shareholders|equity\\s+holders)",
    "total\\s+(?:net\\s+)?assets(?!\\s+and\\s+liabilities)",
    "net\\s+assets",
  ], scale);

  const cash = findLast(lines, [
    'cash\\s+and\\s+cash\\s+equivalents(?:\\s+at\\s+(?:end|close)\\s+of\\s+(?:year|period))?',
    'cash\\s+and\\s+short.?term\\s+investments',
    'cash\\s+and\\s+equivalents',
    'cash\\s+at\\s+(?:end|close)\\s+of\\s+(?:year|period)',
    'cash\\s+and\\s+bank\\s+balances?',
  ], scale);

  const currentAssets = findLast(lines, [
    'total\\s+current\\s+assets',
    'current\\s+assets,?\\s+total',
  ], scale);

  const currentLiabilities = findLast(lines, [
    'total\\s+current\\s+liabilities',
    'current\\s+liabilities,?\\s+total',
  ], scale);

  const longTermDebt = findLast(lines, [
    'long.?term\\s+debt(?!\\s+and\\s+current)',
    'long.?term\\s+borrowings?',
    'non.?current\\s+borrowings?',
    'long.?term\\s+notes\\s+payable',
    'bonds\\s+payable',
    'non.?current\\s+debt',
  ], scale);

  const shortTermDebt = findLast(lines, [
    'short.?term\\s+(?:debt|borrowings?)',
    'current\\s+portion\\s+of\\s+(?:long.?term\\s+)?debt',
    'current\\s+maturities\\s+of\\s+(?:long.?term\\s+)?(?:debt|borrowings?)',
    'notes\\s+payable(?:\\s+to\\s+banks?)?',
    'current\\s+borrowings?',
  ], scale);

  const inventory = findLast(lines, [
    'inventori(?:es|y)(?:,?\\s*net)?',
    'stocks?(?:\\s+of\\s+(?:goods|raw\\s+materials))?',
    'finished\\s+goods',
  ], scale);

  const accountsReceivable = findLast(lines, [
    'accounts?\\s+receivable(?:,?\\s*net)?',
    'trade\\s+(?:and\\s+other\\s+)?receivables?(?:,?\\s*net)?',
    'trade\\s+debtors?',
  ], scale);

  // ── Cash Flow Statement ──────────────────────────────────────
  const operatingCashFlow = findFirst(lines, [
    'net\\s+cash\\s+(?:provided\\s+by|generated\\s+(?:from|by)|from)\\s+operating\\s+activities',
    'cash\\s+(?:generated|flows?)\\s+from\\s+(?:operating|operations)',
    'operating\\s+cash\\s+(?:flow|generated)',
    'cash\\s+from\\s+operations',
    'net\\s+cash\\s+from\\s+operating',
  ], scale);

  // Capex: often negative in cash flow — we take abs when deriving FCF
  const capex = findFirst(lines, [
    'purchases?\\s+of\\s+property,?\\s+plant\\s+and\\s+equipment',
    'purchase\\s+of\\s+property\\s+and\\s+equipment',
    'acquisition\\s+of\\s+property,?\\s+plant\\s+and\\s+equipment',
    'capital\\s+expenditures?',
    'capital\\s+spending',
    'additions\\s+to\\s+property,?\\s+plant\\s+and\\s+equipment',
    'purchase\\s+of\\s+(?:fixed|tangible)\\s+assets',
    'purchase\\s+of\\s+plant\\s+and\\s+equipment',
  ], scale);

  const freeCashFlow = findFirst(lines, [
    'free\\s+cash\\s+flow',
  ], scale);

  // Shares — no scale; reported in thousands/millions; align to revenue scale
  const sharesRaw = findFirst(lines, [
    'diluted\\s+(?:weighted\\s+average\\s+)?(?:shares|common\\s+shares)\\s+(?:outstanding|used)',
    'weighted\\s+average\\s+(?:diluted\\s+)?shares',
    'diluted\\s+shares\\s+(?:outstanding|used)',
    'average\\s+(?:diluted\\s+)?shares\\s+outstanding',
  ], 1);
  const sharesOutstanding = sharesRaw
    ? sharesRaw * (scale === 1e9 ? 1e6 : scale === 1e6 ? 1e3 : 1)
    : null;

  const dividendsPaid = findFirst(lines, [
    'dividends?\\s+paid',
    'cash\\s+dividends?\\s+paid',
    'payment\\s+of\\s+dividends?',
  ], scale);

  // ── Derived values (accounting identities) ───────────────────
  // Fill in what wasn't stated explicitly using relationships between extracted values

  const derivedGrossProfit = grossProfit
    ?? (revenue != null && cogs != null ? revenue - Math.abs(cogs) : null);

  const derivedTotalEquity = totalEquity
    ?? (totalAssets != null && totalLiabilities != null ? totalAssets - totalLiabilities : null);

  const derivedEBITDA = ebitda
    ?? (operatingIncome != null && depreciation != null
        ? operatingIncome + Math.abs(depreciation)
        : null);

  // FCF = Operating Cash Flow − Capital Expenditure
  const derivedFCF = freeCashFlow
    ?? (operatingCashFlow != null && capex != null
        ? operatingCashFlow - Math.abs(capex)
        : null);

  return {
    revenue,
    grossProfit:        derivedGrossProfit,
    operatingIncome,
    ebitda:             derivedEBITDA,
    netIncome,
    interestExpense,
    cogs,
    totalAssets,
    totalLiabilities,
    totalEquity:        derivedTotalEquity,
    cash,
    currentAssets,
    currentLiabilities,
    longTermDebt,
    shortTermDebt,
    operatingCashFlow,
    freeCashFlow:       derivedFCF,
    inventory,
    accountsReceivable,
    sharesOutstanding,
    dividendsPaid,
  };
}
