"""
詳細頁 HTML 解析器
從政府採購網詳細頁 HTML 中提取結構化資料
"""

from bs4 import BeautifulSoup
import re
import logging

logger = logging.getLogger(__name__)


def parse_detail_page(html: str) -> dict:
    """解析詳細頁 HTML，回傳結構化 dict"""
    soup = BeautifulSoup(html, 'lxml')
    result = {}

    # 解析各區塊表格
    _parse_table_section(soup, '機關資料', result)
    _parse_table_section(soup, '採購資料', result)
    _parse_table_section(soup, '招標資料', result)
    _parse_table_section(soup, '領投開標', result)
    _parse_table_section(soup, '其他', result)

    # 額外用 id 抓特定欄位（更可靠）
    _parse_by_id(soup, result)

    return result


def _parse_table_section(soup: BeautifulSoup, section_name: str, result: dict):
    """解析一個表格區塊（用 summary 屬性定位）"""
    table = soup.find('table', {'summary': section_name})
    if not table:
        return

    rows = table.find_all('tr')
    for row in rows:
        cells = row.find_all('td')
        if len(cells) >= 2:
            # 跳過 rowspan 的分類標題 cell
            label_cell = None
            value_cell = None

            for i, cell in enumerate(cells):
                cls = cell.get('class', [])
                # 標題 cell 的 class 含 tbg_1, tbg_4, tbg_5, tbg_6, tbg_7
                if any(c in cls for c in ['tbg_1', 'tbg_4', 'tbg_5', 'tbg_6', 'tbg_7']):
                    label_cell = cell
                # 值 cell 的 class 含 tbg_2, tbg_4R
                elif any(c in cls for c in ['tbg_2', 'tbg_4R']):
                    value_cell = cell

            if label_cell and value_cell:
                label = _clean_text(label_cell.get_text())
                value = _clean_text(value_cell.get_text())
                if label and value:
                    result[label] = value


def _parse_by_id(soup: BeautifulSoup, result: dict):
    """用特定 HTML id 抓取關鍵欄位（更穩定）"""
    id_map = {
        'fkPmsTenderWay': '招標方式',
        'fkPmsAwardWay': '決標方式',
        'fkTpamTenderStatus': '招標狀態',
        'targetDate': '公告日',
        'isMultipleAward': '是否複數決標',
        'isGovernmentEstimate': '是否訂有底價',
        'fkTpamProperty': '財物採購性質',
        'fkPmsProcurementRange': '採購金額級距',
        'fkTpamHowBid': '辦理方式',
        'fkTpamByLaw': '依據法條',
        'isSensitive': '是否屬敏感性採購',
        'isAffectSec': '是否涉及國家安全',
        'budgetIsPdt': '預算金額是否公開',
        'fuRite': '後續擴充',
        'isGrant': '是否受機關補助',
        'isEcqs': '是否電子報價',
        'isSpecial': '是否屬特殊採購',
        'isReadbidTpam': '是否已辦理公開閱覽',
        'isPackage': '是否屬統包',
        'isCpp': '是否屬共同供應契約採購',
        'isJointProcurement': '是否屬聯合採購',
        'isEngineer': '是否實施技師簽證',
        'nego': '是否採行協商措施',
        'isWait': '是否適用採購法第104/105條',
        'isLaw106': '是否依據採購法第106條',
        'isEobtain': '是否提供電子領標',
        'isEsubmit': '是否提供電子投標',
        'spdt': '截止投標',
        'fkTpamBlang': '投標文字',
        'isPhyObtain': '是否提供現場領標',
        'deptCharge': '機關文件費',
        'systemCharge': '系統使用費',
        'sumCharge': '領標總計費用',
        'adaptLaw': '是否依據採購法第99條',
        'fkPmsExecuteLocation': '履約地點',
        'tenderNameText': '標案名稱',
    }

    for html_id, field_name in id_map.items():
        el = soup.find(id=html_id)
        if el:
            text = _clean_text(el.get_text())
            if text:
                # id 抓到的值優先覆蓋 table 解析的
                result[field_name] = text

    # 預算金額（hidden input）
    budget_input = soup.find('input', {'id': 'budget'})
    if budget_input and budget_input.get('value'):
        result['預算金額(數值)'] = budget_input['value']

    # 開標時間（opdt 可能 display:none，改用文字搜尋）
    opdt_el = soup.find('td', string=re.compile(r'開標時間'))
    if opdt_el:
        next_td = opdt_el.find_next_sibling('td')
        if next_td:
            result['開標時間'] = _clean_text(next_td.get_text())

    # 開標地點
    for td in soup.find_all('td'):
        if '開標地點' in td.get_text():
            next_td = td.find_next_sibling('td')
            if next_td:
                result['開標地點'] = _clean_text(next_td.get_text())
            break


def _clean_text(text: str) -> str:
    """清理文字：去除多餘空白和換行"""
    if not text:
        return ''
    # 去除多餘空白
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_key_fields(detail: dict) -> dict:
    """從完整詳細資料中提取報表需要的關鍵欄位"""
    return {
        '機關代碼': detail.get('機關代碼', ''),
        '機關名稱': detail.get('機關名稱', ''),
        '單位名稱': detail.get('單位名稱', ''),
        '機關地址': detail.get('機關地址', ''),
        '聯絡人': detail.get('聯絡人', ''),
        '聯絡電話': detail.get('聯絡電話', ''),
        '電子郵件信箱': detail.get('電子郵件信箱', ''),
        '標案案號': detail.get('標案案號', ''),
        '標案名稱': detail.get('標案名稱', ''),
        '標的分類': detail.get('標的分類', ''),
        '採購金額級距': detail.get('採購金額級距', ''),
        '辦理方式': detail.get('辦理方式', ''),
        '預算金額': detail.get('預算金額', detail.get('預算金額(數值)', '')),
        '招標方式': detail.get('招標方式', ''),
        '決標方式': detail.get('決標方式', ''),
        '招標狀態': detail.get('招標狀態', ''),
        '公告日': detail.get('公告日', ''),
        '截止投標': detail.get('截止投標', ''),
        '開標時間': detail.get('開標時間', ''),
        '開標地點': detail.get('開標地點', ''),
        '是否訂有底價': detail.get('是否訂有底價', ''),
        '履約地點': detail.get('履約地點', ''),
    }
