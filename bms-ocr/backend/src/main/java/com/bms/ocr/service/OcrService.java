package com.bms.ocr.service;

import com.bms.ocr.dto.OcrResult;
import com.bms.ocr.dto.PowerOutageNotice;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private final WebClient nvidiaWebClient;
    private final ObjectMapper objectMapper;

    @Value("${nvidia.api.key}")
    private String apiKey;

    @Value("${nvidia.api.model}")
    private String model;

    public OcrResult parseImage(MultipartFile file) throws IOException {
        log.info("===== 開始解析圖片 =====");
        log.info("檔案名稱: {}, 大小: {} KB, ContentType: {}",
                file.getOriginalFilename(),
                file.getSize() / 1024.0,
                file.getContentType());

        String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
        String mimeType = file.getContentType() != null ? file.getContentType() : "image/png";
        log.info("Base64 編碼長度: {} 字元", base64Image.length());

        String prompt = """
                你是一個專門解析台電停電通知的助手。請仔細閱讀這張圖片中的停電通知表格。
                
                表格只有三個欄位：
                1. 日期 (date)
                2. 預計停電時間 (outageTime) - 合併儲存格中可能有多個時段，用換行分隔
                3. 停電路口 (outageLocation)
                
                重要規則：
                - 表格中「日期」和「預計停電時間」欄位都有合併儲存格。
                - 合併的日期要填入每一筆對應的資料中。
                - 如果合併的時間儲存格包含多個時段（例如同一格寫了 09:00-09:30 和 14:30-15:00），
                  請用逗號連接所有時段，例如 "09:00-09:30,14:30-15:00"。
                - 如果某列沒有顯示時間，代表它與上方共用同一個合併儲存格，請填入相同的時間。
                
                每一列的停電路口就是一筆資料，請逐列解析，輸出 JSON 陣列。
                請只回傳 JSON 陣列，不要加任何說明文字或 markdown 格式。
                範例格式：
                [{"date":"115/04/29","outageTime":"09:00-09:30,14:30-15:00","outageLocation":"路竹區 中華路/路竹國中、中華路117巷"}]
                """;

        Map<String, Object> requestBody = buildRequest(prompt, base64Image, mimeType);

        log.info("呼叫 NVIDIA API - 模型: {}", model);
        long startTime = System.currentTimeMillis();

        String responseBody;
        try {
            responseBody = nvidiaWebClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(180))
                    .block();
            long elapsed = System.currentTimeMillis() - startTime;
            log.info("NVIDIA API 回應成功, 耗時: {} ms", elapsed);
            log.debug("API 原始回應: {}", responseBody);
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("NVIDIA API 呼叫失敗, 耗時: {} ms, 錯誤: {}", elapsed, e.getMessage());
            throw new IOException("NVIDIA API 呼叫失敗: " + e.getMessage(), e);
        }

        return parseResponse(responseBody);
    }

    private Map<String, Object> buildRequest(String prompt, String base64Image, String mimeType) {
        Map<String, Object> imageUrl = new LinkedHashMap<>();
        imageUrl.put("url", "data:" + mimeType + ";base64," + base64Image);

        Map<String, Object> textContent = new LinkedHashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);

        Map<String, Object> imageContent = new LinkedHashMap<>();
        imageContent.put("type", "image_url");
        imageContent.put("image_url", imageUrl);

        Map<String, Object> userMessage = new LinkedHashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", List.of(textContent, imageContent));

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(userMessage));
        requestBody.put("max_tokens", 4096);
        requestBody.put("temperature", 0.1);

        return requestBody;
    }

    private OcrResult parseResponse(String responseBody) {
        log.info("開始解析 API 回應");
        OcrResult result = new OcrResult();
        result.setRawResponse(responseBody);

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0)
                    .path("message").path("content").asText();

            // 清除可能的 markdown 包裝
            content = content.trim();
            if (content.startsWith("```json")) {
                content = content.substring(7);
            } else if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }
            content = content.trim();

            List<PowerOutageNotice> rawNotices = objectMapper.readValue(
                    content, new TypeReference<List<PowerOutageNotice>>() {});

            // 交叉展開：如果 outageTime 包含多個時段（逗號分隔），展開成多筆
            List<PowerOutageNotice> notices = expandNotices(rawNotices);

            result.setSuccess(true);
            result.setMessage("成功解析 " + notices.size() + " 筆停電通知");
            result.setNotices(notices);
            log.info("成功解析 {} 筆停電通知", notices.size());

            // 產生 Markdown 並存檔到 paper 目錄
            String markdown = generateMarkdown(notices);
            result.setMarkdownContent(markdown);
            String filePath = saveMarkdownFile(markdown);
            result.setMarkdownFile(filePath);
        } catch (Exception e) {
            log.error("解析回應失敗", e);
            result.setSuccess(false);
            result.setMessage("解析失敗: " + e.getMessage());
            result.setNotices(Collections.emptyList());
        }

        return result;
    }

    private String generateMarkdown(List<PowerOutageNotice> notices) {
        StringBuilder sb = new StringBuilder();
        sb.append("# 台電停電通知解析結果\n\n");
        sb.append("解析時間：").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"))).append("\n\n");
        sb.append("共 ").append(notices.size()).append(" 筆停電通知\n\n");
        sb.append("| # | 日期 | 預計停電時間 | 停電路口 |\n");
        sb.append("|---|------|-------------|----------|\n");

        for (int i = 0; i < notices.size(); i++) {
            PowerOutageNotice n = notices.get(i);
            sb.append("| ").append(i + 1)
              .append(" | ").append(n.getDate() != null ? n.getDate() : "")
              .append(" | ").append(n.getOutageTime() != null ? n.getOutageTime() : "")
              .append(" | ").append(n.getOutageLocation() != null ? n.getOutageLocation() : "")
              .append(" |\n");
        }

        return sb.toString();
    }

    private List<PowerOutageNotice> expandNotices(List<PowerOutageNotice> rawNotices) {
        List<PowerOutageNotice> expanded = new ArrayList<>();
        for (PowerOutageNotice notice : rawNotices) {
            String time = notice.getOutageTime();
            if (time != null && time.contains(",")) {
                // 多個時段，拆開成多筆
                String[] times = time.split(",");
                for (String t : times) {
                    PowerOutageNotice n = new PowerOutageNotice();
                    n.setDate(notice.getDate());
                    n.setOutageTime(t.trim());
                    n.setOutageLocation(notice.getOutageLocation());
                    expanded.add(n);
                }
            } else {
                expanded.add(notice);
            }
        }
        log.info("展開前 {} 筆, 展開後 {} 筆", rawNotices.size(), expanded.size());
        return expanded;
    }

    private String saveMarkdownFile(String markdown) {
        try {
            Path paperDir = Paths.get("paper");
            Files.createDirectories(paperDir);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName = "outage_" + timestamp + ".md";
            Path filePath = paperDir.resolve(fileName);

            Files.writeString(filePath, markdown, StandardCharsets.UTF_8);
            log.info("Markdown 檔案已儲存: {}", filePath.toAbsolutePath());
            return filePath.toAbsolutePath().toString();
        } catch (IOException e) {
            log.error("儲存 Markdown 檔案失敗", e);
            return null;
        }
    }
}
