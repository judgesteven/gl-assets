/**
 * Local dev server with API proxy to avoid CORS when testing on localhost.
 * Serves static files and proxies /api/v0/* to GameLayer.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const STATIC_ROOT = __dirname;
const GAMELAYER_ORIGIN = 'https://api.gamelayer.co';
const DEV_API_KEY = 'f0089f32c290c458f0db55514239af44';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function proxyToGameLayer(req, res, pathname, search) {
  const upstreamUrl = `${GAMELAYER_ORIGIN}/api/v0${pathname}${search || ''}`;
  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Accept': req.headers['accept'] || 'application/json',
    'api-key': req.headers['api-key'] || DEV_API_KEY,
  };

  const protocol = url.parse(upstreamUrl).protocol === 'https:' ? https : http;
  const proxyReq = protocol.request(
    upstreamUrl,
    { method: req.method, headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    console.error('[proxy]', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy failed', message: err.message }));
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      proxyReq.write(Buffer.concat(chunks));
      proxyReq.end();
    });
  } else {
    proxyReq.end();
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const search = parsed.search;

  if (pathname.startsWith('/api/v0')) {
    const subPath = pathname.slice('/api/v0'.length) || '/';
    proxyToGameLayer(req, res, subPath, search);
    return;
  }

  let filePath = path.join(STATIC_ROOT, pathname === '/' ? 'index.html' : pathname);
  if (!path.extname(filePath)) {
    const withHtml = filePath + '.html';
    if (fs.existsSync(withHtml)) filePath = withHtml;
    else filePath = path.join(filePath, 'index.html');
  }
  serveStatic(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`Dev server: http://localhost:${PORT}`);
  console.log('API requests to /api/v0/* are proxied to GameLayer (no CORS).');
});
