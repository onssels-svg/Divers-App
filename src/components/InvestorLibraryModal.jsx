import { useState } from 'react';
import { investorLenses } from '../utils/investorLenses';
import { kpiSections } from '../utils/kpiConfig';

// KPI descriptions lookup built from kpiConfig
const KPI_META = {};
kpiSections.forEach(s => s.metrics.forEach(m => { KPI_META[m.key] = m; }));

const BIOS = {
  buffett: {
    born:        '1930, Omaha, Nebraska',
    known:       'Chairman & CEO, Berkshire Hathaway',
    performance: '~20% average annual return (1965–2024) vs S&P 500\'s ~10%',
    worth:       '~$140 billion (Forbes 2024)',
    why:         "Built one of the world's largest companies from a failing textile mill using one simple discipline: only buy businesses with durable competitive advantages (“moats”), run by honest management, at prices that leave a margin of safety. His annual shareholder letters are considered the finest free business education available anywhere.",
    books:       ['The Warren Buffett Way — Robert Hagstrom', 'The Snowball — Alice Schroeder', 'Berkshire Hathaway Annual Letters (free at berkshirehathaway.com)'],
    quote:       'Be fearful when others are greedy, and greedy when others are fearful.',
  },
  dalio: {
    born:        '1949, Queens, New York',
    known:       'Founder & Co-CIO, Bridgewater Associates',
    performance: 'Pure Alpha returned ~12%/yr net since 1991; built the world\'s largest hedge fund (~$150B AUM)',
    worth:       '~$20 billion (Forbes 2024)',
    why:         'Systematised macro investing by studying 500 years of economic history to map how debt cycles drive boom and bust. His "All Weather" portfolio — balanced across rising/falling growth and inflation — is widely adopted by institutions. His radical transparency culture also transformed modern management.',
    books:       ['Principles — Ray Dalio (2017)', 'Big Debt Crises — Ray Dalio (free at principles.com)', 'How the Economic Machine Works (30-min YouTube video)'],
    quote:       'Pain + Reflection = Progress.',
  },
  lynch: {
    born:        '1944, Newton, Massachusetts',
    known:       'Portfolio Manager, Fidelity Magellan Fund (1977–1990)',
    performance: '29.2% average annual return over 13 years — the best-performing major mutual fund in history during his tenure',
    worth:       '~$352 million',
    why:         "Proved that ordinary people have an investing edge over professionals because they encounter great products and businesses in daily life before analysts discover them. His GARP (Growth at a Reasonable Price) philosophy and 'invest in what you know' maxim democratised investing for millions.",
    books:       ['One Up on Wall Street — Peter Lynch (1989)', 'Beating the Street — Peter Lynch (1993)', 'Learn to Earn — Peter Lynch (1995)'],
    quote:       'The person that turns over the most rocks wins the game.',
  },
  graham: {
    born:        '1894, London (raised in New York) · Died 1976',
    known:       'Professor, Columbia Business School · Father of Value Investing',
    performance: 'Graham-Newman Corp: ~20%/yr (1936–1956) vs ~12% market average',
    worth:       'N/A (passed away 1976)',
    why:         "Survived the 1929 crash — losing nearly everything — and rebuilt by developing a rigorous, quantitative framework for investing. Invented the concepts of Mr. Market and margin of safety. Warren Buffett, who studied under him at Columbia, called The Intelligent Investor 'by far the best book on investing ever written.' Every major investor of the 20th century was influenced by him.",
    books:       ['The Intelligent Investor — Benjamin Graham (1949)', 'Security Analysis — Graham & Dodd (1934)', 'Benjamin Graham: The Memoirs of the Dean of Wall Street'],
    quote:       'The intelligent investor is a realist who sells to optimists and buys from pessimists.',
  },
  munger: {
    born:        '1924, Omaha, Nebraska · Died November 2023 (age 99)',
    known:       'Vice Chairman, Berkshire Hathaway',
    performance: 'Wheeler, Munger & Co: ~19.8%/yr (1962–1975); then partnered with Buffett to build Berkshire',
    worth:       '~$2.6 billion (Forbes 2023)',
    why:         "Buffett's intellectual partner for 60 years and the person who evolved his thinking from Graham's 'cigar butt' cheapness toward paying fair prices for wonderful businesses. Famous for mental models — applying wisdom from psychology, physics, biology, and history to investing. Brutally honest, deeply read, and endlessly quotable.",
    books:       ["Poor Charlie's Almanack — Peter Kaufman (2005)", 'Seeking Wisdom: From Darwin to Munger — Peter Bevelin', 'The Psychology of Human Misjudgement (free speech transcript)'],
    quote:       'Show me the incentive and I\'ll show you the outcome.',
  },
  fisher: {
    born:        '1907, San Francisco · Died 2004 (age 96)',
    known:       'Founder, Fisher & Company (est. 1931)',
    performance: 'Held Motorola from 1955 to his death in 2004 (49 years, 100×+ return); clients who stayed loyal saw transformative wealth creation',
    worth:       'N/A (private)',
    why:         "Pioneer of growth investing and the long hold. His 'scuttlebutt' research method — interviewing a company's competitors, suppliers, customers, and employees — was revolutionary decades before due diligence became standard. Buffett credits 15% of his thinking to Fisher (vs 85% Graham). His focus on R&D-driven companies and management quality remains prescient.",
    books:       ['Common Stocks and Uncommon Profits — Philip Fisher (1958)', 'Paths to Wealth Through Common Stocks — Philip Fisher (1960)', 'Conservative Investors Sleep Well — Philip Fisher (1975)'],
    quote:       'The stock market is filled with individuals who know the price of everything, but the value of nothing.',
  },
};

