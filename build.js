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
  const bundleUniversalPath = join(buildDir, 'bookmarklet-universal.bundle.js');
  const bundleInlinePath = join(buildDir, 'bookmarklet-inline.bundle.js');
  const testBundlePath = join(buildDir, 'test-bundle.js');

  console.log('Bundling full...');
  await esbuild.build({
    entryPoints: [join(root, 'src', 'index.js')],
    bundle: true,
    format: 'iife',
    minify: false,
    outfile: bundlePath,
    platform: 'browser',
    target: ['es2020'],
  });

  console.log('Bundling universal (all sites, compact)...');
  await esbuild.build({
    entryPoints: [join(root, 'src', 'universal.js')],
    bundle: true,
    format: 'iife',
    minify: false,
    outfile: bundleUniversalPath,
    platform: 'browser',
    target: ['es2020'],
  });

  console.log('Bundling inline (YouTube)...');
  await esbuild.build({
    entryPoints: [join(root, 'src', 'index-inline.js')],
    bundle: true,
    format: 'iife',
    minify: false,
    outfile: bundleInlinePath,
    platform: 'browser',
    target: ['es2020'],
    drop: ['console'],
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
  const result = await minify(code, { compress: { passes: 1 }, mangle: true, format: { comments: false } });
  if (result.code === undefined) throw new Error('Minification failed');
  const bookmarkletCode = `javascript:(function(){${result.code}})();`;
  writeFileSync(outFile, bookmarkletCode, 'utf8');

  const codeUniversal = readFileSync(bundleUniversalPath, 'utf8');
  const resultUniversal = await minify(codeUniversal, {
    compress: false,
    mangle: false,
    format: { comments: false },
  });
  if (resultUniversal.code === undefined) throw new Error('Universal minify failed');
  const universalBookmarklet = `javascript:(function(){${resultUniversal.code}})();`;
  writeFileSync(join(buildDir, 'bookmarklet-universal.js'), universalBookmarklet, 'utf8');

  const codeInline = readFileSync(bundleInlinePath, 'utf8');
  const resultInline = await minify(codeInline, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
  if (resultInline.code === undefined) throw new Error('Inline minify failed');
  const inlineBookmarklet = `javascript:(function(){${resultInline.code}})();`;
  writeFileSync(join(buildDir, 'bookmarklet-inline.js'), inlineBookmarklet, 'utf8');

  writeFileSync(join(buildDir, 'bookmarklet-core.js'), result.code, 'utf8');

  const loaderUrl = process.env.BOOKMARKLET_BASE_URL || '__BASE_URL__';
  const loaderCode = `javascript:(function(){var u="${loaderUrl.replace(/\/$/, '')}/build/bookmarklet-core.js";fetch(u).then(function(r){if(!r.ok)throw new Error("Load failed "+r.status);return r.text();}).then(function(c){if(!c||c.length<500)throw new Error("Invalid script");var b=new Blob([c],{type:"application/javascript"});var url=URL.createObjectURL(b);var s=document.createElement("script");s.src=url;s.onload=function(){URL.revokeObjectURL(url);};document.body.appendChild(s);}).catch(function(e){console.error("Bookmarklet load failed",e);});})();`;
  writeFileSync(join(buildDir, 'bookmarklet-loader.js'), loaderCode, 'utf8');

  console.log('\n✅ Bookmarklets ready:');
  console.log('📌 Universal (all sites):', universalBookmarklet.length, 'chars -', join(buildDir, 'bookmarklet-universal.js'));
  console.log('📌 Inline (YouTube):', inlineBookmarklet.length, 'chars -', join(buildDir, 'bookmarklet-inline.js'));
  console.log('📌 Full (with widget):', bookmarkletCode.length, 'chars -', outFile);
  console.log('📌 Loader:', join(buildDir, 'bookmarklet-loader.js'));
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
