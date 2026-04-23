@echo off
REM 一键安装脚本 - Windows
REM 适用于政府采购网爬虫项目

echo ============================================================
echo 政府采购网爬虫 - 一键安装脚本
echo ============================================================
echo.

REM 检查 Python 是否已安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.7+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] 检测到 Python 版本:
python --version
echo.

echo [2/5] 创建虚拟环境...
if not exist venv (
    python -m venv venv
    echo     虚拟环境创建成功
) else (
    echo     虚拟环境已存在
)
echo.

echo [3/5] 激活虚拟环境...
call venv\Scripts\activate.bat
echo.

echo [4/5] 安装基础依赖...
pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo.

echo [5/5] 安装 Selenium 额外依赖（可选）...
pip install webdriver-manager
echo.

echo ============================================================
echo 安装完成！
echo ============================================================
echo.
echo 接下来您可以：
echo.
echo 1. 测试环境配置：
echo    python test_env.py
echo.
echo 2. 测试 Selenium 环境（如果需要使用 Selenium）：
echo    python test_selenium.py
echo.
echo 3. 运行爬虫：
echo    python main.py
echo.
echo 建议：优先使用 Requests 爬虫（选项 1），速度更快更稳定
echo ============================================================
echo.

pause
