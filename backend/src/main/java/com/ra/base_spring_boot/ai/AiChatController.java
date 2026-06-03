package com.ra.base_spring_boot.ai;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AiChatController {
    private final AiChatService aiChatService;
    private final RagIngestionService ragIngestionService;

    @PostMapping("/api/ai/chat")
    public ResponseEntity<ResponseWrapper> chat(@Valid @RequestBody AiChatRequest request) {
        return ok(aiChatService.chat(request));
    }

    @PostMapping("/api/admin/ai/knowledge")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ResponseWrapper> createKnowledge(@Valid @RequestBody KnowledgeDocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseWrapper.builder()
                .status(HttpStatus.CREATED)
                .code(201)
                .data(ragIngestionService.addAdminDocument(request))
                .build());
    }

    @GetMapping("/api/admin/ai/knowledge")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ResponseWrapper> getKnowledge() {
        return ok(ragIngestionService.findAll());
    }

    @PostMapping("/api/admin/ai/reindex")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ResponseWrapper> reindex() {
        return ok(ReindexResponse.builder()
                .indexedDocuments(ragIngestionService.reindexAll())
                .build());
    }

    private ResponseEntity<ResponseWrapper> ok(Object data) {
        return ResponseEntity.ok(ResponseWrapper.builder()
                .status(HttpStatus.OK)
                .code(200)
                .data(data)
                .build());
    }
}
