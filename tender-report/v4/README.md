# 政府採購網招標資料爬蟲 V4 (Spring Boot 3)

## 概述

將 Python v2 爬蟲改寫為 Spring Boot 3 Java 版本，支援排程自動執行。

## 技術棧

| 元件 | 技術 |
|------|------|
| 框架 | Spring Boot 3.4 + Java 21 |
| 瀏覽器自動化 | Playwright for Java |
| 驗證碼辨識 | NVIDIA NIM API (google/gemma-4-31b-it) |
| HTML 解析 | Jsoup |
| Excel 輸出 | Apache POI |
| 排程 | Spring @Scheduled |

## 專案結構

```
v4/
├── pom.xml
├── src/main/java/tw/gov/pcc/tender/
│   ├── TenderScraperApplication.java    # 主程式
│   ├── config/
│   │   ├── ScraperProperties.java       # 爬蟲設定
│   │   └── NvidiaProperties.java        # NVIDIA API 設定
│   ├── controller/
│   │   └── ScraperController.java       # REST API（手動觸發）
│   ├── model/
│   │   └── TenderRecord.java            # 標案資料 Model
│   ├── scheduler/
│   │   └── ScraperScheduler.java        # 排程任務
│   └── service/
│       ├── CaptchaSolverService.java    # 撲克牌驗證碼辨識
│       ├── DetailParserService.java     # 詳細頁 HTML 解析
│       ├── ExcelExportService.java      # Excel 匯出
│       ├── ImagePreprocessService.java  # 圖片前處理（去干擾線）
│       └── TenderScraperService.java    # 爬蟲主邏輯
└── src/main/resources/
    └── application.yml                   # 設定檔
```

## 環境需求

- Java 21+
- Maven 3.9+
- 環境變數：`NVIDIA_API_KEY`

## 快速開始

```bash
# 1. 設定 NVIDIA API Key
export NVIDIA_API_KEY="nvapi-xxx"

# 2. 安裝 Playwright 瀏覽器
mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install chromium"

# 3. 編譯
mvn clean compile

# 4. 執行
mvn spring-boot:run
```

## 執行方式

### 自動排程
啟動後會依 `application.yml` 的 `scheduler.cron` 設定自動執行（預設：週一到週五 08:00）。

### REST API 手動觸發
```bash
curl -X POST http://localhost:8080/api/scraper/run
```

### 修改設定
編輯 `src/main/resources/application.yml`：
- `scraper.keywords`: 搜尋關鍵字
- `scraper.headless`: 是否無頭模式
- `nvidia.vision-model`: Vision AI 模型
- `scheduler.cron`: 排程表達式
