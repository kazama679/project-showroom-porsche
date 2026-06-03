package com.ra.base_spring_boot.ai;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AiChatResponse {
    private String answer;
    private List<AiSourceDto> sources;
    private Double confidence;
    private Boolean usedInternalKnowledge;
}
