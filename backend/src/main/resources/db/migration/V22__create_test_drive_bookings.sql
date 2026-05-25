-- Flyway migration V22: tạo bảng test_drive_bookings
DROP TABLE IF EXISTS test_drive_bookings;

CREATE TABLE test_drive_bookings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NULL,
    car_model_id BIGINT NULL,
    car_name VARCHAR(255) NULL,
    porsche_code VARCHAR(100) NULL,
    dealer_name VARCHAR(255) NULL,
    dealer_address VARCHAR(500) NULL,
    salutation VARCHAR(50) NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    email VARCHAR(255) NOT NULL,
    country_code VARCHAR(20) NULL,
    phone_number VARCHAR(50) NULL,
    preferred_date DATE NULL,
    preferred_time VARCHAR(50) NULL,
    message TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_note TEXT NULL,
    approved_at DATETIME NULL,
    rejected_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_test_drive_user FOREIGN KEY (user_id) REFERENCES `User` (id),
    CONSTRAINT fk_test_drive_car_model FOREIGN KEY (car_model_id) REFERENCES car_models (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for faster lookup
CREATE INDEX idx_test_drive_user ON test_drive_bookings (user_id);
CREATE INDEX idx_test_drive_car_model ON test_drive_bookings (car_model_id);
CREATE INDEX idx_test_drive_status ON test_drive_bookings (status);
