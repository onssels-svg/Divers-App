import axios from 'axios';

// FMP migrated all v3 endpoints to /stable/ for new accounts (post Aug 2025)
const BASE = 'https://financialmodelingprep.com/stable';

const key = () => {
  const k = import.meta.env.VITE_FMP_API_KEY;
  if (!k || k === 'your_fmp_api_key_here') throw new Error('FMP API key not configured');
  return k;
};

const get = (path, params = {}) =>
  axios.get(`${BASE}${path}`, { params: { ...params, apikey: key() } });

// Lightweight single-call price fetch — used for PDF price auto-detect
export async function getStockPrice(ticker) {
  const res = await get('/quote', { symbol: ticker });
  return res.data?.[0]?.price ?? null;
}

const PRIORITY_EXCHANGES = new Set(['NASDAQ', 'NYSE', 'NYSE ARCA', 'NYSE AMERICAN']);

export async function searchCompany(term) {
  const [bySymbol, byName] = await Promise.allSettled([
    get('/search-symbol', { query: term }),
    get('/search-name',   { query: term }),
  ]);

  const normalize = r => ({ symbol: r.symbol, name: r.name, exchangeShortName: r.exchange });

  const rows = [
    ...(bySymbol.status === 'fulfilled' ? bySymbol.value.data || [] : []),
    ...(byName.status   === 'fulfilled' ? byName.value.data   || [] : []),
  ];

  const seen = new Set();
  return rows
    .filter(r => { if (seen.has(r.symbol)) return false; seen.add(r.symbol); return true; })
    .sort((a, b) => {
      const aPri = PRIORITY_EXCHANGES.has(a.exchange) ? 0 : 1;
      const bPri = PRIORITY_EXCHANGES.has(b.exchange) ? 0 : 1;
      return aPri - bPri;
    })
    .slice(0, 8)
    .map(normalize);
}

export async function getFinancialData(ticker) {
  const [income, balance, cashflow, quote, metrics] = await Promise.all([
    get('/income-statement',      { symbol: ticker, period: 'annual' }),
    get('/balance-sheet-statement', { symbol: ticker, period: 'annual' }),
    get('/cash-flow-statement',   { symbol: ticker, period: 'annual' }),
    get('/quote',                 { symbol: ticker }),
    get('/key-metrics',           { symbol: ticker, period: 'annual' }),
  ]);

  const i  = income.data?.[0]   || {};
  const b  = balance.data?.[0]  || {};
  const c  = cashflow.data?.[0] || {};
  const qt = quote.data?.[0]    || {};
  const m  = metrics.data?.[0]  || {};

  const financial = {
    revenue:            i.revenue,
    grossProfit:        i.grossProfit,
    operatingIncome:    i.operatingIncome,
    ebitda:             i.ebitda,
    netIncome:          i.netIncome,
    interestExpense:    i.interestExpense,
    cogs:               i.costOfRevenue,
    sharesOutstanding:  i.weightedAverageShsOutDil,
    totalAssets:        b.totalAssets,
    totalLiabilities:   b.totalLiabilities,
    totalEquity:        b.totalStockholdersEquity ?? b.totalEquity,
    cash:               b.cashAndCashEquivalents,
    currentAssets:      b.totalCurrentAssets,
    currentLiabilities: b.totalCurrentLiabilities,
    longTermDebt:       b.longTermDebt,
    shortTermDebt:      b.shortTermDebt,
    inventory:          b.inventory,
    accountsReceivable: b.accountsReceivables ?? b.netReceivables,
    operatingCashFlow:  c.operatingCashFlow,
    freeCashFlow:       c.freeCashFlow,
    dividendsPaid:      c.commonDividendsPaid,
  };

  const market = {
    price:           qt.price,
    marketCap:       qt.marketCap,
    // P/E not in /stable/quote — derive from key-metrics earningsYield
    peRatio:         m.earningsYield ? 1 / m.earningsYield : null,
    pbRatio:         null, // not directly available; calculated in kpiCalculations from marketCap/equity
    psRatio:         m.evToSales   ? (m.evToSales * qt.marketCap) / (m.enterpriseValue || 1) : null,
    evEbitda:        m.evToEBITDA,
    enterpriseValue: m.enterpriseValue,
    fcfYield:        m.freeCashFlowYield,
  };

  const companyInfo = {
    name:              qt.name,
    ticker:            qt.symbol || ticker,
    price:             qt.price,
    change:            qt.change,
    changesPercentage: qt.changePercentage,
    marketCap:         qt.marketCap,
    exchange:          qt.exchange,
    currency:          'USD',
  };

  return { financial, market, companyInfo };
}

export async function getHistoricalData(ticker) {
  const [income, cashflow] = await Promise.all([
    get('/income-statement',    { symbol: ticker, period: 'annual', limit: 5 }),
    get('/cash-flow-statement', { symbol: ticker, period: 'annual', limit: 5 }),
  ]);

  const incomeRows   = (income.data   || []).slice().reverse();
  const cashflowRows = (cashflow.data || []).slice().reverse();

  return incomeRows.map((item, idx) => {
    const cf = cashflowRows[idx] || {};
    const rev = item.revenue || 0;
    return {
      year:             item.fiscalYear || item.date?.slice(0, 4) || '—',
      revenue:          item.revenue,
      netIncome:        item.netIncome,
      grossProfit:      item.grossProfit,
      operatingIncome:  item.operatingIncome,
      ebitda:           item.ebitda,
      grossMargin:      rev ? (item.grossProfit    / rev) * 100 : null,
      operatingMargin:  rev ? (item.operatingIncome / rev) * 100 : null,
      netMargin:        rev ? (item.netIncome       / rev) * 100 : null,
      operatingCashFlow: cf.operatingCashFlow,
      freeCashFlow:      cf.freeCashFlow,
    };
  });
}

export async function getAnalystRatings(ticker) {
  try {
    const target = await get('/price-target-consensus', { symbol: ticker });
    return {
      recommendations: null, // analyst-stock-recommendations not available on free stable tier
      priceTarget: target.data?.[0] || null,
    };
  } catch {
    return { recommendations: null, priceTarget: null };
  }
}
