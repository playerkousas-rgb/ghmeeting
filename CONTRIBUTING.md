# CONTRIBUTING

1. 開分支（`arena/<id>-ghmeeting` 或 `fix/...`），一件事一條分支。
2. 改完跑 `npm ci && npm test`（smoke 404＋ui 12 頁＋audit 0 問題＋regression 18＋align 16）。
3. 版號四處同步（APP_VERSION／meta／CACHE／package.json）。
4. 文件同日更新（README 數字唔可以落後代碼）。
5. 開 PR 去 main；CI 綠先merge。合併後刪分支。
6. 官方內容唔改寫；用戶資料唔可以拼入 onclick（用 data-*＋事件綁定）。
