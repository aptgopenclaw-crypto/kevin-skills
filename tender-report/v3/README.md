# 政府採購網爬蟲 V3

完整流程：搜尋列表 → 撲克牌驗證碼（C(6,2) 窮舉法）→ 詳細頁 → Excel 報表

## 安裝

```bash
cd v3
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## 使用

```bash
# 完整流程（列表 + 驗證碼 + 詳細頁）
python main.py

# 只爬列表頁（不需要驗證碼）
python main.py --list-only

# 無頭模式
python main.py --headless
```

## 維護關鍵字（不需要改程式碼）

**首次執行後**，v3 目錄下會自動產生 `keywords_config.xlsx`，包含兩個工作表：

| 工作表 | 用途 |
|---|---|
| **關鍵字設定** | 維護 Solution 名稱與對應的標案搜尋關鍵字 |
| **機關過濾** | 設定特定 Solution 的機關名稱過濾條件 |

### 關鍵字設定工作表

| Solution名稱 | 關鍵字 |
|---|---|
| 智慧三表 | 瓦斯表 |
| 智慧三表 | 水表 |
| 路燈 | 路燈 |
| ... | ... |

- 同一個 Solution 可填多列（一個關鍵字一列）
- 新增 Solution：直接新增列，填入名稱與關鍵字
- 刪除關鍵字：刪除對應列

### 機關過濾工作表

| Solution名稱 | 機關關鍵字 | 僅機關搜尋 |
|---|---|---|
| 交通－ITS | 交通 | 否 |
| ESG－建研所補助 | 警察專科學校 | 是 |

- **機關關鍵字**：標案的機關名稱需包含此關鍵字才納入報表
- **僅機關搜尋**：填 `是` 時，改以機關名稱逐一搜尋（不使用標案名稱關鍵字）

> 存檔後重新執行程式即生效，無需修改任何程式碼。

## 輸出

- `output/YYYYMMDD招標資料.xlsx` — 完整報表

## 目錄結構

```
v3/
├── main.py                  # 入口
├── requirements.txt
├── keywords_config.xlsx     # 使用者自行維護的關鍵字設定（首次執行後自動產生）
├── src/
│   ├── config.py            # 系統配置（URL、Email 等；關鍵字由 Excel 載入）
│   ├── scraper_v2.py        # 主爬蟲（Playwright）
│   └── detail_parser.py    # 詳細頁 HTML 解析
└── output/
    └── debug/               # 驗證碼截圖（除錯用）
```

## 注意事項

1. **必須在本機執行**：政府採購網 WAF 會擋雲端 IP
2. **建議非無頭模式**：首次執行可觀察驗證碼辨識是否正確
3. **驗證碼破解**：使用 C(6,2)=15 種窮舉組合，不需要 AI API
4. 修改關鍵字：編輯 `keywords_config.xlsx`（程式啟動時自動讀取）
5. 修改採購性質過濾：編輯 `src/config.py` 的 `FILTER_PROCUREMENT_TYPE`
