# 政府採購網爬蟲 V3 分析

這是一個台灣政府電子採購網的自動化招標資料爬蟲，用於自動搜尋、收集並彙整每日的政府標案資訊，最後輸出 Excel 報表並以 Email 寄送。

---

## 核心功能

1. **自動搜尋**：根據可設定的 Solution/關鍵字對應表，在政府採購網 (web.pcc.gov.tw) 上搜尋當日新增的招標公告
2. **驗證碼破解**：遇到撲克牌 CAPTCHA 時，採用 C(6,2)=15 種窮舉法隨機嘗試，無需 AI API
3. **詳細頁爬取**：取得每筆標案的機關資料、採購資料、招標資料等細節
4. **Excel 報表輸出**：彙整所有標案，含標案名稱超連結
5. **Email 自動寄送**：依 Solution 分類統計筆數，附上 Excel 報表寄給指定收件人

---

## 架構說明

| 檔案                 | 角色                                                         |
|----------------------|------------------------------------------------------------|
| `main.py`            | 入口，設定 logging，啟動 asyncio 主流程                     |
| `src/config.py`      | 配置中心：關鍵字對應、URL、過濾條件、Email 設定             |
| `src/scraper_v2.py`  | 主爬蟲引擎（Playwright），含列表頁 + CAPTCHA + 詳細頁流程   |
| `src/detail_parser.py` | 用 BeautifulSoup 解析詳細頁 HTML                            |
| `src/mail_sender.py` | 產生 HTML 郵件並透過 SMTP 寄送                              |
| `keywords_config.xlsx` | 使用者自行維護的關鍵字設定檔（不需改程式碼）              |

---

## 執行流程

`main.py` → `scraper_v2.py` → `detail_parser.py` → 匯出 Excel → `mail_sender.py`

1. **載入關鍵字設定（config.py）**：從 `keywords_config.xlsx` 讀取 Solution 與搜尋關鍵字的對應，若檔案不存在則自動產生
2. **列表頁搜尋（scraper_v2.py:scrape_list_page）**：
   - 每個關鍵字逐一呼叫採購網搜尋 API
   - 解析表格取得機關名稱、標案案號、招標方式、採購性質、預算金額等
   - 依 `FILTER_PROCUREMENT_TYPE`（工程/財物/勞務）過濾
   - 依機關名稱關鍵字進行 AND 過濾
3. **機關名稱搜尋**：針對 `ORG_ONLY_SOLUTIONS`（如「ESG－建研所補助」），直接用機關名稱搜尋而非標案關鍵字
4. **詳細頁爬取（scraper_v2.py:solve_captcha_and_get_detail）**：
   - 前往 detail URL，若遇到撲克牌驗證碼，從 15 種組合中隨機選一個嘗試
   - 失敗則繼續隨機嘗試（伺服器會換新 CAPTCHA）
   - 成功後解析詳細頁 HTML
5. **匯出 Excel**：合併列表頁與詳細頁資料，為標案名稱欄位加上超連結
6. **Email 寄送**：依 Solution 分組統計筆數，以 HTML 表格呈現摘要，附上 Excel

---

## 關鍵設計特點

- **驗證碼窮舉法**：政府採購網的撲克牌驗證碼是從 6 張牌中選 2 張配對（C(6,2)=15 種可能）。由於每次提交失敗後伺服器會刷新驗證碼，程式採用「隨機選 → 提交 → 失敗再換」的策略，期望值約 15 次內通過，完全不需要 OCR 或 AI
- **Excel 驅動設定**：使用者不需要懂 Python，只需編輯 `keywords_config.xlsx` 即可新增/刪除 Solution 和關鍵字
- **Playwright 瀏覽器自動化**：使用真實 Chromium 瀏覽器，設定中文 locale (zh-TW)，避免被 WAF 阻擋
- **Debug 機制**：會將列表頁 row HTML 和未知頁面截圖存到 `output/debug/` 供除錯

---

## 限制與注意事項

- **必須在本機執行**：政府採購網 WAF 會阻擋雲端/VPS IP
- **每日只查當天公告的標案**（`dateType=isNow`）
- **每次請求間隔 2 秒**（`REQUEST_DELAY=2`），完整執行約需數分鐘到數十分鐘（取決於關鍵字數量和標案筆數）
- **郵件密碼直接寫在 config.py 中**（`MAIL_PASSWORD`），安全性不佳
