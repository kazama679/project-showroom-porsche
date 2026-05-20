-- Enforce Exterior Paint classification by image URL patterns.
-- Rule of thumb:
-- - True paint swatches: configurator.porsche.com/assets/exteriors/studio_*
-- - Detail/common/cloudinary images: non-paint (move out of paint groups)

-- Ensure fallback non-paint groups exist.
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Styling', 3, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'exterior styling');

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Paint to Sample', 2, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) = 'màu sắc ngoại thất'
  AND NOT EXISTS (SELECT 1 FROM option_groups WHERE LOWER(name) = 'paint to sample');

UPDATE option_groups
SET selection_type = 'SINGLE'
WHERE LOWER(name) IN ('exterior paint', 'paint to sample');

-- 1) Any option with studio exterior swatch URL is paint candidate.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'exterior paint'
SET oi.option_group_id = g.id
WHERE LOWER(COALESCE(oi.image_url, '')) LIKE '%configurator.porsche.com/assets/exteriors/studio_%';

-- 2) Paint to Sample stays separate when clearly identified by code/name.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'paint to sample'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%paint to sample%'
   OR LOWER(oi.name) REGEXP '(^|[^a-z])(0ub|0ud)\\.';

-- 3) Remove non-paint images from paint groups:
--    /model/{year}/{model}/common/detail_* OR cloudinary-hosted assets, etc.
UPDATE option_items oi
JOIN option_groups gp ON LOWER(gp.name) IN ('exterior paint', 'paint to sample')
JOIN option_groups gx ON LOWER(gx.name) = 'exterior styling'
SET oi.option_group_id = gx.id
WHERE oi.option_group_id = gp.id
  AND (
       LOWER(COALESCE(oi.image_url, '')) LIKE '%configurator.porsche.com/model/%/common/detail_%'
    OR LOWER(COALESCE(oi.image_url, '')) LIKE '%res.cloudinary.com/%'
    OR LOWER(COALESCE(oi.image_url, '')) LIKE '%/common/detail_%'
    OR (
         LOWER(COALESCE(oi.image_url, '')) NOT LIKE '%configurator.porsche.com/assets/exteriors/studio_%'
         AND LOWER(COALESCE(oi.image_url, '')) <> ''
       )
  )
  AND LOWER(oi.name) NOT LIKE '%paint to sample%';

-- 4) Safety net: in paint groups, if URL is missing and name is clearly non-paint => move out.
UPDATE option_items oi
JOIN option_groups gp ON LOWER(gp.name) IN ('exterior paint', 'paint to sample')
JOIN option_groups gx ON LOWER(gx.name) = 'exterior styling'
SET oi.option_group_id = gx.id
WHERE oi.option_group_id = gp.id
  AND (oi.image_url IS NULL OR oi.image_url = '')
  AND (
       LOWER(oi.name) LIKE '%decal%'
    OR LOWER(oi.name) LIKE '%stripe%'
    OR LOWER(oi.name) LIKE '%door-sill%'
    OR LOWER(oi.name) LIKE '%aerokit%'
    OR LOWER(oi.name) LIKE '%spoiler%'
    OR LOWER(oi.name) LIKE '%tailpipe%'
    OR LOWER(oi.name) LIKE '%brake%'
    OR LOWER(oi.name) LIKE '%pccb%'
  );
