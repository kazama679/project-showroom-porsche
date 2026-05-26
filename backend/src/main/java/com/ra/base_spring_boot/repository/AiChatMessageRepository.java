package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    List<AiChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
}
