/**
 * Serves the project with CORS headers so the loader bookmarklet can fetch
 * bookmarklet-core.js from pages on other origins (e.g. netflix.com).
 * API: POST /api/complete, GET /api/reward-status, GET /api/bookmarklet?t=TOKEN
 * for cross-domain reward tracking (click bookmarklet on 4 sites → reward unlocked).
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const ROOT = fs.existsSync(PUBLIC) ? PUBLIC : __dirname;
const BUILD = path.join(__dirname, 'build');
const PORT = Number(process.env.PORT) || 3333;

const REQUIRED_DOMAINS = ['youtube.com', 'netflix.com', 'x.com', 'google.com'];

/** token -> Set of completed domain strings */
const completions = new Map();

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url === '/' ? '/install.html' : req.url;
  const pathname = url.split('?')[0];

  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // API: POST /api/complete  body: { token, domain }
  if (req.method === 'POST' && pathname === '/api/complete') {
    const body = await parseBody(req);
    const token = body.token || '';
    const domain = body.domain || '';
    if (!token || !domain) {
      cors(res);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false }));
      return;
    }
    if (!completions.has(token)) completions.set(token, new Set());
    completions.get(token).add(domain);
    cors(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // API: GET /api/reward-status?token=TOKEN
  if (req.method === 'GET' && pathname === '/api/reward-status') {
    const u = new URL(url, 'http://localhost');
    const token = u.searchParams.get('token') || '';
    const set = completions.get(token);
    const completed = set ? Array.from(set) : [];
    const unlocked = REQUIRED_DOMAINS.every((d) => set && set.has(d));
    cors(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ unlocked, completed }));
    return;
  }

  // API: GET /api/bookmarklet?t=TOKEN  → returns bookmarklet with token injected
  if (req.method === 'GET' && pathname === '/api/bookmarklet') {
    const u = new URL(url, 'http://localhost');
    const token = u.searchParams.get('t') || '';
    const tryFile = path.join(BUILD, 'bookmarklet-universal.js');
    const tryPublic = path.join(ROOT, 'build', 'bookmarklet-universal.js');
    const file = fs.existsSync(tryFile) ? tryFile : tryPublic;
    fs.readFile(file, 'utf8', (err, data) => {
      if (err || !data) {
        cors(res);
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const escaped = token.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const code = data.replace(/__TOKEN__/, escaped);
      cors(res);
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.writeHead(200);
      res.end(code);
    });
    return;
  }

  // Static files
  const file = path.join(ROOT, pathname.replace(/^\//, ''));
  if (!path.resolve(file).startsWith(path.resolve(ROOT))) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(file);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('Server with CORS at port', PORT);
  if (!process.env.PORT) console.log('Open http://localhost:' + PORT + '/install.html');
});
