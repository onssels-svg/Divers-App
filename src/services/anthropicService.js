import axios from 'axios';

const MODEL = 'claude-sonnet-4-6';

async function callClaude(messages, systemPrompt, maxTokens = 1024) {
  const res = await axios.post('/api/anthropic', {
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  if (res.data?.error) throw new Error(res.data.error);
  return res.data?.content?.[0]?.text || '';
}

export async function analyzeKPIs(companyName, kpis, kpiSections) {
  const lines = [];
  for (const section of kpiSections) {
    lines.push(`\n${section.label.toUpperCase()}`);
    for (const metric of section.metrics) {
      const v = kpis[metric.key];
      const val = v == null || isNaN(v) ? 'N/A' : metric.format === 'percent'
        ? `${(v * 100).toFixed(1)}%`
        : metric.format === 'multiple' ? `${v.toFixed(1)}x`
        : metric.format === 'days' ? `${Math.round(v)}d`
        : v.toFixed(2);
      lines.push(`  ${metric.name}: ${val}`);
    }
  }

  const system = `You are a senior equity research analyst. Analyse the financial KPIs provided and respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;
  const prompt = `Company: ${companyName}

KPI Data:${lines.join('\n')}

Respond with this exact JSON structure:
{
  "recommendation": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
  "confidence": <integer 0-100>,
  "bullCase": ["point 1", "point 2", "point 3"],
  "bearCase": ["point 1", "point 2", "point 3"],
  "summary": "<2-3 sentence plain English summary a non-expert can understand>"
}`;

  const text = await callClaude([{ role: 'user', content: prompt }], system, 800);

  try {
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    return JSON.parse(json);
  } catch {
    throw new Error('Could not parse AI response. Please try again.');
  }
}

export async function summarizePress(companyName, articles, analystData) {
  const headlines = articles.map((a, i) => `${i + 1}. ${a.title} (${a.source?.name})`).join('\n');
  const analystSummary = analystData?.recommendations
    ? `Analyst consensus: ${analystData.recommendations.analystRatingsbuy || 0} Buy, ${analystData.recommendations.analystRatingsHold || 0} Hold, ${analystData.recommendations.analystRatingsSell || 0} Sell`
    : '';

  const system = `You are a financial journalist summarising press coverage for an investor. Be concise, factual, and neutral. Respond in plain English. 2-3 sentences maximum.`;
  const prompt = `Company: ${companyName}

Recent headlines:
${headlines}

${analystSummary}

Write a brief 2-3 sentence summary of what the press and analysts are currently saying about this company.`;

  return callClaude([{ role: 'user', content: prompt }], system, 300);
}

export async function checkAnthropicAvailable() {
  try {
    const res = await axios.get('/api/health');
    return res.data?.anthropicConfigured === true;
  } catch {
    return false;
  }
}
