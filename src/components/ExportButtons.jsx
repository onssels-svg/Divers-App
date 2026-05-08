import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { kpiSections } from '../utils/kpiConfig';
import { formatValue } from '../utils/kpiCalculations';

export default function ExportButtons({ kpis, financial, companyInfo }) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingXLSX, setExportingXLSX] = useState(false);
  const [exportError, setExportError] = useState('');

  const handlePDF = async () => {
    setExportingPDF(true);
    setExportError('');
    try {
      const el = document.getElementById('dashboard-root');
      if (!el) return;
      const canvas = await html2canvas(el, {
        backgroundColor: '#0f0f0f',
        scale: 1.5,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;

      let y = 0;
      const pageH = pdf.internal.pageSize.getHeight();
      while (y < pdfH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -y, pdfW, pdfH);
        y += pageH;
      }
      pdf.save(`Divers_${companyInfo?.ticker || 'report'}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch {
      setExportError('PDF export failed. Try scrolling to the top first.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleXLSX = () => {
    setExportingXLSX(true);
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1 — KPIs
      const kpiRows = [['Section', 'Metric', 'Value']];
      for (const section of kpiSections) {
        for (const m of section.metrics) {
          const v = kpis?.[m.key];
          kpiRows.push([section.label, m.name, v == null || isNaN(v) ? 'N/A' : formatValue(v, m.format)]);
        }
      }
      const ws1 = XLSX.utils.aoa_to_sheet(kpiRows);
      ws1['!cols'] = [{ wch: 18 }, { wch: 26 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'KPIs');

      // Sheet 2 — Raw Financial Data
      const raw = [
        ['Item', 'Value (USD)'],
        ['Revenue', financial?.revenue ?? 'N/A'],
        ['Gross Profit', financial?.grossProfit ?? 'N/A'],
        ['Operating Income', financial?.operatingIncome ?? 'N/A'],
        ['EBITDA', financial?.ebitda ?? 'N/A'],
        ['Net Income', financial?.netIncome ?? 'N/A'],
        ['Interest Expense', financial?.interestExpense ?? 'N/A'],
        ['Total Assets', financial?.totalAssets ?? 'N/A'],
        ['Total Liabilities', financial?.totalLiabilities ?? 'N/A'],
        ['Total Equity', financial?.totalEquity ?? 'N/A'],
        ['Cash & Equivalents', financial?.cash ?? 'N/A'],
        ['Current Assets', financial?.currentAssets ?? 'N/A'],
        ['Current Liabilities', financial?.currentLiabilities ?? 'N/A'],
        ['Long-term Debt', financial?.longTermDebt ?? 'N/A'],
        ['Operating Cash Flow', financial?.operatingCashFlow ?? 'N/A'],
        ['Free Cash Flow', financial?.freeCashFlow ?? 'N/A'],
        ['Inventory', financial?.inventory ?? 'N/A'],
        ['Accounts Receivable', financial?.accountsReceivable ?? 'N/A'],
        ['Shares Outstanding', financial?.sharesOutstanding ?? 'N/A'],
        ['Dividends Paid', financial?.dividendsPaid ?? 'N/A'],
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(raw);
      ws2['!cols'] = [{ wch: 24 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Raw Data');

      XLSX.writeFile(wb, `Divers_${companyInfo?.ticker || 'report'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExportingXLSX(false);
    }
  };

  if (!kpis) return null;

  return (
    <div>
      <div className="export-row">
        <button className="btn btn-outline btn-sm" onClick={handlePDF} disabled={exportingPDF}>
          {exportingPDF ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Exporting…</> : '↓ PDF'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleXLSX} disabled={exportingXLSX}>
          {exportingXLSX ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Exporting…</> : '↓ Excel'}
        </button>
      </div>
      {exportError && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4, textAlign: 'right' }}>{exportError}</p>}
    </div>
  );
}
