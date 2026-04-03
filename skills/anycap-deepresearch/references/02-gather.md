# Phase 2: Gather

Execute your search plan. Save every result to a local file for later cross-verification.

## Search Strategies

### Broad Discovery -- Map the Landscape

Start with wide searches to understand the information space:

```bash
# Fast scan: titles and URLs only
anycap search --query "topic overview" --no-crawl --max-results 10 \
  | tee research-topic/sources/scan-overview.json

# Recent developments
anycap search --query "topic" --time-range month --no-crawl --max-results 10 \
  | tee research-topic/sources/scan-recent.json

# Domain-specific authoritative sources
anycap search --query "topic" --include arxiv.org --include github.com --no-crawl \
  | tee research-topic/sources/scan-academic.json
```

### Deep Reading -- Extract Substance

For relevant results, get full page content:

```bash
# Full content search (results include crawled page content)
anycap search --query "specific aspect of topic" --max-results 5 \
  | tee research-topic/sources/search-aspect-1.json

# Read a specific important page
anycap crawl https://important-source.com/article \
  | tee research-topic/sources/crawl-source-name.json

# Extract just the markdown for reading
anycap crawl https://docs.example.com/spec | jq -r '.data.markdown' \
  > research-topic/sources/spec-content.md
```

### AI Grounded Answers -- Fill Knowledge Gaps

Use grounding search for complex questions that benefit from synthesis:

```bash
# Get a grounded answer with citations
anycap search --prompt "How does X compare to Y in terms of Z?" \
  | tee research-topic/sources/grounding-comparison.json

# Extract the synthesized answer
anycap search --prompt "What are the key limitations of X?" \
  | jq -r '.data.content' \
  | tee research-topic/sources/grounding-limitations.md

# Save the sources for cross-verification
anycap search --prompt "What are the key limitations of X?" \
  | jq -r '.data.search_metadata.sources[] | "\(.title): \(.uri)"' \
  >> research-topic/notes.md
```

### Time-Bounded Research

For researching events or developments in a specific time period:

```bash
# Exact date range
anycap search --query "topic" --after 2025-01-01 --before 2025-12-31

# Relative time window
anycap search --query "topic latest news" --time-range week
```

### Domain Filtering

Focus on authoritative sources:

```bash
# Only academic and official sources
anycap search --query "topic" --include arxiv.org --include github.com --include ieee.org

# Exclude low-quality sources
anycap search --query "topic" --exclude pinterest.com --exclude quora.com
```

## Downloading Source Images

When a source contains important images (diagrams, charts, screenshots), download the originals:

```bash
# Download an image from a source
curl -o research-topic/assets/architecture-diagram.png "https://example.com/diagram.png"
```

Prefer original images over generated ones. Record the source URL alongside each downloaded image in your notes.

## Analyzing Video Content

When research sources include video content (conference talks, demos, tutorials), use AnyCap to analyze them:

```bash
# Analyze a video for key insights
anycap actions video-read --url https://example.com/talk.mp4 \
  --instruction "Summarize the key points about [topic]" \
  | tee research-topic/sources/video-talk-summary.json
```

Video analysis is especially useful for conference presentations, product demos, and technical walkthroughs that may contain information not available in written form.

## Using Other Tools and Skills

Deep research is not limited to web search and crawl. Actively use any available tools and skills to gather and extract information:

- **PDF documents** -- Download PDFs and use your PDF reading capability to extract content from research papers, whitepapers, and technical specifications.
- **Image understanding** -- Use `anycap actions image-read` to extract text from screenshots, analyze diagrams, or read infographics found during research.
- **Audio analysis** -- Use `anycap actions audio-read` to transcribe and analyze podcast episodes or audio recordings relevant to the topic.
- **File downloads** -- Download data files, spreadsheets, or archives when they contain relevant primary data.
- **Other skills** -- If you have access to other skills (e.g., for specific platforms, APIs, or data sources), use them. The goal is comprehensive information gathering through every available channel.

The key principle: **use every tool at your disposal** to produce the most thorough and well-sourced report possible.

## Saving Intermediate Results

**Save everything.** Every search output, every crawled page, every grounding response should be written to a file. This serves three purposes:

1. **Evidence base** -- you can re-read sources without re-crawling
2. **Cross-verification** -- compare claims across saved sources
3. **Sourcing** -- build the final sources list from your saved files

### Verifying Grounding Search Sources

When using `--prompt` (grounding search), the response includes `search_metadata.sources` with the actual URLs the AI used. **Always extract and record these source URLs** -- they are your traceable citations:

```bash
# Save the full grounding response
anycap search --prompt "What is X?" | tee research-topic/sources/grounding-X.json

# Extract the actual source URLs for your sources list
cat research-topic/sources/grounding-X.json \
  | jq -r '.data.search_metadata.sources[] | "[\(.index)] \(.title): \(.uri)"' \
  >> research-topic/notes.md
```

Do not cite a grounding search as "Grounding search: topic" in your final report. Instead, trace the claim back to the specific source URLs provided in `search_metadata.sources` and cite those URLs directly. If a grounding response lacks source URLs (`search_metadata` is null), treat the information as unverified and corroborate it with a separate search.

Update `notes.md` continuously with:
- Key findings from each search
- Interesting URLs to crawl later
- Contradictions or open questions
- Source quality assessments

```markdown
## Notes

### Sub-question 1: Server-side WASM runtimes
- Found 3 major runtimes: Wasmtime, Wasmer, WasmEdge
- Source: scan-overview.json result #2 (bytecodealliance.org)
- CONFLICTING: Wasmer claims faster startup than Wasmtime, but benchmarks from source X show otherwise
- TODO: Find independent benchmark comparison

### Sub-question 2: Edge computing
- Cloudflare Workers uses V8 isolates, not pure WASM -- need to clarify
- Source: crawl-cloudflare-blog.json
- TODO: Check Fastly Compute@Edge for comparison
```
