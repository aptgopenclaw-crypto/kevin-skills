"""
政府採購網招標資料爬蟲 - 選擇器
"""

import os
import sys
import logging

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    print("\n" + "=" * 60)
    print("政府採購網招標資料爬蟲")
    print("=" * 60)
    print("\n請選擇爬蟲方式:")
    print("1. 使用 Requests (快速，但可能被 WAF 擋)")
    print("2. 使用 Playwright (推薦，可過 CAPTCHA)")
    print("0. 退出")
    print()
    
    choice = input("請輸入選擇 (0-2): ").strip()
    
    if choice == '1':
        logger.info("選擇使用 Requests 爬蟲")
        try:
            from scraper import main as scraper_main
            scraper_main()
        except Exception as e:
            logger.error(f"運行爬蟲失敗: {e}")
    elif choice == '2':
        logger.info("選擇使用 Playwright 爬蟲")
        try:
            from scraper_playwright import main as pw_main
            pw_main()
        except Exception as e:
            logger.error(f"運行爬蟲失敗: {e}")
            import traceback
            traceback.print_exc()
    elif choice == '0':
        logger.info("程序退出")
    else:
        logger.error("無效的選擇")


if __name__ == "__main__":
    main()
