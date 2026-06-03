package com.ra.base_spring_boot.ai;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Configuration
public class LangChain4jAiConfig {
    @Bean
    public ChatModel geminiChatModel(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-2.5-flash}") String model,
            @Value("${gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl
    ) {
        GoogleAiGeminiChatModel.GoogleAiGeminiChatModelBuilder builder = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(model)
                .temperature(0.2)
                .timeout(Duration.ofSeconds(45));

        if (StringUtils.hasText(baseUrl) && !"https://generativelanguage.googleapis.com".equals(baseUrl)) {
            builder.baseUrl(baseUrl);
        }

        return builder.build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return new AllMiniLmL6V2EmbeddingModel();
    }
}
