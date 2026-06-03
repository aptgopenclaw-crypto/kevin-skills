#!/usr/bin/env python3
"""
政府電子採購網 - 招標查詢爬蟲 + NVIDIA AI 篩選
搜尋條件: 公告日期=當日, 採購性質=勞務類
透過關鍵字預篩 + AI 判斷哪些標案適合軟體工程個人工作者投標
"""

import os
import re
import time
import json
import urllib3
import requests
from datetime import datetime, date
from bs4 import BeautifulSoup, NavigableString
from dotenv import load_dotenv

# 政府電子採購網 SSL 憑證有非標準問題，停用驗證警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 載入 .env
load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

BASE_URL = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic"

# 今日日期 (西元)
today = date.today()
today_str = today.strftime("%Y/%m/%d")


def get_search_params(page=1):
    """產生搜尋參數"""
    return {
        "pageSize": "100",
        "firstSearch": "true",
        "searchType": "basic",
        "isBinding": "N",
        "isLogIn": "N",
        "level_1": "on",
        "orgName": "",
        "orgId": "",
        "tenderName": "",
        "tenderId": "",
        "tenderType": "TENDER_DECLARATION",
        "tenderWay": "TENDER_WAY_ALL_DECLARATION",
        "dateType": "isDate",
        "tenderStartDate": today_str,
        "tenderEndDate": today_str,
        "radProctrgCate": "RAD_PROCTRG_CATE_3",
        "policyAdvocacy": "",
        "d-49738-p": str(page),
    }


def parse_tender_table(soup):
    """解析標案表格，回傳標案列表"""
    tenders = []
    table = soup.find("table", {"id": "tpam"})
    if not table:
        return tenders

    tbody = table.find("tbody")
    if not tbody:
        return tenders

    rows = tbody.find_all("tr")
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 9:
            continue

        # 項次
        idx = cols[0].get_text(strip=True)
        # 機關名稱
        org_name = cols[1].get_text(strip=True)
        # 標案案號 + 標案名稱
        case_td = cols[2]
        case_no = ""
        case_name = ""
        case_link = ""
        # 標案案號在 <br> 之前的文字
        first_text = ""
        for child in case_td.children:
            if hasattr(child, 'name') and child.name == 'br':
                break
            if isinstance(child, NavigableString):
                first_text += child.strip()
        case_no = first_text.strip()
        # 標案名稱: 優先從 <script> 的 pageCode2Img("...") 提取
        script_tag = case_td.find("script")
        if script_tag and script_tag.string:
            name_match = re.search(r'pageCode2Img\("([^"]+)"\)', script_tag.string)
            if name_match:
                case_name = name_match.group(1)
        # 若無 script，嘗試從 <span> 或 <a> 取得（本地 HTML 檔案的情況）
        if not case_name:
            span_tag = case_td.find("span")
            if span_tag:
                case_name = span_tag.get_text(strip=True)
        link_tag = case_td.find("a")
        if link_tag and link_tag.get("href"):
            href = link_tag["href"]
            if href.startswith("http"):
                case_link = href
            else:
                case_link = f"https://web.pcc.gov.tw{href}"
            if not case_name:
                case_name = link_tag.get_text(strip=True)

        # 招標方式
        tender_way = cols[4].get_text(strip=True)
        # 採購性質
        proc_type = cols[5].get_text(strip=True)
        # 公告日期
        announce_date = cols[6].get_text(strip=True)
        # 截止投標
        deadline = cols[7].get_text(strip=True)
        # 預算金額
        budget = cols[8].get_text(strip=True)

        tenders.append({
            "項次": idx,
            "機關名稱": org_name,
            "標案案號": case_no,
            "標案名稱": case_name,
            "連結": case_link,
            "招標方式": tender_way,
            "採購性質": proc_type,
            "公告日期": announce_date,
            "截止投標": deadline,
            "預算金額": budget,
        })

    return tenders


