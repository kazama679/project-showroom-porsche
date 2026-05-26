package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_chat_sessions")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AiChatSession extends BaseCreatedObject {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<AiChatMessage> messages = new ArrayList<>();
}
