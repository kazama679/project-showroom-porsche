-- Phiên bản schema + seed ban đầu (Flyway V1). Mọi thay đổi sau: thêm V2__, V3__, ...
-- Thứ tự: CREATE theo FK, rồi INSERT + AUTO_INCREMENT từng nhóm.
CREATE DATABASE IF NOT EXISTS showroom_porsche CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE showroom_porsche;

-- ========== Role ==========
CREATE TABLE `Role` (
    id BIGINT NOT NULL AUTO_INCREMENT,
    roleName VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Role` (id, roleName) VALUES
    (1, 'ROLE_ADMIN'),
    (2, 'ROLE_POSTER'),
    (3, 'ROLE_USER');

ALTER TABLE `Role` AUTO_INCREMENT = 4;

-- ========== User + user_role ==========
CREATE TABLE `User` (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255),
    username VARCHAR(255),
    passwordF VARCHAR(255),
    email VARCHAR(255),
    status TINYINT(1),
    enabled TINYINT(1),
    PRIMARY KEY (id),
    UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES `User` (id),
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES `Role` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mật khẩu mẫu: password (BCrypt)
INSERT INTO `User` (id, full_name, username, passwordF, email, status, enabled) VALUES
    (1, 'Demo User', 'demouser', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'demo@showroom.local', true, true);

INSERT INTO user_role (user_id, role_id) VALUES
    (1, 3);

ALTER TABLE `User` AUTO_INCREMENT = 2;

-- ========== Status ==========
CREATE TABLE statuses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL,
    is_active TINYINT(1),
    PRIMARY KEY (id),
    UNIQUE KEY uk_status_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO statuses (id, created_at, code, name, description, entity_type, is_active) VALUES
    (1, NOW(6), 'BUILD_DRAFT', 'Bản nháp', 'Cấu hình xe đang soạn thảo', 'CAR_BUILD', true),
    (2, NOW(6), 'BUILD_SUBMITTED', 'Đã gửi', 'Đã gửi cấu hình', 'CAR_BUILD', true),
    (3, NOW(6), 'REVIEW_PENDING', 'Chờ duyệt', 'Đánh giá chờ duyệt', 'REVIEW', true);

ALTER TABLE statuses AUTO_INCREMENT = 4;

-- ========== Brand ==========
CREATE TABLE brands (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    country VARCHAR(100),
    logo_url VARCHAR(500),
    PRIMARY KEY (id),
    UNIQUE KEY uk_brands_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO brands (id, name, country, logo_url) VALUES
    (4, 'Porsche', 'Germany', NULL);

ALTER TABLE brands AUTO_INCREMENT = 5;

-- ========== Body type ==========
CREATE TABLE body_types (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO body_types (id, created_at, name, description) VALUES
    (1, NOW(6), 'Coupe', NULL),
    (2, NOW(6), 'Roadster', NULL);

ALTER TABLE body_types AUTO_INCREMENT = 3;

-- ========== Car series ==========
CREATE TABLE car_series (
    id BIGINT NOT NULL AUTO_INCREMENT,
    brand_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active TINYINT(1),
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    PRIMARY KEY (id),
    KEY idx_series_brand (brand_id),
    CONSTRAINT fk_car_series_brand FOREIGN KEY (brand_id) REFERENCES brands (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_series (id, brand_id, name, description, is_active, image_url, video_url) VALUES
    (7, 4, '911', 'Mẫu xe thể thao huyền thoại với động cơ đặt phía sau: 2 cửa, 2+2 chỗ ngồi', true,
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552366/porsche/5459eb42-bac0-4343-abd0-257f85362eae.webp',
     'https://res.cloudinary.com/dfireq2op/video/upload/v1778552370/porsche/videos/47f3fd77-de2a-4ca2-b718-49bae15509a6.mp4'),
    (8, 4, '718', ' Xe thể thao động cơ đặt giữa, chính xác: 2 cửa, 2 chỗ ngồi.', true,
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552491/porsche/1eb475fe-e5c0-42f8-8e36-c16fa8ffbe75.webp',
     'https://res.cloudinary.com/dfireq2op/video/upload/v1778552496/porsche/videos/90f857fb-2e44-4801-b8c7-37faae252a8c.mp4'),
    (9, 4, 'Taycan', 'Xe thể thao điện: 4 cửa, tối đa 5 chỗ ngồi.', true,
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552541/porsche/7da222ff-f087-4233-a950-aa92d5a4dc33.webp',
     'https://res.cloudinary.com/dfireq2op/video/upload/v1778552545/porsche/videos/caefb710-2279-49ae-9929-e4fcceeaaeb1.mp4'),
    (10, 4, 'Panamera', 'Xe sedan hạng sang với mức độ tiện nghi cao: 4 cửa, tối đa 5 chỗ ngồi.', true,
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552612/porsche/9b83e46c-68aa-44d0-b954-81637565951c.webp',
     'https://res.cloudinary.com/dfireq2op/video/upload/v1778552616/porsche/videos/901e0811-7247-4172-80e5-a3f06a2ffdc2.mp4'),
    (11, 4, 'Macan', 'SUV thể thao cỡ nhỏ: 4 cửa, 5 chỗ ngồi.', true,
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552659/porsche/1f073c94-8482-4a8d-bb7f-4d96411e73d7.webp',
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552663/porsche/videos/3d2de76b-eb92-4bfc-a257-07a88e48bdb7.mp4'),
    (12, 4, 'Cayenne', 'Xe SUV đa năng: 4 cửa, tối đa 5 chỗ ngồi.', true,
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552712/porsche/fa971f64-4951-445c-a153-e1dbe201b178.webp',
     'https://res.cloudinary.com/dfireq2op/image/upload/v1778552715/porsche/videos/661a1306-e465-45cc-a273-d4befb1fb5cd.mp4');

ALTER TABLE car_series AUTO_INCREMENT = 13;

-- ========== Car model ==========
CREATE TABLE car_models (
    id BIGINT NOT NULL AUTO_INCREMENT,
    series_id BIGINT NOT NULL,
    body_type_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    base_price DECIMAL(15, 2) NOT NULL,
    short_description TEXT,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    seats INT,
    is_active TINYINT(1),
    PRIMARY KEY (id),
    KEY idx_model_series (series_id),
    KEY idx_model_body (body_type_id),
    KEY idx_model_price (base_price),
    CONSTRAINT fk_car_models_series FOREIGN KEY (series_id) REFERENCES car_series (id),
    CONSTRAINT fk_car_models_body_type FOREIGN KEY (body_type_id) REFERENCES body_types (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_models (id, base_price, fuel_type, is_active, name, seats, short_description, transmission, year, body_type_id, series_id) VALUES
    (2, 135500.00, 'Gasoline', true, '911 Carrera', 4, 'Động cơ tăng áp kép 6 xy-lanh mang lại cảm giác lái vượt trội.', 'PDK (Tự động 8 cấp)', 2024, 2, 7),
    (4, 148000.00, 'Gasoline', true, '911 Carrena T', 4, 'Porsche 911 Carrera T (Touring) là một trải nghiệm đặc biệt tập trung vào trải nghiệm tinh túy, giữa phiên bản 911 Carrera và 911 Carrera S . Đây là mẫu xe lý tưởng cho những người đam mê mê cảm giác Lái xe thể thao thực sự cảm ơn nhờ thiết kế nhẹ nhàng hơn và trang bị tinh giản.', 'Automatic', 2026, 1, 7),
    (5, 156200.00, 'Gasoline', true, '911 Carrera S', 4, 'Porsche 911 Carrera S(thế hệ 992) là biểu tượng xe thể thao hạng sang của Đức, nổi tiếng với sự kết hợp hoàn hảo giữa hiệu suất siêu xe và khả năng sử dụng hàng ngày.', 'Automatic', 2026, 2, 7),
    (7, 164000.00, 'Gasoline', true, '911 Carrena 4S', 4, 'Porsche 911 Carrera 4Slà bản thể thao cao cấp thuộc dòng 911 danh tiếng, nổi bật với sự kết hợp hoàn hảo giữa hiệu suất mạnh mẽ và khả năng bám đường vượt trội nhờ hệ thống động 4 bánh (4) và trang bị cao cấp (S) ', 'Automatic', 2026, 1, 7),
    (8, 75400.00, 'Gasoline', true, '718 Cayman', 2, 'Giá bán lẻ đề xuất của nhà sản xuất. Không bao gồm các tùy chọn; thuế; quyền sở hữu; đăng ký; phí giao hàng, xử lý và quản lý; phí đại lý; thuế quan tiềm năng. Đại lý ấn định giá bán thực tế.', 'Automatic/Manual', 2026, 2, 8),
    (9, 77600.00, 'Electric', true, ' 718 Boxster', 4, '', 'Automatic/Manual', 2026, 2, 8),
    (10, 82100.00, 'Hybrid', true, '718 Cayman Style Edition', 4, '', 'Automatic/Manual', 2026, 1, 8),
    (11, 84200.00, 'Gasoline', true, '718 Boxster Style Edition', 4, '', 'Automatic/Manual', 2026, 2, 8);

ALTER TABLE car_models AUTO_INCREMENT = 12;

-- ========== Car image ==========
CREATE TABLE car_images (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    car_model_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    sort_order INT,
    is_default TINYINT(1),
    PRIMARY KEY (id),
    CONSTRAINT fk_car_images_model FOREIGN KEY (car_model_id) REFERENCES car_models (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_images (id, created_at, car_model_id, image_url, image_type, sort_order, is_default) VALUES
    (7, '2026-05-11 04:03:58.422539', 2, 'https://a.storyblok.com/f/322327/2616x712/5d81165a01/cz25w01ix0010911-carrera-side.png/m/1800x490/smart/filters:format(avif)?dpl=dpl_AHR3Thhn9JKV9Dr5mGEDexMkWjPU', 'list', 1, true),
    (8, '2026-05-11 07:59:54.076922', 4, 'https://a.storyblok.com/f/322327/2616x712/7e18df530b/cz25w25ix0010-911-carrera-t-side.png/m/1800x490/smart/filters:format(avif)?dpl=dpl_AHR3Thhn9JKV9Dr5mGEDexMkWjPU', 'list', 1, true),
    (9, '2026-05-11 08:00:19.322996', 5, 'https://a.storyblok.com/f/322327/2616x712/e83c329a04/cz26w03ix0010-911-carrera-s-side.png/m/1800x490/smart/filters:format(avif)?dpl=dpl_AHR3Thhn9JKV9Dr5mGEDexMkWjPU', 'list', 1, true),
    (10, '2026-05-11 08:01:00.418779', 7, 'https://a.storyblok.com/f/322327/2616x712/d8c77a8efa/cz26w05ix0010-911-carrera-4s-side.png/m/1800x490/smart/filters:format(avif)?dpl=dpl_AHR3Thhn9JKV9Dr5mGEDexMkWjPU', 'list', 1, true),
    (11, '2026-05-12 03:03:41.462949', 8, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778555021/porsche/5549363f-43b5-4c43-9ede-27c01a091c40.avif', 'list', 1, true),
    (12, '2026-05-12 03:04:27.085645', 9, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778555066/porsche/8b0b8dc2-c21f-4405-ae59-1c3369d058be.avif', 'list', 1, true),
    (13, '2026-05-12 03:04:57.074967', 10, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778555096/porsche/c7e0480f-33c7-4313-8089-af743573a8f8.avif', 'list', 1, true),
    (14, '2026-05-12 03:05:31.722705', 11, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778555130/porsche/ffc3c5fa-d1f1-4b3b-a616-bcab0eef715f.avif', 'list', 1, true),
    (15, '2026-05-13 04:53:58.795971', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif', 'detail', 1, true),
    (16, '2026-05-13 08:30:12.253007', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661011/porsche/305482cb-a5b2-48cc-8c64-2826fdc29d3b.avif', 'detail', 2, true),
    (17, '2026-05-13 08:30:51.554960', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661051/porsche/7c590c2e-342d-4688-9b32-fef59d3850bc.avif', 'detail', 3, true),
    (18, '2026-05-13 08:31:26.977718', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661086/porsche/9abe3dfc-d98a-42d1-806e-49da8a25ca8d.avif', 'detail', 4, true),
    (19, '2026-05-13 08:34:49.627337', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661386/porsche/12032f7e-0550-45a9-8a0b-154eb0e95ccb.avif', 'detail', 5, true),
    (20, '2026-05-13 08:36:52.218830', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661411/porsche/2f1445f2-f116-4278-b366-b7a81c1d6b7e.avif', 'detail', 5, true),
    (21, '2026-05-13 08:37:01.541732', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661421/porsche/a3324740-1506-431d-b584-f12f86f43f55.avif', 'detail', 5, true),
    (22, '2026-05-13 08:37:11.880853', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661431/porsche/a432fd03-595c-4396-81ab-7d651ff3b492.avif', 'detail', 5, true),
    (23, '2026-05-13 08:37:33.375398', 2, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661453/porsche/110e95b2-0f86-42fe-8502-1397b5da6eb9.avif', 'detail', 5, true);

ALTER TABLE car_images AUTO_INCREMENT = 24;

-- ========== Option catalog ==========
CREATE TABLE option_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    display_order INT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO option_categories (id, name, display_order) VALUES
    (1, 'Ngoại thất', 1),
    (2, 'Nội thất', 2),
    (3, 'Công nghệ', 3);

ALTER TABLE option_categories AUTO_INCREMENT = 4;

CREATE TABLE option_groups (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    display_order INT,
    PRIMARY KEY (id),
    CONSTRAINT fk_option_groups_category FOREIGN KEY (category_id) REFERENCES option_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO option_groups (id, category_id, name, display_order) VALUES
    (1, 1, 'Mâm xe', 1),
    (2, 1, 'Sơn ngoại thất', 2),
    (3, 2, 'Ghế', 1);

ALTER TABLE option_groups AUTO_INCREMENT = 4;

CREATE TABLE option_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    option_group_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2),
    image_url VARCHAR(500),
    is_default TINYINT(1),
    PRIMARY KEY (id),
    CONSTRAINT fk_option_items_group FOREIGN KEY (option_group_id) REFERENCES option_groups (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO option_items (id, option_group_id, name, description, price, image_url, is_default) VALUES
    (1, 1, 'Mâm 20 inch', 'Bánh xe hợp kim 20 inch', 1200.00, NULL, true),
    (2, 1, 'Mâm 21 inch', 'Bánh xe hợp kim 21 inch SportDesign', 2800.00, NULL, false),
    (3, 2, 'Sơn Carrara White Trắng', 'Màu sơn kim loại', 0.00, NULL, true),
    (4, 3, 'Ghế thể thao Plus', 'Ghế chỉnh điện 14 hướng', 1500.00, NULL, false);

ALTER TABLE option_items AUTO_INCREMENT = 5;

CREATE TABLE option_rules (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    source_option_id BIGINT NOT NULL,
    target_option_id BIGINT NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_option_rules_source FOREIGN KEY (source_option_id) REFERENCES option_items (id),
    CONSTRAINT fk_option_rules_target FOREIGN KEY (target_option_id) REFERENCES option_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO option_rules (id, created_at, source_option_id, target_option_id, rule_type) VALUES
    (1, NOW(6), 1, 2, 'INCOMPATIBLE'),
    (2, NOW(6), 1, 3, 'REQUIRES');

ALTER TABLE option_rules AUTO_INCREMENT = 3;

CREATE TABLE car_model_options (
    id BIGINT NOT NULL AUTO_INCREMENT,
    car_model_id BIGINT NOT NULL,
    option_item_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_car_model_option (car_model_id, option_item_id),
    CONSTRAINT fk_cmo_model FOREIGN KEY (car_model_id) REFERENCES car_models (id),
    CONSTRAINT fk_cmo_option FOREIGN KEY (option_item_id) REFERENCES option_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_model_options (id, car_model_id, option_item_id) VALUES
    (1, 2, 1),
    (2, 2, 3),
    (3, 4, 2),
    (4, 8, 1);

ALTER TABLE car_model_options AUTO_INCREMENT = 5;

-- ========== Spec ==========
CREATE TABLE spec_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    display_order INT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO spec_categories (id, name, display_order) VALUES
    (1, 'Động cơ & vận hành', 1),
    (2, 'Kích thước', 2),
    (3, 'Tiện nghi', 3);

ALTER TABLE spec_categories AUTO_INCREMENT = 4;

CREATE TABLE spec_definitions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(50),
    display_order INT,
    PRIMARY KEY (id),
    CONSTRAINT fk_spec_definitions_category FOREIGN KEY (category_id) REFERENCES spec_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO spec_definitions (id, category_id, name, unit, display_order) VALUES
    (1, 1, 'Dung tích xi-lanh', 'cc', 1),
    (2, 1, 'Công suất tối đa', 'mã lực', 2),
    (3, 2, 'Chiều dài cơ sở', 'mm', 1),
    (4, 3, 'Hệ thống âm thanh', NULL, 1);

ALTER TABLE spec_definitions AUTO_INCREMENT = 5;

CREATE TABLE car_spec_values (
    id BIGINT NOT NULL AUTO_INCREMENT,
    car_model_id BIGINT NOT NULL,
    spec_definition_id BIGINT NOT NULL,
    value VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_car_spec_value (car_model_id, spec_definition_id),
    CONSTRAINT fk_csv_model FOREIGN KEY (car_model_id) REFERENCES car_models (id),
    CONSTRAINT fk_csv_spec FOREIGN KEY (spec_definition_id) REFERENCES spec_definitions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_spec_values (id, car_model_id, spec_definition_id, value) VALUES
    (1, 2, 1, '2981'),
    (2, 2, 2, '385'),
    (3, 2, 3, '2450'),
    (4, 2, 4, 'BOSE Surround'),
    (5, 8, 1, '2497'),
    (6, 9, 2, '366');

ALTER TABLE car_spec_values AUTO_INCREMENT = 7;

CREATE TABLE car_engine_specs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    car_model_id BIGINT NOT NULL,
    engine_type VARCHAR(50),
    drivetrain VARCHAR(50),
    fuel_consumption DECIMAL(5, 2),
    PRIMARY KEY (id),
    UNIQUE KEY uk_car_engine_model (car_model_id),
    CONSTRAINT fk_car_engine_model FOREIGN KEY (car_model_id) REFERENCES car_models (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_engine_specs (id, created_at, car_model_id, engine_type, drivetrain, fuel_consumption) VALUES
    (1, NOW(6), 2, 'Twin-turbo flat-6', 'RWD', 10.50),
    (2, NOW(6), 4, 'Twin-turbo flat-6', 'RWD', 10.80),
    (3, NOW(6), 5, 'Twin-turbo flat-6', 'RWD', 11.00),
    (4, NOW(6), 7, 'Twin-turbo flat-6', 'AWD', 11.20),
    (5, NOW(6), 8, 'Turbo flat-4', 'RWD', 8.90),
    (6, NOW(6), 9, 'Electric motor', 'RWD', NULL),
    (7, NOW(6), 10, 'Turbo flat-4', 'RWD', 9.10),
    (8, NOW(6), 11, 'Turbo flat-4', 'RWD', 9.20);

ALTER TABLE car_engine_specs AUTO_INCREMENT = 9;

CREATE TABLE car_electric_specs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    car_model_id BIGINT NOT NULL,
    range_km INT,
    battery_capacity DECIMAL(6, 2),
    charging_time DECIMAL(5, 2),
    PRIMARY KEY (id),
    UNIQUE KEY uk_car_electric_model (car_model_id),
    CONSTRAINT fk_car_electric_model FOREIGN KEY (car_model_id) REFERENCES car_models (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_electric_specs (id, created_at, car_model_id, range_km, battery_capacity, charging_time) VALUES
    (1, NOW(6), 9, 425, 82.00, 5.50);

ALTER TABLE car_electric_specs AUTO_INCREMENT = 2;

CREATE TABLE car_performance_specs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    car_model_id BIGINT NOT NULL,
    horsepower INT,
    acceleration_0_100 DECIMAL(5, 2),
    top_speed INT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_car_perf_model (car_model_id),
    CONSTRAINT fk_car_perf_model FOREIGN KEY (car_model_id) REFERENCES car_models (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_performance_specs (id, created_at, car_model_id, horsepower, acceleration_0_100, top_speed) VALUES
    (1, NOW(6), 2, 385, 4.00, 293),
    (2, NOW(6), 4, 385, 4.50, 291),
    (3, NOW(6), 5, 450, 3.50, 306),
    (4, NOW(6), 7, 450, 3.40, 306),
    (5, NOW(6), 8, 300, 4.90, 275),
    (6, NOW(6), 9, 366, 4.90, 275),
    (7, NOW(6), 10, 300, 5.00, 272),
    (8, NOW(6), 11, 300, 5.00, 272);

ALTER TABLE car_performance_specs AUTO_INCREMENT = 9;

-- ========== Showroom ==========
CREATE TABLE showroom_locations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    phone VARCHAR(50),
    opening_hours VARCHAR(255),
    is_active TINYINT(1),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO showroom_locations (id, created_at, name, address, city, latitude, longitude, phone, opening_hours, is_active) VALUES
    (1, NOW(6), 'Porsche Centre Saigon', '123 Nguyen Van Troi', 'Ho Chi Minh City', 10.7820000, 106.6950000, '+84 28 1234 5678', '08:00 - 18:00', true),
    (2, NOW(6), 'Porsche Studio Hanoi', '88 Lang Ha', 'Hanoi', 21.0165000, 105.8040000, '+84 24 9876 5432', '09:00 - 19:00', true);

ALTER TABLE showroom_locations AUTO_INCREMENT = 3;

-- ========== Build ==========
CREATE TABLE car_builds (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    car_model_id BIGINT NOT NULL,
    base_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3),
    status_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_car_builds_user FOREIGN KEY (user_id) REFERENCES `User` (id),
    CONSTRAINT fk_car_builds_model FOREIGN KEY (car_model_id) REFERENCES car_models (id),
    CONSTRAINT fk_car_builds_status FOREIGN KEY (status_id) REFERENCES statuses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO car_builds (id, user_id, car_model_id, base_price, total_price, currency, status_id) VALUES
    (1, 1, 2, 135500.00, 138800.00, 'USD', 1),
    (2, 1, 8, 75400.00, 76600.00, 'USD', 2);

ALTER TABLE car_builds AUTO_INCREMENT = 3;

CREATE TABLE build_options (
    id BIGINT NOT NULL AUTO_INCREMENT,
    build_id BIGINT NOT NULL,
    option_item_id BIGINT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_build_options_build FOREIGN KEY (build_id) REFERENCES car_builds (id),
    CONSTRAINT fk_build_options_item FOREIGN KEY (option_item_id) REFERENCES option_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO build_options (id, build_id, option_item_id, price) VALUES
    (1, 1, 2, 2800.00),
    (2, 1, 4, 1500.00),
    (3, 2, 1, 1200.00);

ALTER TABLE build_options AUTO_INCREMENT = 4;

-- ========== Blog ==========
CREATE TABLE blog_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    parent_id BIGINT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_blog_categories_slug (slug),
    CONSTRAINT fk_blog_categories_parent FOREIGN KEY (parent_id) REFERENCES blog_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO blog_categories (id, created_at, name, slug, parent_id) VALUES
    (1, NOW(6), 'Tin tức', 'tin-tuc', NULL),
    (2, NOW(6), 'Hướng dẫn', 'huong-dan', NULL);

ALTER TABLE blog_categories AUTO_INCREMENT = 3;

CREATE TABLE blog_posts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    summary TEXT,
    content LONGTEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    author_id BIGINT NOT NULL,
    published_at DATETIME(6),
    status VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uk_blog_posts_slug (slug),
    CONSTRAINT fk_blog_posts_category FOREIGN KEY (category_id) REFERENCES blog_categories (id),
    CONSTRAINT fk_blog_posts_author FOREIGN KEY (author_id) REFERENCES `User` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO blog_posts (id, created_at, category_id, title, slug, summary, content, thumbnail_url, author_id, published_at, status) VALUES
    (1, NOW(6), 1, 'Chào mừng đến Porsche Showroom', 'chao-mung-porsche', 'Giới thiệu showroom', '<p>Nội dung bài viết mẫu.</p>', NULL, 1, NOW(6), 'PUBLISHED'),
    (2, NOW(6), 2, 'Cách đặt lịch lái thử', 'dat-lich-lai-thu', 'Hướng dẫn nhanh', '<p>Các bước đặt lịch lái thử xe Porsche.</p>', NULL, 1, NULL, 'DRAFT');

ALTER TABLE blog_posts AUTO_INCREMENT = 3;

-- ========== Review / favorite / booking / AI ==========
CREATE TABLE reviews (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    car_model_id BIGINT NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(255),
    content TEXT,
    status VARCHAR(50),
    PRIMARY KEY (id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES `User` (id),
    CONSTRAINT fk_reviews_car_model FOREIGN KEY (car_model_id) REFERENCES car_models (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO reviews (id, created_at, user_id, car_model_id, rating, title, content, status) VALUES
    (1, NOW(6), 1, 2, 5, '911 Carrera tuyệt vời', 'Xe lái rất chắc, cảm giác thể thao đúng chất Porsche.', 'APPROVED'),
    (2, NOW(6), 1, 8, 4, '718 Cayman linh hoạt', 'Phù hợp lái trong phố và đường núi.', 'APPROVED');

ALTER TABLE reviews AUTO_INCREMENT = 3;

CREATE TABLE favorites (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    car_model_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_favorite_user_model (user_id, car_model_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES `User` (id),
    CONSTRAINT fk_favorites_car_model FOREIGN KEY (car_model_id) REFERENCES car_models (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO favorites (id, created_at, user_id, car_model_id) VALUES
    (1, NOW(6), 1, 2),
    (2, NOW(6), 1, 5);

ALTER TABLE favorites AUTO_INCREMENT = 3;

CREATE TABLE test_drive_bookings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    car_model_id BIGINT NOT NULL,
    showroom_id BIGINT NOT NULL,
    booking_date DATETIME(6) NOT NULL,
    status VARCHAR(50),
    PRIMARY KEY (id),
    CONSTRAINT fk_tdb_user FOREIGN KEY (user_id) REFERENCES `User` (id),
    CONSTRAINT fk_tdb_car_model FOREIGN KEY (car_model_id) REFERENCES car_models (id),
    CONSTRAINT fk_tdb_showroom FOREIGN KEY (showroom_id) REFERENCES showroom_locations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO test_drive_bookings (id, created_at, user_id, car_model_id, showroom_id, booking_date, status) VALUES
    (1, NOW(6), 1, 2, 1, DATE_ADD(NOW(6), INTERVAL 7 DAY), 'CONFIRMED'),
    (2, NOW(6), 1, 8, 2, DATE_ADD(NOW(6), INTERVAL 14 DAY), 'PENDING');

ALTER TABLE test_drive_bookings AUTO_INCREMENT = 3;

CREATE TABLE ai_recommendations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    budget DECIMAL(15, 2) NOT NULL,
    `usage` VARCHAR(255),
    family_size INT,
    preferred_body VARCHAR(100),
    recommendation_result TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_ai_reco_user FOREIGN KEY (user_id) REFERENCES `User` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO ai_recommendations (id, created_at, user_id, budget, `usage`, family_size, preferred_body, recommendation_result) VALUES
    (1, NOW(6), 1, 150000.00, 'Đi làm hàng ngày và cuối tuần dã ngoại', 4, 'Coupe', 'Gợi ý: Panamera hoặc 911 Carrera phù hợp ngân sách.'),
    (2, NOW(6), 1, 90000.00, 'Lái thể thao cuối tuần', 2, 'Roadster', 'Gợi ý: 718 Boxster hoặc 718 Cayman.');

ALTER TABLE ai_recommendations AUTO_INCREMENT = 3;
