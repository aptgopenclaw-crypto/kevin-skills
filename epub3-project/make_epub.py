#!/usr/bin/env python3
"""
從 taolibrary.com 下載善書並轉換為 EPUB3 格式
用法: python make_epub.py <URL>
範例: python make_epub.py https://taolibrary.com/category/category14/c14077.htm
"""
import sys
import os
import re
import subprocess
from urllib.parse import urljoin
from bs4 import BeautifulSoup, NavigableString
from ebooklib import epub
import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EPUB3_DIR = os.path.join(SCRIPT_DIR, 'epub3')
COVER_DIR = os.path.join(SCRIPT_DIR, 'cover')
os.makedirs(EPUB3_DIR, exist_ok=True)
os.makedirs(COVER_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
}


def fetch_page(url):
    """取得網頁內容，自動處理編碼"""
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.encoding = resp.apparent_encoding
    if resp.status_code != 200:
        print(f"錯誤：無法取得 {url} (HTTP {resp.status_code})")
        sys.exit(1)
    return BeautifulSoup(resp.text, 'lxml')


def strip_formatting(element):
    """移除粗體、斜體等格式，保留純文字內容"""
    for tag in element.find_all(['b', 'strong', 'i', 'em', 'u', 'font', 'span']):
        tag.unwrap()
    return element


def clean_html(html_str):
    """清理 HTML 內容：移除格式標籤、圖片、Office namespace 標籤，保留段落結構"""
    # 先用正則移除 XML namespace 標籤（如 <o:p>, </o:p>, <v:shape> 等）
    html_str = re.sub(r'</?[a-zA-Z]+:[a-zA-Z]+[^>]*/?>', '', html_str)
    # 移除 xmlns 屬性
    html_str = re.sub(r'\s+xmlns:[a-zA-Z]+="[^"]*"', '', html_str)

    soup = BeautifulSoup(html_str, 'lxml')
    # 移除圖片
    for img in soup.find_all('img'):
        img.decompose()
    # 移除格式標籤
    strip_formatting(soup)
    # 取得 body 內容
    body = soup.find('body')
    if body:
        return ''.join(str(child) for child in body.children)
    return str(soup)


def extract_title(soup):
    """從頁面提取書名"""
    # 優先取 <title> 標籤
    title_tag = soup.find('title')
    if title_tag:
        title = title_tag.get_text(strip=True)
        if title and title != '善書圖書館':
            return title
    # 其次取 container 外的 h1（非導航列的 h1）
    header_div = soup.find('div', id='header')
    for h1 in soup.find_all('h1'):
        # 跳過 header 內的 h1
        if header_div and h1.find_parent('div', id='header'):
            continue
        text = h1.get_text(strip=True)
        if text and text != '善書圖書館':
            return text
    return '未知書名'


def extract_author(soup):
    """從頁面提取作者名稱"""
    container = soup.find('div', id='container')
    if not container:
        container = soup

    # 模式1: <h3 align="right"> 內有作者（如 化性談）
    h3_right = container.find('h3', attrs={'align': 'right'})
    if h3_right:
        author = h3_right.get_text(strip=True)
        # 移除「講話」、「著」等後綴來取得純作者名
        author = re.sub(r'(講話|著|編著|編|撰|述|譯|注|校)$', '', author).strip()
        if author:
            return author

    # 模式2: h1 後面的 <p> 含有作者資訊（如 人鑑）
    for h1 in soup.find_all('h1'):
        if h1.find_parent('div', id='header'):
            continue
        for sib in h1.next_siblings:
            if isinstance(sib, NavigableString):
                continue
            if sib.name == 'div' and sib.get('id') == 'container':
                # 在 container 內找
                for child in sib.children:
                    if isinstance(child, NavigableString):
                        continue
                    if child.name in ('p', 'h3'):
                        text = child.get_text(strip=True)
                        # 常見作者格式：「XXX 編著」「XXX 著」等
                        m = re.match(r'^(.+?)\s*(編著|著|編|撰|述|譯|注|校|講話)$', text)
                        if m:
                            return m.group(1).strip()
                    # 遇到章節標題就停止
                    if child.name in ('h2', 'h3') and child.get('id'):
                        break
                break

    # 模式3: container 內第一個 p 或 h3 含有作者
    for tag in container.find_all(['p', 'h3'], limit=5):
        text = tag.get_text(strip=True)
        m = re.match(r'^(.+?)\s*(編著|著|編|撰|述|譯|注|校|講話)$', text)
        if m:
            return m.group(1).strip()

    return '前賢'


