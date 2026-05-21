-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    salutation VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country_code VARCHAR(50),
    phone_number VARCHAR(50),
    message TEXT,
    dealer_name VARCHAR(255),
    dealer_address VARCHAR(255),
    porsche_code VARCHAR(100),
    car_name VARCHAR(255),
    car_price DOUBLE,
    base_price DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
