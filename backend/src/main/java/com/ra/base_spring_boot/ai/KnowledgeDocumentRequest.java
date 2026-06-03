package com.ra.base_spring_boot.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KnowledgeDocumentRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String content;

    @Size(max = 50)
    private String sourceType = "ADMIN_FAQ";
}
