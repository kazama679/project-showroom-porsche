package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_chat_messages")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AiChatMessage extends BaseCreatedObject {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AiChatSession session;

    @Column(name = "sender", nullable = false, length = 50)
    private String sender; // USER or AI

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "recommended_car_ids", length = 255)
    private String recommendedCarIds; // Comma separated IDs or JSON array
}
