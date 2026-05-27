-- Vehicle Listings table (Sell Your Porsche feature)
CREATE TABLE vehicle_listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 1. Vehicle Information
    vin VARCHAR(17),
    make VARCHAR(100),
    model VARCHAR(100),
    trim_level VARCHAR(100),
    model_year INT,
    mileage INT,
    exterior_color VARCHAR(100),
    interior_color VARCHAR(100),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    drivetrain VARCHAR(50),
    seats INT,
    registration_area VARCHAR(200),

    -- 2. Pricing & Transaction
    asking_price DECIMAL(12,2),
    is_negotiable BOOLEAN DEFAULT FALSE,
    payment_methods VARCHAR(500),
    has_lien BOOLEAN DEFAULT FALSE,
    zip_code VARCHAR(20),
    city VARCHAR(200),
    state_province VARCHAR(200),
    supports_shipping BOOLEAN DEFAULT FALSE,
    accepts_trade_in BOOLEAN DEFAULT FALSE,

    -- 3. Vehicle Condition
    has_accident BOOLEAN DEFAULT FALSE,
    accident_description TEXT,
    has_flood_damage BOOLEAN DEFAULT FALSE,
    has_repaint BOOLEAN DEFAULT FALSE,
    repaint_description VARCHAR(500),
    engine_condition VARCHAR(200),
    transmission_condition VARCHAR(200),
    tire_condition VARCHAR(200),
    brake_condition VARCHAR(200),
    has_warning_lights BOOLEAN DEFAULT FALSE,
    has_electrical_issues BOOLEAN DEFAULT FALSE,
    has_modifications BOOLEAN DEFAULT FALSE,
    modifications_description VARCHAR(500),
    has_smoking_pet_exposure BOOLEAN DEFAULT FALSE,
    condition_description TEXT,

    -- 4. Maintenance History & Documents
    has_service_records BOOLEAN DEFAULT FALSE,
    dealer_serviced BOOLEAN DEFAULT FALSE,
    last_service_mileage INT,
    has_repair_invoices BOOLEAN DEFAULT FALSE,
    title_status VARCHAR(50),
    has_open_recalls BOOLEAN DEFAULT FALSE,
    registration_valid_until VARCHAR(50),
    owner_number INT,
    has_carfax_report BOOLEAN DEFAULT FALSE,

    -- 5. Seller Contact
    seller_full_name VARCHAR(200),
    seller_phone VARCHAR(50),
    seller_email VARCHAR(200),
    seller_city VARCHAR(200),
    seller_state VARCHAR(200),
    seller_type VARCHAR(50),
    preferred_contact_time VARCHAR(200),
    preferred_contact_method VARCHAR(200),

    -- Status & Timestamps
    status VARCHAR(20) DEFAULT 'PENDING',
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_vin (vin),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehicle Listing Images
CREATE TABLE vehicle_listing_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES vehicle_listings(id) ON DELETE CASCADE,
    INDEX idx_listing_id (listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
