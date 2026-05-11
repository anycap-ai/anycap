# Server Rate Limit Config

## Overview

AnyCap server now applies capability rate limits only to protected function routes that explicitly declare a product capability.

The effective bucket is:

```text
user_id + capability
```

Examples:

- `rl:usercap:<userID>:image.generate`
- `rl:usercap:<userID>:drive.browse`
- `rl:usercap:<userID>:page.publish`

System, login-helper, and admin routes that do not declare a capability are not affected by this capability rate limit.

## Config Rules

Default env RPM:

```env
ANYCAP_RATE_LIMIT_RPM=60
```

Dconf override controls:

```env
ANYCAP_RATE_LIMIT_DCONF_ENABLED=false
ANYCAP_RATE_LIMIT_DCONF_GROUP=anycap
ANYCAP_RATE_LIMIT_DCONF_DATA_ID=rate_limit
```

See also:

- `docs/config/server-dconf.md`
- `configs/server/dconf/rate_limit.example.json`

When `ANYCAP_RATE_LIMIT_DCONF_ENABLED=true`, AnyCap initializes the shared `common-go/dconf` client and attempts to load JSON config from:

- `group = ANYCAP_RATE_LIMIT_DCONF_GROUP`
- `dataId = ANYCAP_RATE_LIMIT_DCONF_DATA_ID`

The dconf client itself still relies on its standard environment variables, especially:

- `DCONF_NACOS_HOST`
- `DCONF_NACOS_NAMESPACE`
- optional: `ENV`, `DCONF_NACOS_PORT`, `DCONF_NACOS_CONTEXT_PATH`, `DCONF_NACOS_TIMEOUT_MS`

Capability-specific env override:

```env
ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM=10
ANYCAP_RATE_LIMIT_VIDEO_GENERATE_RPM=5
ANYCAP_RATE_LIMIT_DRIVE_BROWSE_RPM=120
ANYCAP_RATE_LIMIT_PAGE_PUBLISH_RPM=12
```

Resolution order:

1. If dconf is enabled, check dconf `capabilities[<capability>]`
2. If missing or invalid, check dconf `default_rpm`
3. If dconf is disabled, unavailable, or still unresolved, check `ANYCAP_RATE_LIMIT_<CAPABILITY>_RPM`
4. If missing, invalid, or non-positive, fall back to `ANYCAP_RATE_LIMIT_RPM`
5. If the final RPM is `<= 0`, capability rate limiting is skipped for that capability

Recommended dconf JSON shape:

```json
{
  "default_rpm": 60,
  "capabilities": {
    "image.generate": 10,
    "video.generate": 5,
    "music.generate": 8,
    "web.search": 30,
    "web.crawl": 30,
    "image.read": 30,
    "drive.browse": 120,
    "page.publish": 12
  }
}
```

Capability name mapping:

- Replace `.` with `_`
- Convert to upper case
- Prefix with `ANYCAP_RATE_LIMIT_`
- Suffix with `_RPM`

Examples:

- `image.generate` -> `ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM`
- `drive.file.upload.prepare` -> `ANYCAP_RATE_LIMIT_DRIVE_FILE_UPLOAD_PREPARE_RPM`
- `page.version.read` -> `ANYCAP_RATE_LIMIT_PAGE_VERSION_READ_RPM`

## Protected Function Routes

