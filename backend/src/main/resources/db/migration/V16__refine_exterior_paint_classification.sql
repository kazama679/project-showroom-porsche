-- Refine Exterior Paint classification:
-- - Keep only true paint colors in Exterior Paint / Paint to Sample
-- - Move look-alike but non-paint items to proper exterior groups

-- Ensure needed target groups exist.
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Decals and Logos', 5, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior decals and logos');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Trim', 2, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior trim');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Styling', 3, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior styling');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Brake System', 6, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'performance'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'brake system');

UPDATE option_groups
SET selection_type = 'SINGLE'
WHERE LOWER(name) IN ('exterior paint', 'paint to sample', 'brake system');

UPDATE option_groups
SET selection_type = 'MULTIPLE'
WHERE LOWER(name) IN ('exterior decals and logos', 'exterior trim', 'exterior styling');

-- 1) Explicitly classify true paint options.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'paint to sample'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(0ub\\.89\\.24931|0ud\\.89\\.24931)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%paint to sample%';

UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'exterior paint'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(0q|1a|1h|2m|d9)($|[^a-z])'
   OR LOWER(oi.name) REGEXP '^[a-z0-9\\.]{1,12}[[:space:]]*-[[:space:]].*(white|metallic|neo)$'
   OR LOWER(COALESCE(oi.image_url, '')) LIKE '%/assets/exteriors/studio_%';

-- 2) Move non-paint look-alike options out of paint groups.
UPDATE option_items oi
JOIN option_groups gp ON LOWER(gp.name) = 'exterior paint'
JOIN option_groups gd ON LOWER(gd.name) = 'exterior decals and logos'
SET oi.option_group_id = gd.id
WHERE oi.option_group_id = gp.id
  AND (
       LOWER(oi.name) LIKE '%decal%'
    OR LOWER(oi.name) LIKE '%designation on doors%'
    OR LOWER(oi.name) LIKE '%stripe%'
  );

UPDATE option_items oi
JOIN option_groups gp ON LOWER(gp.name) = 'exterior paint'
JOIN option_groups gt ON LOWER(gt.name) = 'exterior trim'
SET oi.option_group_id = gt.id
WHERE oi.option_group_id = gp.id
  AND (
       LOWER(oi.name) LIKE '%door-sill%'
    OR LOWER(oi.name) LIKE '%sill guards%'
    OR LOWER(oi.name) LIKE '%aluminum%'
  );

UPDATE option_items oi
JOIN option_groups gp ON LOWER(gp.name) = 'exterior paint'
JOIN option_groups gb ON LOWER(gb.name) = 'brake system'
SET oi.option_group_id = gb.id
WHERE oi.option_group_id = gp.id
  AND (
       LOWER(oi.name) LIKE '%porsche ceramic composite brakes%'
    OR LOWER(oi.name) LIKE '%pccb%'
    OR LOWER(oi.name) LIKE '%calipers%'
  );

-- 3) Handle your concrete examples even if they are not currently in paint group.
UPDATE option_items oi
JOIN option_groups gd ON LOWER(gd.name) = 'exterior decals and logos'
SET oi.option_group_id = gd.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(amc|amb|ama|amm|ana)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%motorsport stripe%'
   OR LOWER(oi.name) LIKE '%model designation%';

UPDATE option_items oi
JOIN option_groups gt ON LOWER(gt.name) = 'exterior trim'
SET oi.option_group_id = gt.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(vt9)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%door-sill guard%';

UPDATE option_items oi
JOIN option_groups gb ON LOWER(gb.name) = 'brake system'
SET oi.option_group_id = gb.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(1lq|1lx)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%pccb%'
   OR LOWER(oi.name) LIKE '%ceramic composite brakes%';
