# BMS OCR - 台電停電通知解析服務

透過 NVIDIA Vision LLM API，自動辨識台電停電通知圖片，將表格內容結構化為 JSON 資料，並產生 Markdown 報告。

## 功能

- 上傳台電停電通知圖片（PNG、JPG 等格式）
- 呼叫 NVIDIA API（`google/gemma-4-31b-it`）進行視覺辨識
- 自動解析三欄表格：日期、預計停電時間、停電路口
- 處理合併儲存格與多時段資料（自動展開為多筆）
- 回傳結構化 JSON，並將結果存為 Markdown 檔案於 `paper/` 目錄

## 技術架構

| 層次 | 技術 |
|------|------|
| 框架 | Spring Boot 3.4.5 |
| 語言 | Java 21 |
| HTTP 客戶端 | Spring WebFlux (WebClient) |
| AI 模型 | NVIDIA API — `google/gemma-4-31b-it` |
| 序列化 | Jackson |

## 快速開始

### 前置需求

- Java 21+
- Maven 3.8+
- NVIDIA API Key（[申請連結](https://build.nvidia.com/)）

### 設定

在 `backend/src/main/resources/application.yml` 或透過環境變數設定 API Key：

```yaml
nvidia:
  api:
    key: ${NVIDIA_API_KEY}
    base-url: https://integrate.api.nvidia.com/v1
    model: google/gemma-4-31b-it
```

建議使用環境變數以避免金鑰洩漏：

```bash
export NVIDIA_API_KEY=your_api_key_here
```

### 啟動服務

```bash
cd backend
mvn spring-boot:run
```

服務啟動後監聽 `http://localhost:8080`。

## API

### 解析停電通知圖片

**POST** `/api/ocr/parse`

| 參數 | 類型 | 說明 |
|------|------|------|
| `file` | `multipart/form-data` | 台電停電通知圖片（最大 10MB） |

**成功回應範例：**

```json
{
  "success": true,
  "message": "成功解析 5 筆停電通知",
  "notices": [
    {
      "date": "115/04/29",
      "outageTime": "09:00-09:30",
      "outageLocation": "路竹區 中華路/路竹國中"
    },
    {
      "date": "115/04/29",
      "outageTime": "14:30-15:00",
      "outageLocation": "路竹區 中華路/路竹國中"
    }
  ],
  "markdownContent": "# 台電停電通知解析結果\n...",
  "markdownFile": "paper/outage_20260430_111958.md",
  "rawResponse": "..."
}
```

**失敗回應範例：**

```json
{
  "success": false,
  "message": "僅支援圖片格式 (PNG, JPG, etc.)"
}
```

**curl 範例：**

```bash
curl -X POST http://localhost:8080/api/ocr/parse \
  -F "file=@outage_notice.png"
```

## 專案結構

```
backend/
├── pom.xml
├── paper/                          # 解析結果的 Markdown 輸出目錄
└── src/main/
    ├── java/com/bms/ocr/
    │   ├── BmsOcrApplication.java
    │   ├── config/
    │   │   └── WebClientConfig.java        # NVIDIA WebClient 設定
    │   ├── controller/
    │   │   └── OcrController.java          # REST 端點
    │   ├── dto/
    │   │   ├── OcrResult.java              # API 回應結構
    │   │   └── PowerOutageNotice.java      # 單筆停電通知
    │   └── service/
    │       └── OcrService.java             # 核心解析邏輯
    └── resources/
        └── application.yml
```

## 注意事項

- API 超時設定為 180 秒（Vision LLM 推論時間較長）
- 圖片上限為 10MB
- 解析結果同時存入 `backend/paper/` 目錄，檔名格式為 `outage_yyyyMMdd_HHmmss.md`
- 請勿將 API Key 直接寫入版本控制，建議使用環境變數或外部設定檔
