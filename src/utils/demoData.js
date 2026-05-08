// Demo data — Apple FY2023 actuals (all values in USD, base units)
// Used to preview the platform without any API keys

export const demoFinancial = {
  revenue:            383_285_000_000,
  grossProfit:        169_148_000_000,
  operatingIncome:    114_301_000_000,
  ebitda:             125_820_000_000,
  netIncome:           96_995_000_000,
  interestExpense:      3_933_000_000,
  cogs:               214_137_000_000,
  totalAssets:        352_583_000_000,
  totalLiabilities:   290_437_000_000,
  totalEquity:         62_146_000_000,
  cash:                29_965_000_000,
  currentAssets:      143_566_000_000,
  currentLiabilities: 145_308_000_000,
  longTermDebt:        95_281_000_000,
  shortTermDebt:        9_822_000_000,
  operatingCashFlow:  110_543_000_000,
  freeCashFlow:        99_584_000_000,
  dividendsPaid:       15_025_000_000,
  sharesOutstanding:   15_552_000_000,
  inventory:            6_331_000_000,
  accountsReceivable:  29_508_000_000,
};

export const demoMarket = {
  price:           189.30,
  marketCap:  2_945_000_000_000,
  peRatio:          30.4,
  pbRatio:          47.4,
  psRatio:           7.7,
  evEbitda:         24.1,
  enterpriseValue: 3_020_000_000_000,
};

// 5-year historical data for charts (Apple FY2019–FY2023, all USD base units)
export const demoHistorical = [
  { year: '2019', revenue: 260_174e6, netIncome: 55_256e6, grossProfit: 98_392e6,  operatingIncome: 63_930e6, ebitda: 76_477e6,  grossMargin: 37.8, operatingMargin: 24.6, netMargin: 21.2, operatingCashFlow: 69_391e6, freeCashFlow: 58_896e6 },
  { year: '2020', revenue: 274_515e6, netIncome: 57_411e6, grossProfit: 104_956e6, operatingIncome: 66_288e6, ebitda: 77_344e6,  grossMargin: 38.2, operatingMargin: 24.1, netMargin: 20.9, operatingCashFlow: 80_674e6, freeCashFlow: 73_365e6 },
  { year: '2021', revenue: 365_817e6, netIncome: 94_680e6, grossProfit: 152_836e6, operatingIncome: 108_949e6, ebitda: 120_233e6, grossMargin: 41.8, operatingMargin: 29.8, netMargin: 25.9, operatingCashFlow: 104_038e6, freeCashFlow: 92_953e6 },
  { year: '2022', revenue: 394_328e6, netIncome: 99_803e6, grossProfit: 170_782e6, operatingIncome: 119_437e6, ebitda: 130_541e6, grossMargin: 43.3, operatingMargin: 30.3, netMargin: 25.3, operatingCashFlow: 122_151e6, freeCashFlow: 111_443e6 },
  { year: '2023', revenue: 383_285e6, netIncome: 96_995e6, grossProfit: 169_148e6, operatingIncome: 114_301e6, ebitda: 125_820e6, grossMargin: 44.1, operatingMargin: 29.8, netMargin: 25.3, operatingCashFlow: 110_543e6, freeCashFlow: 99_584e6 },
];

export const demoCompanyInfo = {
  name:              'Apple Inc.',
  ticker:            'AAPL',
  price:             189.30,
  change:              1.84,
  changesPercentage:   0.98,
  marketCap:    2_945_000_000_000,
  exchange:          'NASDAQ',
  sector:            'Technology',
  currency:          'USD',
  isDemo:            true,
};
