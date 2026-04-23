"""
政府採購網爬蟲 V2 配置
"""
from datetime import date
import os

# 關鍵字清單
KEYWORDS = [
    "路燈", "充電", "安全", "站牌", "路口",
    "下水道", "水情", "淹水", "校園", "物聯網",
    "空氣品質", "智慧電網", "智慧建築", "冰水主機", "淨零",
    "不斷電", "能源管理", "電表", "微電網"
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

# 驗證碼重試次數（窮舉模式建議 >= 20，C(6,2)=15 種組合）
CAPTCHA_MAX_RETRIES = 20

# 請求間隔（秒）
REQUEST_DELAY = 2

# 過濾：採購性質（空字串 = 不過濾）
FILTER_PROCUREMENT_TYPE = "工程"

# Vision API（用於驗證碼辨識）
# 優先從環境變數讀取，也可在此直接設定
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# NVIDIA NIM API（已驗證可用）
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "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")
NVIDIA_VISION_MODEL = "google/gemma-4-31b-it"

#tring model = "google/gemma-4-31b-it";

# 預設 Vision provider: "bruteforce" | "nvidia" | "anthropic" | "openai"
# bruteforce = 窮舉法，不需要 AI，嘗試所有 C(6,2)=15 種組合
DEFAULT_VISION_PROVIDER = "bruteforce"
