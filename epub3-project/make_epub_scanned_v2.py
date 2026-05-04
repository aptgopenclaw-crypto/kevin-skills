#!/usr/bin/env python3
"""
從 taolibrary.com 下載「圖片式直排善書」並轉換為 EPUB3 格式
【V2 終極優化版】四項核心強化：
  1. 自動傾斜校正 (Deskew) — 偵測文字行角度並自動扶正，消除掃描歪斜
  2. 極限二值化預處理 (Aggressive Binarization) — 消除泛黃背景，文字黑度最大化
  3. 滑動窗口 OCR (Sliding Window) — 每次只辨識 2-3 列，釘死 AI 注意力
  4. 二次驗證自我修正 (Self-Correction) — 可選，讓 AI 校對自己的輸出

用法:
  python make_epub_scanned_v2.py <URL> --ocr-engine nvidia --api-key <KEY>
  python make_epub_scanned_v2.py <URL> --ocr-engine nvidia --api-key <KEY> --self-correction
  python make_epub_scanned_v2.py <URL> --ocr-engine nvidia --api-key <KEY> --strips 4
"""
import sys
import os
import re
import time
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Tuple, Optional, Dict

from bs4 import BeautifulSoup
from ebooklib import epub
import requests

# OCR 相關
PADDLE_AVAILABLE = False
try:
    from paddleocr import PaddleOCR
    PADDLE_AVAILABLE = True
except ImportError:
    pass

try:
    from PIL import Image, ImageEnhance, ImageFilter, ImageOps
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

NUMPY_AVAILABLE = False
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    pass

CV2_AVAILABLE = False
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    pass

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
    prefix = {"INFO": "ℹ", "WARN": "⚠", "ERROR": "❌", "DEBUG": "🔍"}.get(level, "•")
    print(f"[{prefix}] {msg}")


def fetch_page_static(url: str) -> Optional[BeautifulSoup]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.encoding = resp.apparent_encoding
        if resp.status_code == 200:
            return BeautifulSoup(resp.text, 'lxml')
        log(f"HTTP {resp.status_code}: {url}", "ERROR")
    except Exception as e:
        log(f"請求失敗: {e}", "ERROR")
    return None


# ==================== 圖片 URL 取得 ====================

def extract_book_id(url: str, soup: BeautifulSoup) -> Optional[str]:
    for script in soup.find_all('script', src=True):
        m = re.search(r'(c\d+)\.js', script['src'])
        if m:
            return m.group(1)
    m = re.search(r'(c\d+)\.htm', url)
    return m.group(1) if m else None


def fetch_image_urls_from_xml(url: str, soup: BeautifulSoup, max_pages: int = 250) -> List[str]:
    book_id = extract_book_id(url, soup)
    if not book_id:
        log("無法提取書籍 ID", "ERROR")
        return []
    base_url = url.rsplit('/', 1)[0]
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
            rel_path = (elem.text or '').strip()
            if rel_path:
                img_urls.append(f"{base_url}/{rel_path}")
        if len(img_urls) > max_pages:
            log(f"共 {len(img_urls)} 張，限制前 {max_pages} 張")
            img_urls = img_urls[:max_pages]
        log(f"✓ 取得 {len(img_urls)} 張圖片 URL")
        return img_urls
    except ET.ParseError as e:
        log(f"XML 解析失敗: {e}", "ERROR")
    except Exception as e:
        log(f"取得圖片清單失敗: {e}", "ERROR")
    return []


# ==================== 圖片下載 ====================

def download_images_to_local(img_urls: List[str], output_dir: Path = TEMP_DIR) -> List[str]:
    local_paths = []
    skipped = 0
    for i, url in enumerate(img_urls):
        ext = '.png' if url.lower().endswith('.png') else '.jpg'
        local_path = output_dir / f'page_{i+1:03d}{ext}'
        if local_path.exists() and local_path.stat().st_size > 0:
            local_paths.append(str(local_path))
            skipped += 1
            continue
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            if resp.status_code == 200:
                if 'png' in resp.headers.get('Content-Type', ''):
                    local_path = output_dir / f'page_{i+1:03d}.png'
                with open(local_path, 'wb') as f:
                    f.write(resp.content)
                local_paths.append(str(local_path))
                log(f"✓ 下載 {i+1}/{len(img_urls)}: {local_path.name}")
                time.sleep(0.5)
        except Exception as e:
            log(f"✗ 下載失敗 {url}: {e}", "WARN")
    if skipped:
        log(f"⏩ 跳過 {skipped} 張已存在圖片，新下載 {len(local_paths) - skipped} 張")
    return local_paths


