# 政府採購網爬蟲配置
from datetime import date
import os

# 關鍵字清單
KEYWORDS = [
    "校園"
  
]

# 基礎URL
BASE_URL = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic"

# HTTP 請求標頭
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# 請求超時時間（秒）
REQUEST_TIMEOUT = 30

# 輸出檔案名稱
OUTPUT_FILE = os.path.join("output", f"{date.today().strftime('%Y%m%d')}招標資料.xlsx")
