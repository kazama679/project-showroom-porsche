package com.ra.base_spring_boot.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.model.embedding.EmbeddingModel;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagRetrievalService {
    private static final int MAX_RESULTS = 5;
    private static final double MIN_SCORE = 0.62;

    private final KnowledgeDocumentRepository knowledgeDocumentRepository;
    private final EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper;

    public List<RetrievedKnowledge> retrieve(String question) {
        float[] queryVector = embeddingModel.embed(question).content().vector();
        return knowledgeDocumentRepository.findByIndexedTrueAndEmbeddingJsonIsNotNull().stream()
                .map(document -> score(document, queryVector))
                .filter(result -> result.getScore() >= MIN_SCORE)
                .sorted(Comparator.comparing(RetrievedKnowledge::getScore).reversed())
                .limit(MAX_RESULTS)
                .toList();
    }

    public String toJson(Embedding embedding) {
        try {
            return objectMapper.writeValueAsString(embedding.vector());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot serialize embedding", e);
        }
    }

    private RetrievedKnowledge score(KnowledgeDocument document, float[] queryVector) {
        try {
            List<Float> stored = objectMapper.readValue(document.getEmbeddingJson(), new TypeReference<>() {
            });
            float[] documentVector = new float[stored.size()];
            for (int i = 0; i < stored.size(); i++) {
                documentVector[i] = stored.get(i);
            }
            return RetrievedKnowledge.builder()
                    .document(document)
                    .score(cosineSimilarity(queryVector, documentVector))
                    .build();
        } catch (Exception e) {
            log.warn("Skipping invalid knowledge embedding id={}", document.getId(), e);
            return RetrievedKnowledge.builder().document(document).score(0.0).build();
        }
    }

    private double cosineSimilarity(float[] a, float[] b) {
        if (a.length == 0 || a.length != b.length) {
            return 0.0;
        }
        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    @Getter
    @Builder
    public static class RetrievedKnowledge {
        private KnowledgeDocument document;
        private double score;
    }
}
