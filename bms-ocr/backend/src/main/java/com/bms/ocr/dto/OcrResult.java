package com.bms.ocr.dto;

import lombok.Data;
import java.util.List;

@Data
public class OcrResult {
    private boolean success;
    private String message;
    private List<PowerOutageNotice> notices;
    private String markdownContent;
    private String markdownFile;
    private String rawResponse;
}
