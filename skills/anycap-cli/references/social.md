# Social media lookup

Use `anycap social --help` and each subcommand's `--help` to check the installed
CLI's supported operations and platforms. This interface retrieves structured
profile/content data; it does not publish posts or download media files.

## Read a known content URL

```bash
anycap social get --url "https://www.instagram.com/p/<shortcode>/"
anycap social get --url "https://www.instagram.com/reel/<shortcode>/"
```

Use a complete HTTPS permalink. The server identifies the content type from the
URL and strips tracking parameters. Local files, upload references, profile URLs,
and arbitrary website URLs are not content inputs.

## Read an account and its available content

```bash
anycap social profile --platform instagram --username <username>
anycap social list --platform instagram --username <username>
anycap social list --platform instagram --username <username> --type reel
```

Use a username, optionally prefixed with `@`, not a profile URL. The default list
uses the account's post feed, which may also include reels. Each call returns one
upstream batch; it does not promise complete history, keyword search, pagination,
or a requested count. There is no automatic detail lookup for each list item.

## Interpret results

- JSON results are under `data.profile`, `data.content`, or `data.items`.
- Preserve `platform_content_type` when comparing content across platforms.
- Treat null metrics as unavailable, not zero. Plays and views are separate.
- `media` preserves carousel order and contains available resource URLs. URLs
  may expire; do not describe them as permanent stored files.
- A successful empty list is distinct from an upstream error. Do not turn errors
  into claims that an account has no posts or does not exist.
- Report `fetched_at` when using counts in analysis. Read the returned
  `credit_cost` rather than assuming a price. The server converts NexusHub's
  returned USD cost using AnyCap's shared credit conversion. A missing final
  cost is a billing error; do not retry it blindly.
- If the server reports the feature is unavailable, preserve its error and
  request diagnostics. Installing a newer CLI does not enable server access.

## Use as a fallback for video understanding

For a request to read a video, follow the source-resolution order in
[actions.md](actions.md#resolve-social-video-links-without-unnecessary-lookups).
Social lookup is needed only when an accessible video source is still missing,
or when the user also requests structured platform data.

For Instagram's `/reels/<shortcode>/` share-link form, normalize the path to the
supported `/reel/<shortcode>/` permalink without changing the shortcode before
calling `social get`. This normalization is performed by the agent; it is not an
additional CLI command or a promise that every share-link form is supported.

After a successful `social get`, inspect `data.content.media` for a video item
and pass that item's `url` as the single `--url` argument:

```bash
anycap actions video-read --url "<video-url-from-social-result>" \
  --instruction "Describe the scenes and summarize the audio"
```

Quote the entire URL, including its query string. No local download or Drive
upload is required for a remotely accessible source. Do not substitute an image
when no video is returned. Social lookup and video analysis are separate calls;
report their actual costs without assuming fixed prices.
