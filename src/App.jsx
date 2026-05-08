import { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import KPIDashboard from './components/KPIDashboard';
import AIRecommendation from './components/AIRecommendation';
import PressResearch from './components/PressResearch';
import { parsePDF, extractCompanyName } from './utils/pdfParser';
import { calculateKPIs } from './utils/kpiCalculations';
import { kpiSections } from './utils/kpiConfig';
import { getFinancialData, getHistoricalData, searchCompany, getStockPrice } from './services/fmpService';
import { analyzeKPIs, checkAnthropicAvailable } from './services/anthropicService';
import { demoFinancial, demoMarket, demoCompanyInfo, demoHistorical } from './utils/demoData';
import ChartsSection from './components/ChartsSection';
import InvestorSelector from './components/InvestorSelector';
import InvestorVerdictPanel from './components/InvestorVerdictPanel';
import CompanyMatchBanner from './components/CompanyMatchBanner';

export default function App() {
  const [view, setView]               = useState('input'); // 'input' | 'dashboard'
  const [financial, setFinancial]     = useState(null);
  const [market, setMarket]           = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [kpis, setKpis]               = useState(null);
  const [historical, setHistorical]   = useState(null);
  const [aiAnalysis, setAiAnalysis]   = useState(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [manualPrice, setManualPrice]   = useState(null);
  const [pdfMatches, setPDFMatches]     = useState([]);
  const [pdfBestMatch, setPDFBestMatch] = useState(null);
  const [enriching, setEnriching]       = useState(false);
  const [detectingPrice, setDetectingPrice] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAI, setLoadingAI]     = useState(false);
  const [dataError, setDataError]     = useState('');
  const [aiError, setAiError]         = useState('');

  // Check if Anthropic API is configured on the server
  useEffect(() => {
    checkAnthropicAvailable().then(setAiAvailable);
  }, []);

  const showDashboard = (fin, mkt, info, hist = null) => {
    const computed = calculateKPIs(fin, mkt);
    setFinancial(fin);
    setMarket(mkt);
    setCompanyInfo(info);
    setKpis(computed);
    setHistorical(hist);
    setAiAnalysis(null);
    setAiError('');
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePDFUpload = async (file) => {
    setLoadingData(true);
    setDataError('');
    setPDFMatches([]);
    try {
      // Parse PDF and extract company name in parallel
      const [fin, extractedName] = await Promise.all([
        parsePDF(file),
        extractCompanyName(file).catch(() => null),
      ]);

      // Clean filename as fallback name
      const nameFromFile = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[_\-]/g, ' ')
        .replace(/\b(annual|report|accounts?|financial|statements?|fy|20\d{2}|19\d{2})\b/gi, '')
        .replace(/\s+/g, ' ').trim();

      const companyName = extractedName || nameFromFile;
      const info = { name: companyName, ticker: null, price: null, marketCap: null };
      showDashboard(fin, {}, info);

      // Background: try to identify ticker from company name
      if (companyName.length > 2) {
        searchCompany(companyName)
          .then(results => {
            if (results.length > 0) {
              setPDFMatches(results.slice(0, 3));
              setPDFBestMatch(results[0]); // persist even if banner is dismissed
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      setDataError(err.message || 'Failed to parse PDF. Please try a different file.');
    } finally {
      setLoadingData(false);
    }
  };

  // Merge PDF financials with FMP data — PDF values take priority (official report),
  // FMP fills in anything the parser missed + provides all market data.
  const handleFMPEnrich = async (match) => {
    if (!financial) return;
    setEnriching(true);
    try {
      const [{ financial: fmpFin, market: mkt, companyInfo: fmpInfo }, hist] = await Promise.all([
        getFinancialData(match.symbol),
        getHistoricalData(match.symbol).catch(() => null),
      ]);

      // PDF values override FMP for any field the parser found
      const merged = { ...fmpFin };
      for (const [k, v] of Object.entries(financial)) {
        if (v != null) merged[k] = v;
      }

      showDashboard(merged, mkt, { ...fmpInfo, name: fmpInfo.name || companyInfo?.name }, hist);
      setPDFMatches([]);
      setManualPrice(null);
    } catch (err) {
      // Silently fail — PDF dashboard stays usable
      setPDFMatches([]);
    } finally {
      setEnriching(false);
    }
  };

  const handleSearch = async (ticker, name) => {
    setLoadingData(true);
    setDataError('');
    try {
      const [{ financial: fin, market: mkt, companyInfo: info }, hist] = await Promise.all([
        getFinancialData(ticker),
        getHistoricalData(ticker).catch(() => null),
      ]);
      if (name && !info.name) info.name = name;
      showDashboard(fin, mkt, info, hist);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error || err.message || 'Failed to fetch data.';
      if (msg.includes('not configured')) {
        setDataError('FMP API key not configured. Add VITE_FMP_API_KEY to your .env file.');
      } else if (status === 402) {
        setDataError(`"${ticker}" is not available on the free FMP plan. Only NYSE & NASDAQ-listed stocks are supported — try AAPL, MSFT, TSLA, etc.`);
      } else if (status === 404 || !ticker.match(/^[A-Z0-9.]{1,10}$/i)) {
        setDataError(`"${ticker}" wasn't recognised as a ticker. Pick a result from the dropdown instead of typing a company name.`);
      } else {
        setDataError(`Could not load data for "${ticker}". ${msg}`);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleAIAnalyze = async () => {
    if (!kpis || !aiAvailable) return;
    setLoadingAI(true);
    setAiError('');
    try {
      const result = await analyzeKPIs(
        companyInfo?.name || companyInfo?.ticker || 'this company',
        kpis,
        kpiSections,
      );
      setAiAnalysis(result);
    } catch (err) {
      setAiError(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleManualEntry = (fin, mkt, info) => {
    showDashboard(fin, mkt, info, null);
  };

  const handleAdvancedSubmit = (advData) => {
    if (!financial) return;
    const updatedMarket = { ...market, ...Object.fromEntries(Object.entries(advData).filter(([, v]) => v != null)) };
    setMarket(updatedMarket);
    setKpis(calculateKPIs(financial, updatedMarket));
    if (advData.price) setManualPrice(advData.price);
  };

  const handleAutoDetectPrice = async () => {
    if (!pdfBestMatch) return;
    setDetectingPrice(true);
    try {
      const price = await getStockPrice(pdfBestMatch.symbol);
      if (price) {
        handleManualPrice(String(price));
      } else {
        setDataError(`Could not retrieve price for ${pdfBestMatch.symbol}. Enter it manually below.`);
      }
    } catch {
      setDataError(`Could not retrieve price for ${pdfBestMatch.symbol}. Enter it manually below.`);
    } finally {
      setDetectingPrice(false);
    }
  };

  const handleManualPrice = (price) => {
    const p = parseFloat(price);
    if (!p || isNaN(p) || !financial) return;
    const shares = financial.sharesOutstanding || 0;
    const updatedMarket = { price: p, marketCap: shares ? p * shares : null };
    setMarket(updatedMarket);
    setKpis(calculateKPIs(financial, updatedMarket));
    setManualPrice(p);
  };

  const handleDemo = () => {
    showDashboard(demoFinancial, demoMarket, demoCompanyInfo, demoHistorical);
  };

  const handleReset = () => {
    setView('input');
    setFinancial(null);
    setMarket(null);
    setCompanyInfo(null);
    setKpis(null);
    setHistorical(null);
    setAiAnalysis(null);
    setSelectedInvestor(null);
    setManualPrice(null);
    setPDFMatches([]);
    setPDFBestMatch(null);
    setDataError('');
    setAiError('');
  };

  return (
    <div className="app">
      <Header
        companyInfo={companyInfo}
        kpis={kpis}
        financial={financial}
        onReset={handleReset}
        onPDFUpload={view === 'dashboard' ? handlePDFUpload : null}
      />

      {view === 'input' && (
        <InputSection
          onPDFUpload={handlePDFUpload}
          onSearch={handleSearch}
          onManualEntry={handleManualEntry}
          loading={loadingData}
          error={dataError}
        />
      )}

      {view === 'dashboard' && kpis && (
        <main className="dashboard">
          <div className="container" id="dashboard-root">
            {pdfMatches.length > 0 && (
              <CompanyMatchBanner
                matches={pdfMatches}
                onSelect={handleFMPEnrich}
                onDismiss={() => setPDFMatches([])}
                loading={enriching}
              />
            )}

            <ChartsSection historical={historical} />

            <InvestorSelector
              selected={selectedInvestor}
              onSelect={setSelectedInvestor}
            />

            <InvestorVerdictPanel
              investor={selectedInvestor}
              kpis={kpis}
            />

            <KPIDashboard
              kpis={kpis}
              selectedInvestor={selectedInvestor}
              isPDFMode={companyInfo?.ticker === null}
              manualPrice={manualPrice}
              onPriceEntered={handleManualPrice}
              onAutoDetectPrice={pdfBestMatch ? handleAutoDetectPrice : null}
              autoDetectTicker={pdfBestMatch?.symbol}
              detectingPrice={detectingPrice}
              onAdvancedSubmit={handleAdvancedSubmit}
            />

            <div className="divider" />

            <AIRecommendation
              analysis={aiAnalysis}
              loading={loadingAI}
              error={aiError}
              onAnalyze={handleAIAnalyze}
              aiAvailable={aiAvailable}
            />

            <div className="divider" />

            <PressResearch
              companyInfo={companyInfo}
              aiAvailable={aiAvailable}
            />
          </div>
        </main>
      )}
    </div>
  );
}
