package com.ra.base_spring_boot.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {
    List<KnowledgeDocument> findByIndexedTrueAndEmbeddingJsonIsNotNull();

    List<KnowledgeDocument> findBySourceTypeOrderByUpdatedAtDesc(String sourceType);

    Optional<KnowledgeDocument> findBySourceTypeAndSourceRef(String sourceType, String sourceRef);

    void deleteBySourceTypeIn(Collection<String> sourceTypes);
}
