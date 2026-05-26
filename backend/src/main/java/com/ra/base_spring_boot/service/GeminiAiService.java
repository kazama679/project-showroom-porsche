package com.ra.base_spring_boot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiAiService {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com}")
    private String geminiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String buildApiUrl() {
        return geminiBaseUrl + "/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;
    }

    public String generateChatResponse(String userMessage, List<Map<String, Object>> carsData) {
        String url = buildApiUrl();

        try {
            String context = "Bạn là Cố vấn AI của showroom Porsche. Nhiệm vụ của bạn là đề xuất xe phù hợp dựa trên yêu cầu và ngân sách của khách hàng. " +
                    "Hãy sử dụng giọng điệu chuyên nghiệp, lịch sự và thân thiện. " +
                    "YÊU CẦU BẮT BUỘC: LUÔN LUÔN trả lời bằng Tiếng Việt.\n" +
                    "Dưới đây là danh sách các mẫu xe Porsche hiện có:\n" +
                    objectMapper.writeValueAsString(carsData) +
                    "\n\nKhách hàng nói: " + userMessage + "\n\n" +
                    "QUAN TRỌNG: Bạn PHẢI trả lời theo đúng định dạng JSON sau, không bọc trong markdown:\n" +
                    "{\n" +
                    "  \"response_text\": \"Nội dung tư vấn của bạn ở đây\",\n" +
                    "  \"recommended_car_ids\": [1, 2]\n" +
                    "}\n" +
                    "Nếu không có xe phù hợp thì để recommended_car_ids là mảng rỗng [].";

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", context);
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", Collections.singletonList(parts));
            requestBody.put("contents", Collections.singletonList(contents));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Calling Gemini API: model={}", geminiModel);
            String response = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            return textNode.asText();

        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: {}", e.getMessage());
            return "{\"response_text\": \"Tôi xin lỗi, hiện tại hệ thống AI tư vấn đang bận. Vui lòng thử lại sau.\", \"recommended_car_ids\": []}";
        }
    }
}
