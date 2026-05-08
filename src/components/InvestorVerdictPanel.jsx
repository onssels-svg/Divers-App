import { formatValue } from '../utils/kpiCalculations';
import { kpiSections } from '../utils/kpiConfig';

function getMetricFormat(key) {
  for (const section of kpiSections) {
    const m = section.metrics.find(m => m.key === key);
    if (m) return m.format;
  }
  return 'number';
}

function evaluate(criterion, value) {
  if (value == null || isNaN(value)) return null;
  if (criterion.key === 'peRatio' && criterion.min && criterion.max) {
    return value >= criterion.min && value <= criterion.max;
  }
  if (criterion.key === 'netDebt') {
    return value <= criterion.max;
  }
  if (criterion.min !== undefined) return value >= criterion.min;
  if (criterion.max !== undefined) return value <= criterion.max;
  return null;
}

export default function InvestorVerdictPanel({ investor, kpis }) {
  if (!investor) return null;

  const results = investor.criteria.map(c => {
    const value  = kpis?.[c.key];
    const passed = evaluate(c, value);
    const format = getMetricFormat(c.key);
    return { ...c, value, passed, displayValue: value == null || isNaN(value) ? 'N/A' : formatValue(value, format) };
  });

  const scored  = results.filter(r => r.passed !== null);
  const passed  = scored.filter(r => r.passed).length;
  const total   = results.length;
  const pct     = total ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="investor-verdict-panel" style={{ '--investor-accent': investor.accent }}>
      <div className="verdict-header">
        <div className="verdict-avatar" style={{ background: investor.accent }}>
          {investor.initials}
        </div>
        <div className="verdict-header-text">
          <div className="verdict-name">{investor.name}</div>
          <div className="verdict-title">{investor.title}</div>
          <blockquote className="verdict-quote">"{investor.quote}"</blockquote>
          <div className="verdict-source">{investor.source}</div>
        </div>
      </div>

      <div className="verdict-score-bar-wrap">
        <div className="verdict-score-label">
          <span className="verdict-score-num">{passed} of {total}</span> criteria met
        </div>
        <div className="verdict-bar-track">
          <div
            className="verdict-bar-fill"
            style={{ width: `${pct}%`, background: investor.accent }}
          />
        </div>
      </div>

      <div className="verdict-grid">
        {results.map(r => (
          <div key={r.key} className={`verdict-row ${r.passed === true ? 'pass' : r.passed === false ? 'fail' : 'na'}`}>
            <div className="verdict-metric">{r.label}</div>
            <div className="verdict-value">{r.displayValue}</div>
            <div className="verdict-threshold">{r.threshold}</div>
            <div className="verdict-icon">
              {r.passed === true  && <span className="verdict-pass">✓</span>}
              {r.passed === false && <span className="verdict-fail">✗</span>}
              {r.passed === null  && <span className="verdict-na">—</span>}
            </div>
            <div className="verdict-why">{r.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
