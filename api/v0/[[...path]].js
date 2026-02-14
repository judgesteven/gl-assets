/**
 * GameLayer API proxy - avoids CORS by making requests same-origin.
 * Forwards /api/v0/* to https://api.gamelayer.co/api/v0/*
 */

const UPSTREAM = 'https://api.gamelayer.co';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  // Path: from URL path first (/api/v0/players?x=1 -> "players"), else from query (Vercel may send as [...path]=players)
  const prefix = '/api/v0';
  const pathPart = (req.url || '').split('?')[0];
  let pathStr = pathPart.startsWith(prefix)
    ? pathPart.slice(prefix.length).replace(/^\/+|\/+$/g, '')
    : '';
  if (!pathStr && req.query) {
    const q = req.query['path'] ?? req.query['[...path]'];
    pathStr = Array.isArray(q) ? q.join('/') : (q || '');
  }
  let query = (req.url && req.url.includes('?')) ? req.url.split('?')[1] : '';
  if (query) {
    const params = new URLSearchParams(query);
    params.delete('path');
    params.delete('[...path]');
    query = params.toString() ? '?' + params.toString() : '';
  } else {
    query = '';
  }
  const url = `${UPSTREAM}/api/v0/${pathStr}${query}`;

  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Accept': req.headers['accept'] || 'application/json',
    'api-key': req.headers['api-key'] || process.env.GAMELAYER_API_KEY || '',
  };

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    body = req.body;
  } else if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await getRawBody(req);
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    });

    const data = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(data);
  } catch (err) {
    console.error('[GameLayer proxy]', err);
    res.status(502).json({ error: 'Proxy request failed', message: err.message });
  }
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
