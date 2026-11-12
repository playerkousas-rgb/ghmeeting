# SCOPE

## 做
- 幫新領袖帶完整場小童軍集會：規劃→範本→印教材→執袋→設場→帶領→記出席。
- 上五下五導航、逐步預備嚮導、本機資料（localStorage）、離線 PWA、列印教材。
- 非官方聲明每一頁／每一張紙都有。

## 唔做
- 唔做登入／超級管理員／多層權限（嗰啲係旅團系統規則，唔適用於本工具）。
- 唔收集兒童個人資料上伺服器；團員名單只存本機。
- 唔複製官方套包版面；官方嘢連去官方。
- 唔做英文介面（L1–L6 唔追溯）。

## 例外登記
- `EXCEPTION: Vercel Type-C — 呢個係無 build／無 serverless function 嘅靜態 PWA，根目錄直接部署；installCommand、dist outputDirectory、regions 都唔適用。唔加假 build／複製 dist 只為迎合 Type-C 檢查；vercel.json 保留靜態資產快取、更新檔 no-cache 同 main-only deployment。`
- `EXCEPTION: Single-HTML V1/V2 — PWA 入口必須叫 index.html（Vercel／瀏覽器慣例），APP_VERSION 真常數放喺 js/app.js，audit_single_html 唔解析外置 JS；補償：meta app-version、APP_VERSION、package.json、sw.js CACHE 四處同步，npm test + node --test 鎖住；CHANGELOG 記錄每次版號。唔加無用版本化 HTML 副本／註解假常數。`
- `EXCEPTION: L1–L6 — 雙語規則唔追溯（用戶已確認）— 補償：介面維持繁體中文（HK），新內容跟同一語言。`
