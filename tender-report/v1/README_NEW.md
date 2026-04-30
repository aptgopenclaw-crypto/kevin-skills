# 政府採購網招標資料爬蟲

此專案用於爬蟲政府採購網的招標資訊，根據指定的關鍵字清單逐一爬取招標資料，並將結果匯出為 Excel 檔案。

## 功能特點

✓ 根據多個關鍵字批量爬蟲招標資料
✓ 支持兩種爬蟲方式：Requests (推薦) 和 Selenium (支持 JavaScript)
✓ 自動構建查詢 URL 並處理參數
✓ 詳細的錯誤處理和日誌輸出
✓ 自動匯出為格式化的 Excel 文件
✓ 模擬瀏覽器 User-Agent，避免被檢測為爬蟲

## 快速開始

### 1. 建立虛擬環境 (Windows)

```
python -m venv venv
venv\Scripts\activate
```

### 2. 安裝依賴

```
pip install -r requirements.txt
```

### 3. 測試環境

```
python test_env.py
```

### 4. 運行爬蟲

```
python main.py
```

## 關鍵字清單

爬蟲默認包含以下 14 個關鍵字：

1. 路燈
2. 充電
3. 安全
4. 站牌
5. 路口
6. 下水道
7. 水情
8. 校園
9. 物聯網
10. 空氣品質
11. 智慧電網
12. 智慧建築
13. 冰水主機
14. 淨零

## 爬蟲方式

### 方式 1：Requests 爬蟲 (推薦)

快速、輕量級，適合爬蟲靜態內容

運行：python src/scraper.py

優點：速度快，資源消耗少，實現簡單
缺點：無法處理需要 JavaScript 渲染的內容

### 方式 2：Selenium 爬蟲

支持 JavaScript 渲染的動態內容

安裝：pip install selenium webdriver-manager
運行：python src/scraper_selenium.py

優點：可以處理動態內容，更接近真實瀏覽器
缺點：速度較慢，資源消耗多

### 方式 3：使用選擇菜單

運行：python main.py

交互式選擇要使用的爬蟲方式。

## 配置

編輯 src/config.py 檔案來自訂設定：

- KEYWORDS：關鍵字清單
- BASE_URL：政府採購網基礎 URL
- REQUEST_TIMEOUT：請求超時時間（秒）
- OUTPUT_FILE：輸出 Excel 檔案名稱

## 輸出結果

爬蟲完成後，將在 output/ 目錄下生成 招標資料.xlsx Excel 文件

### Excel 欄位說明

| 欄位 | 說明 |
|------|------|
| 關鍵字 | 搜尋使用的關鍵字 |
| 抓取時間 | 資料抓取的時間戳記 |
| 招標名稱 | 招標案的正式名稱 |
| 機關 | 主辦招標的政府機關 |
| 公告日期 | 招標公告發佈日期 |
| 預算金額 | 招標案的預算金額 |
| 招標方式 | 招標採用的方式 |

## 項目結構

.
├── main.py                      爬蟲方式選擇器
├── test_env.py                  環境測試腳本
├── requirements.txt             Python 依賴
├── README.md                    本文件
├── INSTALL.md                   詳細安裝指南
├── .gitignore                   Git 忽略規則
├── src/
│   ├── config.py               配置及參數
│   ├── scraper.py              Requests 爬蟲主程序
│   └── scraper_selenium.py     Selenium 爬蟲主程序
└── output/                      輸出檔案目錄
    └── 招標資料.xlsx           爬蟲結果

## 使用示例

### 示例 1：運行標準爬蟲

```
venv\Scripts\activate
python src/scraper.py
```

### 示例 2：修改關鍵字

編輯 src/config.py，修改 KEYWORDS 列表，然後運行爬蟲：

```
python src/scraper.py
```

## 故障排除

### 無法連接到網站

檢查網路連接，檢查防火牆設置

### 缺少依賴包

pip install -r requirements.txt --upgrade

### Selenium 驅動問題

pip install webdriver-manager

### Excel 匯出失敗

pip install openpyxl --upgrade

詳見 INSTALL.md

## 注意事項

1. 開始和結束日期：爬蟲預設查詢昨天的招標資訊
2. 請求頻率：為避免對伺服器造成負擔，各個請求之間有 2 秒延遲
3. User-Agent：已設置合理的瀏覽器 User-Agent 號碼
4. 爬蟲禮儀：請遵守網站的 robots.txt 和使用條款
5. 日誌輸出：所有操作都會被記錄在日誌中

## 許可證

MIT License

## 版本歷史

v1.0 (2026-03-04)
- 初始版本
- 支持 Requests 爬蟲
- 支持 Selenium 爬蟲
- Excel 匯出功能
