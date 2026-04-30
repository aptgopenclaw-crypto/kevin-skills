#!/usr/bin/env python3
"""
產生古典中文風格書籍封面
用法: python gen_cover.py <書名> <作者> <輸出路徑>
"""
import sys
import os
from PIL import Image, ImageDraw, ImageFont


def generate_cover(title, author, output_path):
    W, H = 1200, 1800
    img = Image.new('RGB', (W, H))
    draw = ImageDraw.Draw(img)

    # Deep navy gradient background
    for y in range(H):
        r = int(35 + 15 * (y / H))
        g = int(20 + 8 * (y / H))
        b = int(45 + 20 * (y / H))
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Gold double-line border
    border_color = (180, 155, 100)
    for offset in [40, 50]:
        draw.rectangle([offset, offset, W-offset, H-offset], outline=border_color, width=2)

    # Corner L decorations
    cl = 60
    for cx, cy, dx, dy in [(60,60,1,1),(W-60,60,-1,1),(60,H-60,1,-1),(W-60,H-60,-1,-1)]:
        draw.line([(cx,cy),(cx+dx*cl,cy)], fill=border_color, width=3)
        draw.line([(cx,cy),(cx,cy+dy*cl)], fill=border_color, width=3)

    # Faint decorative circles at bottom
    overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    ovdraw = ImageDraw.Draw(overlay)
    for i in range(3):
        cx = 300 + i*300
        cy = H - 250
        rx, ry = 250-i*30, 180-i*20
        ovdraw.ellipse([cx-rx,cy-ry,cx+rx,cy+ry], fill=(60,40,50,15))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)

    # Fonts
    font_bold = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'
    if not os.path.exists(font_bold):
        # 嘗試其他常見字型路徑
        for alt in [
            '/usr/share/fonts/noto-cjk/NotoSerifCJK-Bold.ttc',
            '/usr/share/fonts/google-noto-serif-cjk-ttc/NotoSerifCJK-Bold.ttc',
            '/usr/share/fonts/truetype/noto/NotoSerifCJK-Bold.ttc',
        ]:
            if os.path.exists(alt):
                font_bold = alt
                break

    # 根據書名長度調整字體大小
    title_len = len(title)
    if title_len <= 2:
        title_font_size = 220
    elif title_len <= 4:
        title_font_size = 180
    elif title_len <= 6:
        title_font_size = 140
    elif title_len <= 8:
        title_font_size = 110
    else:
        title_font_size = 80

    font_title = ImageFont.truetype(font_bold, title_font_size)
    font_author = ImageFont.truetype(font_bold, 48)

    title_color = (210, 185, 130)
    author_color = (170, 150, 110)

    # Title
    bb = draw.textbbox((0,0), title, font=font_title)
    tx = (W - bb[2]+bb[0]) // 2
    ty = 480
    draw.text((tx, ty), title, fill=title_color, font=font_title)

    # Decorative divider
    title_bottom = ty + (bb[3] - bb[1]) + 40
    line_y = title_bottom
    draw.line([(W//2-150, line_y), (W//2+150, line_y)], fill=border_color, width=2)
    draw.polygon([(W//2,line_y-8),(W//2+8,line_y),(W//2,line_y+8),(W//2-8,line_y)], fill=border_color)

    # Author
    author_text = f"{author}  著"
    bb = draw.textbbox((0,0), author_text, font=font_author)
    draw.text(((W-bb[2]+bb[0])//2, line_y+60), author_text, fill=author_color, font=font_author)



    img.save(output_path, 'PNG')
    print(f"封面已儲存: {output_path}")
    print(f"尺寸: {W}x{H}")


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("用法: python gen_cover.py <書名> <作者> <輸出路徑>")
        sys.exit(1)
    generate_cover(sys.argv[1], sys.argv[2], sys.argv[3])
