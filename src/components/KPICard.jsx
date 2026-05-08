import { useState } from 'react';
import { formatValue } from '../utils/kpiCalculations';

export default function KPICard({ metric, value, investorBadges }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const color   = metric.getColor(value);
  const isNA    = value == null || isNaN(value);
  const display = isNA ? 'N/A' : formatValue(value, metric.format);
  const badges  = investorBadges?.length > 0 ? investorBadges : null;

  return (
    <div className="card kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-name">{metric.name}</span>
        <span className={`kpi-dot ${color}`} />
      </div>

      <div className={`kpi-value${isNA ? ' na' : ''}`}>{display}</div>

      {badges && (
        <div className="investor-kpi-badges">
          {badges.map(b => (
            <div
              key={b.id}
              className="investor-kpi-badge"
              style={{ background: b.accent, color: '#000' }}
              title={`${b.name} watches this metric`}
            >
              {b.initials}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          className="kpi-info-btn"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={`Info about ${metric.name}`}
        >
          i
        </button>

        <div className={`kpi-tooltip${showTooltip ? ' visible' : ''}`}>
          <div className="kpi-tooltip-title">{metric.name}</div>
          <div className="kpi-tooltip-row">
            <div className="kpi-tooltip-label">What it measures</div>
            <div>{metric.description}</div>
          </div>
          <div className="kpi-tooltip-row">
            <div className="kpi-tooltip-label">Who watches it</div>
            <div>{metric.audience}</div>
          </div>
          <div className="kpi-tooltip-row">
            <div className="kpi-tooltip-label" style={{ color: 'var(--green)' }}>Good</div>
            <div>{metric.good}</div>
          </div>
          <div className="kpi-tooltip-row">
            <div className="kpi-tooltip-label" style={{ color: 'var(--red)' }}>Concern</div>
            <div>{metric.bad}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
