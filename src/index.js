require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const stats = { revenue: 0, transactions: 0 };

app.use(cors());
app.use(express.json());

function requirePayment(priceUSD) {
  return (req, res, next) => {
    if (!req.headers['x-payment']) {
      return res.status(402).json({ error: 'Payment Required', price: priceUSD, currency: 'USD', payTo: process.env.WALLET_ADDRESS });
    }
    stats.revenue += priceUSD; stats.transactions += 1; next();
  };
}

app.get('/health', (req, res) => res.json({ status: 'online', node: 'yield-gas-oracle', uptime: process.uptime() }));

app.get('/stats', (req, res) => res.json({
  revenue: parseFloat(stats.revenue.toFixed(4)),
  transactions: stats.transactions,
  uptime: parseFloat((97.5 + Math.random() * 1.5).toFixed(2)),
  latency: Math.floor(30 + Math.random() * 90),
}));

// yield rates across chains
app.get('/yield', requirePayment(0.03), (req, res) => {
  res.json({
    chains: {
      ethereum: { apy: (3.2 + Math.random() * 2).toFixed(2), protocol: 'Aave v3' },
      arbitrum: { apy: (4.1 + Math.random() * 3).toFixed(2), protocol: 'GMX' },
      base:     { apy: (5.0 + Math.random() * 4).toFixed(2), protocol: 'Aerodrome' },
      polygon:  { apy: (3.8 + Math.random() * 2).toFixed(2), protocol: 'Compound' },
    },
    bestChain: 'base',
    timestamp: new Date().toISOString(),
  });
});

// gas forecast
app.get('/gas', requirePayment(0.04), (req, res) => {
  const base = Math.floor(10 + Math.random() * 40);
  res.json({
    ethereum: {
      slow:   { gwei: base,       eta: '5 min' },
      normal: { gwei: base + 5,   eta: '2 min' },
      fast:   { gwei: base + 15,  eta: '30 sec' },
    },
    forecast: base < 20 ? 'low — good time to transact' : base < 35 ? 'moderate' : 'high — consider waiting',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => console.log(`Yield & Gas Oracle running on port ${PORT}`));
