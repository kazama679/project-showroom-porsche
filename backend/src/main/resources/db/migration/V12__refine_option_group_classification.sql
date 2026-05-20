-- Refine option classification to enforce exclusivity by fine-grained option_group
-- (not by broad category like "Performance").

-- 1) Add selection_type for option_groups (backward compatible with existing code).
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

-- 2) Ensure major display categories exist.
INSERT INTO option_categories (name, display_order)
SELECT 'Performance', 4
WHERE NOT EXISTS (
    SELECT 1 FROM option_categories WHERE LOWER(name) = 'performance'
);

INSERT INTO option_categories (name, display_order)
SELECT 'Packages', 5
WHERE NOT EXISTS (
    SELECT 1 FROM option_categories WHERE LOWER(name) = 'packages'
);

-- 3) Create fine-grained groups (single-choice per small group by default).
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exhaust System', 1, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'exhaust system'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Sport Chrono', 2, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'sport chrono'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Steering', 3, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'steering'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Front Axle Lift', 4, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'front axle lift'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Engine / Performance Package', 5, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'engine / performance package'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Packages', 1, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'packages'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'packages'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Interior Package', 2, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'packages'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'interior package'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Package', 3, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'packages'
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'exterior package'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Lights', 10, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('công nghệ', 'cong nghe', 'technology')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'lights'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Driver Assistance', 11, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('công nghệ', 'cong nghe', 'technology')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'driver assistance'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Audio System', 12, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('công nghệ', 'cong nghe', 'technology')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'audio system'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Wheels', 1, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('ngoại thất', 'ngoai that', 'exterior')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'wheels'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Trim', 2, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('ngoại thất', 'ngoai that', 'exterior')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'exterior trim'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seats', 1, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('nội thất', 'noi that', 'interior')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'seats'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Belts', 2, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('nội thất', 'noi that', 'interior')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'seat belts'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Interior Material / Interior Package', 3, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('nội thất', 'noi that', 'interior')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'interior material / interior package'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Interior Trim', 4, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('nội thất', 'noi that', 'interior')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'interior trim'
  );

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Steering Wheel', 5, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('nội thất', 'noi that', 'interior')
  AND NOT EXISTS (
      SELECT 1 FROM option_groups og
      WHERE LOWER(og.name) = 'steering wheel'
  );

-- 4) Keep existing broad "Performance" groups from enforcing single-choice.
UPDATE option_groups
SET selection_type = 'MULTIPLE'
WHERE LOWER(name) = 'performance';

-- 5) Re-map option_items into fine-grained groups based on name/code patterns.
--    Pattern priority is important; steering wheel must be applied before generic wheel.

-- Steering Wheel (interior) before generic steering / wheels.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'steering wheel'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%steering wheel%';

-- Exhaust System: code starts with 0P or contains exhaust/tailpipes.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'exhaust system'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) REGEXP '^(0p[0-9a-z])'
   OR LOWER(oi.name) LIKE '%exhaust%'
   OR LOWER(oi.name) LIKE '%tailpipe%';

-- Sport Chrono: explicit codes and name hints.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'sport chrono'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) REGEXP '^(8lh|8lu)\\b'
   OR LOWER(oi.name) LIKE '%sport chrono%'
   OR LOWER(oi.name) LIKE '%porsche design clock%'
   OR LOWER(oi.name) LIKE '%chrono%clock%';

-- Steering / Power Steering.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'steering'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) REGEXP '^(1n3)\\b'
   OR LOWER(oi.name) LIKE '%power steering%'
   OR (LOWER(oi.name) LIKE '%steering%' AND LOWER(oi.name) NOT LIKE '%steering wheel%');

-- Front Axle Lift / Chassis lift.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'front axle lift'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) REGEXP '^(2uh)\\b'
   OR LOWER(oi.name) LIKE '%front axle lift%'
   OR LOWER(oi.name) LIKE '%axle lift%';

-- Lights.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'lights'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%headlight%'
   OR LOWER(oi.name) LIKE '%matrix%'
   OR LOWER(oi.name) LIKE '% led %'
   OR LOWER(oi.name) LIKE 'led %';

-- Driver assistance.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'driver assistance'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%lane%'
   OR LOWER(oi.name) LIKE '%assist%'
   OR LOWER(oi.name) LIKE '%cruise%'
   OR LOWER(oi.name) LIKE '%parkassist%'
   OR LOWER(oi.name) LIKE '%surround view%';

-- Audio system.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'audio system'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%burmester%'
   OR LOWER(oi.name) LIKE '%bose%'
   OR LOWER(oi.name) LIKE '%sound system%';

-- Seats.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'seats'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%seat%'
  AND LOWER(oi.name) NOT LIKE '%seat belt%';

-- Seat Belts.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'seat belts'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%seat belt%';

-- Interior material / package.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'interior material / interior package'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%leather interior%'
   OR LOWER(oi.name) LIKE '%race-tex%'
   OR LOWER(oi.name) LIKE '%interior package%';

-- Exterior package.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'exterior package'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%exterior package%';

-- Generic packages.
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'packages'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%package%';

-- Wheels (exclude steering wheel).
UPDATE option_items oi
JOIN option_groups target ON LOWER(target.name) = 'wheels'
SET oi.option_group_id = target.id
WHERE LOWER(oi.name) LIKE '%wheel%'
  AND LOWER(oi.name) NOT LIKE '%steering wheel%';
