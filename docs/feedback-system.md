# 📮 意見回報系統（Scout Admin 統一回報 v1）

> 加入日期：2026-10-22 ｜ 影響檔案：`index.html`、`js/app.js`、`js/handbook.js`、`css/app.css`、`sw.js`、`tests/smoke.js`
> 結論：本 APP **原本冇**任何回報／意見渠道；現在接上 Scout Admin 的**統一回報 v1**，一行腳本、無後端、同其他童軍系統同一個看板。

---

## 一、加了什麼

| 位置 | 內容 | 檔案 |
|---|---|---|
| 全站右下角浮動掣 | 官方 widget：`🐛💬 回報 · 意見`（問題回報／意見回饋兩個分頁） | `index.html` 最後一行 `<script>` |
| 手冊 `#book` 底部 | 「📮 意見回報」卡：開表單掣、網頁版表單；私隱界線＋離線做法收喺 `<details>` | `js/handbook.js` → `HB.feedbackCard()` |
| 離線／腳本被封時 | 撳「開回報表單」開模態：可複製的回報文字＋網頁版連結＋私隱提示 | `js/app.js` → `App.feedback()` / `App.copyFeedback()` |
| 樣式 | 浮動掣升上底部導覽（唔蓋 `#tabbar`）、≥44px、列印時隱藏 | `css/app.css` 尾段 |
| 測試鎖 | 12 條斷言（widget、`data-app`、卡片、模態、模板、私隱、CSS、退路） | `tests/smoke.js` ㉔ |

接入碼（就係這一行，放喺 `App.init()` 之後、`</body>` 之前）：

```html
<script src="https://scout-admin-blue.vercel.app/widget.js" data-app="小童軍集會" defer></script>
```

- 提交**不需要 API KEY、不需要登入**；`name`／`contact`／`troopId` 全部選填（可匿名）。
- 統一 payload：`type`（`issue`／`feedback`）、`sourceApp`、`title`／`desc`／`severity` 或 `fbType`／`content`。
- 官方 widget 冇公開「用程式開表單」嘅 API，所以本 APP 嘅卡片／模態**唔會代撳 widget**：有網用右下角掣，冇網用可複製文字。兩條路都通向同一個後台。

---

## 二、`data-app` 要點名（最易出錯嗰步）

Scout Admin 會用 `SOURCE_ALIASES` 把來源名稱**正規化**；單一支部名會被歸入「專章系統」：

```js
// scout-admin/widget.js ＋ apps-script/Code.gs（現行）
'專章系統': ['badge', 'badgesystem', 'vsbadge', '專章', '專章系統',
             'scoutbadge', '童軍支部', '童軍進度追蹤', '深資童軍',
             'cubsbadge', '幼童軍', '幼童軍進度追蹤',
             'roverbadge', '樂行童軍', '樂行童軍進度追蹤']
```

- ❌ `data-app="幼童軍"` → 會被歸入**專章系統**（因為 `cubsbadge` 已用呢個名）。
- ❌ `data-app="小童軍"` → 現時**未**收錄，所以會原樣顯示；但同屬「單一支部名」，日後一加 alias 就會同獎章 APP 撞，所以**唔用**。
- ✅ `data-app="小童軍集會"` → 未登記來源，後台顯示 `🔹 小童軍集會`，照樣分流、照樣統計、**唔會漏單**。

### 各 APP 應該用邊個名

| APP | `data-app` | 備註 |
|---|---|---|
| 小童軍集會（本 APP，`ghmeeting`） | `小童軍集會` | 唔好寫「小童軍」 |
| 幼童軍集會（`cubsmeeting`） | `幼童軍集會` | 唔好寫「幼童軍」 |
| 童軍集會（`scoutmeeting`） | `童軍集會` | 唔好寫「童軍」 |
| 深資童軍集會（`vsmeeting`） | `深資童軍集會` | 唔好寫「深資童軍」 |
| 樂行童軍集會 | `樂行童軍集會` | 唔好寫「樂行童軍」 |
| 旅團通用 | `旅團集會` | |

⚠️ 共通禁忌：**唔好用**「小童軍」「童軍」「幼童軍」「深資童軍」「樂行童軍」「專章」單獨做 `data-app`。

---

## 三、後台會見到什麼

在 Scout Admin（`https://scout-admin-blue.vercel.app/`）的「問題回報 / 意見回饋」看板：

- 來源名稱：**🔹 小童軍集會**（未登記來源＝原樣顯示，照樣分流、照樣統計）。
- 想看正式名稱／專屬圖示／固定排序，才需要在 **scout-admin 倉庫**加一行（可選，非必須）：

```js
// scout-admin/index.html  的 SOURCE_APPS
{ key:'ghmeeting', icon:'🦗', label:'小童軍集會',
  aliases:['ghmeeting','ghmeeting.vercel.app','草蜢助手','小童軍集會'] }
```

