"""
撲克牌驗證碼辨識器
使用 NVIDIA NIM Vision API 辨識撲克牌驗證碼

流程：
1. 截圖驗證碼區域
2. 圖片前處理：移除非黑/紅色的干擾線
3. 送給 Vision AI 辨識 A區和 B區的撲克牌
4. 回傳需要點擊的 B區牌索引
"""

import base64
import io
import json
import logging
import re
from pathlib import Path

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def _parse_captcha_json(result_text: str) -> list[int]:
    """從 Vision AI 回應文字中提取 matches 索引列表。
    處理多種格式：純 JSON、markdown 包裹、多 JSON 區塊、escaped backslash 等。
    """
    # 1. 先清理 markdown 反斜線轉義 (\[ -> [, \_ -> _)
    cleaned = result_text.replace('\\[', '[').replace('\\]', ']').replace('\\_', '_')

    # 2. 嘗試精確匹配：含 "matches" 的單一 JSON 物件（不跨越 {}）
    json_match = re.search(r'\{[^{}]*"matches"[^{}]*\}', cleaned, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group())
            matches = data.get("matches", [])
            logger.info(f"配對索引: {matches}")
            return [int(m) for m in matches]
        except json.JSONDecodeError:
            pass

    # 3. Fallback：找所有 {...} 區塊，逐個嘗試解析
    for m in re.finditer(r'\{[^{}]+\}', cleaned):
        try:
            data = json.loads(m.group())
            if "matches" in data:
                matches = data["matches"]
                logger.info(f"配對索引 (fallback): {matches}")
                return [int(x) for x in matches]
        except json.JSONDecodeError:
            continue

    logger.error(f"無法解析 Vision AI 回應為 JSON: {result_text[:200]}")
    return []


def preprocess_captcha_image(image_bytes: bytes) -> bytes:
    """
    前處理驗證碼圖片：移除非標準撲克牌顏色的干擾線。
    
    撲克牌只有兩種顏色：
    - 黑色系（黑桃♠、梅花♣）：接近純黑
    - 紅色系（紅心♥、方塊♦）：接近純紅
    
    干擾線是同花色形狀但用其他顏色（綠、藍、紫、黃等），
    將這些非黑非紅的彩色像素替換為白色背景。
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    arr = np.array(img, dtype=np.float32)
    
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    # 保留黑色系：R, G, B 都 < 80（深色文字/花色）
    is_black = (r < 80) & (g < 80) & (b < 80)
    
    # 保留紅色系：R 高, G 和 B 低（紅心/方塊）
    is_red = (r > 150) & (g < 80) & (b < 80)
    
    # 保留白色/淺灰背景：R, G, B 都 > 200
    is_white = (r > 200) & (g > 200) & (b > 200)
    
    # 保留深灰色（邊框等）
    is_gray = (np.abs(r - g) < 30) & (np.abs(g - b) < 30) & (r < 200)
    
    # 保留的像素
    keep = is_black | is_red | is_white | is_gray
    
    # 將不保留的像素（干擾線）設為白色
    result = arr.copy()
    result[~keep] = [255, 255, 255]
    
    # 轉回 bytes
    out_img = Image.fromarray(result.astype(np.uint8))
    buf = io.BytesIO()
    out_img.save(buf, format='PNG')
    return buf.getvalue()


# 預設 prompt（含干擾線提示）
CAPTCHA_PROMPT = """你是一個撲克牌辨識專家。這張圖片是一個驗證碼，包含兩個區域：

A區（上方）：顯示 2 張目標撲克牌
B區（下方）：顯示 6 張選項撲克牌

重要辨識規則：
1. 每張牌有「花色」和「數字/字母」
2. 花色只有4種，且顏色固定：
   - 黑桃(♠) = 黑色
   - 梅花(♣) = 黑色  
   - 紅心(♥) = 紅色
   - 方塊(♦) = 紅色
3. 圖片上可能殘留彩色干擾痕跡（已大部分清除），請忽略任何非黑/非紅的花色形狀
4. 只關注黑色和紅色的花色符號來判斷
5. 數字只有：A, 2, 3, 4, 5, 6, 7, 8, 9, 10（不會出現 J, Q, K）
6. 牌面可能有輕微旋轉

請回傳 JSON 格式：
{
  "a_cards": ["花色+數字", "花色+數字"],
  "b_cards": ["花色+數字", "花色+數字", "花色+數字", "花色+數字", "花色+數字", "花色+數字"],
  "matches": [索引數字]
}

