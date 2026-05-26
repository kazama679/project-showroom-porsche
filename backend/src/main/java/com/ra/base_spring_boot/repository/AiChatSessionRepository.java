package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.AiChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiChatSessionRepository extends JpaRepository<AiChatSession, Long> {
    Optional<AiChatSession> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    List<AiChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    @Override
    @org.springframework.lang.NonNull
    Page<AiChatSession> findAll(@org.springframework.lang.NonNull Pageable pageable);
    
    Page<AiChatSession> findByUserId(Long userId, Pageable pageable);
}