```js
// scout-admin/apps-script/Code.gs  的 SOURCE_ALIASES 加同一組別名
'小童軍集會': ['ghmeeting','ghmeeting.vercel.app','grasshopperhub','草蜢助手','小童軍集會']
```

改完依文件重新部署（管理部署 → 編輯 → 版本：新版本），Apps Script 網址不變。

> 這兩行**未做**（唔屬本 APP 範圍）；未做都照收得到，只係後台顯示 `🔹 小童軍集會`。
> 加 `SOURCE_ALIASES` 時要**避免**把「小童軍」單獨寫入任何一組——一寫就會同獎章 APP 撞。

---

## 四、離線／被封網時的退路（重要）

本 APP 係離線優先 PWA，但 widget 係**外部腳本**，Service Worker 唔會跨網域快取它（`fetch` 只處理同源）。

| 情況 | 行為 |
|---|---|
| 有網 | 右下角出現 `🐛💬 回報 · 意見`，撳開即有兩個分頁（問題／意見），提交後顯示「✅ 已提交」 |
| 離線／腳本載入失敗 | 浮動掣唔會出現（頁面照常運作，0 錯誤）；手冊「📮 意見回報」卡仍然開得，撳「開回報表單」→ 出可複製文字＋網頁版連結 |
| 恢復上網 | 浮動掣自動再出現，唔需要重裝 |

實測（sandbox 連唔到 `scout-admin-blue.vercel.app`，正好模擬離線）：
`#book` 1 個 `h1`、`.feedback-card` 存在、`App.feedback()` 回 `true`、模態有 `#fb-ta` 同 `report.html?app=%E5%B0%8F…`、`#scoutw-fab` 不存在、0 console error。

> ⚠️ 未實測：真人喺有網環境撳 widget 提交。上線後第一次提交要人手確認一次（後台有冇 `🔹 小童軍集會` 嘅新單）。

---

## 五、私隱界線（寫入 UI，亦寫入測試）

- 只收**問題本身**；卡片同模態都寫明：**唔好填小朋友姓名、班別、地址或相片**。
- 無出席／考章資料，無帳戶，無 cookie；提交內容**唔會寫入本機儲存**。
- 領袖如要留聯絡方法，屬自願欄位（`name`／`contact`）。
- 模板自動帶嘅只有：APP 名、頁面 hash、版本、瀏覽器 User-Agent。**唔會**帶團員名單、出席、獎章紀錄。

---

## 六、測試鎖（`tests/smoke.js` ㉔，12 條）

- `index.html` 有官方 widget 腳本、`data-app="小童軍集會"`、有 `defer`；
- **唔准**用 `data-app="小童軍"`／「幼童軍」／「童軍」／「專章」等單一支部名；
- 手冊有回報卡（`HB.feedbackCard()` 同 `HB.html()` 都見到）、有私隱、有離線做法；
- `App.feedback()` 開到模態、有 `#fb-ta`、有網頁版表單（`report.html?app=…` 已 URL encode）；
- 模板含類別／頁面／版本／裝置，並提醒唔好填小朋友資料；
- `App.copyFeedback()` 同 `_fbCopyFallback()` 存在（剪貼簿失敗要有退路，唔可以靜靜失敗）；
- CSS：浮動掣 `bottom:calc(var(--appfoot-h) + 78px …)`、`min-height:44px`、列印隱藏；`.fb-privacy,.fedb-privacy` 有樣式。

另外 `tools/align-check.mjs` 第 1a–1d 項會靜態檢查同兩件事，其他 MEETING APP 都跑得。

---

## 七、其他 MEETING APP 要照做的最小步驟

1. `index.html` 最後加一行，只改 `data-app`（見第二節表）。
2. 可選：手冊／設定頁加一張「📮 意見回報」卡（照抄 `HB.feedbackCard()` 結構）。
3. `sw.js` 升 `CACHE` 版號，令舊用戶換新（本 APP：`ghub-v5-3-0-unofficial`）。
4. 跑一次 `npm test`，加返「唔准用單一支部名做 `data-app`」的斷言（照抄 ㉔）。
5. 跑 `node tools/align-check.mjs`，確認 1a–1d 全 ✅。

---

## 八、已知限制

- 浮動掣位置係用 `!important` 覆蓋官方 widget 嘅 CSS（官方預設 `bottom:18px`，會蓋住本 APP 嘅 `#tabbar`）。官方若改名（`#scoutw-fab`）就要跟住改。
- 右下角 FAB 同逐步預備嘅「嚮導條」（`#flowbar`）喺同一角，窄機有機會疊；已知，未影響撳得到嘅按鈕。
- 官方 widget 提交用 `mode:'no-cors'`，前端讀唔到回應，只可以靠「有冇拋錯」判斷成功；所以模態提供「複製文字」作為真正可靠嘅退路。
