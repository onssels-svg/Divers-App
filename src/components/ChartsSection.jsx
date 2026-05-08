import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

const B = (v) => v == null || isNaN(v) ? null : (v / 1e9).toFixed(1);
const pct = (v) => v == null || isNaN(v) ? null : Number(v).toFixed(1);

const CHART_COLORS = {
  revenue:        '#3b82f6',
  netIncome:      '#22c55e',
  ebitda:         '#a855f7',
  grossMargin:    '#38bdf8',
  operatingMargin:'#3b82f6',
  netMargin:      '#a855f7',
  ocf:            '#22c55e',
  fcf:            '#38bdf8',
};

const tooltipStyle = {
  contentStyle: {
    background: '#0c0e1d',
    border: '1px solid rgba(59,130,246,0.35)',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 12,
  },
  labelStyle: { color: '#94a3b8', marginBottom: 4 },
  itemStyle: { color: '#e2e8f0' },
  cursor: { fill: 'rgba(59,130,246,0.06)' },
};

const axisStyle = { fill: '#3d4d65', fontSize: 11 };
const gridStyle = { stroke: 'rgba(59,130,246,0.08)' };

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-title">{title}</div>
        {subtitle && <div className="chart-subtitle">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

export default function ChartsSection({ historical }) {
  if (!historical || historical.length === 0) return null;

  // Prep data for each chart
  const revenueData = historical.map(d => ({
    year: d.year,
    'Revenue': B(d.revenue),
    'Net Income': B(d.netIncome),
  }));

  const marginData = historical.map(d => ({
    year: d.year,
    'Gross Margin': pct(d.grossMargin),
    'Operating Margin': pct(d.operatingMargin),
    'Net Margin': pct(d.netMargin),
  }));

  const cashData = historical.map(d => ({
    year: d.year,
    'Operating CF': B(d.operatingCashFlow),
    'Free CF': B(d.freeCashFlow),
  }));

  return (
    <div className="charts-section">
      <div className="kpi-section-header">
        <span className="kpi-section-title">Financial Trends</span>
      </div>

      <div className="charts-grid">
        {/* Revenue & Net Income */}
        <ChartCard title="Revenue & Net Income" subtitle="5-year, $B">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={4} barCategoryGap="30%">
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} width={48} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v, name) => [`$${v}B`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
              <Bar dataKey="Revenue"    fill={CHART_COLORS.revenue}   radius={[3,3,0,0]} />
              <Bar dataKey="Net Income" fill={CHART_COLORS.netIncome} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Profit Margins */}
        <ChartCard title="Profit Margins" subtitle="5-year, %">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={marginData}>
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={44} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v, name) => [`${v}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
              <Line type="monotone" dataKey="Gross Margin"    stroke={CHART_COLORS.grossMargin}    strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.grossMargin }}    activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Operating Margin" stroke={CHART_COLORS.operatingMargin} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.operatingMargin }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Net Margin"      stroke={CHART_COLORS.netMargin}      strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.netMargin }}      activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cash Flow */}
        <ChartCard title="Cash Flow Generation" subtitle="5-year, $B">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cashData} barGap={4} barCategoryGap="30%">
              <CartesianGrid vertical={false} {...gridStyle} />
              <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} width={48} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v, name) => [`$${v}B`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
              <Bar dataKey="Operating CF" fill={CHART_COLORS.ocf} radius={[3,3,0,0]} />
              <Bar dataKey="Free CF"      fill={CHART_COLORS.fcf} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
