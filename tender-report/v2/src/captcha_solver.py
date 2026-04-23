"""
撲克牌驗證碼辨識器
使用 Anthropic Claude Vision API 辨識撲克牌驗證碼

流程：
1. 截圖整個驗證碼區域
2. 送給 Claude Vision 辨識 A區和 B區的撲克牌
3. 回傳需要點擊的 B區牌索引
"""

import base64
import json
import logging
import re
from pathlib import Path

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

# 預設 prompt
CAPTCHA_PROMPT = """你是一個撲克牌辨識專家。這張圖片是一個驗證碼，包含兩個區域：

A區（上方）：顯示 2 張目標撲克牌
B區（下方）：顯示 6 張選項撲克牌

牌面上有彩色干擾線和隨機旋轉，但你需要辨識每張牌的「花色」和「數字/字母」。

花色有4種：黑桃(♠)、紅心(♥)、方塊(♦)、梅花(♣)
數字有：A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K

請回傳 JSON 格式：
{
  "a_cards": ["花色+數字", "花色+數字"],
  "b_cards": ["花色+數字", "花色+數字", "花色+數字", "花色+數字", "花色+數字", "花色+數字"],
  "matches": [索引數字]
}

其中 matches 是 B區中與 A區相同的牌的索引（0-based）。
花色+數字的格式例如："黑桃10", "紅心A", "方塊K", "梅花3"

注意：
- 匹配必須「花色」和「數字」都相同
- 仔細辨認，不要被干擾線影響
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

    client_kwargs = {"api_key": api_key}
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
) -> list[int]:
    """
    用 NVIDIA NIM API 辨識撲克牌驗證碼
    NIM API 是 OpenAI 相容的，直接複用 solve_captcha_with_openai
    """
    if not api_key:
        import os
        api_key = os.environ.get("NVIDIA_API_KEY", "")

    return solve_captcha_with_openai(
        image_path=image_path,
        image_bytes=image_bytes,
        api_key=api_key,
        model=model,
        base_url="https://integrate.api.nvidia.com/v1",
    )
