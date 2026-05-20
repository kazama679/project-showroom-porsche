-- Step 1: Add is_default to car_model_options
ALTER TABLE car_model_options ADD COLUMN is_default TINYINT(1) DEFAULT 0;

-- Step 2: Create temp tables for deduplication
CREATE TEMPORARY TABLE temp_min_option_items AS
SELECT MIN(id) as min_id, option_group_id, name, description, price, image_url
FROM option_items
GROUP BY option_group_id, name, description, price, image_url;

CREATE TEMPORARY TABLE temp_duplicate_mapping AS
SELECT o.id as old_id, t.min_id as new_id
FROM option_items o
JOIN temp_min_option_items t ON 
    o.option_group_id = t.option_group_id 
    AND o.name = t.name 
    AND (o.description = t.description OR (o.description IS NULL AND t.description IS NULL))
    AND (o.price = t.price OR (o.price IS NULL AND t.price IS NULL))
    AND (o.image_url = t.image_url OR (o.image_url IS NULL AND t.image_url IS NULL))
WHERE o.id != t.min_id;

-- Step 3: Update option_rules
UPDATE IGNORE option_rules r
JOIN temp_duplicate_mapping t ON r.source_option_id = t.old_id
SET r.source_option_id = t.new_id;

UPDATE IGNORE option_rules r
JOIN temp_duplicate_mapping t ON r.target_option_id = t.old_id
SET r.target_option_id = t.new_id;

DELETE r FROM option_rules r
JOIN temp_duplicate_mapping t ON r.source_option_id = t.old_id OR r.target_option_id = t.old_id;

-- Step 4: Update build_options
UPDATE IGNORE build_options c
JOIN temp_duplicate_mapping t ON c.option_item_id = t.old_id
SET c.option_item_id = t.new_id;

DELETE c FROM build_options c
JOIN temp_duplicate_mapping t ON c.option_item_id = t.old_id;

-- Step 5: Update car_model_options
UPDATE IGNORE car_model_options c
JOIN temp_duplicate_mapping t ON c.option_item_id = t.old_id
SET c.option_item_id = t.new_id;

DELETE c FROM car_model_options c
JOIN temp_duplicate_mapping t ON c.option_item_id = t.old_id;

-- Step 6: Delete duplicate option_items
DELETE o FROM option_items o
JOIN temp_duplicate_mapping t ON o.id = t.old_id;

-- Step 7: Drop temp tables
DROP TABLE temp_duplicate_mapping;
DROP TABLE temp_min_option_items;

-- Step 8: Drop is_default from option_items
ALTER TABLE option_items DROP COLUMN is_default;
