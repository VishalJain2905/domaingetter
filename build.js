/**
 * Bookmarklet build script.
 * Bundles src into a single IIFE, minifies, and outputs javascript:(function(){...})();
 */

import * as esbuild from 'esbuild';
import { minify } from 'terser';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const buildDir = join(root, 'build');
const outFile = join(buildDir, 'bookmarklet.js');

async function build() {
  mkdirSync(buildDir, { recursive: true });
  const bundlePath = join(buildDir, 'bookmarklet.bundle.js');
  const testBundlePath = join(buildDir, 'test-bundle.js');

  console.log('Bundling...');
  await esbuild.build({
    entryPoints: [join(root, 'src', 'index.js')],
    bundle: true,
    format: 'iife',
    minify: false,
    outfile: bundlePath,
    platform: 'browser',
    target: ['es2020'],
  });

  console.log('Bundling test runner...');
  await esbuild.build({
    entryPoints: [join(root, 'src', 'test-runner.js')],
    bundle: true,
    format: 'iife',
    minify: false,
    outfile: testBundlePath,
    platform: 'browser',
    target: ['es2020'],
  });

  let code = readFileSync(bundlePath, 'utf8');
  console.log('Minifying...');
  const result = await minify(code, {
    compress: { passes: 1 },
    mangle: true,
    format: { comments: false },
  });
  if (result.code === undefined) throw new Error('Minification failed');

  const bookmarkletCode = `javascript:(function(){${result.code}})();`;
  writeFileSync(outFile, bookmarkletCode, 'utf8');

  writeFileSync(join(buildDir, 'bookmarklet-core.js'), result.code, 'utf8');

  const loaderUrl = process.env.BOOKMARKLET_BASE_URL || '__BASE_URL__';
  const loaderCode = `javascript:(function(){var u="${loaderUrl.replace(/\/$/, '')}/build/bookmarklet-core.js";fetch(u).then(function(r){if(!r.ok)throw new Error("Load failed "+r.status);return r.text();}).then(function(c){if(!c||c.length<500)throw new Error("Invalid script");var s=document.createElement("script");s.textContent=c;document.body.appendChild(s);}).catch(function(e){console.error("Bookmarklet load failed",e);});})();`;
  writeFileSync(join(buildDir, 'bookmarklet-loader.js'), loaderCode, 'utf8');

  console.log('Written:', outFile);
  console.log('Core (host this):', join(buildDir, 'bookmarklet-core.js'));
  console.log('Loader (use if bookmark is truncated):', join(buildDir, 'bookmarklet-loader.js'));
  console.log('Length:', bookmarkletCode.length, 'chars');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
