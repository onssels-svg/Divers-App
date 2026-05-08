import { useState } from 'react';
import { getNews } from '../services/newsService';
import { getAnalystRatings } from '../services/fmpService';
import { summarizePress, checkAnthropicAvailable } from '../services/anthropicService';

export default function PressResearch({ companyInfo, aiAvailable }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleResearch = async () => {
    if (!companyInfo) return;
    setState('loading');
    setError('');

    try {
      const query = `"${companyInfo.name || companyInfo.ticker}"`;
      const ticker = companyInfo.ticker;

      const [articles, analystData] = await Promise.all([
        getNews(query, 5).catch(() => []),
        ticker ? getAnalystRatings(ticker).catch(() => ({ recommendations: null, priceTarget: null })) : Promise.resolve({ recommendations: null, priceTarget: null }),
      ]);

      let pressSummary = null;
      if (aiAvailable && (articles.length > 0 || analystData.recommendations)) {
        pressSummary = await summarizePress(companyInfo.name || ticker, articles, analystData).catch(() => null);
      }

      setData({ articles, analystData, pressSummary });
      setState('done');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch press data.');
      setState('error');
    }
  };

  const rec = data?.analystData?.recommendations;
  const pt  = data?.analystData?.priceTarget;
  const currentPrice = companyInfo?.price;

  const totalAnalysts = rec
    ? (rec.analystRatingsbuy || 0) + (rec.analystRatingsHold || 0) + (rec.analystRatingsSell || 0)
    + (rec.analystRatingsStrongSell || 0) + (rec.analystRatingsStrongBuy || 0)
    : 0;
  const buyCount  = rec ? (rec.analystRatingsbuy || 0) + (rec.analystRatingsStrongBuy || 0) : 0;
  const holdCount = rec ? (rec.analystRatingsHold || 0) : 0;
  const sellCount = rec ? (rec.analystRatingsSell || 0) + (rec.analystRatingsStrongSell || 0) : 0;
  const buyPct    = totalAnalysts ? Math.round(buyCount  / totalAnalysts * 100) : 0;
  const holdPct   = totalAnalysts ? Math.round(holdCount / totalAnalysts * 100) : 0;
  const sellPct   = totalAnalysts ? Math.round(sellCount / totalAnalysts * 100) : 0;

  const avgTarget = pt?.targetConsensus;
  const upside = (avgTarget && currentPrice) ? ((avgTarget - currentPrice) / currentPrice) * 100 : null;

  return (
    <div className="press-section">
      <div className="kpi-section-header" style={{ justifyContent: 'space-between' }}>
        <span className="kpi-section-title">Press &amp; Analyst Research</span>
        {state === 'done' && (
          <button className="btn btn-ghost btn-sm" onClick={handleResearch}>↺ Refresh</button>
        )}
      </div>

      <div className="card press-card">
        {state === 'idle' && (
          <div className="press-trigger">
            <button className="btn btn-gold" onClick={handleResearch}>
              🔎 Research in the Press
            </button>
            <p>Fetch latest news headlines and analyst consensus ratings</p>
          </div>
        )}

        {state === 'loading' && (
          <div className="loading-row">
            <span className="spinner" />
            Fetching news and analyst data…
          </div>
        )}

        {state === 'error' && (
          <div style={{ padding: '24px' }}>
            <div className="error-banner">
              <span>⚠</span>
              <span>{error}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleResearch} style={{ marginTop: 12 }}>
              Try again
            </button>
          </div>
        )}

        {state === 'done' && data && (
          <>
            {/* Analyst consensus */}
            {totalAnalysts > 0 && (
              <div className="analyst-bar-wrap">
                <div className="analyst-bar-label">
                  <span>Analyst Consensus ({totalAnalysts} analysts)</span>
                </div>
                <div className="analyst-bar">
                  <div className="analyst-bar-buy"  style={{ width: `${buyPct}%` }} />
                  <div className="analyst-bar-hold" style={{ width: `${holdPct}%` }} />
                  <div className="analyst-bar-sell" style={{ width: `${sellPct}%` }} />
                </div>
                <div className="analyst-bar-legend">
                  <span><span className="dot-green" /> Buy {buyPct}%</span>
                  <span><span className="dot-amber" /> Hold {holdPct}%</span>
                  <span><span className="dot-red" />   Sell {sellPct}%</span>
                </div>
              </div>
            )}

            {/* Price targets */}
            {(avgTarget || currentPrice) && (
              <div className="price-target-row">
                {currentPrice && (
                  <div className="price-target-item">
                    <div className="price-target-label">Current Price</div>
                    <div className="price-target-value">${currentPrice.toFixed(2)}</div>
                  </div>
                )}
                {avgTarget && (
                  <div className="price-target-item">
                    <div className="price-target-label">Avg. Price Target</div>
                    <div className="price-target-value">${avgTarget.toFixed(2)}</div>
                    {upside != null && (
                      <div className={`price-target-upside ${upside >= 0 ? 'up' : 'down'}`}>
                        {upside >= 0 ? '▲' : '▼'} {Math.abs(upside).toFixed(1)}% {upside >= 0 ? 'upside' : 'downside'}
                      </div>
                    )}
                  </div>
                )}
                {pt?.targetHigh && (
                  <div className="price-target-item">
                    <div className="price-target-label">High / Low Target</div>
                    <div className="price-target-value" style={{ fontSize: 16 }}>
                      ${pt.targetHigh.toFixed(2)} / ${pt.targetLow?.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* News */}
            {data.articles.length > 0 && (
              <ul className="news-list">
                {data.articles.map((a, i) => (
                  <li key={i} className="news-item">
                    <a
                      className="news-headline"
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {a.title}
                    </a>
                    <div className="news-meta">
                      <span>{a.source?.name}</span>
                      <span>·</span>
                      <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* AI summary */}
            {data.pressSummary && (
              <div>
                <div className="press-summary-label">AI Press Summary</div>
                <div className="press-summary">{data.pressSummary}</div>
              </div>
            )}

            {!aiAvailable && data.articles.length > 0 && (
              <div className="info-banner" style={{ marginTop: 16 }}>
                <span>🔑</span>
                <div>Add <strong>ANTHROPIC_API_KEY</strong> to .env to generate an AI summary of this press coverage.</div>
              </div>
            )}

            {data.articles.length === 0 && totalAnalysts === 0 && (
              <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '20px' }}>
                No press or analyst data found for this company.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
