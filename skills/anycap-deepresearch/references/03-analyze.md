# Phase 3: Analyze

After gathering raw material, pause and think critically before writing.

## Cross-Verification

Cross-verification is the most important step in producing a trustworthy report. A claim that appears in only one source is a lead; a claim confirmed by multiple independent sources is a finding.

### Verification Strategies

**Triangulation -- verify key claims across 3+ sources:**

For any important claim (numbers, dates, comparisons, technical facts), check whether multiple independent sources agree. Use your saved intermediate files:

```bash
# Re-read saved sources without re-crawling
cat research-topic/sources/search-runtimes.json | jq -r '.data.results[] | "\(.title): \(.url)"'
cat research-topic/sources/grounding-comparison.md
```

If a claim appears in only one source, either:
- Search specifically for corroborating evidence
- Search for counter-evidence
- Note it as "single-source, unverified" in the report

```bash
# Targeted verification search
anycap search --query "specific claim to verify" --max-results 5 \
  | tee research-topic/sources/verify-claim-X.json

# Check the original source directly
anycap crawl https://primary-source.com/data \
  | tee research-topic/sources/verify-primary.json
```

**Source comparison -- identify conflicts:**

When sources disagree, investigate:

1. Which source is more authoritative? (primary > secondary, official > blog)
2. Which is more recent? (newer data may supersede older claims)
3. Are they measuring different things? (different methodologies, different definitions)
4. Is there a third source that resolves the conflict?

Record conflicts in your notes with explicit references to the saved files:

```markdown
### Conflict: WASM startup time
- Source A (wasmtime blog, sources/crawl-wasmtime.json): "cold start under 1ms"
- Source B (benchmark study, sources/crawl-benchmark.json): "average 3.2ms cold start"
- Resolution: Source A measures module instantiation only; Source B includes compilation.
  Both are correct for different definitions of "cold start".
```

**Temporal verification -- check freshness:**

Information decays. A benchmark from 2023 may be irrelevant for a runtime that had a major release in 2025.

```bash
# Search for the most recent data on a specific point
anycap search --query "topic benchmark 2025 2026" --time-range year
```

## Source Quality Assessment

Rate each source as you analyze:

| Quality | Criteria | Examples |
|---------|----------|----------|
| Primary | Original data, official docs, specs | RFC, API docs, release notes, research papers |
| Authoritative | Expert analysis, established publications | Major tech blogs, conference talks, peer-reviewed work |
| Secondary | Reporting on primary sources | News articles, tutorial sites, aggregator posts |
| Unreliable | Unverified, outdated, or biased | SEO content farms, undated articles, promotional material |

Prefer primary and authoritative sources. Use secondary sources for leads, then trace back to the primary source.

## Gap Analysis

After analyzing your gathered material, identify what is still missing:

1. Which sub-questions from your plan remain unanswered?
2. Which claims lack cross-verification?
3. Are there perspectives or counterarguments you have not explored?
4. Is any data outdated and needs a fresh search?

For each gap, go back to Phase 2 with targeted searches. This loop (Gather -> Analyze -> Gather) is normal and expected. A thorough report usually requires 2-3 iterations.

## When to Stop Searching

The agent decides autonomously when enough material has been gathered. Stop the Gather-Analyze loop when:

- **All sub-questions have at least one verified answer** from a primary or authoritative source
- **Key claims are cross-verified** across 2+ independent sources
- **New searches return diminishing results** -- you are seeing the same sources and claims you already have
- **Remaining gaps are acknowledged** -- some questions may not have publicly available answers; note them as limitations rather than searching indefinitely

Do not stop early just because you have some results. Do not search forever chasing perfection. Use your judgment: a thorough report with noted limitations is better than an incomplete report or an infinite search loop.

## Update Your Notes

Before moving to synthesis, consolidate your analysis in `notes.md`:

- List all verified findings with source references
- List all unresolved conflicts with context
- List all gaps that could not be filled
- Draft a preliminary outline based on what you have found
