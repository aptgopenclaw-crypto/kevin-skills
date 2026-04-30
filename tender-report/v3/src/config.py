"""
政府採購網爬蟲 V2 配置
"""
from datetime import date
import os

# 關鍵字清單
KEYWORDS = [
    "節點", "樞紐", "聯線", "連線", "通訊", "洩洪", "溫室", "空品", "能效", "太陽",
    "再生能源", "冰水主機", "空氣品質", "水情", "新風", "公車", "站牌", "AMI", "車路協同",
    "淨零", "號誌", "交控", "儲能", "電網", "節能", "偵測", "測速", "車牌", "取締",
    "違規", "錄影", "充電", "共桿", "共杆", "低碳", "能源", "冷氣", "EMS", "不斷電",
    "碳排放", "路燈", "執法", "監視系統", "AI", "人工智慧", "行車安全", "路口", "辨識",
    "監控", "自動化駕駛", "交通", "瓦斯表", "水表", "人流", "車流", "停車", "電表",
    "5G", "下水道"
]

# 基礎 URL
BASE_URL = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic"
DETAIL_URL = "https://web.pcc.gov.tw/tps/QueryTender/query/searchTenderDetail"

# HTTP 請求標頭
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
}

# 請求超時時間（秒）
REQUEST_TIMEOUT = 30

# 輸出目錄
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, f"{date.today().strftime('%Y%m%d')}招標資料.xlsx")

# 請求間隔（秒）
REQUEST_DELAY = 2

# 過濾：採購性質（空字串 = 不過濾）
FILTER_PROCUREMENT_TYPE = "工程"

# Email 設定（從環境變數讀取，可在此覆蓋）
MAIL_SMTP_HOST = os.environ.get("O_MAILSER", "smtp.office365.com")
MAIL_SMTP_PORT = int(os.environ.get("O_MAILPORT", "587"))
MAIL_USER = os.environ.get("O_MAILUSER", "fetprivatenetwork@feto365.tw")
MAIL_PASSWORD = os.environ.get("O_MAILPASS", "FET5gpns")
MAIL_ALIAS = os.environ.get("O_ALIAS", "FetIotAlert")
MAIL_RECIPIENTS = [
    "seanwang1@fareastone.com.tw",
    "juchuang@fareastone.com.tw",
    "kevinchang4@fareastone.com.tw",
    "ericyueh1@fareastone.com.tw",
    "sunnychou1@fareastone.com.tw",
]

