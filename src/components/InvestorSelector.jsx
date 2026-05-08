import { investorLenses } from '../utils/investorLenses';

export default function InvestorSelector({ selected, onSelect }) {
  return (
    <div className="investor-selector-section">
      <div className="kpi-section-header">
        <span className="kpi-section-title">Investor Lens</span>
        <span className="investor-selector-hint">Select an investor to spotlight their key metrics</span>
      </div>
      <div className="investor-cards">
        {investorLenses.map(investor => {
          const isActive = selected?.id === investor.id;
          return (
            <button
              key={investor.id}
              className={`investor-card${isActive ? ' active' : ''}`}
              style={{ '--investor-accent': investor.accent }}
              onClick={() => onSelect(isActive ? null : investor)}
              aria-pressed={isActive}
            >
              <div className="investor-avatar" style={{ background: investor.accent }}>
                {investor.initials}
              </div>
              <div className="investor-card-body">
                <div className="investor-card-name">{investor.name}</div>
                <div className="investor-card-title">{investor.title}</div>
                <div className="investor-card-tagline">{investor.tagline}</div>
              </div>
              {isActive && <div className="investor-card-check">✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
