python make_epub_scanned.py "https://taolibrary.com/category/category53/c53005.htm#" \
  --ocr-engine nvidia \
  --api-key "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" \
  --max-pages 200 \
  --start-page 6 \
  --model "meta/llama-3.2-90b-vision-instruct"

  若想換模型（例如 google/gemma-3-27b-it）：
    --model "meta/llama-3.2-11b-vision-instruct"
    --model "meta/llama-3.2-90b-vision-instruct"
