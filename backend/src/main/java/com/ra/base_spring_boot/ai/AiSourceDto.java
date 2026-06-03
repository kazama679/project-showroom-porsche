package com.ra.base_spring_boot.ai;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiSourceDto {
    private Long id;
    private String title;
    private String sourceType;
    private String sourceRef;
    private String imageUrl;
    private Double score;
}
