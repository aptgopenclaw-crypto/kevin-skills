"""
驗證碼 AI 模型 Benchmark 測試
測試不同 NVIDIA NIM VLM 模型解撲克牌驗證碼的通過率

每個模型跑 N 輪實際驗證碼，記錄：
- 每輪是否通過
- 第幾次嘗試通過
- 總通過率
"""

import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

from playwright.async_api import async_playwright

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from config import NVIDIA_API_KEY, HEADERS, OUTPUT_DIR
from captcha_solver import solve_captcha_with_nvidia

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# ═══ 測試的模型清單（NVIDIA NIM 上的 VLM / 多模態模型）═══
TEST_MODELS = [
    # 目前使用
    "google/gemma-4-31b-it",
    # NVIDIA 官方
    "nvidia/nemotron-nano-12b-v2-vl",
    "nvidia/cosmos-reason2-8b",
    # Meta Llama
    "meta/llama-3.2-90b-vision-instruct",
    # Qwen
    "qwen/qwen3.5-397b-a17b",
]

# 每個模型測試的輪次（每輪都會嘗試到通過為止）
ROUNDS_PER_MODEL = 5

# 每輪最多嘗試幾次（安全上限，避免無限循環）
MAX_ATTEMPTS_PER_ROUND = 30

# 用於觸發驗證碼的 URL（任意一筆標案 detail URL）
# 會在啟動時從列表頁取得
SEARCH_URL = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?firstSearch=true&searchType=basic&isBinding=N&isLogIn=N&tenderName=%E8%B7%AF%E7%87%88&tenderType=TENDER_DECLARATION&tenderWay=TENDER_WAY_ALL_DECLARATION&dateType=isDate&tenderStartDate=2026/04/01&tenderEndDate=2026/04/29"


async def get_detail_urls(page, count: int = 20) -> list[str]:
    """從列表頁取得多筆 detail URL（確保每輪可用不同的）"""
    await page.goto(SEARCH_URL, wait_until='networkidle', timeout=30000)
    await page.wait_for_timeout(2000)

    # 先找含 tpam?pk= 或 urlSelector 的連結（實際格式）
    links = await page.query_selector_all('a[href*="tpam?pk="], a[href*="urlSelector"]')
    if not links:
        # 嘗試找 text=檢視 的連結
        links = await page.query_selector_all('a:has-text("檢視")')
    if not links:
        # fallback: 找 detail 相關
        links = await page.query_selector_all('a[href*="readTenderDetail"], a[href*="searchTenderDetail"]')
    if not links:
        links = await page.query_selector_all('table a[href]')

    urls = []
    seen = set()
    for link in links:
        href = await link.get_attribute('href')
        if href and href.strip() and href not in seen:
            seen.add(href)
            if href.startswith('/'):
                urls.append(f"https://web.pcc.gov.tw{href}")
            elif href.startswith('http'):
                urls.append(href)
        if len(urls) >= count:
            break

    # 找不到時 dump debug
    if not urls:
        debug_dir = os.path.join(OUTPUT_DIR, "debug")
        os.makedirs(debug_dir, exist_ok=True)
        html = await page.content()
        with open(os.path.join(debug_dir, "benchmark_list_page.html"), 'w', encoding='utf-8') as f:
            f.write(html)
        logger.error(f"  列表頁 HTML 已儲存至 debug/benchmark_list_page.html")

    return urls


