#!/usr/bin/env node
/* ============================================================================
   🦗 MEETING APP 對齊檢查 v1（2026-10-22）
   ----------------------------------------------------------------------------
   用途：一次過掃「其他 MEETING APP」有冇做齊 2026-10-22 對齊清單入面
         可以自動驗嘅 10 項。唔會改任何檔案，只讀。
   跑法：
     node tools/align-check.mjs                    # 檢查自己（repo 根目錄）
     node tools/align-check.mjs ../cubsmeeting     # 檢查另一個 MEETING APP
   回傳：全部 ✅ → exit 0；有 ❌ → exit 1（可以塞入 CI／pre-push）
   ----------------------------------------------------------------------------
   注意：呢個工具只做「靜態檔案」檢查。標題層級／字數／重複 id 要真 DOM，
         喺本 APP 由 tests/smoke.js ㉓ 鎖住；其他 APP 建議照抄嗰組測試。
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const P = (...p) => path.join(ROOT, ...p);
const read = (p) => { try { return fs.readFileSync(P(p), 'utf8'); } catch { return ''; } };
const mb = (n) => (n / 1048576).toFixed(2) + ' MB';

let pass = 0;
const fails = [];
const warns = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('✅ ' + name + (detail ? '（' + detail + '）' : '')); }
  else { fails.push(name + (detail ? '（' + detail + '）' : '')); console.log('❌ ' + name + (detail ? '（' + detail + '）' : '')); }
}
function warn(name, detail) { warns.push(name + (detail ? '（' + detail + '）' : '')); }

console.log('\n🦗 MEETING APP 對齊檢查 v1');
console.log('   目標：' + ROOT + '\n');

/* ---------- 0. 係唔係一個 MEETING APP ---------- */
const idx = read('index.html');
const sw = read('sw.js');
if (!idx || !sw) {
  console.log('❌ 呢個資料夾唔似 MEETING APP（搵唔到 index.html 或 sw.js）');
  process.exit(1);
}

/* ---------- 1. 意見回報：官方 widget 一行 ---------- */
const widget = /<script[^>]+src="https:\/\/scout-admin-blue\.vercel\.app\/widget\.js"[^>]*>/.test(idx);
check('1a 已接 Scout Admin 統一回報 widget', widget);
const apps = [...idx.matchAll(/data-app="([^"]*)"/g)].map((m) => m[1]);
const appName = apps[0] || '';
check('1b widget 有寫 data-app', !!appName, appName || '冇');
const BANNED = ['小童軍', '童軍', '幼童軍', '深資童軍', '樂行童軍', '專章', '專章系統', '進度追蹤'];
check('1c data-app 唔係單一支部名（唔會被歸入專章系統）',
  !!appName && !BANNED.includes(appName), 'data-app="' + appName + '"');
if (appName && !/集會|旅團/.test(appName)) warn('1d data-app 建議用「×集會／旅團集會」格式', appName);

/* ---------- 2. 路由：aria-current ---------- */
const jsFiles = fs.existsSync(P('js')) ? fs.readdirSync(P('js')).filter((f) => f.endsWith('.js')) : [];
const jsAll = Object.fromEntries(jsFiles.map((f) => [f, read('js/' + f)]));
const routerHits = Object.entries(jsAll).filter(([, s]) => /aria-current/.test(s)).map(([f]) => f);
check('2 路由有寫 aria-current（螢幕報讀器知而家邊頁）', routerHits.length > 0, routerHits.join(',') || '冇');
check('2b 外連唔會有 aria-current（用 data-tab 揀選）', /dataset\.tab|data-tab/.test(jsAll['app.js'] || Object.values(jsAll).join('')));

/* ---------- 3. 版本：App.VER ↔ sw.js CACHE ---------- */
const ver = (Object.values(jsAll).join('\n').match(/VER\s*:\s*'([^']+)'/) || [, ''])[1];
const cache = (sw.match(/CACHE\s*=\s*'([^']+)'/) || [, ''])[1];
const verKey = ver.replace(/^v/, '').replace(/\./g, '-');
check('3 App.VER 同 sw.js CACHE 對齊', !!ver && cache.includes(verKey), ver + '／' + cache);