def get_total_pages(soup):
    """從分頁區塊取得總頁數"""
    page_div = soup.find("div", {"id": "displaytagBannerDiv"})
    if not page_div:
        return 1

    # 尋找所有頁碼連結
    page_links = page_div.find_all("a")
    max_page = 1
    for link in page_links:
        title = link.get("title", "")
        match = re.search(r"跳到第\s*(\d+)\s*頁", title)
        if match:
            page_num = int(match.group(1))
            max_page = max(max_page, page_num)
        # 也檢查 pageact (當前頁面)
        if link.get("class") and "pageact" in link.get("class", []):
            try:
                max_page = max(max_page, int(link.get_text(strip=True)))
            except ValueError:
                pass

    return max_page


def scrape_all_tenders():
    """爬取所有頁面的標案"""
    print(f"🔍 搜尋條件: 公告日期={today_str}, 採購性質=勞務類")
    print(f"   URL: {BASE_URL}")
    print()

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    })

    all_tenders = []
    page = 1

    # 取得第一頁，判斷總頁數
    print(f"📄 正在取得第 {page} 頁...")
    params = get_search_params(page)
    resp = session.get(BASE_URL, params=params, timeout=30, verify=False)
    resp.encoding = "utf-8"
    soup = BeautifulSoup(resp.text, "html.parser")

    # 取得總筆數
    pagebanner = soup.find("span", {"id": "pagebanner"})
    if pagebanner:
        total_match = re.search(r"(\d+)", pagebanner.get_text())
        if total_match:
            print(f"   共 {total_match.group(1)} 筆資料")

    total_pages = get_total_pages(soup)
    print(f"   共 {total_pages} 頁")

    tenders = parse_tender_table(soup)
    all_tenders.extend(tenders)
    print(f"   本頁取得 {len(tenders)} 筆")

    # 取得其餘頁面
    for page in range(2, total_pages + 1):
        time.sleep(1)  # 避免過度請求
        print(f"📄 正在取得第 {page} 頁...")
        params = get_search_params(page)
        resp = session.get(BASE_URL, params=params, timeout=30, verify=False)
        resp.encoding = "utf-8"
        soup = BeautifulSoup(resp.text, "html.parser")
        tenders = parse_tender_table(soup)
        all_tenders.extend(tenders)
        print(f"   本頁取得 {len(tenders)} 筆")

    print(f"\n✅ 共取得 {len(all_tenders)} 筆標案")
    return all_tenders


def keyword_filter(tenders):
    """用關鍵字快速篩選出可能與軟體工程相關的標案"""

    it_keywords = [
        '軟體', '系統開發', '系統建置', '程式', '網站', '網頁', '官網',
        '平台', '平臺', 'APP', 'app', 'Web',
        'AI', '機器學習', '深度學習', '大數據', '數據分析',
        '資料庫', '雲端', 'API', 'IoT', '物聯網',
        '資安', '資訊安全', '弱掃', '滲透',
        '數位轉型', '數位',
        '影片', '影音', '動畫', '多媒體',
        '視覺設計', 'UI', 'UX',
    ]

    exclude_keywords = [
        '游泳', '清潔', '保全', '消毒', '除蟲', '園藝', '綠化',
        '營造', '土木', '水電', '電梯', '空調',
        '醫療', '護理', '長照', '照護', '復健',
        '運輸', '搬遷', '物流', '搬運',
        '午餐', '團膳', '餐會', '餐敍',
        '露營', '畢業旅行', '校外教學', '戶外教育', '隔宿',
        '保險', '保養', '洗滌', '清洗', '除鏽', '油漆',
        '監造', '規劃設計監造', '委託設計監造',
        '機房', '佈線', '布線', '設備維護', '設備維修',
        '電腦設備', '硬體', '網路設備',
        '維護保養', '租賃',
        '行銷', '宣傳', '推廣', '展售', '論壇',
        '年會', '研討會', '博覽會', '展覽',
    ]

    matched = []
    for t in tenders:
        name = t['標案名稱']
        if not name:
            continue

        if any(ex in name for ex in exclude_keywords):
            strong_sw = ['軟體開發', '系統開發', '系統建置', '網站建置', '程式開發', 'APP開發']
            if not any(s in name for s in strong_sw):
                continue

        if any(kw in name for kw in it_keywords):
            matched.append(t)

    return matched


