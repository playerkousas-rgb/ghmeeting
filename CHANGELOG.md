# Changelog

## v5.4.0 — 2026-11-12（審計修復輪）

### P0 資料安全／保安
- 匯出備份：單一 key registry（15 組，補回 flow／bagtick／packkid／packcopies／packcur／packsel）、`schemaVersion:2`、SHA-256 校驗和。
- 匯入備份：allowlist＋逐 key schema 驗證＋原子還原（失敗回滾）＋匯入前自動下載備份。
- 修復 3 個 XSS 注入點（出席紀錄日期、目錄 row、負責領袖 chip）：用戶資料一律 escape／data-*＋事件綁定。
- `Store.set` 失敗而家會報告（紅 toast＋回傳 false），唔再扮「已儲存 ✓」；新增一鍵診斷。
- 出席紀錄 upsert by `no`：重save唔會重複計出席／小草蜢體驗。
- Service Worker：只快取 `res.ok`；更新停喺 waiting，用戶撳「立即更新」先接手。

### P1 規則補齊
- 安裝入口（`beforeinstallprompt`＋iOS Safari 三步教學卡）；更新 banner（立即更新／稍後、dismissedWorker、2.5s fallback、visibilitychange／online／30min 檢查）。
- G11 圖標：補齊 favicon.ico／16／32／maskable-192／og-image（1200×630）；og:image 絕對網址；manifest bg=theme；移除 1024 來源圖。
- W1 copyright meta；V2 APP_VERSION＋meta app-version＋package.json 同步。
- 未知 badge／gh／tid key 有 fallback，唔會 crash。
- Modal：dialog 語義、focus 管理、Esc／背景關、focus trap。
- CSS：`.gh-ic` 絕對定位收窄到九宮格（修復全站 +4px 溢出）；互動綠色加深達 WCAG AA；tap target ≥40px。
- 真實測試閘：package.json＋npm test、audit.js exit code、ui.js 真計數＋stack tagBalance、jsdom 回歸測試 21 項、GitHub Actions CI。

### P2 一致性／repo 健康
- README／docs 數字同步；.gitignore／.vercelignore 補齊；吉祥物母版量化瘦身（<500KB）。
- 新增 CREDITS.md、LICENSE、CHANGELOG.md、AGENTS.md、SCOPE.md、GLOSSARY.md、CONTRIBUTING.md、.env.example。
- vercel.json：icons immutable／sw no-cache headers。

## v5.3 及之前
請參閱 git 歷史。
