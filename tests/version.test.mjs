/* node:test 入口（畀 `node --test` 同 final_check 行）：版號同步＋G11 圖標 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('V2：APP_VERSION／meta／CACHE／package 四處同步', () => {
  const ver = (read('js/app.js').match(/APP_VERSION='([^']+)'/) || [])[1];
  assert.ok(ver, 'APP_VERSION 存在');
  assert.ok(read('index.html').includes(`name="app-version" content="${ver}"`));
  assert.ok(read('sw.js').includes('ghub-v' + ver.slice(1).replace(/\./g, '-')));
  assert.equal(JSON.parse(read('package.json')).version, ver.slice(1) + '.0');
});

test('G11：9 個圖標尺寸＋總體積 ≤260KB', () => {
  const need = { 'favicon.ico': null, 'favicon-16.png': 16, 'favicon-32.png': 32, 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-192.png': 192, 'icon-maskable-512.png': 512, 'og-image.png': 1200 };
  let total = 0;
  for (const [f, size] of Object.entries(need)) {
    const b = fs.readFileSync(path.join(ROOT, 'icons', f)); total += b.length;
    if (f.endsWith('.png')) { assert.equal(b.readUInt32BE(16), size, f); assert.equal(b.readUInt32BE(20), f === 'og-image.png' ? 630 : size, f); }
    else assert.equal(b.readUInt16LE(4), 3, 'ico 三尺寸');
  }
  assert.ok(total <= 260 * 1024, 'total ' + total);
});

test('UP1：SW 條件式 skipWaiting＋SKIP_WAITING handler＋只快取 ok', () => {
  const sw = read('sw.js');
  assert.ok(sw.includes('if(!self.registration.active)return self.skipWaiting()'));
  assert.ok(sw.includes("e.data.type==='SKIP_WAITING'"));
  assert.ok(sw.includes('res&&res.ok'));
});

test('A11：用戶資料唔拼入 onclick（data-* 綁定）', () => {
  const app = read('js/app.js'), kit = read('js/kit.js');
  assert.ok(app.includes('data-plan-tid'));
  assert.ok(!/onclick="Flow\.select\(/.test(app));
  assert.ok(kit.includes('data-owner-chip'));
  assert.ok(!/onclick="Kit\.setOwner\(/.test(kit));
});
