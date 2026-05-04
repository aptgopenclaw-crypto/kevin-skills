#!/bin/bash
# 創建輸出目錄
mkdir -p /home/keivn/workspace/kevin-skills/epub3-project/temp/texts

# 遍歷 temp_images 目錄下的所有 PNG 文件
for img in /home/keivn/workspace/kevin-skills/epub3-project/temp_images/*.png; do
    # 提取文件名（不含路徑和擴展名）
    base=$(basename "$img" .png)
    # 使用 Tesseract 提取文字，並存入對應的文本文件
    tesseract "$img" "/home/keivn/workspace/kevin-skills/epub3-project/temp/texts/${base}" -l chi_tra
    echo "已處理: $img"
done

echo "所有圖片的文字提取完成！"