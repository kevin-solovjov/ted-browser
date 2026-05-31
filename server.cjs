// server.cjs — tiny Express server that:
//   1. Proxies /api/ted/* → https://api.ted.europa.eu/* (bypasses CORS)
//   2. Serves the Vite production build from ./dist
//
// Usage:
//   npm run build
//   node server.cjs
//   → open http://localhost:3000

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy all /api/ted requests to the real TED API
app.use(
  '/api/ted',
  createProxyMiddleware({
    target: 'https://api.ted.europa.eu',
    changeOrigin: true,
    pathRewrite: { '^/api/ted': '' },
    on: {
      error: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({ error: 'Proxy error', detail: err.message });
      },
    },
  })
);

// Serve the built React app
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback — all non-API routes go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TED Tender Monitor running at http://localhost:${PORT}`);
});
