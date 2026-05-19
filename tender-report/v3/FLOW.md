# V3 程式邏輯與流程說明

## 整體架構

```
main.py
├── 設定 logging（console + 日誌檔）
└── 呼叫 scraper_v2.main()
    ├── src/config.py          — 載入關鍵字設定
    ├── src/scraper_v2.py      — 主爬蟲（Playwright）
    │   ├── scrape_list_page() — 搜尋列表頁
    │   ├── solve_captcha_and_get_detail() — 驗證碼 + 詳細頁
    │   └── export_to_excel()  — 輸出報表
    ├── src/detail_parser.py   — 詳細頁 HTML 解析
    └── src/mail_sender.py     — 郵件寄送
```

---

## 主要流程圖

```mermaid
flowchart TD
    A([python main.py]) --> B[設定 logging\nconsole + logs/scraper_*.log]
    B --> C[asyncio.run main]

    C --> D{keywords_config.xlsx\n存在?}
    D -- 否 --> E[自動建立 Excel 範本\n寫入預設關鍵字]
    D -- 是 --> F[從 Excel 載入\nSolution / 關鍵字 / 機關過濾設定]
    E --> G[使用預設關鍵字]
    F --> H{載入成功?}
    H -- 否 --> G
    H -- 是 --> I[使用 Excel 關鍵字]
    G & I --> J[建立 KEYWORDS 列表\n及反查表 KEYWORD_TO_SOLUTION]

    J --> K[啟動 Playwright Chromium\nheadless 依 --headless 參數]

    K --> L{--list-only?}
    L -- 是 --> M[僅執行列表頁爬蟲]
    L -- 否 --> N[完整流程]

    M --> EX
    N --> O[依關鍵字搜尋列表頁\nKEYWORDS 迴圈]
    O --> P[依機關名稱搜尋\nORG_ONLY_SOLUTIONS 迴圈]
    P --> Q[取得每筆標案的詳細頁]
    Q --> EX[匯出 Excel]
    EX --> R[寄送郵件報表]
    R --> S([結束])
```

---

## 1. 設定載入（`src/config.py`）

```mermaid
flowchart TD
    A[import config.py] --> B{keywords_config.xlsx\n存在?}
    B -- 否 --> C[_create_excel_template\n從預設值建立含樣式的 xlsx]
    C --> D[SOLUTION_KEYWORD_MAP = 預設值]
    B -- 是 --> E[_load_from_excel\n讀取兩個工作表]
    E --> F{讀取成功\n且有資料?}
    F -- 否 --> D
    F -- 是 --> G[SOLUTION_KEYWORD_MAP = Excel 值]
    D & G --> H[自動產生\nKEYWORDS 去重有序列表]
    H --> I[自動產生\nKEYWORD_TO_SOLUTION 反查表]
```

**兩個工作表：**

| 工作表 | 欄位 | 用途 |
|---|---|---|
| 關鍵字設定 | Solution名稱、關鍵字 | 標案名稱搜尋關鍵字 |
| 機關過濾 | Solution名稱、機關關鍵字、僅機關搜尋 | 搜尋結果的機關名稱過濾條件 |

---

## 2. 列表頁爬蟲（`scrape_list_page`）

```mermaid
flowchart TD
    A[scrape_list_page\nkeyword 或 org_name] --> B[build_search_url\n含今日日期範圍]
    B --> C[page.goto 搜尋頁\nwait networkidle]
    C --> D{載入成功?}
    D -- 否 --> E[記錄錯誤 回傳空列表]
    D -- 是 --> F[query_selector_all\n找 tr.tb_b2 等列表行]
    F --> G{有資料行?}
    G -- 是 --> H[DEBUG: 儲存第一筆 row HTML\n至 output/debug/]
    H --> I[逐行解析欄位\n機關名稱 標案案號 標案名稱\n採購性質 公告日期 截止投標 預算金額]
    G -- 否 --> J[回傳空列表]
    I --> K[提取 detail URL\n從 a href tpam?pk=]
    K --> L[採購性質過濾\nFILTER_PROCUREMENT_TYPE]
    L --> M{有機關名稱過濾設定\n且非 org 搜尋?}
    M -- 是 --> N[機關名稱 AND 過濾\nSOLUTION_ORG_KEYWORD_MAP]
    M -- 否 --> O[不過濾]
    N & O --> P[回傳過濾後標案列表]
```

**搜尋 URL 結構（`BASE_URL`）：**
- `tenderType=TENDER_DECLARATION`（招標公告）
- `dateType=isNow`（當天）
- `tenderName=<keyword>` 或 `orgName=<org_name>`

---

## 3. 驗證碼破解 + 詳細頁（`solve_captcha_and_get_detail`）

