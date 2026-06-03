DROP TABLE IF EXISTS ai_chat_messages;
DROP TABLE IF EXISTS ai_chat_sessions;

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_ref VARCHAR(100),
    embedding_json LONGTEXT,
    indexed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_knowledge_source (source_type, source_ref),
    INDEX idx_knowledge_indexed (indexed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO knowledge_documents (title, content, source_type, source_ref, indexed, created_at, updated_at)
VALUES
(
    'Chinh sach lai thu mac dinh',
    'Loai du lieu: FAQ noi bo. Khach hang co the gui yeu cau lai thu tren website. Nhan vien showroom se xem xet, xac nhan lich hen va mau xe truoc khi lich lai thu co hieu luc. Khach hang can cung cap thong tin lien he hop le khi dat lich.',
    'ADMIN_FAQ',
    'seed:test-drive-policy',
    FALSE,
    NOW(6),
    NOW(6)
),
(
    'FAQ RAG demo',
    'Loai du lieu: FAQ noi bo. Ma demo RAG noi bo la PORSCHE-RAG-TEST-2026. Neu khach hoi ve ma demo nay, day la du lieu chi co trong knowledge base cua showroom.',
    'ADMIN_FAQ',
    'seed:rag-demo',
    FALSE,
    NOW(6),
    NOW(6)
);
