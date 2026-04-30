# 政府採購網爬蟲配置
from datetime import date
import os

# 關鍵字清單
KEYWORDS = [
    "路燈",
    "充電",
    "安全",
    "站牌",
    "路口",
    "下水道",
    "水情",
    "淹水",
    "校園",
    "物聯網",
    "空氣品質",
    "智慧電網",
    "智慧建築",
    "冰水主機",
    "淨零",
    "不斷電",
    "能源管理",
    "電表",
    "微電網"    
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
