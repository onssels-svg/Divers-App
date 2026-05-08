import { useState } from 'react';

const FIELDS = {
  income: [
    { key: 'revenue',         label: 'Revenue' },
    { key: 'grossProfit',     label: 'Gross Profit' },
    { key: 'cogs',            label: 'Cost of Sales' },
    { key: 'operatingIncome', label: 'Operating Income' },
    { key: 'ebitda',          label: 'EBITDA' },
    { key: 'netIncome',       label: 'Net Income' },
    { key: 'interestExpense', label: 'Interest Expense' },
  ],
  balance: [
    { key: 'totalAssets',         label: 'Total Assets' },
    { key: 'totalLiabilities',    label: 'Total Liabilities' },
    { key: 'totalEquity',         label: 'Total Equity' },
    { key: 'cash',                label: 'Cash & Equivalents' },
    { key: 'currentAssets',       label: 'Current Assets' },
    { key: 'currentLiabilities',  label: 'Current Liabilities' },
    { key: 'longTermDebt',        label: 'Long-term Debt' },
    { key: 'shortTermDebt',       label: 'Short-term Debt' },
    { key: 'inventory',           label: 'Inventory' },
    { key: 'accountsReceivable',  label: 'Accounts Receivable' },
  ],
  cashflow: [
    { key: 'operatingCashFlow', label: 'Operating Cash Flow' },
    { key: 'freeCashFlow',      label: 'Free Cash Flow' },
    { key: 'dividendsPaid',     label: 'Dividends Paid' },
  ],
  market: [
    { key: 'price',            label: 'Share Price', hint: 'current market price' },
    { key: 'marketCap',        label: 'Market Cap', hint: 'same scale as above' },
    { key: 'sharesOutstanding',label: 'Shares Outstanding', hint: 'in millions' },
    { key: 'enterpriseValue',  label: 'Enterprise Value', hint: 'same scale as above' },
  ],
};

function Field({ f, value, onChange }) {
  return (
    <div className="manual-field">
      <label className="manual-label">
        {f.label}
        {f.hint && <span className="manual-hint"> ({f.hint})</span>}
      </label>
      <input
        className="manual-input"
        type="number"
        step="any"
        placeholder="—"
        value={value}
        onChange={e => onChange(f.key, e.target.value)}
      />
    </div>
  );
}

export default function ManualEntryForm({ onSubmit, loading }) {
  const [name,   setName]   = useState('');
  const [scale,  setScale]  = useState('M');
  const [values, setValues] = useState({});

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const multiplier = scale === 'B' ? 1e9 : scale === 'K' ? 1e3 : 1e6;
    const num = (k) => values[k] ? parseFloat(values[k]) * multiplier : null;

    const financial = {
      revenue:           num('revenue'),
      grossProfit:       num('grossProfit'),
      cogs:              num('cogs'),
      operatingIncome:   num('operatingIncome'),
      ebitda:            num('ebitda'),
      netIncome:         num('netIncome'),
      interestExpense:   num('interestExpense'),
      totalAssets:       num('totalAssets'),
      totalLiabilities:  num('totalLiabilities'),
      totalEquity:       num('totalEquity'),
      cash:              num('cash'),
      currentAssets:     num('currentAssets'),
      currentLiabilities:num('currentLiabilities'),
      longTermDebt:      num('longTermDebt'),
      shortTermDebt:     num('shortTermDebt'),
      inventory:         num('inventory'),
      accountsReceivable:num('accountsReceivable'),
      operatingCashFlow: num('operatingCashFlow'),
      freeCashFlow:      num('freeCashFlow'),
      dividendsPaid:     num('dividendsPaid'),
      // Shares outstanding in millions → actual number
      sharesOutstanding: values.sharesOutstanding
        ? parseFloat(values.sharesOutstanding) * 1e6 : null,
    };

    const market = {
      price:           values.price           ? parseFloat(values.price)           : null,
      marketCap:       values.marketCap       ? parseFloat(values.marketCap) * multiplier : null,
      enterpriseValue: values.enterpriseValue ? parseFloat(values.enterpriseValue) * multiplier : null,
    };

    const info = {
      name:      name.trim() || 'Manual Entry',
      ticker:    null,
      price:     market.price,
      marketCap: market.marketCap,
    };

    onSubmit(financial, market, info);
  };

  return (
    <form className="manual-form" onSubmit={handleSubmit}>
      <div className="manual-header-row">
        <div className="manual-field" style={{ flex: 2 }}>
          <label className="manual-label">Company name</label>
          <input
            className="manual-input"
            type="text"
            placeholder="e.g. Barratt Redrow plc"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="manual-field">
          <label className="manual-label">Values reported in</label>
          <select className="manual-input" value={scale} onChange={e => setScale(e.target.value)}>
            <option value="K">Thousands (K)</option>
            <option value="M">Millions (M)</option>
            <option value="B">Billions (B)</option>
          </select>
        </div>
      </div>

      <div className="manual-section-label">Income Statement</div>
      <div className="manual-grid">
        {FIELDS.income.map(f => <Field key={f.key} f={f} value={values[f.key] ?? ''} onChange={set} />)}
      </div>

      <div className="manual-section-label">Balance Sheet</div>
      <div className="manual-grid">
        {FIELDS.balance.map(f => <Field key={f.key} f={f} value={values[f.key] ?? ''} onChange={set} />)}
      </div>

      <div className="manual-section-label">Cash Flow</div>
      <div className="manual-grid">
        {FIELDS.cashflow.map(f => <Field key={f.key} f={f} value={values[f.key] ?? ''} onChange={set} />)}
      </div>

      <div className="manual-section-label">Market Data <span className="manual-hint">(optional — enables valuation ratios)</span></div>
      <div className="manual-grid">
        {FIELDS.market.map(f => <Field key={f.key} f={f} value={values[f.key] ?? ''} onChange={set} />)}
      </div>

      <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
        {loading ? <span className="spinner" /> : 'Calculate KPIs →'}
      </button>
    </form>
  );
}