def is_multipage(soup, base_url):
    """判斷是否為多頁書籍（目錄頁連結到子頁面）"""
    container = soup.find('div', id='container')
    if not container:
        return False, []

    links = []
    for a in container.find_all('a', href=True):
        href = a['href']
        # 跳過錨點連結（同頁內跳轉）
        if href.startswith('#') or href.startswith('javascript:'):
            continue
        # 只處理 .htm/.html 的相對連結（子頁面）
        if href.endswith(('.htm', '.html')) and not href.startswith('http'):
            full_url = urljoin(base_url, href)
            title = a.get_text(strip=True) or href
            links.append((title, full_url))

    # 如果找到子頁面連結，視為多頁書籍
    if links:
        return True, links
    return False, []


def extract_chapters_single(soup):
    """從單頁書籍提取章節（依 h2 或 h3 切分）"""
    container = soup.find('div', id='container')
    if not container:
        container = soup

    # 移除格式標籤
    strip_formatting(container)

    # 判斷用 h2 還是 h3 分章節
    h2s = container.find_all('h2')
    h3s_with_id = container.find_all('h3', id=True)

    if h2s:
        heading_tag = 'h2'
        headings = h2s
    elif h3s_with_id:
        heading_tag = 'h3'
        headings = h3s_with_id
    else:
        # 沒有明確章節標記，整個內容作為一章
        # 移除目錄區塊
        for items_div in container.find_all('div', class_='items'):
            items_div.decompose()
        for ul in container.find_all('ul'):
            # 如果 ul 只含錨點連結，視為目錄
            links = ul.find_all('a', href=True)
            if links and all(a['href'].startswith('#') or a['href'].startswith('c') for a in links):
                ul.decompose()

        content = ''
        for child in container.children:
            if isinstance(child, NavigableString):
                text = child.strip()
                if text:
                    content += f'<p>{text}</p>\n'
            elif child.name and child.name not in ('script', 'style'):
                if child.name == 'h3' and child.get('align') == 'right':
                    continue  # 跳過作者行
                if child.get('class') and 'items' in child.get('class', []):
                    continue
                content += str(child) + '\n'
        if content.strip():
            return [('全文', content)]
        return []

    chapters = []
    for heading in headings:
        title = heading.get_text(strip=True)
        if not title:
            continue

        content_parts = []
        for sib in heading.next_siblings:
            if sib.name == heading_tag:
                break
            # 遇到下一個 <a name=...> 加 heading 的組合也要停
            if sib.name == 'a' and sib.get('name'):
                next_sib = sib.next_sibling
                while next_sib and isinstance(next_sib, NavigableString) and not next_sib.strip():
                    next_sib = next_sib.next_sibling
                if next_sib and next_sib.name == heading_tag:
                    break

            if isinstance(sib, NavigableString):
                text = sib.strip()
                if text:
                    content_parts.append(f'<p>{text}</p>')
            elif sib.name and sib.name not in ('script', 'style'):
                if sib.name == 'a' and sib.get('name'):
                    continue  # 跳過錨點標記
                content_parts.append(str(sib))

        if content_parts:
            chapters.append((title, '\n'.join(content_parts)))

    return chapters


def extract_chapters_multi(links):
    """從多頁書籍提取章節（每個 URL 為一章）"""
    chapters = []
    for i, (title, url) in enumerate(links):
        print(f"  下載第 {i+1}/{len(links)} 章: {title}")
        try:
            soup = fetch_page(url)
        except Exception as e:
            print(f"    警告：無法下載 {url}: {e}")
            continue

        container = soup.find('div', id='container')
        if not container:
            # 嘗試取 body
            container = soup.find('body')
        if not container:
            continue

        # 移除格式標籤
        strip_formatting(container)

        # 移除圖片
        for img in container.find_all('img'):
            img.decompose()

        content = ''.join(str(child) for child in container.children
                         if not isinstance(child, NavigableString) or child.strip())
        if content.strip():
            chapters.append((title, content))

    return chapters