# ==================== [優化 1] 傾斜校正 + 極限二值化預處理 ====================

def deskew_image(pil_img: 'Image.Image') -> 'Image.Image':
    """
    終極版傾斜校正：中心區域採樣 + 水平投影變異數法。

    核心策略：
      1. 只取圖片中心 70% 區域偵測角度，完全排除邊緣黑框與裝訂陰影干擾
      2. 水平投影變異數法（文字行越水平，投影高低落差/變異數越大）
      3. 掃描 ±3°、步進 0.2°，精度優於 minAreaRect
      4. 全圖旋轉時使用純白填充，不留黑邊
    """
    if not NUMPY_AVAILABLE:
        return pil_img

    try:
        img_gray = np.array(pil_img.convert('L'))
        h, w = img_gray.shape

        # 步驟 1：只取中心 70% 區域（各方向去除 15% 邊緣）
        mh, mw = int(h * 0.15), int(w * 0.15)
        center = img_gray[mh:h - mh, mw:w - mw]

        # 步驟 2：二值化偵測區（cv2 Otsu 優先，否則固定閾值）
        if CV2_AVAILABLE:
            _, binary = cv2.threshold(
                center, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
            )
        else:
            binary = ((center < 128) * 255).astype(np.uint8)

        # 步驟 3：水平投影變異數法 — 掃描最佳角度
        def _score(angle: float) -> float:
            tmp = Image.fromarray(binary).rotate(
                angle, resample=Image.BICUBIC, expand=False
            )
            return float(np.var(np.sum(np.array(tmp), axis=1)))

        best_angle, best_score = 0.0, -1.0
        for angle in np.arange(-3.0, 3.1, 0.2):
            s = _score(angle)
            if s > best_score:
                best_score, best_angle = s, angle

        if abs(best_angle) < 0.05:
            return pil_img

        log(f"  📐 偵測到精確傾斜角: {best_angle:+.2f}°（已排除邊緣干擾）")

        # 步驟 4：全圖旋轉，純白填充
        return pil_img.rotate(
            best_angle, resample=Image.BICUBIC, expand=False, fillcolor=255
        )

    except Exception as e:
        log(f"傾斜校正失敗（跳過）: {e}", "WARN")
        return pil_img


def preprocess_aggressive(image_path: str, output_dir: Path = TEMP_DIR) -> str:
    """
    終極預處理流程：扶正 → 均衡 → 二值化 → 銳化 → 去雜點。
    讓 AI 像讀電子書一樣面對純黑純白文字，消除一切紙張顏色干擾。
    回傳處理後圖片路徑（PNG 格式）。
    """
    if not PIL_AVAILABLE:
        return image_path
    try:
        img = Image.open(image_path).convert('L')  # 強制灰階

        # 1. 自動傾斜校正
        img = deskew_image(img)

        # 2. 自適應直方圖均衡：提升局部對比
        img = ImageOps.autocontrast(img, cutoff=2)

        # 3. 對比度增強至極限
        img = ImageEnhance.Contrast(img).enhance(3.0)

        # 4. 硬閾值二值化：閾值調低至 165，更積極過濾泛黃底色
        img = img.point(lambda p: 255 if p > 165 else 0)

        # 5. 銳化邊緣，強化筆畫輪廓
        img = img.filter(ImageFilter.SHARPEN)

        # 6. 中值濾波去除孤立雜點
        img = img.filter(ImageFilter.MedianFilter(size=3))

        out_path = str(output_dir / f'bin_{Path(image_path).stem}.png')
        img.save(out_path)
        return out_path
    except Exception as e:
        log(f"極限預處理失敗: {e}", "WARN")
        return image_path


