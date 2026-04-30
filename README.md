# Kevin Skills

個人技術專案集，涵蓋 OCR 影像辨識、電子書製作、政府採購網爬蟲等應用。

## 專案總覽

| 專案 | 說明 | 技術棧 |
|------|------|--------|
| [bms-ocr](bms-ocr/) | 台電停電通知 OCR 辨識服務 | Java 21 · Spring Boot 3.4 · NVIDIA NIM Vision API |
| [epub3-project](epub3-project/) | 古典中文書籍 EPUB3 轉換器 | Python 3 · BeautifulSoup4 · EbookLib · Pillow |
| [tender-report](tender-report/) | 政府電子採購網招標資料爬蟲 | Python / Java（共 4 個版本） |

---

## bms-ocr

REST API 服務，上傳台電停電通知圖片後，透過 NVIDIA NIM Vision API 進行 OCR 辨識，自動擷取停電日期、時段、地點等欄位，並產出 Markdown 表格。

- **端點**：`POST /api/ocr/parse`
- **功能**：解析合併儲存格、多時段自動展開為獨立紀錄
- **輸出**：Markdown 檔案存放於 `paper/` 目錄

## epub3-project

從 taolibrary.com 擷取古典中文書籍內容，轉換為符合 EPUB3 標準的電子書，並自動產生封面圖片。

- `make_epub.py`：下載書頁並產生 EPUB
- `gen_cover.py`：產生古風封面（藏青金色漸層、L 型角飾）
- 已產出：《化性談》《孝道》《論語》

## tender-report

爬取**政府電子採購網**，依 19 組智慧城市關鍵字篩選招標公告，匯出 Excel 報表。

> ⚠️ 須於本機執行（政府網站 WAF 會阻擋雲端 IP）

### 版本演進

| 版本 | 語言 | 特色 | 狀態 |
|------|------|------|------|
| **v1** | Python | Requests / BeautifulSoup / Playwright | 已棄用 |
| **v2** | Python | Playwright + Vision AI 驗證碼辨識 | 可用 |
| **v3** | Python | 暴力破解驗證碼（免 AI） | 可用 |
| **v4** | Java | Spring Boot + 排程 + NVIDIA NIM API | 企業版 |

**關鍵字範圍**：路燈、充電、安全、候車亭、路口、下水道、水情、淹水、校園、物聯網、空氣品質、智慧電網、建築、冰水主機、淨零、不斷電、能源管理、智慧電表、微電網

**輸出格式**：`YYYYMMDD招標資料.xlsx`（每筆含 22+ 欄位）

---

## 環境需求

- **Java 專案**：JDK 21+、Maven
- **Python 專案**：Python 3.10+、各專案目錄下的 `requirements.txt`
- **瀏覽器**：tender-report 需安裝 Chromium（Playwright 自動管理）

## 授權

私人專案，僅供內部使用。
