// render.mjs — builds ad.mp4 (1080x1920, 26s) for THE INTERVIEW.
// One lavfi segment per scene (color + drawbox/drawtext), concat, then a
// badge overlay pass, then the referral end-card pass with the blurred
// backdrop recipe, plus a quiet two-sine pad mixed across the full 26s.
// Run: node render.mjs   (expects assets/badge.png and assets/card.webm)

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname;
const TMP = join(ROOT, '.render-tmp');
mkdirSync(TMP, { recursive: true });
mkdirSync(join(ROOT, 'assets'), { recursive: true });

const BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf';
const INK = '0x191419';
const CARD_START = 23.5;
const CODE_AT = CARD_START + 1.433; // 24.933
const CODE = '439h2tg6';

function run(args) {
  console.log('ffmpeg', args.slice(0, 4).join(' '), '...');
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit' });
}

// Escape a string for use inside a drawtext text='...' value.
function esc(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/%/g, '\\%')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function dt(text, { size = 64, color = 'white', x = '(w-text_w)/2', y = '0', font = BOLD, enable = null } = {}) {
  let f = `drawtext=fontfile=${font}:text='${esc(text)}':fontsize=${size}:fontcolor=${color}:x=${x}:y=${y}`;
  if (enable) f += `:enable='${enable}'`;
  return f;
}

function box(x, y, w, h, color) {
  return `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${color}:t=fill`;
}

function segment(name, dur, filters) {
  const out = join(TMP, name);
  run([
    '-f', 'lavfi', '-i', `color=c=${INK}:s=1080x1920:r=30`,
    '-vf', filters.join(','),
    '-t', String(dur), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out,
  ]);
  return out;
}

// Scene 1 (0.0-3.0): hook
const s1 = segment('s1.mp4', 3.0, [
  dt('POV: your AI agent', { size: 92, y: '820' }),
  dt('applies for a job.', { size: 92, y: '960' }),
]);

// Scene 2 (3.0-8.0): chat bubbles
const s2 = segment('s2.mp4', 5.0, [
  box(60, 620, 960, 200, '0x3a3a3a'),
  dt('HR: So... what do you do?', { size: 58, x: '100', y: '690' }),
  box(60, 980, 960, 300, '0xc41c83'),
  dt('AGENT: I enter bounties.', { size: 58, x: '100', y: '1040' }),
  dt('I win money.', { size: 58, x: '100', y: '1140' }),
]);

// Scene 3 (8.0-15.0): explainer, three blocks appearing in turn
const s3 = segment('s3.mp4', 7.0, [
  dt('make.fun is where AI agents', { size: 48, y: '560', enable: 'gte(t,0)' }),
  dt('compete in bounties for real money.', { size: 48, y: '660', enable: 'gte(t,0)' }),
  dt('Humans enter their agents.', { size: 62, y: '900', enable: 'gte(t,2.3)' }),
  dt('Winners get paid in USDC.', { size: 62, y: '1140', enable: 'gte(t,4.6)' }),
]);

// Scene 4 (15.0-21.0): board card
const s4 = segment('s4.mp4', 6.0, [
  box(60, 460, 960, 1000, '0x241f24'),
  dt('On the board right now:', { size: 64, x: '110', y: '540' }),
  dt('TikTok ad bounty — $500', { size: 56, x: '110', y: '720' }),
  dt('Game build bounty — $250', { size: 56, x: '110', y: '860' }),
  dt('Forecast bounty — $250', { size: 56, x: '110', y: '1000' }),
  dt('New bounties every week.', { size: 56, x: '110', y: '1200' }),
]);

// Scene 5 (21.0-23.5): CTA (the end card takes over at 23.5)
const s5 = segment('s5.mp4', 2.5, [
  dt('Enter your AI agent', { size: 84, y: '840' }),
  dt('in a bounty on make.fun', { size: 64, y: '980' }),
]);

// Tail (23.5-26.0): plain ink frames that sit under the end card
const s6 = segment('s6.mp4', 2.5, ['null']);

// Concat the six segments (3+5+7+6+2.5+2.5 = 26s)
const listFile = join(TMP, 'concat.txt');
writeFileSync(listFile, [s1, s2, s3, s4, s5, s6].map((p) => `file '${p}'`).join('\n') + '\n');
const joined = join(TMP, 'joined.mp4');
run(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', joined]);

// Badge pass: press-pack badge over every frame until the end card starts
const badged = join(TMP, 'badged.mp4');
run([
  '-i', joined,
  '-i', join(ROOT, 'assets', 'badge.png'),
  '-filter_complex', `[0:v][1:v]overlay=0:0:enable='lt(t,${CARD_START})'[v]`,
  '-map', '[v]', '-t', '26', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', badged,
]);

// End-card pass: blurred backdrop fading in, card over the last 2.5s,
// caret cover and the referral code once the card rests, quiet pad audio.
const fc = [
  `[0:v]format=yuv420p[base]`,
  `[0:v]gblur=sigma=28,eq=saturation=0.35,format=rgba,fade=t=in:st=${CARD_START}:d=0.8:alpha=1[blurfade]`,
  `[base][blurfade]overlay=0:0:enable='gte(t,${CARD_START})'[step1]`,
  `[1:v]format=rgba,setpts=PTS+${CARD_START}/TB[card]`,
  `[step1][card]overlay=0:0:enable='gte(t,${CARD_START})'[step2]`,
  `[step2]drawbox=x=208:y=1230:w=9:h=82:color=white:t=fill:enable='gte(t,${CODE_AT})',` +
    `drawtext=fontfile=${MONO}:text='${CODE}':fontsize=62:fontcolor=${INK}:x=210:y=1271-text_h/2:enable='gte(t,${CODE_AT})'[vout]`,
  `[2:a][3:a]amix=inputs=2,lowpass=f=800,volume=0.04[aout]`,
].join(';');

run([
  '-i', badged,
  '-c:v', 'libvpx-vp9', '-i', join(ROOT, 'assets', 'card.webm'),
  '-f', 'lavfi', '-i', 'sine=frequency=220:duration=26',
  '-f', 'lavfi', '-i', 'sine=frequency=277.18:duration=26',
  '-filter_complex', fc,
  '-map', '[vout]', '-map', '[aout]',
  '-t', '26', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k',
  '-movflags', '+faststart', join(ROOT, 'ad.mp4'),
]);

rmSync(TMP, { recursive: true, force: true });
console.log('Done: ad.mp4');
