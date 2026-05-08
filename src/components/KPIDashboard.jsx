import { useState } from 'react';
import { kpiSections } from '../utils/kpiConfig';
import KPICard from './KPICard';

function PriceBanner({ manualPrice, onPriceEntered, onClearPrice, onAutoDetectPrice, autoDetectTicker, detectingPrice, onAdvancedSubmit }) {
  const [input, setInput]       = useState('');
  const [showAdv, setShowAdv]   = useState(false);
  const [adv, setAdv]           = useState({ marketCap: '', sharesOutstanding: '', enterpriseValue: '' });

  const setA = (k, v) => setAdv(a => ({ ...a, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) onPriceEntered(input.trim());
  };

  const submitAdv = (e) => {
    e.preventDefault();
    const num = (v) => v ? parseFloat(v) : null;
    onAdvancedSubmit({
      price:           input ? parseFloat(input) : undefined,
      marketCap:       adv.marketCap        ? num(adv.marketCap) * 1e6        : null,
      sharesOutstanding: adv.sharesOutstanding ? num(adv.sharesOutstanding) * 1e6 : null,
      enterpriseValue: adv.enterpriseValue  ? num(adv.enterpriseValue) * 1e6  : null,
    });
    setShowAdv(false);
  };

  if (manualPrice) {
    return (
      <div className="pdf-price-banner set">
        <span className="pdf-price-icon">◈</span>
        <span>Share price set to <strong>{manualPrice.toFixed(2)}</strong> — valuation ratios calculated</span>
        <button className="pdf-price-edit" onClick={onClearPrice}>Edit</button>
      </div>
    );
  }

  return (
    <div className="pdf-price-banner">
      <div className="pdf-price-top">
        <span className="pdf-price-icon">◈</span>
        <span className="pdf-price-label">
          Enter current share price to calculate P/E, P/B, P/S and other valuation ratios
        </span>
        <div className="pdf-price-actions">
          {onAutoDetectPrice && (
            <button
              className="btn btn-sm pdf-price-auto"
              onClick={onAutoDetectPrice}
              disabled={detectingPrice}
              title={`Fetch live price for ${autoDetectTicker}`}
            >
              {detectingPrice ? <span className="spinner" /> : `⚡ Auto-detect (${autoDetectTicker})`}
            </button>
          )}
          <form onSubmit={submit} className="pdf-price-form">
            <input
              className="pdf-price-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 124.50"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-gold btn-sm" disabled={!input.trim()}>
              Apply
            </button>
          </form>
        </div>
      </div>

      <button className="pdf-adv-toggle" onClick={() => setShowAdv(s => !s)}>
        {showAdv ? '▲ Hide advanced' : '▼ Advanced — enter market cap, shares or EV manually'}
      </button>

      {showAdv && (
        <form className="pdf-adv-form" onSubmit={submitAdv}>
          <div className="pdf-adv-grid">
            <div className="pdf-adv-field">
              <label>Market Cap (M)</label>
              <input type="number" step="any" placeholder="e.g. 2945" value={adv.marketCap} onChange={e => setA('marketCap', e.target.value)} className="pdf-price-input" style={{ width: '100%' }} />
            </div>
            <div className="pdf-adv-field">
              <label>Shares Outstanding (M)</label>
              <input type="number" step="any" placeholder="e.g. 1022" value={adv.sharesOutstanding} onChange={e => setA('sharesOutstanding', e.target.value)} className="pdf-price-input" style={{ width: '100%' }} />
            </div>
            <div className="pdf-adv-field">
              <label>Enterprise Value (M)</label>
              <input type="number" step="any" placeholder="e.g. 3020" value={adv.enterpriseValue} onChange={e => setA('enterpriseValue', e.target.value)} className="pdf-price-input" style={{ width: '100%' }} />
            </div>
          </div>
          <button type="submit" className="btn btn-gold btn-sm" style={{ marginTop: 8 }}>
            Apply advanced data
          </button>
        </form>
      )}
    </div>
  );
}

export default function KPIDashboard({
  kpis, selectedInvestors = [],
  isPDFMode, manualPrice, onPriceEntered, onClearPrice, onAutoDetectPrice, autoDetectTicker, detectingPrice, onAdvancedSubmit,
}) {
  return (
    <div>
      {isPDFMode && (
        <PriceBanner
          manualPrice={manualPrice}
          onPriceEntered={onPriceEntered}
          onClearPrice={onClearPrice}
          onAutoDetectPrice={onAutoDetectPrice}
          autoDetectTicker={autoDetectTicker}
          detectingPrice={detectingPrice}
          onAdvancedSubmit={onAdvancedSubmit}
        />
      )}

      {kpiSections.map(section => (
        <div key={section.key} className="kpi-section">
          <div className="kpi-section-header">
            <span className="kpi-section-title">{section.label}</span>
          </div>
          <div className="kpi-grid">
            {section.metrics.map(metric => {
              const badges = selectedInvestors.filter(inv => inv.focusKPIs.includes(metric.key));
              return (
                <KPICard
                  key={metric.key}
                  metric={metric}
                  value={kpis[metric.key]}
                  investorBadges={badges.length > 0 ? badges : null}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