def analyze_with_nvidia(tenders):
    """使用 NVIDIA API 對預篩後的標案做最終判斷"""
    print(f"\n🤖 正在使用 AI 對 {len(tenders)} 筆預篩標案做最終判斷...")

    batch_size = 50
    suitable_tenders = []

    for i in range(0, len(tenders), batch_size):
        batch = tenders[i:i + batch_size]
        batch_text = ""
        for t in batch:
            batch_text += (
                f"[{t['項次']}] {t['標案名稱']} | "
                f"機關: {t['機關名稱']} | "
                f"預算: {t['預算金額']} | "
                f"招標方式: {t['招標方式']} | "
                f"截止: {t['截止投標']}\n"
            )

        prompt = f"""你是一位軟體工程自由接案者的投標顧問。以下是已經初步篩選、可能與軟體工程相關的政府標案。

請從中找出「真正適合軟體工程師個人投標」的案件。重點是：案件的核心工作內容必須是「寫程式/開發軟體/建置系統」。

【選入條件】（核心工作必須涉及程式開發或軟體工程）：
- 軟體開發、系統開發/建置
- 網站/網頁開發建置、前後端開發
- APP 開發
- AI/機器學習模型開發
- 資料庫設計建置、數據分析平台開發
- 雲端架構建置、DevOps
- 資安檢測、弱掃、滲透測試（技術面）
- 爬蟲開發、自動化腳本
- 平台/系統客製化開發

【排除條件】（即使名稱有「系統」「平台」字眼也排除）：
- IT 維運/機房維護/網路管理（運維不是開發）
- 硬體採購/安裝/佈線
- 設備租賃（如平台租賃費）
- 活動辦理（研討會、年會、展覽）
- 影片製作、行銷推廣、宣傳計畫、Podcast（非程式工作）
- 行銷、宣傳、推廣類案件（即使有「數位」字眼）
- 顧問/諮詢（除非明確是技術架構顧問）
- 監控系統「維護保養」（非開發）
- 預算超過 500 萬（個人難以承接）
- 數位課程「製作」（是內容製作，非軟體開發）

只回覆 JSON，不要加其他文字：
[
  {{"項次": "N", "理由": "簡短說明"}}
]

若無適合的，回覆 []

標案列表：
{batch_text}"""

        headers = {
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "meta/llama-3.1-8b-instruct",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 4096,
        }

        try:
            resp = requests.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=120,
            )
            resp.raise_for_status()
            result = resp.json()
            content = result["choices"][0]["message"]["content"]

            json_match = re.search(r"\[.*\]", content, re.DOTALL)
            if json_match:
                try:
                    batch_results = json.loads(json_match.group())
                    suitable_tenders.extend(batch_results)
                except json.JSONDecodeError:
                    cleaned = json_match.group()
                    cleaned = re.sub(r'(?<=: ")([^"]*)"([^"]*)"([^"]*")', r'\1\2\3', cleaned)
                    try:
                        batch_results = json.loads(cleaned)
                        suitable_tenders.extend(batch_results)
                    except json.JSONDecodeError as e2:
                        print(f"   ⚠️ JSON 解析失敗第 {i//batch_size + 1} 批: {e2}")

            if i + batch_size < len(tenders):
                time.sleep(2)

        except Exception as e:
            print(f"   ⚠️ AI 分析第 {i//batch_size + 1} 批時發生錯誤: {e}")

    return suitable_tenders


