#!/usr/bin/env python3
"""
從 taolibrary.com 下載「圖片式直排善書」並轉換為 EPUB3 格式
支援：解析 photo.xml 取圖 + OCR 辨識 + 直排文字重組 + EPUB3 直排樣式
用法: python make_epub_scanned.py <URL> [--horizontal] [--ocr-engine paddle]
範例: 
  python make_epub_scanned.py https://taolibrary.com/category/category89/c89035.htm
  python make_epub_scanned.py https://... --horizontal  # 輸出橫排版本
"""
import sys
import os
import re
import time
import argparse
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, urlparse
from pathlib import Path
from typing import List, Tuple, Optional, Dict
# 基礎套件
from bs4 import BeautifulSoup, NavigableString
from ebooklib import epub
import requests

# OCR 相關（可選，依 --ocr-engine 動態載入）
PADDLE_AVAILABLE = False
try:
    from paddleocr import PaddleOCR
    PADDLE_AVAILABLE = True
except ImportError:
    pass

# 圖片處理
try:
    from PIL import Image, ImageEnhance, ImageFilter
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# 路徑設定
SCRIPT_DIR = Path(__file__).parent.resolve()
EPUB3_DIR = SCRIPT_DIR / 'epub3_scanned'
COVER_DIR = SCRIPT_DIR / 'cover'
TEMP_DIR = SCRIPT_DIR / 'temp_images'
for d in [EPUB3_DIR, COVER_DIR, TEMP_DIR]:
    d.mkdir(exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'}


# ==================== 工具函式 ====================
def log(msg: str, level: str = "INFO"):
    """統一日誌輸出"""
    prefix = {"INFO": "ℹ", "WARN": "⚠", "ERROR": "❌", "DEBUG": "🔍"}.get(level, "•")
    print(f"[{prefix}] {msg}")


def fetch_page_static(url: str) -> Optional[BeautifulSoup]:
    """靜態取得網頁（用於初始解析）"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.encoding = resp.apparent_encoding
        if resp.status_code == 200:
            return BeautifulSoup(resp.text, 'lxml')
        else:
            log(f"HTTP {resp.status_code}: {url}", "ERROR")
    except Exception as e:
        log(f"請求失敗 {url}: {e}", "ERROR")
    return None


# ==================== 從 photo.xml 取得圖片 URL ====================
def extract_book_id(url: str, soup: BeautifulSoup) -> Optional[str]:
    """
    從頁面 HTML 提取書籍 ID（用於定位 photo.xml）
    優先從 <script src="XXXX.js"> 取得，其次從 URL 路徑推斷
    """
    # 方法 1: 從 <script src="cXXXXX.js"> 提取
    for script in soup.find_all('script', src=True):
        src = script['src']
        m = re.search(r'(c\d+)\.js', src)
        if m:
            return m.group(1)
    
    # 方法 2: 從 URL 路徑提取
    m = re.search(r'(c\d+)\.htm', url)
    if m:
        return m.group(1)
    
    return None


def fetch_image_urls_from_xml(
    url: str,
    soup: BeautifulSoup,
    max_pages: int = 250
) -> List[str]:
    """
    解析網站的 photo.xml 取得所有圖片的完整 URL
    taolibrary.com 的圖片存放結構:
      HTML: .../categoryXX/cXXXXX.htm
      JS:   .../categoryXX/cXXXXX.js
      XML:  .../categoryXX/cXXXXX/photo.xml
      圖片: .../categoryXX/cXXXXX/large/N.jpg
    """
    book_id = extract_book_id(url, soup)
    if not book_id:
        log("無法從頁面提取書籍 ID", "ERROR")
        return []
    
    # 構建 photo.xml 的完整 URL
    base_url = url.rsplit('/', 1)[0]  # 去掉最後的 .htm 檔名
    xml_url = f"{base_url}/{book_id}/photo.xml"
    log(f"取得圖片清單: {xml_url}")
    
    try:
        resp = requests.get(xml_url, headers=HEADERS, timeout=30)
        resp.encoding = 'utf-8'
        if resp.status_code != 200:
            log(f"無法取得 photo.xml (HTTP {resp.status_code})", "ERROR")
            return []
        
        root = ET.fromstring(resp.content)
        img_urls = []
        for elem in root.findall('largeImage'):
            rel_path = elem.text.strip() if elem.text else ''
            if rel_path:
                full_url = f"{base_url}/{rel_path}"
                img_urls.append(full_url)
        
        # 限制頁數
        if len(img_urls) > max_pages:
            log(f"共 {len(img_urls)} 張圖片，限制取前 {max_pages} 張")
            img_urls = img_urls[:max_pages]
        
        log(f"✓ 從 photo.xml 取得 {len(img_urls)} 張圖片 URL")
        return img_urls
        
    except ET.ParseError as e:
        log(f"XML 解析失敗: {e}", "ERROR")
    except Exception as e:
        log(f"取得圖片清單失敗: {e}", "ERROR")
    return []


# ==================== 圖片預處理 ====================
def preprocess_image(image_path: str) -> Optional[Image.Image]:
    """圖片預處理：提升 OCR 準確率"""
    if not PIL_AVAILABLE:
        return Image.open(image_path)
    
    try:
        img = Image.open(image_path).convert('L')  # 轉灰階
        
        # 對比度增強
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.3)
        
        # 銳化
        img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=3))
        
        # 二值化（可選，視圖片品質調整）
        # threshold = 128
        # img = img.point(lambda p: 255 if p > threshold else 0)
        
        return img
    except Exception as e:
        log(f"圖片預處理失敗: {e}", "WARN")
        return None


# ==================== OCR 辨識 ====================
class OCRHandler:
    """OCR 處理抽象類別"""
    is_vision_ai: bool = False  # True 表示直接回傳純文字，不需欄位重組
    
    def recognize(self, image_path: str) -> List[Dict]:
        """
        回傳 OCR 結果: [
            {'text': '字', 'bbox': [x1,y1,x2,y2], 'confidence': 0.95},
            ...
        ]
        """
        raise NotImplementedError

    def recognize_text(self, image_path: str) -> str:
        """回傳純文字（僅 vision AI 实現）"""
        raise NotImplementedError


class PaddleOCRHandler(OCRHandler):
    """PaddleOCR 實作"""
    
    def __init__(self, lang: str = 'ch'):
        if not PADDLE_AVAILABLE:
            raise ImportError("PaddleOCR 未安裝，請執行: pip install paddlepaddle paddleocr")
        
        # 初始化模型（首次會自動下載）
        self.ocr = PaddleOCR(
            use_textline_orientation=True,
            lang=lang,
        )
        log("PaddleOCR 模型載入完成")
    
    def recognize(self, image_path: str) -> List[Dict]:
        result = self.ocr.ocr(image_path, cls=True)
        if not result or not result[0]:
            return []
        
        output = []
        for item in result[0]:
            bbox = item[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
            text = item[1][0]
            confidence = item[1][1]
            
            # 轉為 [x1, y1, x2, y2] 格式
            x_coords = [p[0] for p in bbox]
            y_coords = [p[1] for p in bbox]
            x1, x2 = min(x_coords), max(x_coords)
            y1, y2 = min(y_coords), max(y_coords)
            
            output.append({
                'text': text,
                'bbox': [x1, y1, x2, y2],
                'confidence': confidence,
                'center': ((x1+x2)/2, (y1+y2)/2)
            })
        return output


# ==================== NVIDIA Vision AI OCR ====================
class NvidiaVisionOCRHandler(OCRHandler):
    """NVIDIA NIM Vision AI 實作（直接回傳純文字，不需欄位重組）"""
    is_vision_ai = True

    NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
    DEFAULT_MODEL = "nvidia/llama-3.2-90b-vision-instruct"

    def __init__(self, api_key: str, model: str = DEFAULT_MODEL):
        try:
            from openai import OpenAI
            self.client = OpenAI(
                base_url=self.NVIDIA_BASE_URL,
                api_key=api_key,
            )
        except ImportError:
            raise ImportError("openai 未安裝，請執行: pip install openai")

        self.model = model
        log(f"NVIDIA Vision AI 初始化 (model={model})")

    def recognize(self, image_path: str) -> List[Dict]:
        """Vision AI 不使用此方法，請用 recognize_text()"""
        raise NotImplementedError

    def recognize_text(self, image_path: str) -> str:
        """\u5c07圖片以 base64 傳給 NVIDIA Vision API，回傳整理後的直排文字"""
        import base64

        with open(image_path, 'rb') as f:
            img_b64 = base64.standard_b64encode(f.read()).decode('utf-8')

        # 判斷圖片類型
        suffix = Path(image_path).suffix.lower()
        mime = 'image/png' if suffix == '.png' else 'image/jpeg'

        prompt = (
            "請辨識這張圖片中的中文內容。"
            "內容為繁體中文直排書籍，閱讀順序為由右至左、每欄由上至下。"
            "請按正確的閱讀順序輸出所有文字，"
            "不要加入任何解釋、標題或格式符號，只輸出原文內容。"
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{img_b64}"},
                        },
                        {"type": "text", "text": prompt},
                    ],
                }],
                temperature=0.1,
                max_tokens=4096,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            log(f"Vision API 調用失敗: {e}", "ERROR")
            return ""


class TesseractOCRHandler(OCRHandler):
    """Tesseract OCR 實作"""
    
    def __init__(self, lang: str = 'chi_tra_vert'):
        try:
            import pytesseract
            self.pytesseract = pytesseract
            # 需確保系統已安裝 tesseract-ocr 與 chi_tra.traineddata
        except ImportError:
            raise ImportError("pytesseract 未安裝，請執行: pip install pytesseract")
        
        self.lang = lang
        log(f"Tesseract OCR 初始化 (lang={lang})")
    
    def recognize(self, image_path: str) -> List[Dict]:
        # 取得帶有座標的資料
        data = self.pytesseract.image_to_data(
            image_path, 
            lang=self.lang,
            output_type=self.pytesseract.Output.DICT
        )
        
        output = []
        for i in range(len(data['text'])):
            text = data['text'][i].strip()
            if not text:
                continue
            
            confidence = data['conf'][i]
            if confidence < 30:  # 過濾低信心度結果
                continue
                
            output.append({
                'text': text,
                'bbox': [
                    data['left'][i],
                    data['top'][i],
                    data['left'][i] + data['width'][i],
                    data['top'][i] + data['height'][i]
                ],
                'confidence': confidence,
                'center': (
                    data['left'][i] + data['width'][i]/2,
                    data['top'][i] + data['height'][i]/2
                )
            })
        return output


# ==================== 直排文字重組 ====================
def reconstruct_vertical_text(
    ocr_results: List[Dict], 
    image_width: int,
    column_tolerance: float = 0.15  # 欄位寬度容差（佔圖片寬度比例）
) -> str:
    """
    將直排 OCR 結果重組為正確閱讀順序（右→左，每欄上→下）
    
    直排中文閱讀邏輯：
    1. 先分「欄」：依 X 座標群組（右側欄位 X 值較大）
    2. 欄內排序：依 Y 座標由上到下
    3. 欄間排序：依 X 座標由右到左（X 值大的先讀）
    """
    if not ocr_results:
        return ""
    
    # 步驟 1: 估算欄寬（使用中位數文字寬度 × 經驗係數）
    text_widths = [bbox[2]-bbox[0] for bbox in [r['bbox'] for r in ocr_results]]
    if not text_widths:
        return ""
    
    avg_width = sorted(text_widths)[len(text_widths)//2]
    estimated_column_width = avg_width * 1.8  # 直排欄寬約為單字寬 1.5-2 倍
    
    # 步驟 2: 依 X 座標分群（欄位偵測）
    # 使用簡單的分群演算法：若兩文字 X 中心距離 < threshold，視為同一欄
    threshold = estimated_column_width * (1 + column_tolerance)
    
    # 依 X 中心座標排序（先處理右側）
    sorted_by_x = sorted(ocr_results, key=lambda r: r['center'][0], reverse=True)
    
    columns = []  # [[{ocr_item}, ...], ...] 每個元素是一欄的文字列表
    for item in sorted_by_x:
        x_center = item['center'][0]
        placed = False
        
        # 嘗試放入現有欄位
        for col in columns:
            ref_x = col[0]['center'][0]
            if abs(x_center - ref_x) < threshold:
                col.append(item)
                placed = True
                break
        
        # 創建新欄位
        if not placed:
            columns.append([item])
    
    # 步驟 3: 每欄內部依 Y 座標由上到下排序
    for col in columns:
        col.sort(key=lambda r: r['center'][1])
    
    # 步驟 4: 欄位間依「最上方文字的 Y」微調（處理欄頂不對齊）
    columns.sort(key=lambda col: -col[0]['center'][0])  # X 由右到左
    
    # 步驟 5: 串接文字
    paragraphs = []
    for col in columns:
        col_text = "".join(item['text'] for item in col).strip()
        if col_text:
            paragraphs.append(col_text)
    
    # 直排轉為段落：每欄為一段（或依標點進一步斷句）
    return "。".join(paragraphs) + "。" if paragraphs else ""


def reconstruct_horizontal_text(
    ocr_results: List[Dict],
    image_height: int
) -> str:
    """
    [選項 B] 將直排轉為橫排輸出
    邏輯：先分欄（右→左），欄內由上→下，再將每欄轉為橫向段落
    """
    vertical_text = reconstruct_vertical_text(ocr_results, image_height)
    # 簡單轉換：將直排段落直接作為橫排段落（標點需額外處理）
    # 進階實作可加入標點位置調整、斷句優化等
    return vertical_text.replace("。", "。\n")  # 每欄換行


# ==================== EPUB3 建立（支援直排） ====================
def build_epub_scanned(
    title: str,
    author: str,
    chapters: List[Tuple[str, str]],  # [(chapter_title, content_html), ...]
    cover_path: str,
    vertical_mode: bool = True,
    output_dir: Path = EPUB3_DIR
) -> str:
    """建立支援直排的 EPUB3 檔案"""
    
    book = epub.EpubBook()
    book.set_identifier(f'taolibrary-scanned-{re.sub(r"[^a-zA-Z0-9]", "", title)[:20]}')
    book.set_title(title)
    book.set_language('zh-TW')
    book.add_author(author)
    
    # 封面
    with open(cover_path, 'rb') as f:
        cover_data = f.read()
    book.set_cover('cover.png', cover_data)
    
    # CSS 樣式（關鍵：直排支援）
    css_content = '''
body { 
    font-family: "KaiTi", "STKaiti", "BiauKai", serif; 
    line-height: 2.0; 
    margin: 1em; 
    text-align: justify;
}
'''
    if vertical_mode:
        css_content += '''
/* 直排模式 */
.vertical-rl {
    writing-mode: vertical-rl;      /* 由右至左直排 */
    text-orientation: upright;       /* 文字直立（非旋轉） */
    letter-spacing: 0.1em;
}
.vertical-rl p {
    margin: 0 0.5em;
    text-indent: 0;                  /* 直排不需首行縮排 */
}
.vertical-rl h2 {
    writing-mode: horizontal-tb;     /* 標題保持橫排 */
    text-align: center;
    margin: 1em 0;
}
'''
    else:
        css_content += '''
/* 橫排模式 */
p { text-indent: 2em; margin: 0.5em 0; }
h2 { text-align: center; }
'''
    
    css = epub.EpubItem(
        uid='style', 
        file_name='style/default.css', 
        media_type='text/css',
        content=css_content.encode('utf-8')
    )
    book.add_item(css)
    
    # 標題頁
    title_page = epub.EpubHtml(title='封面', file_name='title.xhtml', lang='zh-TW')
    title_class = 'vertical-rl' if vertical_mode else ''
    title_page.content = f'''
<div {f'class="{title_class}"' if vertical_mode else ''}>
    <h1>{title}</h1>
    <p style="text-align:center;">{author}</p>
</div>
'''
    title_page.add_item(css)
    book.add_item(title_page)
    
    spine = ['nav', title_page]
    toc = []
    
    # 章節
    for i, (ch_title, content_text) in enumerate(chapters):
        # 清理並包裝內容
        clean_content = re.sub(r'\s+', ' ', content_text).strip()
        
        ch = epub.EpubHtml(
            title=ch_title, 
            file_name=f'ch{i:03d}.xhtml', 
            lang='zh-TW'
        )
        
        if vertical_mode:
            # 直排：每句/段落用 <p> 包裝，整體用 vertical-rl
            # 簡單斷句：依標點分割
            sentences = re.split(r'([。！？；])', clean_content)
            paragraphs = []
            current = ""
            for s in sentences:
                current += s
                if s in '。！？；':
                    if current.strip():
                        paragraphs.append(f'<p>{current.strip()}</p>')
                    current = ""
            if current.strip():
                paragraphs.append(f'<p>{current.strip()}</p>')
            
            ch.content = f'''
<h2>{ch_title}</h2>
<div class="vertical-rl">
    {''.join(paragraphs)}
</div>
'''
        else:
            # 橫排：一般段落
            paragraphs = re.split(r'\n+', clean_content)
            p_tags = [f'<p>{p.strip()}</p>' for p in paragraphs if p.strip()]
            ch.content = f'<h2>{ch_title}</h2>\n' + '\n'.join(p_tags)
        
        ch.add_item(css)
        book.add_item(ch)
        spine.append(ch)
        toc.append(ch)
    
    # 目錄與導航
    book.toc = toc
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = spine
    
    # 輸出
    safe_title = re.sub(r'[\\/:*?"<>|]', '_', title)
    output_path = output_dir / f'{safe_title}.epub'
    epub.write_epub(str(output_path), book)
    
    return str(output_path)


# ==================== 封面產生（复用原程式） ====================
def generate_cover(title: str, author: str) -> str:
    """呼叫 gen_cover.py 產生封面"""
    cover_script = SCRIPT_DIR / 'gen_cover.py'
    if not cover_script.exists():
        log("gen_cover.py 未找到，使用預設封面", "WARN")
        # 建立簡單文字封面
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGB', (800, 1200), color='#f5f0e6')
        draw = ImageDraw.Draw(img)
        # 嘗試載入中文字型
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/arphic/ukai.ttc", 48)
        except:
            font = ImageFont.load_default()
        draw.text((400, 400), title, fill='#333', font=font, anchor="mm")
        draw.text((400, 500), author, fill='#666', font=font, anchor="mm")
        safe_title = re.sub(r'[\\/:*?"<>|]', '_', title)
        cover_path = COVER_DIR / f'{safe_title}.png'
        img.save(cover_path)
        return str(cover_path)
    
    safe_title = re.sub(r'[\\/:*?"<>|]', '_', title)
    cover_path = COVER_DIR / f'{safe_title}.png'
    
    import subprocess
    result = subprocess.run(
        [sys.executable, str(cover_script), title, author, str(cover_path)],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        log(f"封面產生失敗: {result.stderr}", "WARN")
        # 降級處理...
        return generate_cover(title, author)  # 遞迴呼叫簡易版
    
    print(result.stdout.strip())
    return str(cover_path)


# ==================== 主流程 ====================
def download_images_to_local(img_urls: List[str], output_dir: Path = TEMP_DIR) -> List[str]:
    """下載圖片到本地，回傳本地路徑列表"""
    local_paths = []
    for i, url in enumerate(img_urls):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            if resp.status_code == 200:
                # 從 URL 或 Content-Type 判斷副檔名
                ext = '.jpg'  # 預設
                if 'png' in resp.headers.get('Content-Type', ''):
                    ext = '.png'
                
                local_path = output_dir / f'page_{i+1:03d}{ext}'
                with open(local_path, 'wb') as f:
                    f.write(resp.content)
                local_paths.append(str(local_path))
                log(f"✓ 下載 {i+1}/{len(img_urls)}: {local_path.name}")
                time.sleep(0.5)  # 避免請求過快
        except Exception as e:
            log(f"✗ 下載失敗 {url}: {e}", "WARN")
    return local_paths


def process_scanned_book(
    url: str,
    ocr_engine: str = 'tesseract',
    horizontal_output: bool = False,
    max_pages: int = 250,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
) -> Optional[str]:
    """主處理流程"""
    
    # 步驟 1: 初始解析取得書名/作者
    log(f"初始解析: {url}")
    soup = fetch_page_static(url)
    if not soup:
        return None
    
    # 提取書名與作者（复用原程式邏輯）
    title_tag = soup.find('title')
    title = title_tag.get_text(strip=True) if title_tag else '未知書名'
    if title == '善書圖書館':
        h1 = soup.find('h1')
        title = h1.get_text(strip=True) if h1 else '未知書名'
    
    # 簡單作者提取（可擴充）
    author = '前賢'
    h3_author = soup.find('h3', attrs={'align': 'right'})
    if h3_author:
        author = re.sub(r'(講話|著|編著|編)$', '', h3_author.get_text(strip=True))
    
    log(f"📚 {title} — {author}")
    
    # 步驟 2: 從 photo.xml 取得圖片 URL
    log("🔄 解析 photo.xml 取得圖片清單...")
    img_urls = fetch_image_urls_from_xml(url, soup, max_pages=max_pages)
    if not img_urls:
        log("未取得任何圖片，請檢查選擇器或網站結構", "ERROR")
        return None
    
    # 步驟 3: 下載圖片到本地
    log(f"📥 下載 {len(img_urls)} 張圖片...")
    local_images = download_images_to_local(img_urls)
    
    # 步驟 4: OCR 辨識 + 文字重組
    log(f"🔍 啟動 OCR 辨識 (engine={ocr_engine})...")
    
    # 初始化 OCR
    try:
        if ocr_engine == 'nvidia':
            if not api_key:
                log("--api-key 為必填項（--ocr-engine nvidia）", "ERROR")
                return None
            ocr = NvidiaVisionOCRHandler(
                api_key=api_key,
                model=model or NvidiaVisionOCRHandler.DEFAULT_MODEL,
            )
        elif ocr_engine == 'tesseract':
            ocr = TesseractOCRHandler()
        elif ocr_engine == 'paddle' and PADDLE_AVAILABLE:
            ocr = PaddleOCRHandler()
        else:
            # 預設嘗試 tesseract，再試 paddle
            try:
                ocr = TesseractOCRHandler()
                log("自動使用 Tesseract OCR", "WARN")
            except ImportError:
                if PADDLE_AVAILABLE:
                    ocr = PaddleOCRHandler()
                else:
                    log("無可用 OCR 引擎，請安裝 pytesseract 或 paddleocr", "ERROR")
                    return None
    except Exception as e:
        log(f"OCR 引擎初始化失敗: {e}", "ERROR")
        return None
    
    chapters = []
    for i, img_path in enumerate(local_images):
        log(f"OCR 處理 {i+1}/{len(local_images)}: {os.path.basename(img_path)}")
        
        # 預處理（可選）
        if PIL_AVAILABLE:
            processed = preprocess_image(img_path)
            if processed:
                temp_path = str(TEMP_DIR / f'proc_{os.path.basename(img_path)}')
                processed.save(temp_path)
                img_path = temp_path
        
        # OCR 辨識
        if ocr.is_vision_ai:
            # Vision AI 直接回傳整理後的文字，不需欄位重組
            text = ocr.recognize_text(img_path)
        else:
            ocr_results = ocr.recognize(img_path)

            # 取得圖片尺寸（用於直排重組）
            try:
                with Image.open(img_path) as img:
                    img_w, img_h = img.size
            except:
                img_w, img_h = 1000, 1500  # 預設値

            # 文字重組
            if horizontal_output:
                text = reconstruct_horizontal_text(ocr_results, img_h)
            else:
                text = reconstruct_vertical_text(ocr_results, img_w)
        
        if text.strip():
            chapters.append((f'第 {i+1} 頁', text))
            log(f"  ✓ 辨識完成 → {len(text)} 字")
        else:
            log(f"  ⚠ 未辨識到有效文字", "WARN")
    
    if not chapters:
        log("OCR 未產出任何內容，請檢查圖片品質或 OCR 設定", "ERROR")
        return None
    
    # 步驟 5: 產生封面 + 建立 EPUB
    log("🎨 產生封面...")
    cover_path = generate_cover(title, author)
    
    log(f"📦 建立 EPUB3 ({'直排' if not horizontal_output else '橫排'}模式)...")
    output_path = build_epub_scanned(
        title=title,
        author=author,
        chapters=chapters,
        cover_path=cover_path,
        vertical_mode=not horizontal_output
    )
    
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description='圖片式直排善書 → EPUB3 轉換工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
依賴安裝建議:
  # 基礎
  pip install beautifulsoup4 ebooklib requests pillow
  
  # OCR 選項（二選一或全裝）
  pip install paddlepaddle paddleocr    # 推薦，中文效果佳
  # 或
  pip install pytesseract               # 需另外安裝 tesseract-ocr 系統套件
  
  # 瀏覽器自動化
  pip install selenium
  # 並下載 ChromeDriver: https://chromedriver.chromium.org/
  
範例:
  # 基本用法（直排輸出）
  python make_epub_scanned.py "https://taolibrary.com/..."
  
  # 輸出橫排版本
  python make_epub_scanned.py "https://..." --horizontal
  
  # 指定 OCR 引擎 + 限制頁數
  python make_epub_scanned.py "https://..." --ocr-engine tesseract --max-pages 50
        '''
    )
    parser.add_argument('url', help='目標圖書網頁 URL')
    parser.add_argument('--horizontal', action='store_true', help='輸出橫排文字（預設為直排）')
    parser.add_argument('--ocr-engine', choices=['tesseract', 'paddle', 'nvidia'], default='tesseract',
                       help='OCR 引擎選擇（預設: tesseract）')
    parser.add_argument('--api-key', help='NVIDIA API Key（--ocr-engine nvidia 時必填）')
    parser.add_argument('--model', default=NvidiaVisionOCRHandler.DEFAULT_MODEL,
                       help=f'NVIDIA 模型名稱（預設: {NvidiaVisionOCRHandler.DEFAULT_MODEL}）')
    parser.add_argument('--max-pages', type=int, default=250, help='最大處理頁數（防無限翻頁）')
    parser.add_argument('--headless', action='store_true', default=True, help='Selenium 無頭模式（預設開啟）')
    
    args = parser.parse_args()
    
    if 'taolibrary.com' not in args.url:
        log("⚠ 此程式針對 taolibrary.com 優化，其他網站可能需要調整選擇器", "WARN")
    
    result = process_scanned_book(
        url=args.url,
        ocr_engine=args.ocr_engine,
        horizontal_output=args.horizontal,
        max_pages=args.max_pages,
        api_key=args.api_key,
        model=args.model,
    )
    
    if result:
        log(f"✅ 完成！EPUB 已儲存: {result}")
    else:
        log("❌ 處理失敗，請檢查日誌", "ERROR")
        sys.exit(1)


if __name__ == '__main__':
    main()