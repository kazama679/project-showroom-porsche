-- Porsche option taxonomy tuning (data-fix only).
-- Goal:
-- 1) exclusivity follows fine-grained option groups
-- 2) optional add-ons are toggle-able (MULTIPLE)
-- 3) paint/seat main variants stay SINGLE

-- Ensure selection_type exists (safe for environments where V12 did not run yet).
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

-- Ensure target groups exist.
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Paint', 1, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('màu sắc ngoại thất', 'mau sac ngoai that', 'ngoại thất', 'ngoai that')
  AND NOT EXISTS (SELECT 1 FROM option_groups og WHERE LOWER(og.name) = 'exterior paint')
LIMIT 1;

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Type', 1, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('ghế', 'ghe', 'nội thất', 'noi that')
  AND NOT EXISTS (SELECT 1 FROM option_groups og WHERE LOWER(og.name) = 'seat type')
LIMIT 1;

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Accessories', 2, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('ghế', 'ghe', 'nội thất', 'noi that')
  AND NOT EXISTS (SELECT 1 FROM option_groups og WHERE LOWER(og.name) = 'seat accessories')
LIMIT 1;

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Optional Features', 99, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('công nghệ', 'cong nghe', 'technology', 'ngoại thất', 'ngoai that', 'nội thất', 'noi that')
  AND NOT EXISTS (SELECT 1 FROM option_groups og WHERE LOWER(og.name) = 'optional features')
LIMIT 1;

-- Selection type corrections.
UPDATE option_groups
SET selection_type = 'SINGLE'
WHERE LOWER(name) IN (
    'exterior paint',
    'exhaust system',
    'sport chrono',
    'steering',
    'front axle lift',
    'seat type',
    'seats',
    'steering wheel',
    'lights',
    'audio system',
    'wheels'
);

UPDATE option_groups
SET selection_type = 'MULTIPLE'
WHERE LOWER(name) IN (
    'optional features',
    'seat accessories',
    'driver assistance',
    'interior trim',
    'exterior trim',
    'packages'
);

-- 1) Paint -> SINGLE group (fix "selected 5 colors" issue).
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'exterior paint'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%paint to sample%'
   OR LOWER(oi.name) LIKE '%metallic%'
   OR LOWER(oi.name) LIKE '%solid%'
   OR LOWER(oi.name) LIKE '%uni%'
   OR LOWER(oi.name) REGEXP '^[a-z0-9]{1,3}[[:space:]]*-[[:space:]].*(blue|black|white|grey|gray|silver|red|yellow|green)';

-- 2) Seat main variants -> Seat Type (SINGLE), not technology.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'seat type'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(q1j|q4q|q2j|q2k|q1a|q1b|q1c|q5|q6)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%adaptive sport seats%'
   OR LOWER(oi.name) LIKE '%sport seats plus%'
   OR LOWER(oi.name) LIKE '%comfort seats%'
   OR LOWER(oi.name) LIKE '%bucket seats%';

UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'seat accessories'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%headrest%'
   OR LOWER(oi.name) LIKE '%seat belt%'
   OR LOWER(oi.name) LIKE '%floor mat%'
   OR LOWER(oi.name) LIKE '%seat heating%'
   OR LOWER(oi.name) LIKE '%seat ventilation%';

-- 3) Performance fine split (SINGLE in each subgroup).
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'exhaust system'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(0p5|0p8|0p9)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%sport exhaust%'
   OR LOWER(oi.name) LIKE '%tailpipe%';

UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'sport chrono'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(8lh|8lu|up3)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%sport chrono%'
   OR LOWER(oi.name) LIKE '%stopwatch%'
   OR LOWER(oi.name) LIKE '%digital tachometer%';

UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'steering'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(1n3)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%power steering%'
   OR (LOWER(oi.name) LIKE '%steering%' AND LOWER(oi.name) NOT LIKE '%steering wheel%');

UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'front axle lift'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(2uh)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%front axle lift%';

-- 4) Toggle-able optional add-ons.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'optional features'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(0i2|ud1|dck|dwv|zxm|zga|z1s)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%extended range fuel tank%'
   OR LOWER(oi.name) LIKE '%under door puddle light%'
   OR LOWER(oi.name) LIKE '%dashcam%'
   OR LOWER(oi.name) LIKE '%car cover%'
   OR LOWER(oi.name) LIKE '%subscription%'
   OR LOWER(oi.name) LIKE '%maintenance%';

-- 5) Misc obvious misplacements.
-- Example from your output: PDK gear selector should not be in wheel group.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'interior trim'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%gear selector%';
