import { useState } from 'react';
import { formatValue } from '../utils/kpiCalculations';

export default function KPICard({ metric, value, investorBadge }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const color  = metric.getColor(value);
  const isNA   = value == null || isNaN(value);
  const display = isNA ? 'N/A' : formatValue(value, metric.format);

  return (
    <div className="card kpi-card">
      {investorBadge && (
        <div
          className="investor-kpi-badge"
          style={{ background: investorBadge.accent, color: '#000' }}
          title={`${investorBadge.name} watches this metric`}
        >
          {investorBadge.initials}
        </div>
      )}
      <div className="kpi-card-top">
        <span className="kpi-name">{metric.name}</span>
        <span className={`kpi-dot ${color}`} />
      </div>

      <div className={`kpi-value${isNA ? ' na' : ''}`}>{display}</div>

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
