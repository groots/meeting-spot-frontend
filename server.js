const express = require('express');
const next = require('next');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ 
  dev,
  dir: __dirname,
});
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

app.prepare().then(() => {
  const server = express();
  
  // Serve static files from the Next.js .next directory
  server.use('/_next', express.static(path.join(__dirname, '.next')));
  
  // Serve public files
  server.use(express.static(path.join(__dirname, 'public')));
  
  // Proxy API requests - make sure this is before the catch-all handler
  server.use('/api', createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    pathRewrite: path => path, // Don't rewrite paths, forward them as-is
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('Accept', 'application/json');
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).json({ error: 'Proxy Error', message: err.message });
    },
    logLevel: 'debug'
  }));
  
  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  
  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
    console.log(`> API proxying to ${API_URL}`);
  });
}).catch((err) => {
  console.error('Error during app preparation:', err);
  process.exit(1);
}); 