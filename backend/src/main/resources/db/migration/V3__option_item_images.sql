-- Sample images for option items (admin can replace via Option Items)
UPDATE option_items SET image_url = 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661086/porsche/9abe3dfc-d98a-42d1-806e-49da8a25ca8d.avif'
WHERE id = 1 AND (image_url IS NULL OR image_url = '');

UPDATE option_items SET image_url = 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661051/porsche/7c590c2e-342d-4688-9b32-fef59d3850bc.avif'
WHERE id = 2 AND (image_url IS NULL OR image_url = '');

UPDATE option_items SET image_url = 'https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif'
WHERE id = 3 AND (image_url IS NULL OR image_url = '');

UPDATE option_items SET image_url = 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661011/porsche/305482cb-a5b2-48cc-8c64-2826fdc29d3b.avif'
WHERE id = 4 AND (image_url IS NULL OR image_url = '');