def build_epub(title, author, chapters, cover_path):
    """建立 EPUB3 檔案"""
    book = epub.EpubBook()
    book.set_identifier(f'taolibrary-{re.sub(r"[^a-zA-Z0-9]", "", title)[:20]}')
    book.set_title(title)
    book.set_language('zh-TW')
    book.add_author(author)

    # 封面圖片
    with open(cover_path, 'rb') as f:
        cover_data = f.read()
    book.set_cover('cover.png', cover_data)

    # CSS
    css = epub.EpubItem(
        uid='style', file_name='style/default.css', media_type='text/css',
        content='''
body { font-family: serif; line-height: 1.8; margin: 1em; }
h1, h2, h3 { text-align: center; }
p { text-indent: 2em; margin: 0.5em 0; }
li { margin: 0.3em 0; }
'''.encode('utf-8'))
    book.add_item(css)

    # 標題頁
    title_page = epub.EpubHtml(title='封面', file_name='title.xhtml', lang='zh-TW')
    title_page.content = f'<h1>{title}</h1><p style="text-align:center;">{author}</p>'
    title_page.add_item(css)
    book.add_item(title_page)

    spine = ['nav', title_page]
    toc = []

    for i, (ch_title, body) in enumerate(chapters):
        # 清理 HTML 內容
        cleaned_body = clean_html(body)
        ch = epub.EpubHtml(title=ch_title, file_name=f'ch{i:03d}.xhtml', lang='zh-TW')
        ch.content = f'<h2>{ch_title}</h2>\n{cleaned_body}'
        ch.add_item(css)
        book.add_item(ch)
        spine.append(ch)
        toc.append(ch)

    book.toc = toc
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = spine

    # 輸出檔案
    safe_title = re.sub(r'[\\/:*?"<>|]', '_', title)
    output_path = os.path.join(EPUB3_DIR, f'{safe_title}.epub')
    epub.write_epub(output_path, book)
    return output_path


def generate_cover(title, author):
    """呼叫 gen_cover.py 產生封面"""
    cover_script = os.path.join(SCRIPT_DIR, 'gen_cover.py')
    safe_title = re.sub(r'[\\/:*?"<>|]', '_', title)
    cover_path = os.path.join(COVER_DIR, f'{safe_title}.png')

    result = subprocess.run(
        [sys.executable, cover_script, title, author, cover_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"封面產生失敗: {result.stderr}")
        sys.exit(1)
    print(result.stdout.strip())
    return cover_path


def main():
    if len(sys.argv) < 2:
        print("用法: python make_epub.py <URL>")
        print("範例: python make_epub.py https://taolibrary.com/category/category14/c14077.htm")
        sys.exit(1)

    url = sys.argv[1]

    # 驗證 URL
    if 'taolibrary.com' not in url:
        print("警告：此程式專為 taolibrary.com 設計，其他網站可能無法正確解析。")

    print(f"正在下載: {url}")
    soup = fetch_page(url)

    # 提取書名與作者
    title = extract_title(soup)
    author = extract_author(soup)
    print(f"書名: {title}")
    print(f"作者: {author}")

    # 判斷單頁或多頁
    multipage, links = is_multipage(soup, url)

    if multipage:
        print(f"偵測到多頁書籍，共 {len(links)} 個章節")
        chapters = extract_chapters_multi(links)
    else:
        print("偵測到單頁書籍，解析章節中...")
        chapters = extract_chapters_single(soup)

    if not chapters:
        print("錯誤：未能提取到任何章節內容")
        sys.exit(1)

    print(f"共提取 {len(chapters)} 個章節")

    # 產生封面
    print("正在產生封面...")
    cover_path = generate_cover(title, author)

    # 建立 EPUB
    print("正在建立 EPUB3...")
    output_path = build_epub(title, author, chapters, cover_path)
    print(f"EPUB 已儲存至: {output_path}")


if __name__ == '__main__':
    main()
