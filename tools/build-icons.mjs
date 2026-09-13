#!/usr/bin/env node
/* ============================================================================
   童仔 GH — Icon System 建構器
   ----------------------------------------------------------------------------
   來源（唯一真相）：icons/svg/i-*.svg     48×48 viewBox・2.2 圓角描邊・水彩填色
   產生：
     icons/gh-icons.svg        sprite（13 個 <symbol>，可 <use href="...#gh-plan">）
     icons/png/48/i-*.png      48×48  （介面用／後備）
     icons/png/1024/i-*.png    1024×1024（商店圖、印刷、manifest shortcuts）
     index.html                自動注入 sprite（<!--GH-SPRITE:START--> ~ :END-->）
     docs/brand.html           自動注入 sprite（同一對 marker）

   跑法：node tools/build-icons.mjs
   PNG 輸出需要 @resvg/resvg-js（冇裝都照出 sprite，只係 skip PNG）：
     npm i @resvg/resvg-js     （或 RESVG_PATH=/path/to/node_modules node tools/build-icons.mjs）
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SVGDIR = path.join(ROOT, 'icons', 'svg');

const NAMES = {                       // 檔名 → 中文名（sprite symbol id 用 gh- 開頭）
  'i-plan':     '集會目錄',
  'i-tpl':      '範本',
  'i-lead':     '帶領',
  'i-pack':     '官方套包',
  'i-book':     '手冊',
  'i-print':    '工作紙',
  'i-play':     '活動',
  'i-song':     '歌曲',
  'i-chute':    '快樂傘',
  'i-tools':    '快鍵',
  'i-search':   '搜尋',
  'i-track':    '記錄',
  'i-settings': '設定',
};

/* ---------- 1. 讀來源 ---------- */
const files = fs.readdirSync(SVGDIR).filter(f => f.endsWith('.svg') && f.startsWith('i-')).sort();
if (!files.length) { console.error('❌ icons/svg/ 搵唔到 i-*.svg'); process.exit(1); }

const items = files.map(f => {
  const key = f.replace(/\.svg$/, '');
  const raw = fs.readFileSync(path.join(SVGDIR, f), 'utf8');
  /* 搣走外層 <svg …> … </svg>，淨低入面嘅嘢塞落 <symbol> */
  const open = raw.match(/<svg\b[^>]*>/i);
  const close = raw.lastIndexOf('</svg>');
  if (!open || close < 0) throw new Error(`${f} 唔係合法 svg`);
  const viewBox = (raw.match(/viewBox="([^"]+)"/i) || [, '0 0 48 48'])[1];
  const inner = raw.slice(open.index + open[0].length, close).trim();
  return { key, id: 'gh-' + key.slice(2), label: NAMES[key] || key, viewBox, inner, raw };
});

/* ---------- 2. sprite ---------- */
const sprite = `<!-- 童仔 GH Icon Sprite — 由 tools/build-icons.mjs 從 icons/svg/i-*.svg 自動產生，唔好手改 -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true" focusable="false"><defs>
${items.map(it => `  <symbol id="${it.id}" viewBox="${it.viewBox}"><title>${it.label}</title>${it.inner}</symbol>`).join('\n')}
</defs></svg>`;
fs.writeFileSync(path.join(ROOT, 'icons', 'gh-icons.svg'), sprite.replace('style="display:none" ', '') + '\n');
console.log(`✅ icons/gh-icons.svg  (${items.length} 個 symbol)`);

/* ---------- 3. 注入 HTML（sprite 內聯，離線／iOS 都用到，唔使額外請求） ---------- */
const inline = sprite.replace('<svg xmlns', '<svg id="gh-sprite" xmlns');
let injected = 0;
for (const html of ['index.html', path.join('docs', 'brand.html')]) {
  const p = path.join(ROOT, html);
  if (!fs.existsSync(p)) continue;
  let src = fs.readFileSync(p, 'utf8');
  const re = /(<!--GH-SPRITE:START-->)([\s\S]*?)(<!--GH-SPRITE:END-->)/;
  if (!re.test(src)) { console.warn(`⚠️  ${html} 冇 GH-SPRITE marker，skip`); continue; }
  const next = `$1\n${inline}\n  $3`;
  src = src.replace(re, next);
  fs.writeFileSync(p, src);
  injected++;
  console.log(`✅ ${html} 已注入 sprite`);
}

/* ---------- 4. PNG 兩套：48 / 1024 ---------- */
let Resvg = null;
{
  const require = createRequire(import.meta.url);
  const tries = ['@resvg/resvg-js'];
  if (process.env.RESVG_PATH) tries.push(path.join(process.env.RESVG_PATH, '@resvg/resvg-js'));
  for (const mod of tries) { try { Resvg = require(mod).Resvg; break } catch (_) {} }
}
if (!Resvg) {
  console.log('⏭️  冇 @resvg/resvg-js → skip PNG（想出圖：npm i @resvg/resvg-js）');
} else {
  for (const size of [48, 192, 1024]) {
    const dir = path.join(ROOT, 'icons', 'png', String(size));
    fs.mkdirSync(dir, { recursive: true });
    for (const it of items) {
      const svg = it.raw.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
        let a = attrs.replace(/width="[^"]*"/i, '').replace(/height="[^"]*"/i, '');
        return `<svg${a} xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">`;
      });
      const png = new Resvg(svg, { fitTo: { mode: 'width', value: size }, background: null }).render().asPng();
      fs.writeFileSync(path.join(dir, it.key + '.png'), png);
    }
    console.log(`✅ icons/png/${size}/ (${items.length} 張)`);
  }
}
console.log(`\n共 ${items.length} 個 icon：${items.map(i => i.id).join(' ')}`);
