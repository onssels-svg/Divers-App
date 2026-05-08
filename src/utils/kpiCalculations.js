const safe = (a, b) => {
  if (a == null || b == null || b === 0 || isNaN(a) || isNaN(b)) return null;
  return a / b;
};

export const calculateKPIs = (financial, market = {}) => {
  const {
    revenue, netIncome, ebitda, totalAssets, totalEquity,
    cash = 0, freeCashFlow, sharesOutstanding,
    currentAssets, currentLiabilities, longTermDebt = 0, shortTermDebt = 0,
    grossProfit, operatingIncome, interestExpense, inventory = 0,
    accountsReceivable, cogs,
  } = financial || {};

  const {
    price, marketCap, peRatio, pbRatio, psRatio, evEbitda, enterpriseValue,
  } = market || {};

  const totalDebt = (longTermDebt || 0) + (shortTermDebt || 0);

  // Prefer market-supplied ratios; fall back to calculations
  // P/E = price ÷ EPS (EPS = netIncome / sharesOutstanding)
  const eps     = netIncome && sharesOutstanding ? netIncome / sharesOutstanding : null;
  const calcPE  = peRatio  ?? (price && eps ? price / eps : null);
  // P/B requires positive equity (negative equity = technically insolvent)
  const calcPB  = pbRatio  ?? (marketCap && totalEquity > 0 ? marketCap / totalEquity : null);
  const calcPS  = psRatio  ?? safe(marketCap, revenue);
  const calcEVE = evEbitda ?? (enterpriseValue && ebitda ? enterpriseValue / ebitda : null);

  return {
    // Profitability
    grossMargin:      safe(grossProfit, revenue),
    operatingMargin:  safe(operatingIncome, revenue),
    netProfitMargin:  safe(netIncome, revenue),
    roe:              safe(netIncome, totalEquity),
    roa:              safe(netIncome, totalAssets),
    ebitdaMargin:     safe(ebitda, revenue),

    // Valuation
    peRatio:          calcPE,
    pbRatio:          calcPB,
    psRatio:          calcPS,
    evEbitda:         calcEVE,
    fcfYield:         safe(freeCashFlow, marketCap),

    // Financial Health
    currentRatio:     safe(currentAssets, currentLiabilities),
    quickRatio:       currentLiabilities ? ((currentAssets || 0) - inventory) / currentLiabilities : null,
    debtToEquity:     totalEquity > 0 ? totalDebt / totalEquity : null,
    interestCoverage: (interestExpense && operatingIncome) ? operatingIncome / Math.abs(interestExpense) : null,
    netDebt:          totalDebt - (cash || 0),

    // Efficiency
    assetTurnover:         safe(revenue, totalAssets),
    inventoryTurnover:     (cogs && inventory) ? cogs / inventory : null,
    daysSalesOutstanding:  (accountsReceivable && revenue) ? (accountsReceivable / revenue) * 365 : null,
  };
};

export const formatValue = (value, format) => {
  if (value == null || isNaN(value)) return 'N/A';
  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'multiple':
      return `${value.toFixed(1)}×`;
    case 'ratio':
      return value.toFixed(2);
    case 'days':
      return `${Math.round(value)}d`;
    case 'currency': {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
      if (abs >= 1e9)  return `${sign}$${(abs / 1e9).toFixed(1)}B`;
      if (abs >= 1e6)  return `${sign}$${(abs / 1e6).toFixed(1)}M`;
      if (abs >= 1e3)  return `${sign}$${(abs / 1e3).toFixed(1)}K`;
      return `${sign}$${abs.toFixed(0)}`;
    }
    default:
      return value.toFixed(2);
  }
};

export const formatLargeNumber = (n) => {
  if (n == null || isNaN(n)) return 'N/A';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  return `${sign}$${abs.toLocaleString()}`;
};
