export default function CompanyMatchBanner({ matches, onSelect, onDismiss, loading }) {
  return (
    <div className="company-match-banner">
      <div className="company-match-left">
        <div className="company-match-title">
          Found online — load live market data, price &amp; historical charts?
        </div>
        <div className="company-match-options">
          {matches.map(m => (
            <button
              key={m.symbol}
              className="company-match-option"
              onClick={() => onSelect(m)}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <span className="company-match-ticker">{m.symbol}</span>
                  <span className="company-match-name">{m.name}</span>
                  <span className="company-match-exchange">{m.exchangeShortName}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
      <button className="company-match-dismiss" onClick={onDismiss} title="Dismiss">✕</button>
    </div>
  );
}
