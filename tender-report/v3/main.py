"""
政府採購網招標資料爬蟲 V3
完整流程：搜尋列表 → 撲克牌驗證碼（C(6,2) 窮舉法）→ 詳細頁 → Excel 報表
"""

import logging
import os
import sys
from datetime import datetime

# 添加 src 目錄
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# 設定 logging：同時輸出到 console 和 log 檔案
LOG_DIR = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, f"scraper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),                    # console
        logging.FileHandler(log_file, encoding='utf-8'),  # 檔案
    ]
)
logging.getLogger().info(f"Log 檔案: {log_file}")

if __name__ == '__main__':
    import asyncio
    from scraper_v2 import main
    asyncio.run(main())