# ==================== [優化 2] 雙頁切分 + 垂直條帶切分 ====================

def split_image_halves(image_path: str, output_dir: Path = TEMP_DIR) -> Tuple[Optional[str], Optional[str]]:
    """將雙頁對開圖切為右頁、左頁，裁去中縫與四周黑邊。"""
    if not PIL_AVAILABLE:
        return None, None
    try:
        img = Image.open(image_path)
        w, h = img.size
        mid = w // 2
        base = Path(image_path).stem
        ext = Path(image_path).suffix

        margin_x = int(w * 0.08)
        margin_y = int(h * 0.04)
        gutter = int(w * 0.02)  # 中縫留白

        right_page = img.crop((margin_x, margin_y, mid - gutter, h - margin_y))
        left_page = img.crop((mid + gutter, margin_y, w - margin_x, h - margin_y))

        rp = str(output_dir / f'{base}_R{ext}')
        lp = str(output_dir / f'{base}_L{ext}')
        right_page.save(rp)
        left_page.save(lp)
        log(f"  ✂ 切為右頁 {right_page.size}，左頁 {left_page.size}")
        return rp, lp
    except Exception as e:
        log(f"切分失敗: {e}", "WARN")
        return None, None


def split_into_vertical_strips(image_path: str, n_strips: int = 3,
                                output_dir: Path = TEMP_DIR) -> List[str]:
    """
    [滑動窗口] 將單頁圖片垂直切為 n_strips 個直排條帶（右→左閱讀順序）。
    直排閱讀方向：最右側條帶先讀，最左側最後讀。
    回傳路徑列表（已依閱讀順序排列：[最右條帶, ..., 最左條帶]）。
    """
    if not PIL_AVAILABLE:
        return [image_path]
    try:
        img = Image.open(image_path)
        w, h = img.size
        strip_w = w // n_strips
        base = Path(image_path).stem
        ext = Path(image_path).suffix

        strips = []
        for i in range(n_strips):
            # i=0 → 最右側條帶
            x_start = w - (i + 1) * strip_w
            x_end = w - i * strip_w
            # 最左側條帶取剩餘寬度，避免整除誤差丟失像素
            if i == n_strips - 1:
                x_start = 0
            strip = img.crop((x_start, 0, x_end, h))
            path = str(output_dir / f'{base}_strip{i:02d}{ext}')
            strip.save(path)
            strips.append(path)
            log(f"    條帶 {i+1}/{n_strips}: x=[{x_start}, {x_end}] → {Path(path).name}")
        return strips
    except Exception as e:
        log(f"垂直切分失敗: {e}", "WARN")
        return [image_path]