async def attempt_captcha(page, model: str, round_num: int = 0) -> dict:
    """
    在當前 CAPTCHA 頁面嘗試用指定模型解驗證碼，直到通過為止。

    Returns:
        {"success": bool, "attempts": int, "error": str or None}
    """
    for attempt in range(1, MAX_ATTEMPTS_PER_ROUND + 1):
        page_text = await page.text_content('body') or ''

        # 確認仍在驗證碼頁
        if '機關資料' in page_text or '招標資料' in page_text or '機關代碼' in page_text:
            return {"success": True, "attempts": attempt - 1, "error": None}

        has_captcha = ('A區' in page_text or '撲克牌' in page_text or
                       '防止惡意程式' in page_text or '驗證' in page_text)
        if not has_captcha:
            return {"success": False, "attempts": attempt, "error": "非驗證碼頁面"}

        # 只截取驗證碼表單區域（減少干擾提高辨識率）
        captcha_form = await page.query_selector('#validateForm')
        if captcha_form:
            screenshot_bytes = await captcha_form.screenshot()
        else:
            # fallback: 整頁截圖
            screenshot_bytes = await page.screenshot(full_page=True)
            logger.warning(f"    找不到 #validateForm，使用整頁截圖")

        # 儲存 debug 截圖
        debug_dir = os.path.join(OUTPUT_DIR, "debug", "benchmark")
        os.makedirs(debug_dir, exist_ok=True)
        model_short = model.replace("/", "_")
        debug_path = os.path.join(debug_dir, f"{model_short}_r{round_num}_a{attempt}.png")
        with open(debug_path, 'wb') as f:
            f.write(screenshot_bytes)

        # 呼叫模型（加入 60 秒超時保護）
        try:
            matches = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: solve_captcha_with_nvidia(
                        image_bytes=screenshot_bytes,
                        api_key=NVIDIA_API_KEY,
                        model=model,
                    )
                ),
                timeout=60
            )
        except asyncio.TimeoutError:
            logger.warning(f"    嘗試 {attempt}: 模型呼叫超時 (60s)")
            matches = []
        except Exception as e:
            logger.warning(f"    模型 {model} 呼叫失敗: {e}")
            matches = []

        if not matches:
            logger.info(f"    嘗試 {attempt}: 模型未回傳結果，重新整理驗證碼")
            refresh_btn = await page.query_selector('text=重新產生')
            if not refresh_btn:
                refresh_btn = await page.query_selector('text=重新整理')
            if refresh_btn:
                await refresh_btn.click()
                await page.wait_for_timeout(2000)
            continue

        # 點擊 B區匹配的牌
        b_checkboxes = await page.query_selector_all('input[name="choose"]')
        if len(b_checkboxes) >= 6:
            # 清除所有 checkbox
            for cb in b_checkboxes:
                await cb.evaluate('el => el.checked = false')

            # 點擊匹配的牌
            for idx in matches:
                if idx < len(b_checkboxes):
                    cb_id = await b_checkboxes[idx].get_attribute('id')
                    if cb_id:
                        label = await page.query_selector(f'label[for="{cb_id}"]')
                        if label:
                            await label.click()
                            await page.wait_for_timeout(300)
                        else:
                            await b_checkboxes[idx].evaluate('el => el.checked = true')
                    else:
                        await b_checkboxes[idx].evaluate('el => el.checked = true')

        # 送出
        submit_btn = await page.query_selector('#b_submit, input[value="確認送出"]')
        if not submit_btn:
            submit_btn = await page.query_selector('button:has-text("送出"), text=確認送出')
        if submit_btn:
            await submit_btn.click()
        else:
            logger.warning(f"    找不到送出按鈕")
            continue

        await page.wait_for_timeout(3000)
        try:
            await page.wait_for_load_state('networkidle', timeout=10000)
        except Exception:
            pass

        # 檢查結果
        new_text = await page.text_content('body') or ''
        if '機關資料' in new_text or '招標資料' in new_text or '機關代碼' in new_text:
            return {"success": True, "attempts": attempt, "error": None}

        # 仍在 CAPTCHA 頁，繼續
        logger.info(f"    嘗試 {attempt}: matches={matches} 未通過")
        # 等待新驗證碼載入完成
        await page.wait_for_timeout(2000)

    return {"success": False, "attempts": MAX_ATTEMPTS_PER_ROUND, "error": "超過最大嘗試次數"}


