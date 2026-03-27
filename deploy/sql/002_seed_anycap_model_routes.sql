INSERT INTO anycap_model_routes (model_id, capability, operation, ability_key, algo_type, display_name, extra)
VALUES
    ('nano-banana-2',   'image', 'generate', 'nano_banana_2',                'txt_2_img',   'Nano Banana 2',  '{}'::jsonb),
    ('nano-banana-2',   'image', 'edit',     'nano_banana_2',                'img_2_img',   'Nano Banana 2',  '{}'::jsonb),
    ('nano-banana-pro', 'image', 'generate', 'nano_banana_pro',             'txt_2_img',   'Nano Banana Pro', '{}'::jsonb),
    ('nano-banana-pro', 'image', 'edit',     'nano_banana_pro',             'img_2_img',   'Nano Banana Pro', '{}'::jsonb),
    ('seedream-4.5',    'image', 'generate', 'ark-doubao-seedream-5',       'txt_2_img',   'Seedream 4.5',   '{"env":"","tier":"","region":"","enabled":true,"priority":100,"route_type":"direct"}'::jsonb),
    ('seedream-4.5',    'image', 'edit',     'ark-doubao-seedream-4-5-251128','img_2_img',  'Seedream 4.5',   '{"env":"","tier":"","region":"","enabled":true,"priority":100,"route_type":"direct"}'::jsonb),
    ('seedream-5',      'image', 'generate', 'ark-doubao-seedream-5',       'txt_2_img',   'Seedream 5',     '{"env":"","tier":"","region":"","enabled":true,"priority":100,"route_type":"direct"}'::jsonb),
    ('seedream-5',      'image', 'edit',     'ark-doubao-seedream-5',       'img_2_img',   'Seedream 5',     '{"env":"","tier":"","region":"","enabled":true,"priority":100,"route_type":"direct"}'::jsonb),
    ('veo-3.1',         'video', 'generate', 'veo3.1',                     'txt_2_video', 'Veo 3.1',        '{"env":"","tier":"","region":"","enabled":true,"priority":100,"route_type":"direct"}'::jsonb)
ON CONFLICT (model_id, operation, algo_type) DO NOTHING;