def resize_for_api(image_path: str, max_dim: int = 2048,
                   output_dir: Path = TEMP_DIR) -> str:
    """縮小圖片以節省 token，不超過 max_dim。"""
    if not PIL_AVAILABLE:
        return image_path
    try:
        with Image.open(image_path) as img:
            w, h = img.size
        if max(w, h) <= max_dim:
            return image_path
        scale = max_dim / max(w, h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = Image.open(image_path).resize((new_w, new_h), Image.LANCZOS)
        out_path = str(output_dir / f'rs_{Path(image_path).name}')
        resized.save(out_path)
        log(f"    📐 縮小: {w}×{h} → {new_w}×{new_h}")
        return out_path
    except Exception as e:
        log(f"縮小失敗: {e}", "WARN")
        return image_path


# ==================== OCR 引擎 ====================

def _detect_and_trim_repetition(text: str, window: int = 8, threshold: int = 6) -> str:
    """截斷 AI 幻覺產生的重複文字片段。"""
    if not text or len(text) < window * 2:
        return text
    for i in range(len(text) - window):
        chunk = text[i:i + window]
        if max(chunk.count(c) for c in set(chunk)) >= threshold:
            trimmed = text[:i].rstrip()
            log(f"⚠ 偵測重複幻覺，截斷於第 {i} 字（{len(text)} → {len(trimmed)}）", "WARN")
            return trimmed
    return text


def _clean_repetition(text: str) -> str:
    """清理重複模式（從長模式到短模式）。"""
    text = re.sub(r'(.)\1{5,}', r'\1', text)
    for length in [20, 10, 5]:
        pattern = re.compile(r'(.{' + str(length) + r',}?)\1{2,}')
        while True:
            m = pattern.search(text)
            if not m:
                break
            text = text[:m.start()] + m.group(1) + text[m.end():]
    return text


class NvidiaVisionOCRHandler:
    """NVIDIA NIM Vision AI 實作（V2 終極版）。"""
    is_vision_ai = True
    DEFAULT_MODEL = "nvidia/llama-3.2-90b-vision-instruct"

    # [優化版 Prompt] 更短、更強硬、更聚焦（針對條帶圖片）
    STRIP_PROMPT = (
        "你是一個高精準度的古籍整理專家。這張圖是書本的一小部分。\n"
        "【任務】請按『從右至左』的順序，逐字轉錄所有繁體中文內容。\n"
        "【禁令】\n"
        "1. 禁止輸出任何除了書中內容以外的字眼（如：這是一頁...）。\n"
        "2. 禁止重複。如果辨識到的文字與前文高度相似，請跳過。\n"
        "3. 若某行模糊，請以 □ 代替，不可猜測。\n"
        "【輸出格式】每一列文字單獨成行。"
    )

    CORRECTION_PROMPT_TEMPLATE = (
        "以下是對這張古籍圖片進行 OCR 辨識後得到的初稿：\n\n"
        "---\n{draft}\n---\n\n"
        "請對照圖片，執行以下校對任務：\n"
        "1. 找出初稿中「漏字」或「多字」的段落並修正。\n"
        "2. 刪除所有重複出現的字句（僅保留第一次出現）。\n"
        "3. 若某字真的無法辨識，保留「□」，不要猜測。\n"
        "4. 只輸出修正後的純文字，不要說明或解釋。"
    )

    def __init__(self, api_key: str, model: str = DEFAULT_MODEL, max_tokens: int = 600):
        try:
            from openai import OpenAI
            self.client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=api_key,
            )
        except ImportError:
            raise ImportError("openai 未安裝，請執行: pip install openai")
        self.model = model
        self.max_tokens = max_tokens
        log(f"NVIDIA Vision AI 初始化 (model={model}, max_tokens={max_tokens})")

    def _call_api(self, image_path: str, prompt: str) -> str:
        """共用 API 呼叫邏輯。"""
        import base64
        suffix = Path(image_path).suffix.lower()
        mime = 'image/png' if suffix == '.png' else 'image/jpeg'
        with open(image_path, 'rb') as f:
            img_b64 = base64.standard_b64encode(f.read()).decode('utf-8')

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": [
                {"type": "image_url",
                 "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
                {"type": "text", "text": prompt},
            ]}],
            temperature=0.0,
            top_p=0.01,
            frequency_penalty=2.0,
            presence_penalty=0.6,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content.strip()

    def recognize_text(self, image_path: str) -> str:
        """單張圖片 OCR（含後處理防幻覺）。"""
        try:
            raw = self._call_api(image_path, self.STRIP_PROMPT)
            log(f"    📊 原始回傳: {len(raw)} 字")
            raw = _detect_and_trim_repetition(raw)
            raw = _clean_repetition(raw)
            return raw
        except Exception as e:
            log(f"Vision API 調用失敗: {e}", "ERROR")
            return ""

    def recognize_text_with_correction(self, image_path: str) -> str:
        """
        [優化 3] 二次驗證自我修正：
        第一遍 OCR → 將結果與原圖再傳給 AI 校對。
        """
        draft = self.recognize_text(image_path)
        if not draft.strip():
            return draft

        log(f"    🔄 啟動二次驗證校對...")
        correction_prompt = self.CORRECTION_PROMPT_TEMPLATE.format(draft=draft)
        try:
            corrected = self._call_api(image_path, correction_prompt)
            log(f"    ✅ 校對完成: {len(draft)} → {len(corrected)} 字")
            corrected = _detect_and_trim_repetition(corrected)
            corrected = _clean_repetition(corrected)
            return corrected
        except Exception as e:
            log(f"二次驗證失敗，使用原始結果: {e}", "WARN")
            return draft