其中 matches 是 B區中與 A區相同的牌的索引（0-based）。
花色+數字的格式例如："黑桃10", "紅心A", "方塊5", "梅花3"

注意：
- 匹配必須「花色」和「數字」都完全相同
- 忽略所有非黑色/紅色的干擾圖形
- 只回傳 JSON，不要其他文字
"""


def solve_captcha_with_anthropic(
    image_path: str = None,
    image_bytes: bytes = None,
    api_key: str = "",
    model: str = "claude-sonnet-4-20250514",
) -> list[int]:
    """
    用 Anthropic Claude Vision 辨識撲克牌驗證碼

    Args:
        image_path: 驗證碼截圖路徑
        image_bytes: 或直接傳入圖片 bytes
        api_key: Anthropic API key
        model: 模型名稱

    Returns:
        list[int]: 需要點擊的 B區牌索引（0-based）
    """
    try:
        import anthropic
    except ImportError:
        logger.error("請安裝 anthropic: pip install anthropic")
        return []

    if not api_key:
        import os
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        logger.error("缺少 ANTHROPIC_API_KEY")
        return []

    # 讀取圖片
    if image_bytes is None:
        if image_path is None:
            logger.error("必須提供 image_path 或 image_bytes")
            return []
        image_bytes = Path(image_path).read_bytes()

    # Base64 encode
    b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    # 判斷 media type
    if image_path and image_path.lower().endswith('.png'):
        media_type = "image/png"
    else:
        media_type = "image/png"  # 預設 png（Playwright 截圖）

    client = anthropic.Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model=model,
            max_tokens=512,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": CAPTCHA_PROMPT,
                        },
                    ],
                }
            ],
        )

        result_text = response.content[0].text.strip()
        logger.info(f"Vision AI 回應: {result_text}")

        return _parse_captcha_json(result_text)

    except Exception as e:
        logger.error(f"Vision AI 呼叫失敗: {e}")
        return []


def solve_captcha_with_openai(
    image_path: str = None,
    image_bytes: bytes = None,
    api_key: str = "",
    model: str = "gpt-4o",
    base_url: str = None,
) -> list[int]:
    """
    用 OpenAI 相容 API 辨識撲克牌驗證碼
    支援 OpenAI / NVIDIA NIM / 任何 OpenAI 相容端點
    """
    try:
        from openai import OpenAI
    except ImportError:
        logger.error("請安裝 openai: pip install openai")
        return []

    if not api_key:
        import os
        api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        logger.error("缺少 API Key")
        return []

    if image_bytes is None:
        if image_path is None:
            return []
        image_bytes = Path(image_path).read_bytes()

    b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    client_kwargs = {"api_key": api_key, "timeout": 60.0}
    if base_url:
        client_kwargs["base_url"] = base_url
    client = OpenAI(**client_kwargs)

    try:
        response = client.chat.completions.create(
            model=model,
            max_tokens=512,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{b64}",
                            },
                        },
                        {
                            "type": "text",
                            "text": CAPTCHA_PROMPT,
                        },
                    ],
                }
            ],
        )

        result_text = response.choices[0].message.content.strip()
        logger.info(f"Vision AI 回應: {result_text}")

        return _parse_captcha_json(result_text)

    except Exception as e:
        logger.error(f"Vision API 呼叫失敗: {e}")
        return []


def solve_captcha_with_nvidia(
    image_path: str = None,
    image_bytes: bytes = None,
    api_key: str = "",
    model: str = "nvidia/llama-3.2-nv-vision-90b-instruct",
    preprocess: bool = True,
) -> list[int]:
    """
    用 NVIDIA NIM API 辨識撲克牌驗證碼
    NIM API 是 OpenAI 相容的，直接複用 solve_captcha_with_openai
    
    Args:
        preprocess: 是否進行圖片前處理（移除干擾線）
    """
    if not api_key:
        import os
        api_key = os.environ.get("NVIDIA_API_KEY", "")

    # 讀取圖片
    if image_bytes is None:
        if image_path is None:
            return []
        image_bytes = Path(image_path).read_bytes()

    # 圖片前處理：移除干擾線
    if preprocess:
        try:
            image_bytes = preprocess_captcha_image(image_bytes)
            logger.info("  已完成圖片前處理（移除干擾線）")
        except Exception as e:
            logger.warning(f"  圖片前處理失敗，使用原圖: {e}")

    return solve_captcha_with_openai(
        image_bytes=image_bytes,
        api_key=api_key,
        model=model,
        base_url="https://integrate.api.nvidia.com/v1",
    )
