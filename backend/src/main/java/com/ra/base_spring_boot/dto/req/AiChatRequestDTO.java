package com.ra.base_spring_boot.dto.req;

import lombok.Data;

@Data
public class AiChatRequestDTO {
    private String message;
    private Long sessionId; // Can be null for new session
}