```mermaid
flowchart TD
    A[solve_captcha_and_get_detail\ntender 含 _detail_url] --> B[page.goto detail_url]
    B --> C{頁面包含\n機關資料/招標資料?}
    C -- 是 --> D[直接解析\n無驗證碼]
    D --> K
    C -- 否 --> E{頁面包含\n撲克牌/驗證/A區?}
    E -- 否 --> F[未知頁面\n截圖存 debug/ 回傳 None]
    E -- 是 --> G[開始窮舉法\nall_combos = C 6,2 = 15種]

    G --> H[隨機選一種組合 combo]
    H --> I[取得 B區 6 個 checkbox]
    I --> J{checkbox 數 ≥ 6?}
    J -- 否 --> L[點擊重新整理 繼續]
    L --> H
    J -- 是 --> M[清除所有 checkbox 狀態]
    M --> N[依 combo 點擊對應 label\n共 2 張牌]
    N --> O[點擊確認送出]
    O --> P[等待 networkidle]
    P --> Q{頁面包含\n機關資料/招標資料?}
    Q -- 是 --> R[驗證碼通過\n記錄嘗試次數]
    R --> K[parse_detail_page 解析 HTML]
    Q -- 否 --> S{還在\nCAPTCHA 頁?}
    S -- 是 --> H
    S -- 否 --> T[未知結果 繼續]
    T --> H

    K --> U[回傳結構化 dict]
```

**撲克牌驗證碼原理：**
- 頁面顯示 A 區（題目牌）和 B 區（6 張牌，需選出 2 張匹配的）
- 本程式使用**隨機窮舉法**：從 C(6,2)=15 種組合中隨機選一種
- 每次命中率約 1/15（≈6.7%），期望嘗試次數約 15 次
- 伺服器每次提交失敗後會更換驗證碼，程式持續重試

---

## 4. 詳細頁解析（`src/detail_parser.py`）

```mermaid
flowchart TD
    A[parse_detail_page html] --> B[BeautifulSoup lxml 解析]
    B --> C[_parse_table_section\n解析 summary=機關資料]
    C --> D[_parse_table_section\n解析 summary=採購資料]
    D --> E[_parse_table_section\n解析 summary=招標資料]
    E --> F[_parse_table_section\n解析 summary=領投開標]
    F --> G[_parse_table_section\n解析 summary=其他]
    G --> H[_parse_by_id\n用 HTML id 精確抓取欄位\n共約 40 個 id]
    H --> I[回傳完整 result dict]
    I --> J[extract_key_fields\n篩選報表需要的 22 個欄位]
```

**`_parse_table_section` 邏輯：**
- 找 `table[summary=區塊名稱]`
- 逐 `<tr>` 解析 label cell（class: tbg_1/4/5/6/7）和 value cell（class: tbg_2/tbg_4R）
- `_parse_by_id` 的結果會**覆蓋** table 解析的同名欄位（更可靠）

---

## 5. Excel 匯出（`export_to_excel`）

```mermaid
flowchart TD
    A[export_to_excel] --> B[整理 export_rows\n合併列表頁 + 詳細頁資料]
    B --> C[DataFrame → xlsx\nsheet=招標資料]
    C --> D[_style_excel 套用樣式]
    D --> E[細框線 + 標題列綠底]
    E --> F[標案名稱欄位加超連結\n連結到詳細連結欄位 URL]
    F --> G[自動欄寬 max 50 字元]
    G --> H[儲存 output/YYYYMMDD招標資料.xlsx]
```

**輸出欄位（共 28 欄）：**

| 來源 | 欄位 |
|---|---|
| 列表頁 | 項次、相關的Solution、關鍵字、機關名稱、標案案號、標案名稱、傳輸次數、招標方式、採購性質、公告日期、截止投標、預算金額、詳細連結 |
| 詳細頁 | 機關代碼、單位名稱、機關地址、聯絡人、聯絡電話、電子郵件信箱、標的分類、採購金額級距、辦理方式、決標方式、招標狀態、開標時間、開標地點、是否訂有底價、履約地點 |

---

## 6. 郵件寄送（`src/mail_sender.py`）

```mermaid
flowchart TD
    A[send_report_email\nexcel_path keyword_counts total] --> B[build_summary_html\n依 Solution 彙總各關鍵字筆數]
    B --> C[產生 HTML 表格\n依筆數降冪排列]
    C --> D[建立 MIME multipart 郵件\n附加 Excel 檔案]
    D --> E[SMTP 連線寄送\nMAIL_SMTP_HOST:MAIL_SMTP_PORT]
    E --> F{寄送成功?}
    F -- 是 --> G[記錄 INFO]
    F -- 否 --> H[記錄 ERROR]
```

---

## 執行模式對照

| 指令 | 行為 |
|---|---|
| `python main.py` | 完整流程：列表頁 + 驗證碼 + 詳細頁 + Excel + 郵件 |
| `python main.py --headless` | 同上，但瀏覽器不顯示視窗 |
| `python main.py --list-only` | 只爬列表頁，不解驗證碼、不取詳細頁、不寄信 |

---

## 檔案輸出

```
v3/
├── logs/
│   └── scraper_YYYYMMDD_HHMMSS.log   # 執行日誌
├── output/
│   ├── YYYYMMDD招標資料.xlsx           # 報表
│   └── debug/
│       ├── list_row_debug_<keyword>.html  # 列表頁第一筆 row（除錯）
│       └── unknown_<案號>.png            # 未知頁面截圖（除錯）
└── keywords_config.xlsx               # 使用者維護的關鍵字設定
```
