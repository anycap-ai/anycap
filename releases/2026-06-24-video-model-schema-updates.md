## What's Changed

### Video Model Schema And Atomic Node Support

- Added `multi-shot-video` mode for `kling-3.0` and `kling-3.0-omni`, backed by the upstream `multi_shot_video` atomic node algo.
- Exposed `multi_shot_clips` in the public video schema, with each clip carrying `prompt` and `duration`.
- Added reference image support for Kling multi-shot generation through the AnyCap-facing `images` parameter (`maxItems: 9`), mapped to `video_option.refer_image_urls`.
- Added reference video support for Seedance 2.0 image-to-video schemas through the AnyCap-facing `videos` parameter (`maxItems: 3`), while preserving existing model routes.
- Added request DTO and NexusHub payload plumbing for `multi_shot_clips`, `images`, and `videos` without removing existing model support.

### Seedance Resolution

- Added `1080p` schema support for `seedance-2` text-to-video and image-to-video.
- Kept `seedance-2-fast` at `480p` / `720p` because real upstream validation rejects `1080p` for both t2v and i2v on `doubao-seedance-2-0-fast`.

### Validation

- Verified local schema output from `anycap-server-local`:
  - `kling-3.0` and `kling-3.0-omni` expose `images` and `multi_shot_clips` for `multi-shot-video`.
  - `seedance-2` exposes `480p`, `720p`, and `1080p`.
  - `seedance-2-fast` exposes only `480p` and `720p`.
- Ran real generation checks:
  - `kling-3.0` multi-shot with two reference images succeeded upstream.
  - `seedance-2` 1080p t2v and i2v succeeded upstream.
  - `seedance-2-fast` 1080p t2v and i2v were rejected upstream, so 1080p is not exposed for fast.
- Ran targeted Go tests for curated catalog, video domain/service, and NexusHub payload mapping.
