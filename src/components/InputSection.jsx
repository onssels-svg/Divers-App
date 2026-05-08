import { useState, useRef, useCallback } from 'react';
import { searchCompany } from '../services/fmpService';
import ManualEntryForm from './ManualEntryForm';

export default function InputSection({ onPDFUpload, onSearch, onManualEntry, loading, error }) {
  const [mode, setMode]               = useState('search');
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [dragging, setDragging]       = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const searchTimer  = useRef();

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(searchTimer.current);
    if (val.length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSuggestLoading(true);
      try { setSuggestions((await searchCompany(val)).slice(0, 6)); }
      catch { setSuggestions([]); }
      finally { setSuggestLoading(false); }
    }, 350);
  };

  const handleSelect = (item) => {
    setQuery(item.symbol);
    setSuggestions([]);
    onSearch(item.symbol, item.name);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSuggestions([]);
    onSearch(query.trim());
  };

  const handleFile = useCallback((file) => {
    if (!file || file.type !== 'application/pdf') return;
    setSelectedFile(file);
    onPDFUpload(file);
  }, [onPDFUpload]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section className="input-section">
      <div className="input-hero">
        <h1>Analyse like a<br /><em>professional investor</em></h1>
        <p>Search any listed company, upload an annual report, or enter data manually.</p>
      </div>

      <div className="card input-card">

        {/* ── Primary: Ticker / company search ── */}
        <form onSubmit={handleSearchSubmit}>
          <div className="search-wrap">
            <input
              className="search-input"
              type="text"
              placeholder="Search company or ticker — e.g. Apple, AAPL, MSFT…"
              value={query}
              onChange={handleQueryChange}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-gold btn-sm search-btn"
              disabled={loading || !query.trim()}
            >
              {loading && mode === 'search' ? <span className="spinner" /> : '→'}
            </button>

            {suggestions.length > 0 && (
              <div className="search-dropdown">
                {suggestions.map(item => (
                  <button
                    key={item.symbol}
                    type="button"
                    className="search-dropdown-item"
                    onClick={() => handleSelect(item)}
                  >
                    <span className="search-dropdown-ticker">{item.symbol}</span>
                    <span className="search-dropdown-name">{item.name}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 'auto' }}>
                      {item.exchangeShortName}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {suggestLoading && (
              <div style={{ position: 'absolute', right: 56, top: '50%', transform: 'translateY(-50%)' }}>
                <span className="spinner" />
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
            Powered by Financial Modeling Prep
          </p>
        </form>

        {/* ── Secondary options ── */}
        <div className="input-or-row">
          <span className="input-or-line" />
          <span className="input-or-text">or</span>
          <span className="input-or-line" />
        </div>

        <div className="input-option-cards">
          <button
            className={`input-option-card${mode === 'pdf' ? ' active' : ''}`}
            onClick={() => setMode(mode === 'pdf' ? 'search' : 'pdf')}
          >
            <span className="input-option-icon">📄</span>
            <span className="input-option-label">Annual Report</span>
            <span className="input-option-sub">Upload a PDF</span>
          </button>
          <button
            className={`input-option-card${mode === 'manual' ? ' active' : ''}`}
            onClick={() => setMode(mode === 'manual' ? 'search' : 'manual')}
          >
            <span className="input-option-icon">✏️</span>
            <span className="input-option-label">Manual Entry</span>
            <span className="input-option-sub">Enter data by hand</span>
          </button>
        </div>

        {/* ── PDF dropzone ── */}
        {mode === 'pdf' && (
          <div className="input-panel">
            <div
              className={`dropzone${dragging ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files?.[0])}
              />
              <div className="dropzone-icon">📄</div>
              <div className="dropzone-text">
                <strong>{selectedFile ? selectedFile.name : 'Drop your annual report PDF here'}</strong>
                {selectedFile
                  ? (loading ? 'Extracting financial data…' : 'File loaded — click to change')
                  : 'or click to browse · PDF format only'}
              </div>
              {loading && (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                  <span className="spinner" />
                </div>
              )}
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 10 }}>
              Extracted locally in your browser — your PDF is never uploaded to any server.
            </p>
          </div>
        )}

        {/* ── Manual entry form ── */}
        {mode === 'manual' && (
          <div className="input-panel">
            <ManualEntryForm onSubmit={onManualEntry} loading={loading} />
          </div>
        )}

        {error && (
          <div className="error-banner" style={{ marginTop: 16 }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
