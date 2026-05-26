package com.ra.base_spring_boot.controller.admin;

import com.ra.base_spring_boot.entity.AiChatSession;
import com.ra.base_spring_boot.repository.AiChatSessionRepository;
import com.ra.base_spring_boot.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/ai-chat")
@RequiredArgsConstructor
public class AdminAiChatController {

    private final AiChatSessionRepository sessionRepository;
    private final AiChatService aiChatService;

    @GetMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<AiChatSession> sessionPage = sessionRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
                
        Map<String, Object> response = new HashMap<>();
        response.put("data", sessionPage.getContent().stream().map(session -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", session.getId());
            map.put("userId", session.getUser().getId());
            map.put("username", session.getUser().getUsername());
            map.put("fullName", session.getUser().getFullName());
            map.put("createdAt", session.getCreatedAt());
            map.put("status", session.getStatus());
            return map;
        }).toList());
        response.put("total", sessionPage.getTotalElements());
        response.put("currentPage", sessionPage.getNumber());
        response.put("totalPages", sessionPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSessionDetail(@PathVariable Long sessionId) {
        return ResponseEntity.ok(aiChatService.getSessionHistory(sessionId));
    }
}