/* ---------- 4. 預快取大小 ---------- */
function listOf(name) {
  const m = sw.match(new RegExp(name + '\\s*=\\s*\\[([\\s\\S]*?)\\]'));
  return m ? (m[1].match(/'[^']*'|"[^"]*"/g) || []).map((x) => x.slice(1, -1)) : [];
}
const assets = listOf('ASSETS');
const extra = listOf('CACHE_EXTRA');
const bytes = (list) => list.reduce((t, a) => {
  const p = a.replace(/^\.\//, '');
  try { return t + fs.statSync(P(a === './' ? 'index.html' : p)).size; } catch { return t; }
}, 0);
const assetsSize = bytes(assets);
check('4a 預快取（安裝包）≤ 1.5 MB', assets.length > 0 && assetsSize <= 1.5 * 1048576,
  assets.length + ' 個檔／' + mb(assetsSize));
const heavy = assets.filter((a) => /\/img\/.*\.(avif|jpe?g|png|webp)$/i.test(a) && !/icons\//.test(a));
check('4b 大圖唔喺安裝包（改背景補）', heavy.length === 0, heavy.length ? heavy.length + ' 張大圖仍喺 ASSETS' : '');
if (extra.length) {
  check('4c 有 CACHE_EXTRA ＋ message 背景補，而且逐張 add（一張失敗唔拖死其餘）',
    /CACHE_EXTRA/.test(sw) && /addEventListener\('message'/.test(sw) && /precache-extra/.test(sw));
  check('4d 頁面空閒時先叫背景補', /requestIdleCallback|postMessage/.test(idx));
}

/* ---------- 5. 模組定義唔准重複 ---------- */
const seen = new Map();
const dups = [];
for (const [f, src] of Object.entries(jsAll)) {
  for (const m of src.matchAll(/^(?:var\s+)?([A-Z][A-Za-z]*)\.([A-Za-z_$][\w$]*)\s*=\s*function/gm)) {
    const key = m[1] + '.' + m[2];
    if (seen.has(key) && seen.get(key) !== f) dups.push(key + '（' + seen.get(key) + ' / ' + f + '）');
    else seen.set(key, f);
  }
}
check('5 冇兩個檔案定義同一個 function（防止靜靜覆寫）', dups.length === 0, dups.join('、'));

/* ---------- 6. 圖片離線後備 ---------- */
const imgMod = jsAll['img.js'] || '';
check('6 圖片有 404／離線後備（唔會開天窗）',
  /onerror/.test(imgMod) || /onerror=/.test(Object.values(jsAll).join('')) || /swap\(/.test(imgMod));

/* ---------- 7. 文件齊全 ---------- */
check('7a docs/feedback-system.md 存在', fs.existsSync(P('docs/feedback-system.md')));
check('7b docs/dialogue-align-20261022.md 存在', fs.existsSync(P('docs/dialogue-align-20261022.md')));

/* ---------- 8. 測試鎖 ---------- */
const testTxt = ['tests/smoke.js', 'tests/quality.mjs', 'tests/ui.js']
  .map(read).join('\n');
check('8a 測試有鎖「意見回報」（widget／data-app）', /widget\.js|data-app/.test(testTxt));
check('8b 測試有鎖「每頁一個 h1／標題唔跳級」', /h1/.test(testTxt) && /跳級/.test(testTxt));

/* ---------- 總結 ---------- */
console.log('\n────────────────────────────────────────');
console.log('✅ 通過 ' + pass + ' 項' + (warns.length ? '｜⚠️ 提示 ' + warns.length + ' 項' : ''));
if (warns.length) warns.forEach((w) => console.log('   ⚠️ ' + w));
if (fails.length) {
  console.log('❌ 未做 ' + fails.length + ' 項：');
  fails.forEach((f) => console.log('  ・' + f));
  console.log('\n👉 逐項做法見 docs/dialogue-align-20261022.md 尾段「四大類對齊清單」。');
  process.exit(1);
}
console.log('🎉 對齊清單可以自動驗嘅項目全部過關。');
