import { useState } from 'react';
import InvestorLibraryModal from './InvestorLibraryModal';

export default function InvestorSelector({ selected, onToggle, customInvestors, onAddCustom, onDeleteCustom }) {
  const [showLibrary, setShowLibrary] = useState(false);

  return (
    <>
      <div className="investor-selector-section">
        <div className="kpi-section-header">
          <span className="kpi-section-title">Investor Lens</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowLibrary(true)}>
            {selected.length === 0 ? 'Open Library →' : '✎ Edit selection'}
          </button>
        </div>

        {selected.length === 0 ? (
          <button className="investor-empty-state" onClick={() => setShowLibrary(true)}>
            Choose up to 3 legendary investors — overlay their criteria on every KPI card
          </button>
        ) : (
          <div className="investor-selected-strip">
            {selected.map(inv => (
              <div
                key={inv.id}
                className="investor-pill"
                style={{ '--investor-accent': inv.accent }}
              >
                <div className="investor-pill-avatar" style={{ background: inv.accent }}>
                  {inv.initials}
                </div>
                <span className="investor-pill-name">{inv.name}</span>
                <button
                  className="investor-pill-remove"
                  onClick={() => onToggle(inv)}
                  aria-label={`Remove ${inv.name}`}
                >×</button>
              </div>
            ))}
            {selected.length < 3 && (
              <button className="investor-pill-add" onClick={() => setShowLibrary(true)}>
                + Add investor
              </button>
            )}
          </div>
        )}
      </div>

      {showLibrary && (
        <InvestorLibraryModal
          selected={selected}
          onToggle={onToggle}
          customInvestors={customInvestors}
          onAddCustom={onAddCustom}
          onDeleteCustom={onDeleteCustom}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </>
  );
}