def main():
    print("=" * 70)
    print("  政府電子採購網 - 軟體工程標案篩選工具（關鍵字 + AI）")
    print("=" * 70)
    print()

    # Step 1: 爬取標案列表
    all_tenders = scrape_all_tenders()

    if not all_tenders:
        print("❌ 未取得任何標案資料")
        return

    # 儲存原始資料
    output_file = os.path.join(os.path.dirname(__file__), "tenders_raw.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_tenders, f, ensure_ascii=False, indent=2)
    print(f"💾 原始資料已儲存至: tenders_raw.json")

    # Step 2: 關鍵字預篩
    keyword_matched = keyword_filter(all_tenders)
    print(f"\n🔑 關鍵字預篩: {len(all_tenders)} → {len(keyword_matched)} 筆")

    if not keyword_matched:
        print("⚠️ 關鍵字預篩無結果，今日可能無相關標案。")
        return

    # Step 3: 強制納入 + AI 判斷
    # 明確軟體工程關鍵字組合，直接納入不依賴 AI
    strong_patterns = [
        '網站建置', '網站開發', '網站改版', '網站改善', '網站檢測', '無障礙檢測',
        '系統建置', '系統開發', '系統擴充',
        '軟體開發', '軟體建置', '客製化軟體',
        'APP開發', 'app開發',
        '平台擴充', '平台建置', '平台開發', '平臺擴充', '平臺建置', '平臺開發',
    ]

    force_included = []
    need_ai = []
    for t in keyword_matched:
        name = t['標案名稱']
        if any(p in name for p in strong_patterns):
            t["理由"] = "關鍵字直接匹配"
            force_included.append(t)
        else:
            need_ai.append(t)

    if force_included:
        print(f"\n✅ 強制納入（明確軟體工程）: {len(force_included)} 筆")

    ai_results = analyze_with_nvidia(need_ai) if need_ai else []
    print(f"\n🤖 AI 判斷適合投標: {len(ai_results)} 筆")

    # 合併 AI 結果與原始標案資料
    ai_idx_set = {str(r["項次"]) for r in ai_results}
    ai_reason_map = {str(r["項次"]): r.get("理由", "") for r in ai_results}

    ai_matched = []
    for t in need_ai:
        if str(t["項次"]) in ai_idx_set:
            t["理由"] = ai_reason_map.get(str(t["項次"]), "")
            ai_matched.append(t)

    # 合併，去重
    suitable_idx = set()
    suitable = []
    for t in force_included + ai_matched:
        if t["項次"] not in suitable_idx:
            suitable_idx.add(t["項次"])
            suitable.append(t)

    # 排除預算超過 500 萬的
    suitable = [t for t in suitable if not t["預算金額"] or
                int(t["預算金額"].replace(",", "")) <= 5000000]

    # Step 4: 輸出結果
    print("\n" + "=" * 70)
    print("  📋 適合軟體工程師投標的標案")
    print("=" * 70)

    if not suitable:
        print("\n  今日暫無適合軟體工程師投標的標案。")
    else:
        for item in suitable:
            print(f"\n  [{item['項次']}] {item['標案名稱']}")
            print(f"      機關: {item['機關名稱']}")
            print(f"      預算: {item['預算金額']}")
            print(f"      截止: {item['截止投標']}")
            print(f"      招標方式: {item['招標方式']}")
            print(f"      理由: {item.get('理由', '')}")
            if item["連結"]:
                print(f"      連結: {item['連結']}")

    # 儲存篩選結果
    date_str = today.strftime("%Y-%m-%d")
    result_filename = f"tenders_suitable_{date_str}.json"
    result_file = os.path.join(os.path.dirname(__file__), result_filename)
    with open(result_file, "w", encoding="utf-8") as f:
        json.dump(suitable, f, ensure_ascii=False, indent=2)
    print(f"\n💾 篩選結果已儲存至: {result_filename}")
    print(f"\n共 {len(suitable)} 筆適合投標（共 {len(all_tenders)} 筆勞務類標案）")


if __name__ == "__main__":
    main()
