import { useState } from 'react';
import { formatValue } from '../utils/kpiCalculations';
import { kpiSections } from '../utils/kpiConfig';

const KPI_META = {};
kpiSections.forEach(s => s.metrics.forEach(m => { KPI_META[m.key] = m; }));

function getMetricFormat(key) {
  return KPI_META[key]?.format || 'number';
}

function CritInfoBtn({ kpiKey }) {
  const [show, setShow] = useState(false);
  const meta = KPI_META[kpiKey];
  if (!meta) return null;
  return (
    <span className="crit-info-wrap">
      <button
        className="crit-info-btn"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        aria-label={`About ${meta.name}`}
      >ℹ</button>
      {show && (
        <div className="crit-info-tooltip">
          <div className="crit-info-name">{meta.name}</div>
          <div className="crit-info-desc">{meta.description}</div>
          <div className="crit-info-row"><span className="crit-info-good">Good:</span> {meta.good}</div>
          <div className="crit-info-row"><span className="crit-info-bad">Watch:</span> {meta.bad}</div>
        </div>
      )}
    </span>
  );
}

function evaluate(criterion, value) {
  if (value == null || isNaN(value)) return null;
  if (criterion.min !== undefined && criterion.max !== undefined) {
    return value >= criterion.min && value <= criterion.max;
  }
  if (criterion.min !== undefined) return value >= criterion.min;
  if (criterion.max !== undefined) return value <= criterion.max;
  return null;
}

function SinglePanel({ investor, kpis }) {
  const results = investor.criteria.map(c => {
    const value   = kpis?.[c.key];
    const passed  = evaluate(c, value);
    const format  = getMetricFormat(c.key);
    return {
      ...c,
      value,
      passed,
      displayValue: value == null || isNaN(value) ? 'N/A' : formatValue(value, format),
    };
  });

  const scored   = results.filter(r => r.passed !== null);
  const passed   = scored.filter(r => r.passed).length;
  const total    = results.length;
  const naCount  = total - scored.length;
  const pct      = scored.length ? Math.round((passed / scored.length) * 100) : 0;

  return (
    <div className="investor-verdict-panel" style={{ '--investor-accent': investor.accent }}>
      <div className="verdict-header">
        <div className="verdict-avatar" style={{ background: investor.accent }}>
          {investor.initials}
        </div>
        <div className="verdict-header-text">
          <div className="verdict-name">{investor.name}</div>
          <div className="verdict-title">{investor.title}</div>
          {investor.quote && <blockquote className="verdict-quote">"{investor.quote}"</blockquote>}
          {investor.source && <div className="verdict-source">{investor.source}</div>}
        </div>
      </div>

      <div className="verdict-score-bar-wrap">
        <div className="verdict-score-label">
          <span className="verdict-score-num">{passed} of {scored.length}</span> scorable criteria met
          {naCount > 0 && <span className="verdict-na-note"> · {naCount} N/A</span>}
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
          <div
            key={r.key}
            className={`verdict-row ${r.passed === true ? 'pass' : r.passed === false ? 'fail' : 'na'}`}
          >
            <div className="verdict-metric">
              {r.label}
              <CritInfoBtn kpiKey={r.key} />
            </div>
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

export default function InvestorVerdictPanel({ investors, kpis }) {
  if (!investors || investors.length === 0) return null;
  return (
    <div className="verdict-panels-stack">
      {investors.map(investor => (
        <SinglePanel key={investor.id} investor={investor} kpis={kpis} />
      ))}
    </div>
  );
}