class TesseractOCRHandler:
    is_vision_ai = False

    def __init__(self, lang: str = 'chi_tra_vert'):
        try:
            import pytesseract
            self.pytesseract = pytesseract
        except ImportError:
            raise ImportError("pytesseract 未安裝，請執行: pip install pytesseract")
        self.lang = lang
        log(f"Tesseract OCR 初始化 (lang={lang})")

    def recognize(self, image_path: str) -> List[Dict]:
        data = self.pytesseract.image_to_data(
            image_path, lang=self.lang,
            output_type=self.pytesseract.Output.DICT
        )
        output = []
        for i in range(len(data['text'])):
            text = data['text'][i].strip()
            if not text or data['conf'][i] < 30:
                continue
            output.append({
                'text': text,
                'bbox': [data['left'][i], data['top'][i],
                         data['left'][i] + data['width'][i],
                         data['top'][i] + data['height'][i]],
                'confidence': data['conf'][i],
                'center': (data['left'][i] + data['width'][i] / 2,
                           data['top'][i] + data['height'][i] / 2),
            })
        return output


class PaddleOCRHandler:
    is_vision_ai = False

    def __init__(self, lang: str = 'ch'):
        if not PADDLE_AVAILABLE:
            raise ImportError("PaddleOCR 未安裝，請執行: pip install paddlepaddle paddleocr")
        self.ocr = PaddleOCR(use_textline_orientation=True, lang=lang)
        log("PaddleOCR 模型載入完成")

    def recognize(self, image_path: str) -> List[Dict]:
        result = self.ocr.ocr(image_path, cls=True)
        if not result or not result[0]:
            return []
        output = []
        for item in result[0]:
            bbox = item[0]
            text, confidence = item[1][0], item[1][1]
            xs = [p[0] for p in bbox]
            ys = [p[1] for p in bbox]
            x1, x2 = min(xs), max(xs)
            y1, y2 = min(ys), max(ys)
            output.append({
                'text': text,
                'bbox': [x1, y1, x2, y2],
                'confidence': confidence,
                'center': ((x1 + x2) / 2, (y1 + y2) / 2),
            })
        return output


# ==================== 直排文字重組（非 Vision AI 使用） ====================

