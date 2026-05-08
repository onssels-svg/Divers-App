export const kpiSections = [
  {
    key: 'profitability',
    label: 'Profitability',
    metrics: [
      {
        key: 'grossMargin',
        name: 'Gross Margin',
        format: 'percent',
        description: 'Shows what percentage of revenue remains after subtracting the direct cost of making the product or delivering the service.',
        audience: 'All investors — especially valuable when comparing companies within the same industry.',
        good: 'Above 40%: Strong pricing power and efficient production.',
        bad: 'Below 20%: Razor-thin margins with little buffer against cost increases.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 0.40) return 'green';
          if (v >= 0.20) return 'amber';
          return 'red';
        },
      },
      {
        key: 'operatingMargin',
        name: 'Operating Margin',
        format: 'percent',
        description: 'How much profit the company keeps from every dollar of revenue after paying all operating costs (salaries, rent, marketing).',
        audience: 'Value investors and analysts measuring core business efficiency.',
        good: 'Above 15%: The core business is highly profitable.',
        bad: 'Below 5%: The business is barely breaking even on operations.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 0.15) return 'green';
          if (v >= 0.05) return 'amber';
          return 'red';
        },
      },
      {
        key: 'netProfitMargin',
        name: 'Net Profit Margin',
        format: 'percent',
        description: 'The ultimate bottom line — what percentage of each dollar of revenue ends up as actual profit after all costs, interest, and taxes.',
        audience: 'Essential for all investors. The truest measure of profitability.',
        good: 'Above 10%: Strong overall profitability.',
        bad: 'Below 3%: Very little profit generated per dollar of sales.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 0.10) return 'green';
          if (v >= 0.03) return 'amber';
          return 'red';
        },
      },
      {
        key: 'roe',
        name: 'Return on Equity',
        format: 'percent',
        description: "Measures how effectively management uses the money shareholders have invested to generate profit. Warren Buffett's favourite metric.",
        audience: 'Value investors and long-term shareholders assessing management quality.',
        good: 'Above 15%: Excellent use of shareholder capital.',
        bad: 'Below 8%: Shareholders would likely earn more elsewhere.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 0.15) return 'green';
          if (v >= 0.08) return 'amber';
          return 'red';
        },
      },
      {
        key: 'roa',
        name: 'Return on Assets',
        format: 'percent',
        description: 'How efficiently the company converts its total asset base — everything it owns — into profit.',
        audience: 'Creditors and value investors assessing asset efficiency, especially in capital-intensive industries.',
        good: 'Above 5%: Assets are being deployed very productively.',
        bad: 'Below 2%: Poor returns from the asset base.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 0.05) return 'green';
          if (v >= 0.02) return 'amber';
          return 'red';
        },
      },
      {
        key: 'ebitdaMargin',
        name: 'EBITDA Margin',
        format: 'percent',
        description: 'Operating cash profitability before accounting choices (depreciation) and financing decisions (interest, taxes) distort the picture.',
        audience: 'Private equity investors and analysts comparing companies across different capital structures.',
        good: 'Above 20%: Strong underlying cash generation.',
        bad: 'Below 10%: Limited operational cash flow.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 0.20) return 'green';
          if (v >= 0.10) return 'amber';
          return 'red';
        },
      },
    ],
  },
  {
    key: 'valuation',
    label: 'Valuation',
    metrics: [
      {
        key: 'peRatio',
        name: 'P/E Ratio',
        format: 'multiple',
        description: 'How many dollars you pay today for each dollar of annual earnings. A high P/E means investors expect strong future growth.',
        audience: 'Universal — the most widely used valuation metric by all investor types.',
        good: '10–25×: Reasonably priced relative to earnings.',
        bad: 'Above 40×: Very expensive; requires high growth to justify.',
        getColor: v => {
          if (v == null || isNaN(v) || v < 0) return 'neutral';
          if (v >= 10 && v <= 25) return 'green';
          if ((v >= 5 && v < 10) || (v > 25 && v <= 40)) return 'amber';
          return 'red';
        },
      },
      {
        key: 'pbRatio',
        name: 'Price to Book',
        format: 'multiple',
        description: "Compares the stock's market value to the company's net asset value (what's left if you sold everything and paid all debts).",
        audience: 'Value investors, especially for banks, insurers, and asset-heavy businesses.',
        good: '1–3×: Priced close to asset value.',
        bad: 'Above 5×: Paying a large premium over assets.',
        getColor: v => {
          if (v == null || isNaN(v) || v < 0) return 'neutral';
          if (v >= 1 && v <= 3) return 'green';
          if ((v >= 0.5 && v < 1) || (v > 3 && v <= 5)) return 'amber';
          return 'red';
        },
      },
      {
        key: 'psRatio',
        name: 'Price to Sales',
        format: 'multiple',
        description: 'How much the market pays for each dollar of revenue. Useful for growth companies that are not yet profitable.',
        audience: 'Growth investors evaluating early-stage, high-growth, or unprofitable companies.',
        good: 'Below 2×: Inexpensive relative to revenue.',
        bad: 'Above 5×: Requires exceptional growth to justify the premium.',
        getColor: v => {
          if (v == null || isNaN(v) || v < 0) return 'neutral';
          if (v <= 2) return 'green';
          if (v <= 5) return 'amber';
          return 'red';
        },
      },
      {
        key: 'evEbitda',
        name: 'EV / EBITDA',
        format: 'multiple',
        description: "The go-to metric for M&A deals — what an acquirer would pay for the entire business relative to its cash profits.",
        audience: 'M&A analysts, private equity, and sophisticated investors doing cross-company comparisons.',
        good: 'Below 10×: Attractively valued for a potential buyer.',
        bad: 'Above 20×: Very expensive by historical standards.',
        getColor: v => {
          if (v == null || isNaN(v) || v < 0) return 'neutral';
          if (v <= 10) return 'green';
          if (v <= 20) return 'amber';
          return 'red';
        },
      },
      {
        key: 'fcfYield',
        name: 'FCF Yield',
        format: 'percent',
        description: 'Free cash flow as a percentage of market cap — like a dividend yield, but for all the cash the business generates.',
        audience: 'Value investors who want to know the real cash return per dollar invested.',
        good: 'Above 5%: Attractive cash returns relative to price paid.',
        bad: 'Below 2%: Low cash generation relative to market value.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 0.05) return 'green';
          if (v >= 0.02) return 'amber';
          return 'red';
        },
      },
    ],
  },
  {
    key: 'financialHealth',
    label: 'Financial Health',
    metrics: [
      {
        key: 'currentRatio',
        name: 'Current Ratio',
        format: 'ratio',
        description: 'Can the company pay its bills due in the next 12 months using its short-term assets? Above 1 means yes.',
        audience: 'Creditors, lenders, and conservative investors assessing short-term survival risk.',
        good: 'Above 2.0: Healthy buffer to cover near-term obligations.',
        bad: 'Below 1.0: Cannot cover short-term debts — potential liquidity crisis.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 2) return 'green';
          if (v >= 1) return 'amber';
          return 'red';
        },
      },
      {
        key: 'quickRatio',
        name: 'Quick Ratio',
        format: 'ratio',
        description: 'A stricter liquidity test — can the company pay its short-term bills without needing to sell any inventory?',
        audience: 'Lenders and creditors, especially in industries where inventory is slow to sell.',
        good: 'Above 1.0: Liquid enough to cover obligations without touching inventory.',
        bad: 'Below 0.7: Potential difficulty meeting near-term obligations.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 1) return 'green';
          if (v >= 0.7) return 'amber';
          return 'red';
        },
      },
      {
        key: 'debtToEquity',
        name: 'Debt to Equity',
        format: 'ratio',
        description: 'How much the company borrowed relative to what shareholders own. Higher means more financial risk.',
        audience: 'Bond investors, creditors, and conservative equity investors.',
        good: 'Below 0.5: Conservatively financed with a strong equity cushion.',
        bad: 'Above 1.5: High leverage — dangerous if revenues fall.',
        getColor: v => {
          if (v == null || isNaN(v) || v < 0) return 'neutral';
          if (v <= 0.5) return 'green';
          if (v <= 1.5) return 'amber';
          return 'red';
        },
      },
      {
        key: 'interestCoverage',
        name: 'Interest Coverage',
        format: 'ratio',
        description: 'How many times over the company can pay its annual interest bill from operating profits. Lower = more default risk.',
        audience: 'Bond investors and lenders — key for assessing the risk of a company failing to service its debt.',
        good: 'Above 5×: Comfortably covers interest payments many times over.',
        bad: 'Below 2×: Dangerously close to being unable to service its debt.',
        getColor: v => {
          if (v == null || isNaN(v) || v < 0) return 'neutral';
          if (v >= 5) return 'green';
          if (v >= 2) return 'amber';
          return 'red';
        },
      },
      {
        key: 'netDebt',
        name: 'Net Debt',
        format: 'currency',
        description: "Total debt minus all cash on hand — the real debt burden if the company used its cash to pay down borrowings today.",
        audience: 'All investors and analysts assessing balance sheet strength.',
        good: 'Negative (net cash): The company has more cash than debt — very strong.',
        bad: 'Very high: Debt overhang constrains future investment and dividends.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v <= 0) return 'green';
          return 'amber';
        },
      },
    ],
  },
  {
    key: 'efficiency',
    label: 'Efficiency',
    metrics: [
      {
        key: 'assetTurnover',
        name: 'Asset Turnover',
        format: 'ratio',
        description: 'How much revenue the company generates for every dollar of assets it owns. Higher is more efficient.',
        audience: 'Value investors and analysts, particularly in capital-intensive industries like manufacturing or retail.',
        good: 'Above 1.0: Generating more than $1 of revenue per $1 of assets.',
        bad: 'Below 0.5: Very low revenue relative to the asset base.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 1) return 'green';
          if (v >= 0.5) return 'amber';
          return 'red';
        },
      },
      {
        key: 'inventoryTurnover',
        name: 'Inventory Turnover',
        format: 'ratio',
        description: 'How many times the company sells and replaces its inventory each year. Higher means products are moving quickly.',
        audience: 'Operations analysts and investors in retail, manufacturing, and consumer goods.',
        good: 'Above 6×: Inventory is moving rapidly — efficient operations.',
        bad: 'Below 3×: Slow-moving inventory ties up cash and risks obsolescence.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v >= 6) return 'green';
          if (v >= 3) return 'amber';
          return 'red';
        },
      },
      {
        key: 'daysSalesOutstanding',
        name: 'Days Sales Outstanding',
        format: 'days',
        description: 'The average number of days it takes the company to collect payment after making a sale. Shorter is better.',
        audience: 'Credit analysts and cash-flow-focused investors.',
        good: 'Below 30 days: Collecting cash quickly and efficiently.',
        bad: 'Above 60 days: Slow collections strain cash flow and signal customer issues.',
        getColor: v => {
          if (v == null || isNaN(v)) return 'neutral';
          if (v <= 30) return 'green';
          if (v <= 60) return 'amber';
          return 'red';
        },
      },
    ],
  },
];
