"""
政府採購網爬蟲 V3 配置
"""
from datetime import date
import os
from collections import OrderedDict

# Solution 與關鍵字對照表
SOLUTION_KEYWORD_MAP = OrderedDict([
    ("智慧三表", ["瓦斯表", "水表", "AMI", "電表"]),
    ("共杆", ["節點", "樞紐", "共桿", "共杆"]),
    ("路燈", ["路燈"]),
    ("水情", ["洩洪", "水情", "下水道"]),
    ("空氣品質", ["空品", "空氣品質"]),
    ("班班（中小學）", ["新風", "冷氣", "EMS"]),
    ("充電樁", ["充電", "停車"]),
    ("交通－站牌", ["公車", "站牌"]),
    ("交通－號誌不斷電", ["不斷電"]),
    ("交通－ITS", ["車路協同", "號誌", "交控", "行車安全", "路口", "自動化駕駛", "交通", "人流", "車流"]),
    ("CCTV", ["執法", "監視系統", "辨識", "偵測", "測速", "車牌", "取締", "違規", "錄影"]),
    ("ESG－淨零及節能", ["溫室", "能效", "冰水主機", "碳排放", "低碳", "能源", "淨零", "節能"]),
    ("ESG－微電網及儲能", ["儲能", "電網", "太陽", "再生能源"]),
    ("IoT相關", ["聯線", "連線", "通訊", "AI", "人工智慧", "監控", "5G"]),
])

# 從 SOLUTION_KEYWORD_MAP 自動產生關鍵字清單（去重保序）
KEYWORDS = []
for _kws in SOLUTION_KEYWORD_MAP.values():
    for _kw in _kws:
        if _kw not in KEYWORDS:
            KEYWORDS.append(_kw)

# 關鍵字 → Solution 反查表
KEYWORD_TO_SOLUTION = {}
for _sol, _kws in SOLUTION_KEYWORD_MAP.items():
    for _kw in _kws:
        KEYWORD_TO_SOLUTION[_kw] = _sol

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
MAIL_ALIAS = os.environ.get("O_ALIAS", "政府採購公告")
MAIL_RECIPIENTS = [
    "kevinchang4@fareastone.com.tw",
]