def reconstruct_vertical_text(ocr_results: List[Dict], image_width: int,
                               column_tolerance: float = 0.15) -> str:
    if not ocr_results:
        return ""
    widths = [r['bbox'][2] - r['bbox'][0] for r in ocr_results]
    avg_w = sorted(widths)[len(widths) // 2]
    threshold = avg_w * 1.8 * (1 + column_tolerance)
    sorted_items = sorted(ocr_results, key=lambda r: r['center'][0], reverse=True)
    columns: List[List[Dict]] = []
    for item in sorted_items:
        xc = item['center'][0]
        placed = False
        for col in columns:
            if abs(xc - col[0]['center'][0]) < threshold:
                col.append(item)
                placed = True
                break
        if not placed:
            columns.append([item])
    for col in columns:
        col.sort(key=lambda r: r['center'][1])
    columns.sort(key=lambda col: -col[0]['center'][0])
    return "".join("".join(r['text'] for r in col).strip() for col in columns)


# ==================== EPUB3 建立 ====================

def build_epub_scanned(title: str, author: str,
                        chapters: List[Tuple[str, str]],
                        cover_path: str, vertical_mode: bool = True,
                        output_dir: Path = EPUB3_DIR) -> str:
    book = epub.EpubBook()
    book.set_identifier(f'taolibrary-v2-{re.sub(r"[^a-zA-Z0-9]", "", title)[:20]}')
    book.set_title(title)
    book.set_language('zh-TW')
    book.add_author(author)

    with open(cover_path, 'rb') as f:
        book.set_cover('cover.png', f.read())

    css_content = 'body { font-family: "KaiTi","STKaiti","BiauKai",serif; line-height: 2.0; margin: 1em; }\n'
    if vertical_mode:
        css_content += (
            'html, body { writing-mode: vertical-rl; -webkit-writing-mode: vertical-rl; '
            '-epub-writing-mode: vertical-rl; text-orientation: mixed; }\n'
            'p { margin: 0 0.5em; text-indent: 0; }\n'
            'h2 { text-align: center; margin: 1em 0; }\n'
        )
    else:
        css_content += 'p { text-indent: 2em; margin: 0.5em 0; }\nh2 { text-align: center; }\n'

    css = epub.EpubItem(uid='style', file_name='style/default.css',
                        media_type='text/css', content=css_content.encode('utf-8'))
    book.add_item(css)

    title_page = epub.EpubHtml(title='封面', file_name='title.xhtml', lang='zh-TW')
    title_page.content = f'<h1>{title}</h1><p style="text-align:center;">{author}</p>'
    title_page.add_item(css)
    book.add_item(title_page)

    spine = ['nav', title_page]
    toc = []
    for i, (ch_title, content_text) in enumerate(chapters):
        clean = re.sub(r'\s+', ' ', content_text).strip()
        ch = epub.EpubHtml(title=ch_title, file_name=f'ch{i:03d}.xhtml', lang='zh-TW')
        if vertical_mode:
            parts = re.split(r'([。！？；])', clean)
            paras, cur = [], ""
            for s in parts:
                cur += s
                if s in '。！？；':
                    if cur.strip():
                        paras.append(f'<p>{cur.strip()}</p>')
                    cur = ""
            if cur.strip():
                paras.append(f'<p>{cur.strip()}</p>')
            ch.content = f'<h2>{ch_title}</h2>{"".join(paras)}'
        else:
            p_tags = [f'<p>{p.strip()}</p>' for p in re.split(r'\n+', clean) if p.strip()]
            ch.content = f'<h2>{ch_title}</h2>\n' + '\n'.join(p_tags)
        ch.add_item(css)
        book.add_item(ch)
        spine.append(ch)
        toc.append(ch)

    book.toc = toc
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = spine
    if vertical_mode:
        book.set_direction('rtl')

    safe_title = re.sub(r'[\\/:*?"<>|]', '_', title)
    output_path = output_dir / f'{safe_title}.epub'
    epub.write_epub(str(output_path), book)
    return str(output_path)


# ==================== 封面產生 ====================

def generate_cover(title: str, author: str) -> str:
    import subprocess
    cover_script = SCRIPT_DIR / 'gen_cover.py'
    safe_title = re.sub(r'[\\/:*?"<>|]', '_', title)
    cover_path = COVER_DIR / f'{safe_title}.png'

    if cover_script.exists():
        result = subprocess.run(
            [sys.executable, str(cover_script), title, author, str(cover_path)],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print(result.stdout.strip())
            return str(cover_path)
        log(f"gen_cover.py 失敗: {result.stderr}", "WARN")

    # 降級：簡易文字封面
    if PIL_AVAILABLE:
        from PIL import ImageDraw, ImageFont
        img = Image.new('RGB', (800, 1200), color='#f5f0e6')
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/arphic/ukai.ttc", 48)
        except Exception:
            font = ImageFont.load_default()
        draw.text((400, 400), title, fill='#333', font=font, anchor="mm")
        draw.text((400, 500), author, fill='#666', font=font, anchor="mm")
        img.save(cover_path)
    return str(cover_path)


# ==================== 主處理流程 ====================

def process_scanned_book(
    url: str,
    ocr_engine: str = 'nvidia',
    horizontal_output: bool = False,
    max_pages: int = 250,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    start_page: int = 1,
    end_page: Optional[int] = None,
    max_tokens: int = 600,
    split_pages: bool = True,
    n_strips: int = 3,
    self_correction: bool = False,
    aggressive_preprocess: bool = True,
) -> Optional[str]:
    """
    主流程：
    下載 → 極限預處理 → 雙頁切分 → 垂直條帶切分 → OCR → (二次驗證) → EPUB
    """
    log(f"初始解析: {url}")
    soup = fetch_page_static(url)
    if not soup:
        return None

    title_tag = soup.find('title')
    title = title_tag.get_text(strip=True) if title_tag else '未知書名'
    if title == '善書圖書館':
        h1 = soup.find('h1')
        title = h1.get_text(strip=True) if h1 else '未知書名'

    author = '前賢'
    h3 = soup.find('h3', attrs={'align': 'right'})
    if h3:
        author = re.sub(r'(講話|著|編著|編)$', '', h3.get_text(strip=True))

    log(f"📚 {title} — {author}")

    # 取得圖片 URL
    img_urls = fetch_image_urls_from_xml(url, soup, max_pages=max_pages)
    if not img_urls:
        log("未取得任何圖片", "ERROR")
        return None

    # 下載
    log(f"📥 下載 {len(img_urls)} 張圖片...")
    local_images = download_images_to_local(img_urls)

    # 初始化 OCR
    log(f"🔍 啟動 OCR (engine={ocr_engine})...")
    try:
        if ocr_engine == 'nvidia':
            if not api_key:
                log("--api-key 為必填（--ocr-engine nvidia）", "ERROR")
                return None
            ocr = NvidiaVisionOCRHandler(
                api_key=api_key,
                model=model or NvidiaVisionOCRHandler.DEFAULT_MODEL,
                max_tokens=max_tokens,
            )
        elif ocr_engine == 'tesseract':
            ocr = TesseractOCRHandler()
        elif ocr_engine == 'paddle' and PADDLE_AVAILABLE:
            ocr = PaddleOCRHandler()
        else:
            try:
                ocr = TesseractOCRHandler()
            except ImportError:
                if PADDLE_AVAILABLE:
                    ocr = PaddleOCRHandler()
                else:
                    log("無可用 OCR 引擎", "ERROR")
                    return None
    except Exception as e:
        log(f"OCR 引擎初始化失敗: {e}", "ERROR")
        return None

    if start_page > 1 or end_page is not None:
        end_desc = f"第 {end_page} 頁" if end_page else "末頁"
        log(f"⏩ OCR 範圍：第 {start_page} 頁 → {end_desc}")

    chapters = []
    for i, img_path in enumerate(local_images):
        page_num = i + 1
        if page_num < start_page:
            continue
        if end_page is not None and page_num > end_page:
            break
        log(f"OCR 處理 {page_num}/{len(local_images)}: {os.path.basename(img_path)}")

        if ocr.is_vision_ai:
            # ── [優化 1] 極限二值化預處理 ──
            if aggressive_preprocess:
                log("  🎨 極限二值化預處理...")
                img_path = preprocess_aggressive(img_path)

            page_texts = []

            if split_pages and PIL_AVAILABLE:
                right_path, left_path = split_image_halves(img_path)
                half_pages = [(right_path, '右'), (left_path, '左')]
            else:
                half_pages = [(img_path, '全')]

            for half_path, label in half_pages:
                if not half_path:
                    continue

                if n_strips > 1:
                    # ── [優化 2] 垂直條帶滑動窗口 ──
                    log(f"  ✂ {label}頁 → {n_strips} 條帶滑動窗口...")
                    strips = split_into_vertical_strips(half_path, n_strips=n_strips)
                else:
                    strips = [half_path]

                half_texts = []
                for j, strip_path in enumerate(strips):
                    strip_path = resize_for_api(strip_path)
                    log(f"  🔍 OCR {label}頁 條帶 {j+1}/{len(strips)}...")

                    if self_correction:
                        # ── [優化 3] 二次驗證自我修正 ──
                        text = ocr.recognize_text_with_correction(strip_path)
                    else:
                        text = ocr.recognize_text(strip_path)

                    if text.strip():
                        half_texts.append(text.strip())

                if half_texts:
                    page_texts.append("\n".join(half_texts))

            text = "\n---\n".join(page_texts) if page_texts else ""

        else:
            # Tesseract / PaddleOCR：直接辨識 + 欄位重組
            if PIL_AVAILABLE:
                try:
                    with Image.open(img_path) as _img:
                        img_w, img_h = _img.size
                except Exception:
                    img_w, img_h = 1000, 1500
            else:
                img_w, img_h = 1000, 1500
            ocr_results = ocr.recognize(img_path)
            text = reconstruct_vertical_text(ocr_results, img_w)

        if text.strip():
            text = re.sub(r'(.)\1{5,}', r'\1', text)
            chapters.append((f'第 {page_num} 頁', text))
            log(f"  ✓ 完成 → {len(text)} 字")
            log(f"  📝 {text[:200]}{'...' if len(text) > 200 else ''}", "DEBUG")
        else:
            log(f"  ⚠ 未辨識到有效文字", "WARN")

    if not chapters:
        log("OCR 未產出任何內容", "ERROR")
        return None

    log("🎨 產生封面...")
    cover_path = generate_cover(title, author)

    log(f"📦 建立 EPUB3 ({'直排' if not horizontal_output else '橫排'})...")
    output_path = build_epub_scanned(
        title=title,
        author=author,
        chapters=chapters,
        cover_path=cover_path,
        vertical_mode=not horizontal_output,
    )
    return output_path


# ==================== CLI ====================

def main():
    parser = argparse.ArgumentParser(
        description='圖片式直排善書 → EPUB3 轉換工具 (V2 終極優化版)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
範例:
  # 基本（NVIDIA API + 滑動窗口，預設 3 條帶）
  python make_epub_scanned_v2.py "https://taolibrary.com/..." \\
      --ocr-engine nvidia --api-key <KEY>

  # 啟用二次驗證（較慢，精度最高）
  python make_epub_scanned_v2.py "https://..." \\
      --ocr-engine nvidia --api-key <KEY> --self-correction

  # 4 條帶切分（更細緻，適合字密頁）
  python make_epub_scanned_v2.py "https://..." \\
      --ocr-engine nvidia --api-key <KEY> --strips 4

  # 關閉極限預處理（原始圖片傳給 AI）
  python make_epub_scanned_v2.py "https://..." \\
      --ocr-engine nvidia --api-key <KEY> --no-aggressive-preprocess
        '''
    )
    parser.add_argument('url', help='目標圖書網頁 URL')
    parser.add_argument('--horizontal', action='store_true', help='輸出橫排（預設直排）')
    parser.add_argument('--ocr-engine', choices=['tesseract', 'paddle', 'nvidia'],
                        default='nvidia', help='OCR 引擎（預設: nvidia）')
    parser.add_argument('--api-key', help='NVIDIA API Key（--ocr-engine nvidia 時必填）')
    parser.add_argument('--model', default=NvidiaVisionOCRHandler.DEFAULT_MODEL,
                        help=f'NVIDIA 模型名稱（預設: {NvidiaVisionOCRHandler.DEFAULT_MODEL}）')
    parser.add_argument('--max-pages', type=int, default=250, help='最大處理頁數')
    parser.add_argument('--start-page', type=int, default=1, help='從第幾頁開始 OCR')
    parser.add_argument('--end-page', type=int, default=None, help='OCR 到第幾頁為止（預設：處理到最後一頁）')
    parser.add_argument('--max-tokens', type=int, default=600,
                        help='Vision AI 每次最大輸出 token 數（預設 600）')
    parser.add_argument('--strips', type=int, default=3, metavar='N',
                        help='每半頁切為幾個垂直條帶（預設 3；設為 1 停用滑動窗口）')
    parser.add_argument('--no-split', action='store_true', default=False,
                        help='停用雙頁對開切分')
    parser.add_argument('--self-correction', action='store_true', default=False,
                        help='啟用二次驗證自我修正（較慢，精度最高）')
    parser.add_argument('--no-aggressive-preprocess', action='store_true', default=False,
                        help='停用極限二值化預處理')

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
        start_page=args.start_page,
        end_page=args.end_page,
        max_tokens=args.max_tokens,
        split_pages=not args.no_split,
        n_strips=args.strips,
        self_correction=args.self_correction,
        aggressive_preprocess=not args.no_aggressive_preprocess,
    )

    if result:
        log(f"✅ 完成！EPUB 已儲存: {result}")
    else:
        log("❌ 處理失敗，請檢查日誌", "ERROR")
        sys.exit(1)


if __name__ == '__main__':
    main()
