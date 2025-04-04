const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 8080;

app.prepare().then(() => {
  const server = express();
  
  // Serve static files from the public directory
  server.use(express.static(path.join(__dirname, 'public')));
  
  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  
  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
}); 