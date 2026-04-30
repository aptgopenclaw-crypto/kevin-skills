# GitHub Copilot 項目說明

此項目是一個政府採購網招標資料爬蟲系統。

## 項目概述

使用 Python 根據指定的關鍵字清單爬取政府採購網 (https://web.pcc.gov.tw/) 的招標資訊，並將結果自動匯出為 Excel 檔案。

## 主要功能

- 支持多個關鍵字的批量爬蟲
- 兩種爬蟲引擎：Requests (快速) 和 Selenium (支持 JavaScript)
- 自動生成格式化的 Excel 報表
- 詳細的日誌和錯誤處理

## 快速開始

1. 激活虛擬環境：venv\Scripts\activate
2. 安裝依賴：pip install -r requirements.txt
3. 測試環境：python test_env.py
4. 運行爬蟲：python main.py

## 專案布局

src/
  - config.py: 配置及關鍵字定義
  - scraper.py: Requests 版爬蟲 (推薦)
  - scraper_selenium.py: Selenium 版爬蟲

output/
  - 輸出 Excel 檔案目錄

main.py
  - 交互式爬蟲選擇器

test_env.py
  - 環境配置檢查工具

## 關鍵詞

路燈, 充電, 安全, 站牌, 路口, 下水道, 水情, 校園, 物聯網, 空氣品質, 智慧電網, 智慧建築, 冰水主機, 淨零

## 重要文檔

- README.md: 項目概述和使用指南
- INSTALL.md: 詳細安裝和故障排除説明
- requirements.txt: Python 依賴列表
