package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.req.AiChatRequestDTO;
import com.ra.base_spring_boot.dto.res.AiChatResponseDTO;
import com.ra.base_spring_boot.entity.User;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai-chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping
    public ResponseEntity<AiChatResponseDTO> sendMessage(
            @RequestBody AiChatRequestDTO request,
            @AuthenticationPrincipal MyUserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userDetails.getUser();

        return ResponseEntity.ok(aiChatService.handleChat(request, user.getId()));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getHistory(@PathVariable Long sessionId, @AuthenticationPrincipal MyUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(aiChatService.getSessionHistory(sessionId));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getMySessions(@AuthenticationPrincipal MyUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(aiChatService.getUserSessions(userDetails.getUser().getId()));
    }

}
