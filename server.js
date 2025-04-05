const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ 
  dev,
  // Explicitly set the directory to the app directory
  dir: __dirname,
  // Ensure we're using the App Router
  conf: {
    experimental: {
      appDir: true,
    },
  },
});
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
}).catch((err) => {
  console.error('Error during app preparation:', err);
  process.exit(1);
}); 