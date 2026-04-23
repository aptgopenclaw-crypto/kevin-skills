# 政府採購網招標資料爬蟲

自動爬取[政府電子採購網](https://web.pcc.gov.tw)招標公告，依 19 組智慧城市關鍵字搜尋，並匯出 Excel 報表。

## 專案結構

```
tender-report/
├── gov/          # V1 — Requests / Playwright 爬蟲（早期版本）
├── v2/           # V2 — Playwright + 窮舉驗證碼（推薦使用）
└── example/      # 政府採購網頁面範例 HTML（供開發參考）
```

## 關鍵字清單（19 組）

路燈、充電、安全、站牌、路口、下水道、水情、淹水、校園、物聯網、空氣品質、智慧電網、智慧建築、冰水主機、淨零、不斷電、能源管理、電表、微電網

## V2（推薦）

完整流程：**搜尋列表 → 撲克牌驗證碼 → 詳細頁解析 → Excel 報表**

### 特點

- Playwright 瀏覽器自動化，支援 JavaScript 渲染
- 撲克牌驗證碼支援 **窮舉法**（C(6,2)=15 種組合，無需 AI）及 Vision AI（Anthropic / NVIDIA / OpenAI）
- 自動解析詳細頁，提取 22 個關鍵欄位
- 過濾採購性質（預設：工程類）

### 安裝

```bash
cd v2
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

### 使用

```bash
python main.py                        # 完整流程（預設窮舉法驗證碼）
python main.py --list-only            # 只爬列表頁（不需驗證碼）
python main.py --headless             # 無頭模式
python main.py --vision nvidia        # 改用 NVIDIA Vision AI
python main.py --vision anthropic     # 改用 Anthropic Claude Vision
```

### 驗證碼策略

| 模式 | 說明 | 需要 API Key |
|------|------|:---:|
| `bruteforce` | 窮舉 C(6,2)=15 種組合，同一驗證碼最多 15 次必過 | ✗ |
| `nvidia` | NVIDIA NIM Vision AI（Gemma 4 31B） | ✓ |
| `anthropic` | Anthropic Claude Vision | ✓ |
| `openai` | OpenAI GPT-4o Vision | ✓ |

切換方式：修改 `v2/src/config.py` 的 `DEFAULT_VISION_PROVIDER` 或使用 `--vision` 參數。

### 輸出

`v2/output/YYYYMMDD招標資料.xlsx`

Excel 欄位包含：關鍵字、機關名稱、標案案號、標案名稱、招標方式、採購性質、公告日期、截止投標、預算金額，以及詳細頁的聯絡資訊、履約地點等。

### 設定

編輯 `v2/src/config.py`：

| 設定項 | 說明 | 預設值 |
|--------|------|--------|
| `KEYWORDS` | 搜尋關鍵字清單 | 19 組 |
| `FILTER_PROCUREMENT_TYPE` | 採購性質過濾 | `"工程"` |
| `DEFAULT_VISION_PROVIDER` | 驗證碼策略 | `"bruteforce"` |
| `CAPTCHA_MAX_RETRIES` | 驗證碼最大嘗試次數 | `20` |
| `REQUEST_DELAY` | 請求間隔（秒） | `2` |

---

## V1（gov/）

早期版本，提供兩種爬蟲引擎：

| 引擎 | 說明 |
|------|------|
| Requests + BeautifulSoup | 輕量快速，但可能被 WAF 擋 |
| Playwright | 瀏覽器自動化，支援 CAPTCHA（NVIDIA Vision AI） |

```bash
cd gov
pip install -r requirements.txt
python main.py    # 交互式選擇引擎
```

---

## 注意事項

1. **必須在本機執行** — 政府採購網 WAF 會擋雲端 IP
2. **建議非無頭模式** — 便於觀察驗證碼流程
3. **請求頻率** — 已內建 2 秒延遲，請勿過度頻繁
4. **搜尋範圍** — 預設搜尋當天公告

## 依賴套件

- Python 3.10+
- playwright、beautifulsoup4、lxml、pandas、openpyxl
- （選用）anthropic、openai — 僅 Vision AI 模式需要

## 授權

MIT License
