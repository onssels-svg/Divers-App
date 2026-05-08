import { useRef } from 'react';
import ExportButtons from './ExportButtons';
import { formatLargeNumber } from '../utils/kpiCalculations';

export default function Header({ companyInfo, kpis, financial, onReset, onPDFUpload }) {
  const fileRef = useRef();
  const ci = companyInfo || {};
  const priceUp = ci.change >= 0;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file && onPDFUpload) onPDFUpload(file);
    e.target.value = '';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={onReset}>
            DIVERS
            <span>Deep Dive Analysis</span>
          </div>

          {ci.name && (
            <div className="header-company">
              <span className="header-company-name">{ci.name}</span>
              {ci.ticker && <span className="header-company-ticker">{ci.ticker}</span>}
              {ci.exchange && <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{ci.exchange}</span>}
              {ci.price != null && (
                <span className="header-price">
                  ${ci.price.toFixed(2)}
                  {ci.change != null && (
                    <span style={{ fontSize: 12, color: priceUp ? 'var(--green)' : 'var(--red)', marginLeft: 8 }}>
                      {priceUp ? '+' : ''}{ci.change?.toFixed(2)} ({ci.changesPercentage?.toFixed(2)}%)
                    </span>
                  )}
                </span>
              )}
              {ci.marketCap != null && (
                <span style={{ color: 'var(--text-2)', fontSize: 12 }}>
                  Mkt cap {formatLargeNumber(ci.marketCap)}
                </span>
              )}
            </div>
          )}

          <div className="header-actions">
            {ci.name && onPDFUpload && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => fileRef.current?.click()}
                  title="Enrich with an annual report PDF"
                >
                  📄 Add PDF
                </button>
              </>
            )}
            {ci.name && (
              <button className="btn btn-ghost btn-sm" onClick={onReset}>
                ← New Analysis
              </button>
            )}
            <ExportButtons kpis={kpis} financial={financial} companyInfo={companyInfo} />
          </div>
        </div>
      </div>
    </header>
  );
}
