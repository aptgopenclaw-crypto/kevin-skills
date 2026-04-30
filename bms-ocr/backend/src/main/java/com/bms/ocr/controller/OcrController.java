package com.bms.ocr.controller;

import com.bms.ocr.dto.OcrResult;
import com.bms.ocr.service.OcrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@Slf4j
public class OcrController {

    private final OcrService ocrService;

    @PostMapping("/parse")
    public ResponseEntity<OcrResult> parseOutageImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            OcrResult error = new OcrResult();
            error.setSuccess(false);
            error.setMessage("請上傳圖片檔案");
            return ResponseEntity.badRequest().body(error);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            OcrResult error = new OcrResult();
            error.setSuccess(false);
            error.setMessage("僅支援圖片格式 (PNG, JPG, etc.)");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            OcrResult result = ocrService.parseImage(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("圖片解析失敗", e);
            OcrResult error = new OcrResult();
            error.setSuccess(false);
            error.setMessage("伺服器錯誤: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
