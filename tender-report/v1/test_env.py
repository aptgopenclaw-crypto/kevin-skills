"""
測試環境配置
"""

import sys
import os

def test_imports():
    """測試所需的包是否已安裝"""
    packages = {
        'requests': 'HTTP 請求庫',
        'bs4': 'HTML 解析庫',
        'pandas': '資料處理庫',
        'openpyxl': 'Excel 支持庫',
        'lxml': 'XML/HTML 解析庫'
    }
    
    print("=" * 60)
    print("測試必需的 Python 套件")
    print("=" * 60 + "\n")
    
    missing = []
    for package, description in packages.items():
        try:
            __import__(package)
            print(f"✓ {package:<15} - {description}")
        except ImportError:
            print(f"✗ {package:<15} - {description} [缺失]")
            missing.append(package)
    
    print("\n測試可選的 Python 套件")
    print("-" * 60 + "\n")
    
    optional = {
        'selenium': 'Selenium WebDriver - 用於 JavaScript 渲染',
    }
    
    for package, description in optional.items():
        try:
            __import__(package)
            print(f"✓ {package:<15} - {description}")
        except ImportError:
            print(f"✗ {package:<15} - {description} [未安裝]")
    
    return missing

def test_config():
    """測試配置檔案"""
    print("\n" + "=" * 60)
    print("測試配置檔案")
    print("=" * 60 + "\n")
    
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
        from config import KEYWORDS, BASE_URL, REQUEST_TIMEOUT, OUTPUT_FILE
        
        print(f"✓ 關鍵字數量: {len(KEYWORDS)}")
        print(f"✓ 基礎 URL: {BASE_URL}")
        print(f"✓ 請求超時: {REQUEST_TIMEOUT} 秒")
        print(f"✓ 輸出檔案: {OUTPUT_FILE}")
        print(f"\n關鍵字清單:")
        for i, keyword in enumerate(KEYWORDS, 1):
            print(f"  {i}. {keyword}")
        
        return True
    except Exception as e:
        print(f"✗ 配置檔案讀取失敗: {e}")
        return False

def test_directories():
    """測試目錄結構"""
    print("\n" + "=" * 60)
    print("測試目錄結構")
    print("=" * 60 + "\n")
    
    directories = {
        'src': '爬蟲代碼目錄',
        'output': '輸出目錄'
    }
    
    for dir_name, description in directories.items():
        if os.path.exists(dir_name):
            print(f"✓ {dir_name:<15} - {description}")
        else:
            print(f"✗ {dir_name:<15} - {description} [不存在]")

def main():
    """主測試函數"""
    print("\n")
    print("  " + "=" * 56)
    print("  政府採購網招標資料爬蟲 - 環境測試")
    print("  " + "=" * 56)
    
    # 測試導入
    missing = test_imports()
    
    # 測試配置
    config_ok = test_config()
    
    # 測試目錄
    test_directories()
    
    # 總結
    print("\n" + "=" * 60)
    print("測試總結")
    print("=" * 60 + "\n")
    
    if missing:
        print(f"⚠ 缺失 {len(missing)} 個必需的套件:")
        print(f"  {', '.join(missing)}")
        print(f"\n請執行以下命令安裝缺失的套件:")
        print(f"  pip install {' '.join(missing)}")
    else:
        print("✓ 所有必需的套件都已安裝")
    
    if config_ok:
        print("✓ 配置檔案正確")
    else:
        print("✗ 配置檔案有問題")
    
    print("\n" + "=" * 60)
    
    if not missing and config_ok:
        print("✓ 環境測試通過，可以開始爬蟲")
        return 0
    else:
        print("✗ 環境測試失敗，請先解決上述問題")
        return 1


if __name__ == "__main__":
    sys.exit(main())
