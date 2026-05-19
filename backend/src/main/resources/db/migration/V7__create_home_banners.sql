CREATE TABLE home_banners (
    id BIGINT NOT NULL AUTO_INCREMENT,
    car_model_id BIGINT,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'HERO' or 'CARD'
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_home_banners_car_model FOREIGN KEY (car_model_id) REFERENCES car_models (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default Hero Banner (Ảnh 1 in user's request)
INSERT INTO home_banners (car_model_id, title, type, video_url, image_url, display_order, is_active)
VALUES (2, 'Cayenne S E-Hybrid.', 'HERO', '/home/porsche.mp4', 'https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif', 1, 1);

-- Seed default Cards (Ảnh 2 in user's request, 3 cards)
INSERT INTO home_banners (car_model_id, title, type, video_url, image_url, display_order, is_active)
VALUES 
(2, 'Panamera GTS.', 'CARD', NULL, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif', 1, 1),
(4, 'Porsche "There is no substitute" Collection.', 'CARD', NULL, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661011/porsche/305482cb-a5b2-48cc-8c64-2826fdc29d3b.avif', 2, 1),
(5, '911 Carrera.', 'CARD', NULL, 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661051/porsche/7c590c2e-342d-4688-9b32-fef59d3850bc.avif', 3, 1);
