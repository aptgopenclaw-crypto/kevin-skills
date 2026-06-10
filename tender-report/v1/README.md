# 政府採購網招標資料爬蟲

此專案用於爬蟻政府採購網的招標資訊，並將結果匯出為 Excel 檔案。

## 功能

- 根據指定的關鍵字清單爬蟲招標資料
- 支援多個關鍵字並行處理
- 自動構建查詢URL並發送請求
- 解析HTML回應並提取招標資訊
- 將爬蟲結果匯出為 Excel 檔案

## 關鍵字清單

- 路燈
- 充電
- 安全
- 站牌
- 路口
- 下水道
- 水情
- 校園
- 物聯網
- 空氣品質
- 智慧電網
- 智慧建築
- 冰水主機
- 淨零

## 環境要求

- Python 3.7+
- 見 `requirements.txt` 文件

## 安裝

### 步驟 1：建立虛擬環境

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 步驟 2：安裝依賴

```bash
pip install -r requirements.txt
```

## 使用方法

### 基本使用

```bash
python src/scraper.py
```

## 配置

編輯 `src/config.py` 檔案來自訂設定：

- `KEYWORDS`：關鍵字清單
- `BASE_URL`：政府採購網基礎URL
- `REQUEST_TIMEOUT`：請求超時時間（秒）
- `OUTPUT_FILE`：輸出Excel檔案名稱

## 輸出

爬蟲結果將以 Excel 檔案形式保存在 `output/` 目錄下，檔名為 `招標資料.xlsx`。

### Excel 欄位

- 關鍵字：搜尋使用的關鍵字
- 抓取時間：資料抓取時間
- 機關名稱：主辦機關名稱
- 標案案號：招標案號
- 標案名稱：招標案的正式名稱
- 傳輸次數：標案傳輸次數
- 招標方式：招標採用的方式
- 採購性質：採購類型（工程類/財物類/勞務類）
- 公告日期：招標公告日期
- 截止投標日期：截止投標日期
- 預算金額：招標案預算金額

## 項目結構

```
.
├── src/
│   ├── scraper.py      # 主爬蟲腳本
│   └── config.py       # 配置檔案
├── output/             # 輸出目錄
├── requirements.txt    # Python依賴
└── SKILL.md          # 說明文件
```

## 注意事項

1. **請求頻率**：為避免對伺服器造成負擔，爬蟲在各個請求間有 2 秒延遲
2. **昨日日期**：爬蟲預設搜尋昨天的招標資訊
3. **User-Agent**：已設置合理的 User-Agent 標頭
4. **錯誤處理**：所有錯誤都會被記錄並輸出

## 故障排除

### Selenium 相關問題

**問題：** "Request on loopback from external IP" 或其他 ChromeDriver 錯誤

**解決方案：**
```bash
pip install webdriver-manager
```

詳細說明請參考：[SELENIUM_TROUBLESHOOTING.md](SELENIUM_TROUBLESHOOTING.md)

**建議：** 優先使用 Requests 版本爬蟲（選項 1），更快更穩定。

### 無法連接到網站

- 確認網路連接
- 檢查防火牆和代理設定
- 嘗試更新 User-Agent

### 未找到資料

- 檢查關鍵字是否正確
- 確認日期範圍是否有效
- 網站可能已更改HTML結構，需要調整解析邏輯

### 導入Excel時出錯

- 確認已安裝 `openpyxl`
- 檢查輸出目錄是否存在
- 確認檔案名稱中沒有非法字符

## 許可證

MIT License

## 聯絡

如有問題或建議，歡迎提交 Issue 或 Pull Request。
