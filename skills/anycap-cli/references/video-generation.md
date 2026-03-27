# Video Generation

Generate videos from text prompts. The generated video is automatically downloaded to the current directory.

## Workflow

```mermaid
graph LR
    A[List models] --> B[Get schema]
    B --> C[Generate]
```

### Step 1: Discover models

```bash
anycap video models
```

Extract model IDs:

```bash
anycap video models | jq -r '.models[].model'
```

To inspect a specific model:

```bash
anycap video models <model-id>
```

### Step 2: Check parameter schema (important)

Each model accepts different parameters. Always fetch the schema before generating to discover available parameters:

```bash
anycap video models <model-id> schema
```

The schema response describes all accepted parameters (ratio, resolution, duration, negative_prompt, etc.) with their types, defaults, and allowed values. Use this to construct valid `--param` flags.

List all parameter names and their types:

```bash
anycap video models <model-id> schema | jq -r '.data.schema.model_params | to_entries[] | "\(.key): \(.value.type)"'
```

### Step 3: Generate

The generated video is automatically saved to the current directory. Use `-o` to specify a custom path.

**Best practice:** Always use `-o` with a descriptive filename derived from the prompt context (e.g., `-o ocean-waves.mp4`). Without `-o`, the file gets a generic timestamped name like `video_20260327_103000.mp4`.

Basic generation:

```bash
anycap video generate --prompt "a cat walking on the beach at sunset" --model <model-id>
```

With parameters discovered from the schema:

```bash
anycap video generate \
  --prompt "ocean waves crashing on rocks" \
  --model <model-id> \
  --param ratio=16:9 \
  --param duration=5 \
  --param negative_prompt="blurry, low quality"
```

Image-to-video (animate a reference image):

```bash
anycap video generate \
  --prompt "animate this scene with gentle wind" \
  --model <model-id> \
  --param reference_image_urls='["https://example.com/photo.jpg"]'
```

Save to a specific path:

```bash
anycap video generate \
  --prompt "a logo animation" \
  --model <model-id> \
  -o logo-animation.mp4
```

### Flags

| Flag           | Required | Description                                                                       |
| -------------- | -------- | --------------------------------------------------------------------------------- |
| `--prompt`     | yes      | Text description of the video to generate                                         |
| `--model`      | yes      | Model ID from `video models`                                                      |
| `--param`      | no       | Parameter as `key=value` (repeatable); discover via `video models <model> schema` |
| `-o, --output` | no       | Custom output path (default: current directory)                                   |

### --param value types

Values are auto-parsed as JSON when possible:

| Example                                          | Parsed as               |
| ------------------------------------------------ | ----------------------- |
| `--param ratio=16:9`                             | string `"16:9"`         |
| `--param duration=5`                             | number `5`              |
| `--param resolution=1080p`                       | string `"1080p"`        |
| `--param negative_prompt="blurry"`               | string `"blurry"`       |
| `--param reference_image_urls='["url1","url2"]'` | array `["url1","url2"]` |

### Output Format

The output is a flat JSON object optimized for agent consumption:

```json
{"status":"success","local_path":"/absolute/path/to/video.mp4","model":"veo-3.1","credits_used":5,"request_id":"req_abc123"}
```

| Field          | Description                                |
| -------------- | ------------------------------------------ |
| `status`       | `"success"` or `"error"`                   |
| `local_path`   | Absolute path to the downloaded video file |
| `model`        | Model ID used for generation               |
| `credits_used` | Number of credits consumed                 |
| `request_id`   | Server request ID for debugging            |

Extract the local file path:

```bash
anycap video generate --prompt "..." --model <model-id> | jq -r '.local_path'
```

## Complete Example

```bash
# Find a model
anycap video models

# Check what parameters it accepts
anycap video models veo-3.1 schema

# Generate with parameters from the schema
anycap video generate \
  --prompt "a watercolor animation of cherry blossoms falling" \
  --model veo-3.1 \
  --param ratio=16:9 \
  --param duration=5 \
  -o cherry-blossoms.mp4
```
