# 政府採購網爬蟲項目 - 完整指南

## 項目已建立完成！

您的政府採購網招標資料爬蟲項目已成功建立。

## 項目概要

**功能**：根據 14 個關鍵字逐一爬取政府採購網招標資訊，並導出為 Excel 文件

**關鍵字**：路燈, 充電, 安全, 站牌, 路口, 下水道, 水情, 校園, 物聯網, 空氣品質, 智慧電網, 智慧建築, 冰水主機, 淨零

## 快速開始 (3 步)

### 1. 建立虛擬環境
```
python -m venv venv
venv\Scripts\activate
```

### 2. 安裝依賴
```
pip install -r requirements.txt
```

### 3. 運行爬蟲
```
python main.py
```

## 項目結構

```
d:\python-play\gov\
├── main.py                          # 爬蟲入口 - 交互式選擇
├── test_env.py                      # 環境檢查工具
├── requirements.txt                 # Python 依賴
│
├── SKILL.md                        # 項目說明文檔
├── INSTALL.md                       # 詳細安裝指南
├── QUICKSTART.md                    # 快速啟動命令
├── PROJECT_GUIDE.txt                # 本文件
│
├── src/                             # 爬蟲代碼目錄
│   ├── __init__.py                  # 包初始化文件
│   ├── config.py                    # 配置和參數
│   ├── scraper.py                   # Requests 爬蟲
│   └── scraper_selenium.py          # Selenium 爬蟲
│
├── output/                          # 輸出目錄
│   └── 招標資料.xlsx                # 爬蟻結果（爬蟻後生成）
│
└── .github/
    └── copilot-instructions.md      # GitHub Copilot 說明
```

## 使用方法

### 方法 1：交互式選擇（推薦）

```
python main.py
```

程序會提示選擇：
- 1 = Requests 爬蟻（快速，推薦）
- 2 = Selenium 爬蟻（支持 JavaScript）
- 0 = 退出

### 方法 2：直接運行 Requests 爬蟻

```
python src/scraper.py
```

### 方法 3：直接運行 Selenium 爬蟻

```
pip install selenium webdriver-manager   # 首次需要
python src/scraper_selenium.py
```

## 爬蟻引擎對比

### Requests 爬蟳（推薦）
- 速度：快 ⚡
- 資源消耗：少 🟢
- JavaScript 支持：否
- 開始時間：立即
- 推薦用途：大多數靜態內容

### Selenium 爬蟳
- 速度：慢 🐢
- 資源消耗：多 🔴
- JavaScript 支持：是 ✓
- 開始時間：需要啟動瀏覽器
- 推薦用途：動態內容、複雜互動

## 配置修改

編輯 `src/config.py` 來自訂設定：

```python
# 修改關鍵字
KEYWORDS = [
    "路燈",
    "充電",
    # ... 添加或刪除關鍵字
]

# 修改超時時間
REQUEST_TIMEOUT = 30

# 修改輸出檔案名稱
OUTPUT_FILE = "output/招標資料.xlsx"
```

## 常用命令

```bash
# 激活虛擬環境
venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 測試環境
python test_env.py

# 運行爬蟻
python main.py

# 查看 Python 版本
python --version

# 列出已安裝的包
pip list

# 反激活虛擬環境
deactivate
```

## 輸出結果

爬蟻完成後，會在 `output/招標資料.xlsx` 生成 Excel 文件

### Excel 欄位說明

| 欄位 | 說明 | 範例 |
|------|------|------|
| 關鍵字 | 搜尋使用的關鍵字 | 路燈 |
| 抓取時間 | 抓取資料的時間 | 2026-03-04 10:30:45 |
| 機關名稱 | 主辦機關 | 嘉義縣中埔鄉公所 |
| 標案案號 | 招標案號 | 1150021 |
| 標案名稱 | 招標案的正式名稱 | Danas-G-07-02-6-中埔鄉轄內臉、鄉道之路燈災害復建工程 |
| 傳輸次數 | 標案傳輸次數 | 02 |
| 招標方式 | 招標採用的方式 | 公開取得報價單或企劃書 |
| 採購性質 | 採購類型 | 工程類 |
| 公告日期 | 招標公告日期 | 115/03/04 |
| 截止投標日期 | 截止投標日期 | 115/03/11 |
| 預算金額 | 招標預算 | 629,500 |

## 故障排除

### 問題：無法導入 requests 或其他套件

**解決**：重新安裝依賴
```
pip install -r requirements.txt --upgrade
```

### 問題：無法連接到政府採購網

**解決**：
1. 檢查網路連接
2. 檢查防火牆設置
3. 嘗試代理設置

### 問題：未找到招標資訊

**原因可能**：
- 關鍵字不符合
- 查詢日期沒有相符數據
- 網站 HTML 結構已更改

**解決**：
- 修改 `src/config.py` 中的 `KEYWORDS`
- 檢查日期設置
- 更新 HTML 解析邏輯

### 問題：Excel 導出失敗

**解決**：
```
pip install openpyxl --upgrade
```

## 注意事項

1. **日期設定**：爬蟈預設搜尋昨天的招標資訊
2. **請求頻率**：各個請求間有 2 秒延遲以避免對伺服器造成負擔
3. **User-Agent**：已設置合理的瀏覽器標識
4. **爬蟻禮儀**：請遵守網站使用條款
5. **日誌輸出**：所有操作都會輸出詳細日誌

## 文件說明

- **SKILL.md**：項目概述、功能介紹、使用指南
- **INSTALL.md**：詳細安裝步驟、故障排除、常見問題
- **QUICKSTART.md**：快速啟動命令集合
- **PROJECT_GUIDE.txt**：本文件，完整使用指南
- **requirements.txt**：Python 依賴列表

## 許可證

MIT License

## 版本信息

- **版本**：1.0
- **建立日期**：2026-03-04
- **支持的 Python 版本**：3.7+

## 需要幫助？

1. 查看 SKILL.md 了解基本信息
2. 查看 INSTALL.md 了解詳細安裝步驟
3. 查看 QUICKSTART.md 了解常用命令
4. 執行 `python test_env.py` 測試環境

---

**項目建立完成！開始爬蟈吧！**
