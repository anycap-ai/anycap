# Actions

Actions are AI-powered operations on existing content: understand images, read videos, and more to come.

All actions live under `anycap actions <action-name>`.

## image-read

Analyze one or more images: describe content, extract text, answer questions, compare images.

```bash
# Single image
anycap actions image-read --url https://example.com/photo.jpg

# With instruction
anycap actions image-read --file ./screenshot.png --instruction "What text is in this image?"

# Multiple images (up to 10)
anycap actions image-read \
  --url https://example.com/before.jpg \
  --url https://example.com/after.jpg \
  --instruction "What changed between these two images?"

# Mix URLs and local files
anycap actions image-read \
  --url https://example.com/reference.jpg \
  --file ./draft.png \
  --instruction "How closely does the draft match the reference?"
```

Options:

| Flag | Required | Description |
|------|----------|-------------|
| `--url` | at least one | Image URL (repeatable, up to 10 total with --file) |
| `--file` | at least one | Local image file (repeatable, auto-uploaded) |
| `--instruction` | no | Guide the model on what to analyze |
| `--model` | no | Specific model ID |

At least one `--url` or `--file` is required. Maximum 10 images per request.

The response `content` field contains the model's text output.

Extract just the text:

```bash
anycap actions image-read --file ./screenshot.png --instruction "What text is in this image?" | jq -r '.content'
```

## video-read

Analyze a video: describe content, summarize events, extract information. Supports direct video URLs and YouTube links.

```bash
anycap actions video-read --url https://example.com/clip.mp4
anycap actions video-read --url https://www.youtube.com/watch?v=dQw4w9WgXcQ --instruction "Summarize this video"
anycap actions video-read --file ./recording.mp4 --instruction "List all on-screen text"
```

Options:

| Flag | Required | Description |
|------|----------|-------------|
| `--url` | one of url/file | Video URL (direct link or YouTube URL) |
| `--file` | one of url/file | Local video file (auto-uploaded, max 100 MB) |
| `--instruction` | no | What to look for or describe |
| `--model` | no | Specific model ID |

Exactly one of `--url` or `--file` is required.

### Resolve social video links without unnecessary lookups

This is an agent workflow, not automatic URL resolution inside `video-read`.
Follow this order when the user asks to read a video:

1. Reuse a local video, a usable direct video URL already provided or retrieved
   in this conversation, or a URL type the installed `video-read` supports
   directly. Do not call `social get` just because the source is social media.
2. For a social page URL without a usable video source, make at most one bounded
   source lookup with an available HTTP/page-reading/browser tool, if it can
   reasonably expose the video's direct URL. Reuse an already-open page when
   practical. Skip this attempt if the tool is unavailable or the page is known
   to require inaccessible authentication; do not install a scraper or perform
   a lengthy browser workflow merely to avoid a lookup charge.
3. If no usable source is found, check `anycap social --help` for installed
   support and follow [social.md](social.md): call `social get` once, select the
   requested video from `data.content.media`, then pass its URL to `video-read`.
   Do not fetch the author's profile or feed unless the user's request needs it.
4. If a direct-source read explicitly fails because the source is expired or
   inaccessible, use that same supported social fallback once if it has not
   already been used. Authentication, insufficient credit, rate limits, billing
   uncertainty, and model failures are not reasons to call social or resubmit a
   potentially billable analysis. Preserve the error and diagnostics.

A successful page fetch is not a successful video lookup: captions, thumbnails,
HTML login pages, and browser-only `blob:` URLs are not remotely readable video
sources. Preserve signed URL query parameters. Do not claim to have watched a
video based only on its caption, thumbnail, or social metadata. A carousel may
contain multiple videos; select the requested item rather than silently analyzing
all of them. For private, deleted, or otherwise unavailable media, explain the
limitation and ask for an accessible source or local file; do not bypass access
controls.

When the user has already asked for video analysis, carry out necessary source
resolution within that scope without a redundant confirmation, respecting any
stated budget or no-paid-tools constraint. Before using the paid fallback, briefly
explain that social retrieves the video source and video-read analyzes it, with
separate charges. If only explaining usage, show the workflow without calling it.

Ordinary HTTP/browser lookup does not trigger AnyCap social billing, but the tool
may have its own cost. AnyCap `crawl` is not a free substitute. Avoid sending known
unsupported social page URLs to `video-read` merely to provoke a failure. Report
actual returned `credit_cost` values for calls made; do not hard-code a combined
price or assume failed calls were free.

Local video files must be under 100 MB. For larger files, compress first:

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4
```

Local uploads automatically retry transient network and storage failures up to
three times. If the CLI still reports `storage upload failed`, follow its hint:
check the network connection and retry; for video, compress the file before the
next attempt.

For persistent failures, an agent may use local segmentation as a fallback only
when the analysis is safe to perform per segment:

1. Prefer compressing the complete video so cross-scene context is preserved.
2. If that still fails, split it into 2–5 minute clips with 2–5 seconds of
   overlap so actions and speech are not cut at a boundary.
3. Run at most 2–3 `video-read` requests concurrently. Each clip is a separate
   request and may consume its own credits and rate-limit capacity.
4. Ask for timestamped observations from every clip, convert relative clip
   timestamps back to the original timeline, and merge the results.
5. Do not segment tasks that require whole-video narrative, cross-clip causality,
   or continuous identity tracking; compress and retry the complete video instead.

`video-read` accepts one video per invocation. Parallel segmented analysis is an
agent-orchestrated workflow, not a multi-video `video-read` request.

## audio-read

Analyze audio: transcribe speech, describe sounds, answer questions about audio content. Supports direct audio URLs and YouTube links (audio is extracted automatically).

```bash
anycap actions audio-read --url https://example.com/recording.wav
anycap actions audio-read --url https://www.youtube.com/watch?v=dQw4w9WgXcQ --instruction "Transcribe the lyrics"
anycap actions audio-read --file ./meeting.mp3 --instruction "Summarize the main topics discussed"
```

Options:

| Flag | Required | Description |
|------|----------|-------------|
| `--url` | one of url/file | Audio URL (direct link or YouTube URL) |
| `--file` | one of url/file | Local audio file (auto-uploaded) |
| `--instruction` | no | What to listen for or describe |
| `--model` | no | Specific model ID |

Exactly one of `--url` or `--file` is required.

## Parsing Responses

All action responses share the same shape: `{"status": "success", "content": "...", "request_id": "req_..."}`.

```bash
# Extract content as plain text
anycap actions video-read --file ./clip.mp4 | jq -r '.content'

# Pipe content into another tool or file
anycap actions image-read --url https://example.com/chart.png \
  --instruction "Extract the data as CSV" | jq -r '.content' > data.csv

# Check for errors before using content
result=$(anycap actions image-read --file ./photo.jpg)
if echo "$result" | jq -e 'has("error")' > /dev/null 2>&1; then
  echo "$result" | jq -r '.message'
else
  echo "$result" | jq -r '.content'
fi
```

## Tips

- **Prefer `--file` for local files.** All actions auto-upload local files internally. Do NOT upload to drive first to get a URL -- just pass the file path directly with `--file`.
- Without `--instruction`, models default to a general description. Specific instructions yield better results (e.g., "extract all text", "count the people", "describe the color palette", "transcribe the speech").
- Video files are limited to 100 MB when using `--file`. Compress oversized videos with ffmpeg before uploading.
- Use `--model` only if you need a specific model. The default is generally the best available.
