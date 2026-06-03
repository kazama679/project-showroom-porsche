package com.ra.base_spring_boot.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatRequest {
    @NotBlank
    @Size(max = 2000)
    private String message;
}
