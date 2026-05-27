-- V25: Add user profile fields (phone, birth_date, address, city, country)
ALTER TABLE user ADD COLUMN phone VARCHAR(30) NULL;
ALTER TABLE user ADD COLUMN birth_date VARCHAR(20) NULL;
ALTER TABLE user ADD COLUMN address VARCHAR(255) NULL;
ALTER TABLE user ADD COLUMN city VARCHAR(100) NULL;
ALTER TABLE user ADD COLUMN country VARCHAR(100) NULL;
