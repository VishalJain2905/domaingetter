/**
 * Serves the project with CORS headers so the loader bookmarklet can fetch
 * bookmarklet-core.js from pages on other origins (e.g. netflix.com).
 * Use: node server.js
 * Then open install.html and use the loader; keep this server running.
 * For HTTPS sites like Netflix you must use HTTPS for the core (e.g. ngrok or real host).
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const ROOT = fs.existsSync(PUBLIC) ? PUBLIC : __dirname;
const PORT = Number(process.env.PORT) || 3333;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let p = req.url === '/' ? '/install.html' : req.url.split('?')[0];
  const file = path.join(ROOT, p.replace(/^\//, ''));

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