| Route | Capability | Env Override |
| --- | --- | --- |
| `POST /v1/image/generate` | `image.generate` | `ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM` |
| `POST /v1/video/generate` | `video.generate` | `ANYCAP_RATE_LIMIT_VIDEO_GENERATE_RPM` |
| `POST /v1/music/generate` | `music.generate` | `ANYCAP_RATE_LIMIT_MUSIC_GENERATE_RPM` |
| `POST /v1/web/search` | `web.search` | `ANYCAP_RATE_LIMIT_WEB_SEARCH_RPM` |
| `POST /v1/web/crawl` | `web.crawl` | `ANYCAP_RATE_LIMIT_WEB_CRAWL_RPM` |
| `POST /v1/capabilities/presign` | `asset.upload.prepare` | `ANYCAP_RATE_LIMIT_ASSET_UPLOAD_PREPARE_RPM` |
| `POST /v1/capabilities/image/read` | `image.read` | `ANYCAP_RATE_LIMIT_IMAGE_READ_RPM` |
| `POST /v1/capabilities/video/read` | `video.read` | `ANYCAP_RATE_LIMIT_VIDEO_READ_RPM` |
| `POST /v1/capabilities/audio/read` | `audio.read` | `ANYCAP_RATE_LIMIT_AUDIO_READ_RPM` |
| `POST /v1/feedback` | `feedback.submit` | `ANYCAP_RATE_LIMIT_FEEDBACK_SUBMIT_RPM` |
| `POST /v1/drive/folders` | `drive.folder.create` | `ANYCAP_RATE_LIMIT_DRIVE_FOLDER_CREATE_RPM` |
| `POST /v1/drive/files/presign` | `drive.file.upload.prepare` | `ANYCAP_RATE_LIMIT_DRIVE_FILE_UPLOAD_PREPARE_RPM` |
| `POST /v1/drive/files/complete` | `drive.file.upload.complete` | `ANYCAP_RATE_LIMIT_DRIVE_FILE_UPLOAD_COMPLETE_RPM` |
| `GET /v1/drive/nodes` | `drive.browse` | `ANYCAP_RATE_LIMIT_DRIVE_BROWSE_RPM` |
| `PATCH /v1/drive/nodes/:id` | `drive.item.update` | `ANYCAP_RATE_LIMIT_DRIVE_ITEM_UPDATE_RPM` |
| `DELETE /v1/drive/nodes/:id` | `drive.item.delete` | `ANYCAP_RATE_LIMIT_DRIVE_ITEM_DELETE_RPM` |
| `PUT /v1/drive/nodes/:id/share` | `drive.share.update` | `ANYCAP_RATE_LIMIT_DRIVE_SHARE_UPDATE_RPM` |
| `POST /v1/drive/nodes/:id/share/rotate` | `drive.share.rotate` | `ANYCAP_RATE_LIMIT_DRIVE_SHARE_ROTATE_RPM` |
| `DELETE /v1/drive/nodes/:id/share` | `drive.share.revoke` | `ANYCAP_RATE_LIMIT_DRIVE_SHARE_REVOKE_RPM` |
| `POST /v1/pages` | `page.create` | `ANYCAP_RATE_LIMIT_PAGE_CREATE_RPM` |
| `GET /v1/pages` | `page.list` | `ANYCAP_RATE_LIMIT_PAGE_LIST_RPM` |
| `GET /v1/pages/:id` | `page.read` | `ANYCAP_RATE_LIMIT_PAGE_READ_RPM` |
| `PATCH /v1/pages/:id` | `page.update` | `ANYCAP_RATE_LIMIT_PAGE_UPDATE_RPM` |
| `DELETE /v1/pages/:id` | `page.delete` | `ANYCAP_RATE_LIMIT_PAGE_DELETE_RPM` |
| `POST /v1/pages/:id/versions` | `page.version.create` | `ANYCAP_RATE_LIMIT_PAGE_VERSION_CREATE_RPM` |
| `POST /v1/pages/:id/versions/:vid/files/presign` | `page.asset.upload.prepare` | `ANYCAP_RATE_LIMIT_PAGE_ASSET_UPLOAD_PREPARE_RPM` |
| `POST /v1/pages/:id/versions/:vid/files/complete` | `page.asset.upload.complete` | `ANYCAP_RATE_LIMIT_PAGE_ASSET_UPLOAD_COMPLETE_RPM` |
| `POST /v1/pages/:id/versions/:vid/finalize` | `page.version.finalize` | `ANYCAP_RATE_LIMIT_PAGE_VERSION_FINALIZE_RPM` |
| `POST /v1/pages/:id/versions/:vid/publish` | `page.publish` | `ANYCAP_RATE_LIMIT_PAGE_PUBLISH_RPM` |
| `POST /v1/pages/:id/versions/:vid/rollback-clone` | `page.rollback` | `ANYCAP_RATE_LIMIT_PAGE_ROLLBACK_RPM` |
| `POST /v1/pages/:id/unpublish` | `page.unpublish` | `ANYCAP_RATE_LIMIT_PAGE_UNPUBLISH_RPM` |
| `GET /v1/pages/:id/versions` | `page.version.list` | `ANYCAP_RATE_LIMIT_PAGE_VERSION_LIST_RPM` |
| `GET /v1/pages/:id/versions/by-number/:no` | `page.version.read` | `ANYCAP_RATE_LIMIT_PAGE_VERSION_READ_RPM` |

## Protected Routes That Bypass Capability Rate Limit

These routes still require auth, but they do not declare a capability and therefore skip capability rate limiting:

- `GET /v1/status`
- `GET /v1/dashboard/summary`
- `GET /v1/me`
- `GET /v1/credits/balance`
- `GET /v1/logs`
- `POST /v1/auth/logout`
- `POST /v1/auth/exchange`
- `POST /v1/auth/device-verify`
- `POST /v1/auth/browser-verify`
- `GET /v1/admin/model-routes`
- `POST /v1/admin/model-routes`
- `GET /v1/admin/model-routes/:id`
- `PUT /v1/admin/model-routes/:id`
- `DELETE /v1/admin/model-routes/:id`
