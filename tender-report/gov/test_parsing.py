"""
测试 HTML 解析逻辑
使用提供的 HTML 样本测试爬虫解析功能
"""

import sys
import os

# 添加 src 目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from bs4 import BeautifulSoup

# HTML 测试样本（政府采购网实际结构）
test_html = """
<table class="tb_01" id="tpam">
<thead>
<tr>
<th class="th_b1 g_title no_blank">項次</th>
<th class="th_b2 g_title no_blank sortable">機關名稱</th>
<th class="th_b3 g_title no_blank sortable">標案案號<br>標案名稱</th>
<th class="th_b2 g_title no_blank sortable">傳輸<br>次數</th>
<th class="th_b2 g_title no_blank sortable">招標<br>方式</th>
<th class="th_b2 g_title no_blank sortable">採購<br>性質</th>
<th class="th_b2 g_title no_blank sortable">公告<br>日期</th>
<th class="th_b2 g_title no_blank sortable">截止<br>投標</th>
<th class="th_b3 g_title no_blank sortable">預算<br>金額</th>
<th class="th_b2 g_title no_blank">功能選項</th>
</tr>
</thead>
<tbody>
<tr class="tb_b2">
<td class="no_blank" style="text-align:center;">1</td>
<td>嘉義縣中埔鄉公所</td>
<td>
    1150021
    <br>
    <a href="/prkms/urlSelector/common/tpam?pk=NzExNTk1Nzg=">
        <u><span id="1"><script>var hw = Geps3.CNS.pageCode2Img("Danas-G-07-02-6-中埔鄉轄內縣、鄉道之路燈災害復建工程");$("#1").html(hw);</script></span></u>
    </a>
</td>
<td>
    <a href="/prkms/urlSelector/common/tpam?pk=NzExNTk1Nzg=">
        <u>02</u>
    </a>
</td>
<td>公開取得報價單或企劃書</td>
<td class="no_blank">工程類</td>
<td class="no_blank" style="text-align:center;">115/03/04</td>
<td class="no_blank" style="text-align:center;">115/03/11</td>
<td class="no_blank">
    <span class="no_blank R">629,500</span>
</td>
<td></td>
</tr>
<tr class="tb_b2">
<td class="no_blank" style="text-align:center;">2</td>
<td>雲林縣北港鎮公所</td>
<td>
    1153CT17
    <br>
    <a href="/prkms/urlSelector/common/tpam?pk=ABC123">
        <u>115年度北港鎮路燈材料採購案(開口契約)</u>
    </a>
</td>
<td>
    <a href="/prkms/urlSelector/common/tpam?pk=ABC123">
        <u>01</u>
    </a>
</td>
<td>公開招標</td>
<td class="no_blank">財物類</td>
<td class="no_blank" style="text-align:center;">115/03/04</td>
<td class="no_blank" style="text-align:center;">115/03/23</td>
<td class="no_blank">
    <span class="no_blank R">2,000,000</span>
</td>
<td></td>
</tr>
</tbody>
</table>
"""

def test_parsing():
    """测试解析逻辑"""
    print("=" * 60)
    print("测试政府采购网 HTML 解析")
    print("=" * 60)
    print()
    
    soup = BeautifulSoup(test_html, 'lxml')
    
    # 查找表格
    print("1. 查找表格...")
    table = soup.find('table', {'class': 'tb_01'})
    if table:
        print("   ✓ 找到表格 (class='tb_01')")
    else:
        print("   ✗ 未找到表格")
        return
    
    # 查找 tbody
    print("\n2. 查找 tbody...")
    tbody = table.find('tbody')
    if tbody:
        print("   ✓ 找到 tbody")
    else:
        print("   ✗ 未找到 tbody")
        return
    
    # 查找数据行
    print("\n3. 查找数据行...")
    rows = tbody.find_all('tr')
    print(f"   ✓ 找到 {len(rows)} 行数据")
    
    # 解析每一行
    print("\n4. 解析数据行...")
    print("-" * 60)
    
    for i, row in enumerate(rows, 1):
        print(f"\n数据行 #{i}:")
        cols = row.find_all('td')
        print(f"  欄位數量: {len(cols)}")
        
        if len(cols) >= 9:
            print(f"  [0] 項次: {cols[0].get_text(strip=True)}")
            print(f"  [1] 機關名稱: {cols[1].get_text(strip=True)}")
            
            # 标案案号和名称 - 包含从 script 提取的逻辑
            script_tag = cols[2].find('script')
            tender_name_from_script = None
            
            if script_tag:
                import re
                script_text = script_tag.string
                if script_text:
                    match = re.search(r'Geps3\.CNS\.pageCode2Img\("([^"]+)"\)', script_text)
                    if match:
                        tender_name_from_script = match.group(1)
                        print(f"  [2] 從 Script 提取標案名稱: ✓")
            
            col2_text = cols[2].get_text(separator='\\n').strip()
            lines = [line.strip() for line in col2_text.split('\\n') if line.strip()]
            
            if len(lines) >= 1:
                print(f"  [2] 標案案號: {lines[0]}")
            
            if tender_name_from_script:
                print(f"      標案名稱 (Script): {tender_name_from_script}")
            elif len(lines) >= 2:
                print(f"      標案名稱 (Text): {' '.join(lines[1:])}")
            
            print(f"  [3] 傳輸次數: {cols[3].get_text(strip=True)}")
            print(f"  [4] 招標方式: {cols[4].get_text(strip=True)}")
            print(f"  [5] 採購性質: {cols[5].get_text(strip=True)}")
            print(f"  [6] 公告日期: {cols[6].get_text(strip=True)}")
            print(f"  [7] 截止投標: {cols[7].get_text(strip=True)}")
            print(f"  [8] 預算金額: {cols[8].get_text(strip=True)}")
        else:
            print(f"  ⚠ 欄位數量不足（需要至少 9 個）")
    
    print()
    print("-" * 60)
    print("\n" + "=" * 60)
    print("✓ 解析测试完成")
    print("=" * 60)
    print("\n如果以上输出正确，说明解析逻辑正常工作。")
    print("现在可以运行实际爬虫：")
    print("  python main.py")

if __name__ == "__main__":
    test_parsing()