const ACCENT_PRESETS = [
  '#f59e0b', '#38bdf8', '#22c55e', '#a855f7',
  '#ec4899', '#f97316', '#ef4444', '#6366f1',
];
const toInitials = name =>
  name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

// ── Criterion info tooltip ────────────────────────────
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

// ── Library view ──────────────────────────────────────
function LibraryView({ selected, onToggle, customInvestors, onDeleteCustom, onShowBio, onShowCustom }) {
  const all   = [...investorLenses, ...customInvestors];
  const count = selected.length;

  return (
    <div className="lib-view">
      <div className="lib-sub-header">
        {count === 0 && 'Choose up to 3 investors to overlay their criteria on your dashboard.'}
        {count > 0 && count < 3 && <><span className="lib-count-badge">{count}/3</span> selected — click an investor to add or remove.</>}
        {count >= 3 && <><span className="lib-count-badge">3/3</span> all slots filled — remove one below before adding another.</>}
      </div>

      <div className="lib-list">
        {all.map(inv => {
          const isActive   = selected.some(s => s.id === inv.id);
          const isDisabled = !isActive && count >= 3;
          const hasBio     = !inv.isCustom && !!BIOS[inv.id];
          return (
            <div
              key={inv.id}
              className={`lib-card${isActive ? ' active' : ''}${isDisabled ? ' faded' : ''}`}
              style={{ '--investor-accent': inv.accent }}
            >
              <div className="lib-card-left">
                <div className="lib-avatar" style={{ background: inv.accent }}>{inv.initials}</div>
                <div className="lib-card-text">
                  <div className="lib-name">{inv.name}</div>
                  <div className="lib-title">{inv.title}</div>
                  <div className="lib-tagline">{inv.tagline}</div>
                </div>
              </div>
              <div className="lib-card-actions">
                {hasBio && (
                  <button className="btn-lib-bio" onClick={() => onShowBio(inv.id)}>
                    Bio ↗
                  </button>
                )}
                {inv.isCustom && (
                  <button className="btn-lib-bio" onClick={() => onDeleteCustom(inv.id)}>
                    Delete
                  </button>
                )}
                <button
                  className={`btn-lib-add${isActive ? ' added' : ''}`}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onToggle(inv)}
                  style={isActive ? { borderColor: inv.accent, color: inv.accent } : {}}
                >
                  {isActive ? '✓ Added' : '+ Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lib-footer">
        <button className="lib-custom-btn" onClick={onShowCustom}>
          + Build Custom Investor
        </button>
      </div>
    </div>
  );
}

// ── Bio view ──────────────────────────────────────────
function BioView({ investorId, selected, onToggle, onBack }) {
  const investor = investorLenses.find(i => i.id === investorId);
  const bio      = BIOS[investorId];
  if (!investor || !bio) return null;
  const isActive = selected.some(s => s.id === investor.id);

  return (
    <div className="bio-view">
      <button className="bio-back" onClick={onBack}>← Back to Library</button>

      <div className="bio-header">
        <div className="bio-avatar" style={{ background: investor.accent }}>{investor.initials}</div>
        <div>
          <h2 className="bio-name">{investor.name}</h2>
          <div className="bio-known">{investor.known || investor.title}</div>
        </div>
      </div>

      <div className="bio-meta-grid">
        <div><span className="bio-meta-label">Born / Died</span>{bio.born}</div>
        <div><span className="bio-meta-label">Performance</span>{bio.performance}</div>
        {bio.worth && <div><span className="bio-meta-label">Net worth</span>{bio.worth}</div>}
      </div>

      <blockquote className="bio-quote">"{bio.quote}"</blockquote>

      <p className="bio-why">{bio.why}</p>

      <div className="bio-section">
        <div className="bio-section-label">Key reading</div>
        <ul className="bio-books">
          {bio.books.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>

      <div className="bio-section">
        <div className="bio-section-label">
          Their {investor.criteria.length} criteria
        </div>
        <div className="bio-criteria-list">
          {investor.criteria.map(c => (
            <div key={c.key} className="bio-criterion">
              <div className="bio-crit-top">
                <span className="bio-crit-label">{c.label}</span>
                <span className="bio-crit-threshold" style={{ color: investor.accent }}>{c.threshold}</span>
                <CritInfoBtn kpiKey={c.key} />
              </div>
              <div className="bio-crit-why">{c.why}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bio-footer">
        <button
          className={`btn ${isActive ? 'btn-ghost' : 'btn-gold'}`}
          onClick={() => onToggle(investor)}
        >
          {isActive ? '✓ Added — click to remove' : '+ Add to dashboard'}
        </button>
      </div>
    </div>
  );
}

// ── Custom Builder view ───────────────────────────────
function CustomBuilderView({ onSave, onBack }) {
  const [name, setName]         = useState('');
  const [initials, setInitials] = useState('');
  const [accent, setAccent]     = useState(ACCENT_PRESETS[3]);
  const [tagline, setTagline]   = useState('');
  const [picked, setPicked]     = useState([]);
  const [expanded, setExpanded] = useState({});
  const [error, setError]       = useState('');

  const derivedInitials = initials || toInitials(name);

  const toggleExpand = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const addCrit = (inv, c) => {
    if (picked.some(p => p.key === c.key)) return;
    setPicked(p => [...p, { ...c, _from: inv.name }]);
  };
  const removeCrit = key => setPicked(p => p.filter(c => c.key !== key));

  const handleSave = () => {
    if (!name.trim()) { setError('Please enter a name.'); return; }
    if (picked.length === 0) { setError('Pick at least one criterion from the library.'); return; }
    onSave({
      id:        `custom_${Date.now()}`,
      name:      name.trim(),
      initials:  derivedInitials,
      title:     tagline.trim() || 'Custom Investor',
      tagline:   tagline.trim() || 'Custom Investor',
      quote:     '',
      source:    'Custom criteria',
      accent,
      focusKPIs: [...new Set(picked.map(c => c.key))],
      criteria:  picked.map(({ _from: _f, ...rest }) => rest),
      isCustom:  true,
    });
  };

  return (
    <div className="custom-builder">
      <button className="bio-back" onClick={onBack}>← Back to Library</button>
      <h3 className="custom-builder-title">Build Custom Investor</h3>

      <div className="custom-identity">
        <input
          className="modal-input"
          placeholder="Investor name *"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
        />
        <input
          className="modal-input custom-initials-input"
          placeholder={toInitials(name) || 'AB'}
          value={initials}
          onChange={e => setInitials(e.target.value.slice(0, 2).toUpperCase())}
          maxLength={2}
        />
        <input
          className="modal-input custom-tagline-input"
          placeholder="Philosophy / tagline (optional)"
          value={tagline}
          onChange={e => setTagline(e.target.value)}
        />
      </div>

      <div className="modal-color-row" style={{ padding: '0 0 16px' }}>
        {ACCENT_PRESETS.map(c => (
          <button
            key={c}
            className={`modal-color-swatch${accent === c ? ' selected' : ''}`}
            style={{ background: c }}
            onClick={() => setAccent(c)}
            aria-label={c}
          />
        ))}
        <div className="modal-avatar-preview" style={{ background: accent }}>
          {derivedInitials}
        </div>
      </div>

      {error && <div className="modal-error">{error}</div>}

      <div className="custom-builder-hint">
        Click any criterion below to add it to your investor. You can mix and match from different investors.
      </div>

      <div className="custom-columns">
        {/* Left: library criteria */}
        <div className="custom-lib-panel">
          <div className="custom-panel-label">Library criteria</div>
          {investorLenses.map(inv => (
            <div key={inv.id} className="custom-inv-section">
              <button className="custom-inv-toggle" onClick={() => toggleExpand(inv.id)}>
                <div className="custom-inv-avatar" style={{ background: inv.accent }}>{inv.initials}</div>
                <span className="custom-inv-name">{inv.name}</span>
                <span className="custom-inv-chevron">{expanded[inv.id] ? '▲' : '▼'}</span>
              </button>
              {expanded[inv.id] && (
                <div className="custom-inv-criteria-list">
                  {inv.criteria.map(c => {
                    const already = picked.some(p => p.key === c.key);
                    return (
                      <button
                        key={c.key}
                        className={`custom-crit-row${already ? ' already' : ''}`}
                        onClick={() => !already && addCrit(inv, c)}
                        disabled={already}
                        title={already ? 'Already added' : `Add ${c.label}`}
                      >
                        <span className="custom-crit-label">{c.label}</span>
                        <span className="custom-crit-threshold">{c.threshold}</span>
                        <CritInfoBtn kpiKey={c.key} />
                        <span className="custom-crit-add-icon">{already ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: picked criteria */}
        <div className="custom-picked-panel">
          <div className="custom-panel-label">
            Your criteria
            {picked.length > 0 && <span className="custom-picked-count"> ({picked.length})</span>}
          </div>
          {picked.length === 0 ? (
            <div className="custom-picked-empty">
              Expand an investor on the left and click their criteria to build your lens
            </div>
          ) : (
            picked.map(c => (
              <div key={c.key} className="custom-picked-row">
                <div className="custom-picked-info">
                  <div className="custom-crit-label">{c.label}</div>
                  <div className="custom-crit-threshold">{c.threshold}</div>
                  {c._from && <div className="custom-crit-from">from {c._from}</div>}
                </div>
                <button className="modal-row-del" onClick={() => removeCrit(c.key)}>×</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="custom-builder-footer">
        <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
        <button className="btn btn-gold" onClick={handleSave}>Save investor</button>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────
export default function InvestorLibraryModal({ selected, onToggle, customInvestors, onAddCustom, onDeleteCustom, onClose }) {
  const [view, setView]         = useState('library');
  const [bioId, setBioId]       = useState(null);

  const showBio    = id => { setBioId(id); setView('bio'); };
  const backToLib  = ()  => setView('library');

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lib-modal-box">
        <div className="modal-header">
          <h3 className="modal-title">
            {view === 'library' && 'Investor Library'}
            {view === 'bio'     && 'Investor Profile'}
            {view === 'custom'  && 'Build Custom Investor'}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="lib-modal-body">
          {view === 'library' && (
            <LibraryView
              selected={selected}
              onToggle={onToggle}
              customInvestors={customInvestors}
              onDeleteCustom={onDeleteCustom}
              onShowBio={showBio}
              onShowCustom={() => setView('custom')}
            />
          )}
          {view === 'bio' && bioId && (
            <BioView
              investorId={bioId}
              selected={selected}
              onToggle={onToggle}
              onBack={backToLib}
            />
          )}
          {view === 'custom' && (
            <CustomBuilderView
              onSave={inv => { onAddCustom(inv); setView('library'); }}
              onBack={backToLib}
            />
          )}
        </div>
      </div>
    </div>
  );
}
