-- Canonicalize option taxonomy:
-- - categories are display-only sections
-- - selection is controlled only by option_groups.selection_type
-- - remap critical option_items by code/name into fine-grained groups

-- A) Ensure required columns exist and legacy category multi-select is ignored.
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_groups'
      AND COLUMN_NAME = 'selection_type'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE option_groups ADD COLUMN selection_type VARCHAR(20) NOT NULL DEFAULT ''SINGLE''',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @cat_multi_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'option_categories'
      AND COLUMN_NAME = 'is_multi_select'
);
SET @sql := IF(
    @cat_multi_exists > 0,
    'ALTER TABLE option_categories DROP COLUMN is_multi_select',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- B) Canonical categories (display sections only).
INSERT INTO option_categories (name, display_order)
SELECT 'Màu sắc ngoại thất', 1
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'màu sắc ngoại thất');
INSERT INTO option_categories (name, display_order)
SELECT 'Ngoại thất', 2
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'ngoại thất');
INSERT INTO option_categories (name, display_order)
SELECT 'Mâm xe', 3
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'mâm xe');
INSERT INTO option_categories (name, display_order)
SELECT 'Nội thất', 4
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'nội thất');
INSERT INTO option_categories (name, display_order)
SELECT 'Ghế', 5
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'ghế');
INSERT INTO option_categories (name, display_order)
SELECT 'Performance', 6
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'performance');
INSERT INTO option_categories (name, display_order)
SELECT 'Công nghệ', 7
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'công nghệ');
INSERT INTO option_categories (name, display_order)
SELECT 'Packages', 8
WHERE NOT EXISTS (SELECT 1 FROM option_categories WHERE LOWER(name) = 'packages');

UPDATE option_categories
SET display_order = CASE LOWER(name)
    WHEN 'màu sắc ngoại thất' THEN 1
    WHEN 'ngoại thất' THEN 2
    WHEN 'mâm xe' THEN 3
    WHEN 'nội thất' THEN 4
    WHEN 'ghế' THEN 5
    WHEN 'performance' THEN 6
    WHEN 'công nghệ' THEN 7
    WHEN 'packages' THEN 8
    ELSE display_order
END
WHERE LOWER(name) IN (
    'màu sắc ngoại thất','ngoại thất','mâm xe','nội thất','ghế','performance','công nghệ','packages'
);

-- Merge obvious duplicate/synonym categories into canonical ones.
UPDATE option_groups og
JOIN option_categories src ON og.category_id = src.id
JOIN option_categories dst ON LOWER(dst.name) = 'mâm xe'
SET og.category_id = dst.id
WHERE LOWER(src.name) IN ('bánh xe', 'banh xe');

UPDATE option_groups og
JOIN option_categories src ON og.category_id = src.id
JOIN option_categories dst ON LOWER(dst.name) = 'ghế'
SET og.category_id = dst.id
WHERE LOWER(src.name) IN ('ghe');

UPDATE option_groups og
JOIN option_categories src ON og.category_id = src.id
JOIN option_categories dst ON LOWER(dst.name) = 'công nghệ'
SET og.category_id = dst.id
WHERE LOWER(src.name) IN ('cong nghe', 'technology');

-- C) Ensure canonical groups exist with selection_type.
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Paint', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'màu sắc ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior paint');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Paint to Sample', 2, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'màu sắc ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'paint to sample');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Wheels', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'mâm xe'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'wheels');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Wheel Colors', 2, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'mâm xe'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'wheel colors');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Wheel Accessories', 3, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'mâm xe'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'wheel accessories');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Winter wheel-and-tire sets', 4, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'mâm xe'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'winter wheel-and-tire sets');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Packages', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior packages');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Trim', 2, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior trim');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Styling', 3, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior styling');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Roof and Transport Systems', 4, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'roof and transport systems');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Decals and Logos', 5, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior decals and logos');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Interior Material / Interior Package', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'nội thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'interior material / interior package');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Interior Packages', 2, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'nội thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'interior packages');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Interior Trim', 3, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'nội thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'interior trim');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Steering Wheel', 4, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'nội thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'steering wheel');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Type', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ghế'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'seat type');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Finish', 2, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ghế'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'seat finish');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Belts', 3, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ghế'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'seat belts');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Accessories', 4, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'ghế'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'seat accessories');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exhaust System', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exhaust system');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Sport Chrono', 2, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'sport chrono');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Steering', 3, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'steering');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Front Axle Lift', 4, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'front axle lift');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Engine / Performance Package', 5, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'engine / performance package');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Lights', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'công nghệ'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'lights');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Driver Assistance', 2, 'MULTIPLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'công nghệ'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'driver assistance');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Audio System', 3, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'công nghệ'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'audio system');
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Audio & Communications', 4, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'công nghệ'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'audio & communications');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Packages', 1, 'SINGLE' FROM option_categories oc
WHERE LOWER(oc.name) = 'packages'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'packages');

-- D) Enforce canonical group category assignment.
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'màu sắc ngoại thất'
SET og.category_id = oc.id
WHERE LOWER(og.name) IN ('exterior paint', 'paint to sample');
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'mâm xe'
SET og.category_id = oc.id
WHERE LOWER(og.name) IN ('wheels', 'wheel colors', 'wheel accessories', 'winter wheel-and-tire sets');
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'ngoại thất'
SET og.category_id = oc.id
WHERE LOWER(og.name) IN ('exterior packages', 'exterior trim', 'exterior styling', 'roof and transport systems', 'exterior decals and logos');
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'nội thất'
SET og.category_id = oc.id
WHERE LOWER(og.name) IN ('interior material / interior package', 'interior packages', 'interior trim', 'steering wheel');
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'ghế'
SET og.category_id = oc.id
WHERE LOWER(og.name) IN ('seat type', 'seat finish', 'seat belts', 'seat accessories');
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'performance'
SET og.category_id = oc.id
WHERE LOWER(og.name) IN ('exhaust system', 'sport chrono', 'steering', 'front axle lift', 'engine / performance package');
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'công nghệ'
SET og.category_id = oc.id
WHERE LOWER(og.name) IN ('lights', 'driver assistance', 'audio system', 'audio & communications');
UPDATE option_groups og JOIN option_categories oc ON LOWER(oc.name) = 'packages'
SET og.category_id = oc.id
WHERE LOWER(og.name) = 'packages';

-- E) Normalize selection_type only by group.
UPDATE option_groups
SET selection_type = CASE
    WHEN LOWER(name) IN (
        'driver assistance','exterior trim','interior trim','exterior styling',
        'roof and transport systems','exterior decals and logos','wheel accessories','seat accessories'
    ) THEN 'MULTIPLE'
    ELSE 'SINGLE'
END;

-- F) Remap option_items by code/name.
-- Paint
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='paint to sample'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%paint to sample%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='exterior paint'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '^[a-z0-9]{1,4}[[:space:]]*-[[:space:]].*(white|black|jet black|vanadium|gt silver|ice grey|guards red|gentian|carmine|provence|lugano|oak green|aventurine|shade green|slate|chalk|metallic|neo)'
   OR LOWER(COALESCE(oi.image_url,'')) LIKE '%/assets/exteriors/studio_%';

-- Wheels / wheel colors / accessories
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='wheel colors'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%wheels painted%'
   OR LOWER(oi.name) LIKE '%painted in%'
   OR LOWER(oi.name) LIKE '%wheel center cap%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='wheel accessories'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%wheel bolt%'
   OR LOWER(oi.name) LIKE '%titanium wheel bolts%'
   OR LOWER(oi.name) LIKE '%center cap%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='wheels'
SET oi.option_group_id = g.id
WHERE (LOWER(oi.name) LIKE '% wheel%' OR LOWER(oi.name) LIKE '%wheels%' OR LOWER(oi.name) LIKE '%wheel set%')
  AND LOWER(oi.name) NOT LIKE '%wheels painted%'
  AND LOWER(oi.name) NOT LIKE '%wheel center cap%'
  AND LOWER(oi.name) NOT LIKE '%wheel bolt%'
  AND LOWER(oi.name) NOT LIKE '%steering wheel%';

-- Performance split
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='exhaust system'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(0p[0-9a-z])'
   OR LOWER(oi.name) LIKE '%exhaust%'
   OR LOWER(oi.name) LIKE '%tailpipe%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='sport chrono'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(8lh|8lu)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%sport chrono%'
   OR LOWER(oi.name) LIKE '%stopwatch%'
   OR LOWER(oi.name) LIKE '%porsche design subsecond clock%'
   OR LOWER(oi.name) LIKE '%chrono%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='steering'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(1n3)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%power steering%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='front axle lift'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(2uh)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%front axle lift%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='steering wheel'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%steering wheel%';

-- Tech
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='lights'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%headlight%'
   OR LOWER(oi.name) LIKE '%matrix%'
   OR LOWER(oi.name) LIKE '%lights%'
   OR LOWER(oi.name) LIKE '%taillight%'
   OR LOWER(oi.name) LIKE '%vision%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='driver assistance'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%assist%'
   OR LOWER(oi.name) LIKE '%assistance%'
   OR LOWER(oi.name) LIKE '%lane%'
   OR LOWER(oi.name) LIKE '%cruise%'
   OR LOWER(oi.name) LIKE '%parkassist%'
   OR LOWER(oi.name) LIKE '%surround view%'
   OR LOWER(oi.name) LIKE '%night vision%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='audio system'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%bose%'
   OR LOWER(oi.name) LIKE '%burmester%'
   OR LOWER(oi.name) LIKE '%sound system%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='audio & communications'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%communication%'
   OR LOWER(oi.name) LIKE '%apple carplay%'
   OR LOWER(oi.name) LIKE '%smartphone%'
   OR LOWER(oi.name) LIKE '%navigation%'
   OR LOWER(oi.name) LIKE '%connect%';

-- Seats + interior materials
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='seat type'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%sport seats%'
   OR LOWER(oi.name) LIKE '%power sport seats%'
   OR LOWER(oi.name) LIKE '%adaptive sport seats%'
   OR LOWER(oi.name) LIKE '%lightweight bucket seats%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='seat accessories'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%ventilated seats%'
   OR LOWER(oi.name) LIKE '%heated seats%'
   OR LOWER(oi.name) LIKE '%rear seats%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='seat belts'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%seat belt%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='interior material / interior package'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%leather interior%'
   OR LOWER(oi.name) LIKE '%club leather interior%'
   OR LOWER(oi.name) LIKE '%race-tex interior%'
   OR LOWER(oi.name) LIKE '%exclusive manufaktur leather interior%'
   OR LOWER(oi.name) LIKE '%heritage design interior%'
   OR LOWER(oi.name) LIKE '%leather package%';

-- Packages/exterior trim
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='exterior packages'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%sportdesign package%'
   OR LOWER(oi.name) LIKE '%aerokit%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='exterior trim'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%mirror trim%'
   OR LOWER(oi.name) LIKE '%window trim%'
   OR LOWER(oi.name) LIKE '%side skirt%'
   OR LOWER(oi.name) LIKE '%fascia%'
   OR LOWER(oi.name) LIKE '%carbon fiber%';
UPDATE option_items oi JOIN option_groups g ON LOWER(g.name)='packages'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%package%'
  AND LOWER(oi.name) NOT LIKE '%sportdesign package%'
  AND LOWER(oi.name) NOT LIKE '%interior package%'
  AND LOWER(oi.name) NOT LIKE '%exterior package%';