async def run_benchmark(headless: bool = False, model: str = ""):
    """執行單一模型的 benchmark 測試"""
    if not model:
        logger.error("請指定模型名稱")
        return

    logger.info("=" * 60)
    logger.info("驗證碼 AI 模型 Benchmark 測試")
    logger.info(f"測試模型: {model}")
    logger.info(f"測試輪次: {ROUNDS_PER_MODEL}")
    logger.info(f"每輪最多嘗試: {MAX_ATTEMPTS_PER_ROUND}")
    logger.info(f"Headless: {headless}")
    logger.info("=" * 60)

    results = {}

    pw = await async_playwright().start()
    browser = await pw.chromium.launch(
        headless=headless,
        args=['--no-sandbox', '--disable-blink-features=AutomationControlled']
    )

    # 先用一個臨時 context 取得 detail URLs
    tmp_context = await browser.new_context(
        user_agent=HEADERS['User-Agent'],
        viewport={'width': 1280, 'height': 900},
        locale='zh-TW',
    )
    tmp_page = await tmp_context.new_page()

    # 取得多筆 detail URL
    logger.info("正在從列表頁取得 detail URLs...")
    detail_urls = await get_detail_urls(tmp_page)
    await tmp_context.close()

    if not detail_urls:
        logger.error("無法取得 detail URL，結束測試")
        await browser.close()
        await pw.stop()
        return

    logger.info(f"取得 {len(detail_urls)} 筆 detail URL")

    logger.info("-" * 60)
    logger.info(f"開始測試模型: {model}")
    logger.info("-" * 60)

    model_results = []

    # 使用同一個 context 快速連續訪問來觸發驗證碼
    context = await browser.new_context(
        user_agent=HEADERS['User-Agent'],
        viewport={'width': 1280, 'height': 900},
        locale='zh-TW',
    )
    page = await context.new_page()

    url_index = 0
    round_num = 0

    while round_num < ROUNDS_PER_MODEL:
        # 快速訪問 detail URL 直到觸發驗證碼
        detail_url = detail_urls[url_index % len(detail_urls)]
        url_index += 1

        try:
            await page.goto(detail_url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(1000)
        except Exception as e:
            logger.warning(f"  載入頁面失敗: {e}，換下一筆")
            continue

        page_text = await page.text_content('body') or ''

        # 檢查是否觸發驗證碼
        has_captcha = ('A區' in page_text or '撲克牌' in page_text or
                       '防止惡意程式' in page_text)

        if not has_captcha:
            # 還沒觸發驗證碼，繼續快速訪問下一筆
            logger.info(f"  訪問第 {url_index} 筆 detail URL... 尚未觸發驗證碼")
            # 加快速度，不等太久
            await page.wait_for_timeout(300)
            continue

        # 觸發驗證碼了！開始這一輪測試
        round_num += 1
        logger.info(f"  第 {round_num}/{ROUNDS_PER_MODEL} 輪 — 驗證碼已觸發（第 {url_index} 筆 URL）")

        result = await attempt_captcha(page, model, round_num)
        model_results.append(result)

        status = "✓ 通過" if result["success"] else "✗ 失敗"
        logger.info(f"  第 {round_num} 輪結果: {status}，嘗試次數: {result['attempts']}")

        # 等待一下再繼續
        await asyncio.sleep(2)

        # 安全閥：如果已經訪問太多 URL 都沒觸發更多驗證碼，停止
        if url_index >= len(detail_urls) * 3:
            logger.warning(f"  已訪問 {url_index} 筆 URL，停止測試")
            break

    await context.close()

    results = {model: model_results}

    # 關閉瀏覽器
    await browser.close()
    await pw.stop()

    # ═══ 輸出報告 ═══
    print_report(results)
    save_report(results)


def print_report(results: dict):
    """印出測試報告"""
    print("\n")
    print("=" * 70)
    print("  驗證碼 AI 模型 Benchmark 測試報告")
    print(f"  測試時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  目標：每個模型通過驗證碼需要幾次嘗試")
    print("=" * 70)
    print()
    print(f"{'模型':<45} {'平均次數':<10} {'最少':<6} {'最多':<6} {'全部通過'}")
    print("-" * 85)

    for model, rounds in results.items():
        passed_attempts = [r["attempts"] for r in rounds if r["success"]]
        failed = [r for r in rounds if not r["success"]]

        if passed_attempts:
            avg = sum(passed_attempts) / len(passed_attempts)
            min_a = min(passed_attempts)
            max_a = max(passed_attempts)
            all_pass = "是" if not failed else f"否 ({len(failed)} 輪未通過)"
            print(f"{model:<45} {avg:<10.1f} {min_a:<6} {max_a:<6} {all_pass}")
        else:
            print(f"{model:<45} {'N/A':<10} {'N/A':<6} {'N/A':<6} 全部失敗")

    print()
    print("每輪詳細:")
    print("-" * 85)
    for model, rounds in results.items():
        print(f"\n  {model}:")
        for i, r in enumerate(rounds, 1):
            status = "✓" if r["success"] else "✗"
            if r.get("error") == "no_captcha":
                detail = "無驗證碼（直接通過）"
            elif r["success"]:
                detail = f"第 {r['attempts']} 次通過"
            else:
                detail = f"嘗試 {r['attempts']} 次仍未通過"
                if r.get("error"):
                    detail += f" ({r['error']})"
            print(f"    第 {i} 輪: {status} {detail}")


def save_report(results: dict):
    """儲存測試報告為 JSON"""
    output_dir = os.path.join(os.path.dirname(__file__), "output")
    os.makedirs(output_dir, exist_ok=True)

    report = {
        "test_time": datetime.now().isoformat(),
        "config": {
            "rounds_per_model": ROUNDS_PER_MODEL,
            "max_attempts_per_round": MAX_ATTEMPTS_PER_ROUND,
        },
        "results": {}
    }

    for model, rounds in results.items():
        total = len(rounds)
        passed = sum(1 for r in rounds if r["success"])
        passed_attempts = [r["attempts"] for r in rounds if r["success"] and r["attempts"] > 0]

        report["results"][model] = {
            "total_rounds": total,
            "passed": passed,
            "pass_rate": passed / total if total > 0 else 0,
            "avg_attempts_when_passed": sum(passed_attempts) / len(passed_attempts) if passed_attempts else None,
            "rounds": rounds,
        }

    # 取得模型簡短名稱作檔名
    model_name = list(results.keys())[0] if results else "unknown"
    model_short = model_name.replace("/", "_")

    report_path = os.path.join(output_dir, f"captcha_benchmark_{model_short}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    logger.info(f"報告已儲存: {report_path}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(
        description='驗證碼 AI 模型 Benchmark 測試',
        usage='%(prog)s [--headless] <model_id>\n\n可用模型:\n' +
              '\n'.join(f'  {m}' for m in TEST_MODELS),
    )
    parser.add_argument('model', help='模型 ID，例如 google/gemma-4-31b-it')
    parser.add_argument('--headless', action='store_true', help='無頭模式執行')
    args = parser.parse_args()
    asyncio.run(run_benchmark(headless=args.headless, model=args.model))
