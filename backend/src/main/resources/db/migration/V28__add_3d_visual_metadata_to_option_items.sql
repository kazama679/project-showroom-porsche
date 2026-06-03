-- Nullable 3D visual metadata for configurator options.
-- Scoped seed below only marks options assigned to car model 106.

SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_items'
      AND COLUMN_NAME = 'visual_type'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE option_items ADD COLUMN visual_type VARCHAR(50) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_items'
      AND COLUMN_NAME = 'color_hex'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE option_items ADD COLUMN color_hex VARCHAR(20) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_items'
      AND COLUMN_NAME = 'material_target'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE option_items ADD COLUMN material_target VARCHAR(100) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_items'
      AND COLUMN_NAME = 'mesh_name'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE option_items ADD COLUMN mesh_name VARCHAR(150) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_items'
      AND COLUMN_NAME = 'texture_url'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE option_items ADD COLUMN texture_url VARCHAR(500) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_items'
      AND COLUMN_NAME = 'model_3d_variant_url'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE option_items ADD COLUMN model_3d_variant_url VARCHAR(500) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE option_items oi
JOIN car_model_options cmo ON cmo.option_item_id = oi.id
JOIN option_groups og ON og.id = oi.option_group_id
JOIN option_categories oc ON oc.id = og.category_id
SET
    oi.visual_type = 'PAINT_COLOR',
    oi.material_target = COALESCE(oi.material_target, 'body'),
    oi.color_hex = COALESCE(
        oi.color_hex,
        CASE
            WHEN LOWER(oi.name) REGEXP 'white|trang|carrara' THEN '#F5F5F2'
            WHEN LOWER(oi.name) REGEXP 'black|den|jet' THEN '#050505'
            WHEN LOWER(oi.name) REGEXP 'red|do|carmine|guards' THEN '#D5001C'
            WHEN LOWER(oi.name) REGEXP 'blue|xanh|gentian|shark' THEN '#143A5A'
            WHEN LOWER(oi.name) REGEXP 'silver|bac|dolomite|gt silver' THEN '#C9CCD0'
            WHEN LOWER(oi.name) REGEXP 'grey|gray|ghi|agate|volcano|slate' THEN '#555B5F'
            WHEN LOWER(oi.name) REGEXP 'green|xanh la|shade' THEN '#4C5A45'
            WHEN LOWER(oi.name) REGEXP 'yellow|vang|racing' THEN '#F2C300'
            ELSE '#D5001C'
        END
    )
WHERE cmo.car_model_id = 106
  AND LOWER(CONCAT_WS(' ', oc.name, og.name, oi.name)) REGEXP 'paint|color|son|mau|exterior paint';

UPDATE option_items oi
JOIN car_model_options cmo ON cmo.option_item_id = oi.id
JOIN option_groups og ON og.id = oi.option_group_id
JOIN option_categories oc ON oc.id = og.category_id
SET
    oi.visual_type = 'WHEEL',
    oi.material_target = COALESCE(oi.material_target, 'wheel'),
    oi.mesh_name = COALESCE(
        oi.mesh_name,
        CASE
            WHEN LOWER(oi.name) REGEXP 'classic' THEN 'wheel_classic'
            WHEN LOWER(oi.name) REGEXP 'sport|rs|turbo|design' THEN 'wheel_sport'
            WHEN LOWER(oi.name) REGEXP '20|21' THEN 'wheel_large'
            ELSE 'wheel_default'
        END
    )
WHERE cmo.car_model_id = 106
  AND LOWER(CONCAT_WS(' ', oc.name, og.name, oi.name)) REGEXP 'wheel|wheels|mam|banh|rim';
