python make_epub_scanned.py "https://taolibrary.com/category/category52/c52007.htm#" \
  --ocr-engine nvidia \
  --api-key "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" \
  --max-pages 100 \
  --model "google/gemma-4-31b-it"

  若想換模型（例如 google/gemma-3-27b-it）：
    --model "meta/llama-3.2-11b-vision-instruct"