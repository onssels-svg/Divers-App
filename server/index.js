require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// Health check — lets the client know if Anthropic key is configured
app.get('/api/health', (req, res) => {
  res.json({ anthropicConfigured: !!process.env.ANTHROPIC_API_KEY });
});

// Anthropic API proxy
app.post('/api/anthropic', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
    }
    res.json(data);
  } catch (err) {
    console.error('Anthropic proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// NewsAPI proxy
app.get('/api/news', async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'NEWS_API_KEY not configured' });
  }

  const { q, pageSize = 5 } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter: q' });

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=${pageSize}&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      return res.status(response.status || 400).json({ error: data.message || 'NewsAPI error' });
    }
    res.json(data);
  } catch (err) {
    console.error('NewsAPI proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🤿  Divers proxy server → http://localhost:${PORT}`);
  console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓ key found' : '✗ key missing (AI features disabled)'}`);
  console.log(`   NewsAPI:   ${process.env.NEWS_API_KEY ? '✓ key found' : '✗ key missing'}\n`);
});
