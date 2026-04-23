# 政府採購網爬蟲 V2

完整流程：搜尋列表 → 撲克牌驗證碼（Vision AI 辨識）→ 詳細頁 → Excel 報表

## 安裝

```bash
cd v2
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## 設定 API Key

驗證碼辨識需要 Vision AI。設定任一：

```bash
# Anthropic Claude（預設）
export ANTHROPIC_API_KEY="sk-ant-..."

# 或 OpenAI GPT-4V（備用）
export OPENAI_API_KEY="sk-..."
```

## 使用

```bash
# 完整流程（列表 + 驗證碼 + 詳細頁）
python main.py

# 只爬列表頁（不需要驗證碼）
python main.py --list-only

# 無頭模式
python main.py --headless

# 用 OpenAI Vision
python main.py --vision openai
```

## 輸出

- `output/YYYYMMDD招標資料.xlsx` — 完整報表

## 目錄結構

```
v2/
├── main.py              # 入口
├── requirements.txt
├── src/
│   ├── config.py        # 配置（關鍵字、URL、API key）
│   ├── scraper_v2.py    # 主爬蟲（Playwright）
│   ├── detail_parser.py # 詳細頁 HTML 解析
│   └── captcha_solver.py # 撲克牌驗證碼 Vision AI 辨識
└── output/
    └── debug/           # 驗證碼截圖（除錯用）
```

## 注意事項

1. **必須在本機執行**：政府採購網 WAF 會擋雲端 IP
2. **建議非無頭模式**：首次執行可觀察驗證碼辨識是否正確
3. **驗證碼辨識率**：Vision AI 辨識撲克牌準確率約 80-90%，失敗會自動重試 3 次
4. 修改關鍵字：編輯 `src/config.py` 的 `KEYWORDS`
5. 修改過濾條件：編輯 `src/config.py` 的 `FILTER_PROCUREMENT_TYPE`（空字串 = 不過濾）
