INSERT INTO anycap_model_routes (model_id, capability, operation, ability_key, algo_type, display_name)
VALUES
    ('nano-banana-2', 'image', 'generate', 'google_nano_banana_2', 'txt_2_img', 'Nano Banana 2'),
    ('nano-banana-2', 'image', 'edit', 'google_nano_banana_2', 'img_2_img', 'Nano Banana 2'),
    ('veo-3.1', 'video', 'generate', 'google_veo_31', 'txt_2_video', 'Veo 3.1'),
    ('veo-3.1', 'video', 'from_image', 'google_veo_31', 'img_2_video', 'Veo 3.1'),
    ('elevenlabs-v3', 'audio', 'speak', 'cloudsway_elevenlabs_tts', '', 'ElevenLabs v3')
ON CONFLICT (model_id, operation, algo_type) DO NOTHING;
