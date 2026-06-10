# 政府採購網招標資料爬蟲 - 安裝和使用指南

## 🚀 快速安裝 (Windows)

如果您使用 Windows，可以使用一鍵安裝腳本：

```bash
install.bat
```

這將自動完成所有安裝步驟。

---

## 📋 Selenium 問題快速修復

如果遇到 Selenium 相關錯誤（如 "Request on loopback from external IP"），請執行：

```bash
pip install webdriver-manager
```

或參考 [SELENIUM_TROUBLESHOOTING.md](SELENIUM_TROUBLESHOOTING.md) 獲取詳細說明。

**建議**：優先使用 Requests 爬蟲（選項 1），更快更穩定。

---

## 安裝步驟

### 步驟 1：檢查 Python 版本

確保您已安裝 Python 3.7 或更高版本。在終端中執行：

```bash
python --version
或
python3 --version
```

### 步驟 2：建立虛擬環境 (推薦)

使用虛擬環境隔離項目依賴：

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 步驟 3：安裝依賴

在虛擬環境激活的狀態下，執行：

```bash
pip install -r requirements.txt
```

### 步驟 4 (可選)：安裝 Selenium 依賴

如果需要使用 Selenium 爬蟲 (支持 JavaScript 渲染)，還需安裝：

```bash
pip install selenium webdriver-manager
```

## 使用方法

### 方法 1：使用選擇器 (推薦)

```bash
python main.py
```

程序會提示您選擇爬蟲方式：
- 選項 1：使用 Requests (推薦，速度快)
- 選項 2：使用 Selenium (支持 JavaScript 內容)
- 選項 0：退出

### 方法 2：直接運行爬蟲腳本

#### 使用 Requests 版本：

```bash
python src/scraper.py
```

#### 使用 Selenium 版本：

```bash
python src/scraper_selenium.py
```

## 配置說明

編輯 `src/config.py` 檔案來自訂爬蟲設定：

```python
# 關鍵字清單
KEYWORDS = [
    "路燈",
    "充電",
    # ... 其他關鍵字
]

# 爬蟲基礎URL
BASE_URL = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic"

# 請求超時時間（秒）
REQUEST_TIMEOUT = 30

# 輸出 Excel 檔案名稱
OUTPUT_FILE = "output/招標資料.xlsx"
```

## 功能說明

### Requests 爬蟲 (`scraper.py`)

- 速度快，資源消耗少
- 適合爬蟲靜態 HTML 內容
- 支持自動重試和錯誤處理
- 詳細的日誌輸出

**優點：**
- 快速
- 輕量級
- 適合大量數據爬蟲

**缺點：**
- 無法處理需要 JavaScript 渲染的內容

### Selenium 爬蟲 (`scraper_selenium.py`)

- 支持 JavaScript 渲染的動態內容
- 模擬真實瀏覽器行為
- 適合複雜的交互式頁面

**優點：**
- 可以處理動態內容
- 更接近真實用戶行為

**缺點：**
- 較慢
- 資源消耗較多
- 需要安裝 ChromeDriver

## 輸出結果

爬蟲完成後，將在 `output/` 目錄下生成 `招標資料.xlsx` Excel 文件。

### Excel 文件說明

| 欄位 | 說明 |
|------|------|
| 關鍵字 | 搜尋使用的關鍵字 |
| 抓取時間 | 資料抓取的時間 |
| 招標名稱 | 招標案的名稱 |
| 機關 | 主辦機關 |
| 公告日期 | 招標公告日期 |
| 預算金額 | 招標案的預算金額 |
| 招標方式 | 招標採用的方式 |

## 故障排除

### 問題 1：無法連接到政府採購網

**可能原因：**
- 網路連接不穩定
- 防火牆或代理阻擋

**解決方案：**
- 檢查互聯網連接
- 檢查防火牆設置
- 使用代理設置

### 問題 2：未找到結果

**可能原因：**
- 關鍵字不符合
- 查詢日期沒有相符數據
- 網站HTML結構已更改

**解決方案：**
- 修改 `config.py` 中的 `KEYWORDS`
- 檢查日期範圍
- 查看網頁源碼並更新HTML解析邏輯

### 問題 3：Excel 導出失敗

**可能原因：**
- 缺少 `openpyxl` 套件
- 輸出目錄不存在
- 文件被其他程序占用

**解決方案：**
- 執行 `pip install openpyxl`
- 手動創建 `output/` 目錄
- 關閉已打開的 Excel 文件

### 問題 4：Selenium 相關錯誤

**可能原因：**
- ChromeDriver 版本不匹配
- Chrome 瀏覽器未安裝

**解決方案：**
- 執行 `pip install webdriver-manager`
- 安裝最新版本的 Google Chrome

## 項目結構

```
.
├── main.py               # 爬蟲選擇器
├── requirements.txt      # Python 依賴列表
├── SKILL.md            # 本文件
├── INSTALL.md           # 安裝指南
├── .gitignore           # Git 忽略規則
├── src/
│   ├── config.py        # 配置檔案
│   ├── scraper.py       # Requests 爬蟲
│   └── scraper_selenium.py  # Selenium 爬蟲
└── output/              # 輸出目錄
    └── 招標資料.xlsx    # 爬蟲結果
```

## 注意事項

1. **請求頻率**：爬蟲在各個請求間有 2 秒延遲，以避免對伺服器造成負擔
2. **User-Agent**：已設置合理的瀏覽器 User-Agent
3. **日期設定**：默認查詢昨天的招標資訊
4. **爬蟲禮儀**：請遵守網站的 robots.txt 和使用條款

## 常用命令

```bash
# 激活虛擬環境
venv\Scripts\activate (Windows)
source venv/bin/activate (macOS/Linux)

# 安裝依賴
pip install -r requirements.txt

# 運行爬蟲
python main.py

# 查看幫助
python -c "from src.scraper import TenderScraper; help(TenderScraper)"

# 反激活虛擬環境
deactivate
```

## 許可證

MIT License

## 聯絡

如有問題或建議，歡迎提交反饋。
