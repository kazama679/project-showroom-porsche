CREATE TABLE ai_chat_sessions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    CONSTRAINT fk_ai_chat_session_user FOREIGN KEY (user_id) REFERENCES `User` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_chat_messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    session_id BIGINT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    content TEXT,
    recommended_car_ids VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_ai_chat_message_session FOREIGN KEY (session_id) REFERENCES ai_chat_sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
