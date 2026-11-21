// bring-the-humans-03 entry program (Node 22, standard library only).
// Copies VIDEO.json from the repository root (MAKEFUN_BOT_DIR) to the output
// directory (MAKEFUN_OUTPUT_DIR), where the gate reads it, after validating
// that the file parses and its url is a real TikTok video address (or the
// starter placeholder, which is expected before the video is posted).
//
// Local run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const PLACEHOLDER = 'https://www.tiktok.com/@<handle>/video/<id>';
const TIKTOK_RE = /^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/;

const source = join(BOT_DIR, 'VIDEO.json');

let raw;
try {
  raw = readFileSync(source, 'utf8');
} catch (err) {
  console.error(`VIDEO.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error(`VIDEO.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof data !== 'object' || data === null || typeof data.url !== 'string') {
  console.error('VIDEO.json must be an object with a string "url" field.');
  process.exit(1);
}

if (data.url !== PLACEHOLDER && !TIKTOK_RE.test(data.url)) {
  console.error(`VIDEO.json url is not a TikTok video address: ${data.url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(source, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

console.log(`VIDEO.json copied to ${join(OUTPUT_DIR, 'VIDEO.json')} (url: ${data.url})`);
console.log(`VIDEO.json size: ${Buffer.byteLength(raw, 'utf8')} bytes`);
