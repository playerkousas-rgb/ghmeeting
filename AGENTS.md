# AGENTS.md

## 呢個 repo 係咩
小童軍集會助手（Grasshopper Hub）— 本機優先靜態 PWA，幫新領袖帶完整場小童軍集會。
**非官方**：與香港童軍總會無任何關聯；官方內容照錄、延伸編寫要寫白。

## 硬規矩
- 跟 `/home/user/readme-review`（playerkousas-rgb/readme）共用規則：S/F/A/W/V＋I/UP（PWA）＋G11（圖標）。
- 本機資料只存 localStorage；唔好引入登入／伺服器儲存。
- 改版號：`APP_VERSION`（js/app.js）＋`meta app-version`（index.html）＋`sw.js CACHE`＋`package.json` 一齊升。
- 改完必跑 `npm test`（smoke＋ui＋audit＋regression＋align）。
- 官方內容（誓詞・規律・口號・PDF 連結）唔可以改寫；詳見 docs/dialogue-align-20261022.md「共通唔可以改」。
- 用戶介面語言：繁體中文（HK）。L1–L6 雙語規則唔追溯。
- 常駐頁底一行（© 2026 Scout System・非官方・版本）係用戶明确要求，唔好靜靜改走。

## 結構
- index.html＋css/app.css＋sw.js＝PWA 外殼；js/*.js＝模組（vm 測試會逐個載入，新模組要登記）。
- tests/＝smoke（404 棘輪）／ui（真 DOM 計數）／audit（內容缺口）／regression（jsdom 回歸）。
- tools/＝align-check・build-icons・build-mascot。
