-- Cleanup misclassified options after broad pattern remaps:
-- 1) Exterior paint must contain only paint colors
-- 2) Seats must be split into seat type / seat finish / seat accessories

-- Ensure target groups exist in a reasonable category.
INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Seat Finish', 2, 'SINGLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('ghế', 'ghe', 'nội thất', 'noi that')
  AND NOT EXISTS (SELECT 1 FROM option_groups og WHERE LOWER(og.name) = 'seat finish')
LIMIT 1;

INSERT INTO option_groups (category_id, name, display_order, selection_type)
SELECT oc.id, 'Exterior Styling', 3, 'MULTIPLE'
FROM option_categories oc
WHERE LOWER(oc.name) IN ('ngoại thất', 'ngoai that')
  AND NOT EXISTS (SELECT 1 FROM option_groups og WHERE LOWER(og.name) = 'exterior styling')
LIMIT 1;

-- Normalize selection type for these cleaned groups.
UPDATE option_groups
SET selection_type = 'SINGLE'
WHERE LOWER(name) IN ('exterior paint', 'seat type', 'seat finish');

UPDATE option_groups
SET selection_type = 'MULTIPLE'
WHERE LOWER(name) IN ('seat accessories', 'exterior styling');

-- Strict paint predicate:
-- - image_url from Porsche exterior color studio
-- - OR explicit paint wording
-- - OR short paint code with color naming
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'exterior paint'
SET oi.option_group_id = g.id
WHERE (
        LOWER(COALESCE(oi.image_url, '')) LIKE '%/assets/exteriors/studio_%'
     OR LOWER(oi.name) LIKE '%paint to sample%'
     OR LOWER(oi.name) LIKE '%metallic%'
     OR LOWER(oi.name) LIKE '%uni%'
     OR LOWER(oi.name) LIKE '%solid%'
     OR LOWER(oi.name) REGEXP '^[a-z0-9]{1,3}[[:space:]]*-[[:space:]].*(white|black|blue|red|grey|gray|silver|yellow|green|orange|violet|neo)'
      );

-- Remove "stray" non-paint options from Exterior Paint.
UPDATE option_items oi
JOIN option_groups gp ON LOWER(gp.name) = 'exterior paint'
JOIN option_groups gx ON LOWER(gx.name) = 'exterior styling'
SET oi.option_group_id = gx.id
WHERE oi.option_group_id = gp.id
  AND NOT (
        LOWER(COALESCE(oi.image_url, '')) LIKE '%/assets/exteriors/studio_%'
     OR LOWER(oi.name) LIKE '%paint to sample%'
     OR LOWER(oi.name) LIKE '%metallic%'
     OR LOWER(oi.name) LIKE '%uni%'
     OR LOWER(oi.name) LIKE '%solid%'
     OR LOWER(oi.name) REGEXP '^[a-z0-9]{1,3}[[:space:]]*-[[:space:]].*(white|black|blue|red|grey|gray|silver|yellow|green|orange|violet|neo)'
  );

-- Seat type: mutually exclusive main seat variants.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'seat type'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) REGEXP '(^|[^a-z])(q1j|q4q|q2j|q2k|q1a|q1b|q1c|q5|q6)($|[^a-z])'
   OR LOWER(oi.name) LIKE '%adaptive sport seats%'
   OR LOWER(oi.name) LIKE '%sport seats plus%'
   OR LOWER(oi.name) LIKE '%comfort seats%'
   OR LOWER(oi.name) LIKE '%bucket seats%';

-- Seat finish: upholstery/trim style for selected seat.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'seat finish'
SET oi.option_group_id = g.id
WHERE (LOWER(oi.name) LIKE '%seat%' OR LOWER(oi.name) LIKE '%interior%')
  AND (
        LOWER(oi.name) LIKE '%leather%'
     OR LOWER(oi.name) LIKE '%race-tex%'
     OR LOWER(oi.name) LIKE '%upholstery%'
     OR LOWER(oi.name) LIKE '%club leather%'
     OR LOWER(oi.name) LIKE '%two-tone%'
     OR LOWER(oi.name) LIKE '%stitching%'
      )
  AND LOWER(oi.name) NOT LIKE '%seat belt%'
  AND LOWER(oi.name) NOT LIKE '%headrest%'
  AND LOWER(oi.name) NOT LIKE '%floor mat%';

-- Seat accessories: can be selected independently.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'seat accessories'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%headrest%'
   OR LOWER(oi.name) LIKE '%seat belt%'
   OR LOWER(oi.name) LIKE '%floor mat%'
   OR LOWER(oi.name) LIKE '%seat heating%'
   OR LOWER(oi.name) LIKE '%seat ventilation%';

-- Example from your screenshot/context:
-- ensure gear selector is not placed under wheel groups.
UPDATE option_items oi
JOIN option_groups g ON LOWER(g.name) = 'interior trim'
SET oi.option_group_id = g.id
WHERE LOWER(oi.name) LIKE '%gear selector%';
