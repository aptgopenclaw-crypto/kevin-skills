package tw.gov.pcc.tender.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tw.gov.pcc.tender.config.NvidiaProperties;

import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 撲克牌驗證碼辨識器
 * 使用 NVIDIA NIM Vision API (OpenAI 相容) 辨識撲克牌驗證碼
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CaptchaSolverService {

    private final NvidiaProperties nvidiaProps;
    private final ImagePreprocessService imagePreprocess;
    private final ObjectMapper objectMapper;

    /**
     * 預設 Prompt
     */
    private static final String CAPTCHA_PROMPT = """
            你是一個撲克牌辨識專家。這張圖片是一個驗證碼，包含兩個區域：
            
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
            """;

    /**
     * 用 NVIDIA NIM API 辨識撲克牌驗證碼
     *
     * @param imageBytes 驗證碼截圖
     * @param preprocess 是否進行圖片前處理（移除干擾線）
     * @return B區需要點擊的索引 (0-based)
     */
    public List<Integer> solve(byte[] imageBytes, boolean preprocess) {
        if (nvidiaProps.getApiKey() == null || nvidiaProps.getApiKey().isBlank()) {
            log.error("缺少 NVIDIA_API_KEY");
            return List.of();
        }

        // 圖片前處理
        byte[] processedBytes = imageBytes;
        if (preprocess) {
            try {
                processedBytes = imagePreprocess.removeInterferenceLines(imageBytes);
                log.info("  已完成圖片前處理（移除干擾線）");
            } catch (Exception e) {
                log.warn("  圖片前處理失敗，使用原圖: {}", e.getMessage());
            }
        }

        // Base64 encode
        String b64 = Base64.getEncoder().encodeToString(processedBytes);

        // 構建 OpenAI 相容的請求 body
        Map<String, Object> requestBody = buildRequestBody(b64);

        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl(nvidiaProps.getBaseUrl())
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + nvidiaProps.getApiKey())
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            String responseJson = restClient.post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseResponse(responseJson);
        } catch (Exception e) {
            log.error("Vision API 呼叫失敗: {}", e.getMessage());
            return List.of();
        }
    }

    public List<Integer> solve(byte[] imageBytes) {
        return solve(imageBytes, true);
    }

    private Map<String, Object> buildRequestBody(String base64Image) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", nvidiaProps.getVisionModel());
        body.put("max_tokens", 512);

        Map<String, Object> imageUrlContent = Map.of(
                "type", "image_url",
                "image_url", Map.of("url", "data:image/png;base64," + base64Image)
        );
        Map<String, Object> textContent = Map.of(
                "type", "text",
                "text", CAPTCHA_PROMPT
        );

        Map<String, Object> message = Map.of(
                "role", "user",
                "content", List.of(imageUrlContent, textContent)
        );
        body.put("messages", List.of(message));

        return body;
    }

    private List<Integer> parseResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            String content = root.at("/choices/0/message/content").asText("");
            log.info("Vision AI 回應: {}", content);
            return parseCaptchaJson(content);
        } catch (Exception e) {
            log.error("解析 Vision AI 回應失敗: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * 從 Vision AI 回應文字中提取 matches 索引列表。
     * 處理多種格式：純 JSON、markdown 包裹、多 JSON 區塊、escaped backslash 等。
     */
    List<Integer> parseCaptchaJson(String resultText) {
        // 清理 markdown 反斜線轉義
        String cleaned = resultText.replace("\\[", "[").replace("\\]", "]").replace("\\_", "_");

        // 嘗試精確匹配：含 "matches" 的單一 JSON 物件
        Pattern pattern = Pattern.compile("\\{[^{}]*\"matches\"[^{}]*\\}", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(cleaned);
        if (matcher.find()) {
            List<Integer> result = extractMatches(matcher.group());
            if (result != null) {
                log.info("配對索引: {}", result);
                return result;
            }
        }

        // Fallback：找所有 {...} 區塊
        Pattern fallback = Pattern.compile("\\{[^{}]+\\}");
        Matcher fallbackMatcher = fallback.matcher(cleaned);
        while (fallbackMatcher.find()) {
            List<Integer> result = extractMatches(fallbackMatcher.group());
            if (result != null) {
                log.info("配對索引 (fallback): {}", result);
                return result;
            }
        }

        log.error("無法解析 Vision AI 回應為 JSON: {}", resultText.substring(0, Math.min(200, resultText.length())));
        return List.of();
    }

    private List<Integer> extractMatches(String jsonStr) {
        try {
            JsonNode node = objectMapper.readTree(jsonStr);
            JsonNode matchesNode = node.get("matches");
            if (matchesNode != null && matchesNode.isArray()) {
                List<Integer> matches = new ArrayList<>();
                for (JsonNode m : matchesNode) {
                    matches.add(m.asInt());
                }
                return matches;
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
