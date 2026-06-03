package com.ra.base_spring_boot.ai;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class KnowledgeDocumentResponse {
    private Long id;
    private String title;
    private String content;
    private String sourceType;
    private String sourceRef;
    private Boolean indexed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
