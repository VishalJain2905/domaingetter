/**
 * Prepares static files for deploy (Render, Vercel, Netlify, etc.).
 * Run: npm run build && node scripts/prepare-static.js
 * Then use "public" as the publish directory.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(root, 'install.html'), path.join(publicDir, 'install.html'));
copyRecursive(path.join(root, 'build'), path.join(publicDir, 'build'));
copyRecursive(path.join(root, 'test'), path.join(publicDir, 'test'));

console.log('Static files ready in public/');
