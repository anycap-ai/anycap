# Phase 1: Plan

This phase has three steps: preliminary search (optional), user clarification (mandatory), and search strategy design.

## Step 1: Preliminary Search (Optional)

If the topic is unfamiliar or complex, run a few quick searches first to build context. This helps you ask better clarification questions:

```bash
# Quick scan to understand the landscape
anycap search --query "topic" --no-crawl --max-results 5

# Or get a grounded overview
anycap search --prompt "What is [topic] and what are the key aspects?"
```

Skip this step if the topic is straightforward or you already have enough context to ask good questions.

## Step 2: Clarify with the User (Mandatory)

This step is **not optional**. Do not assume you understand the user's intent -- ask.

Present your understanding of the topic (informed by the preliminary search if you did one) and ask the user to refine it:

1. **Scope and focus** -- "Here are the sub-questions I plan to investigate: [list]. Are there angles you want me to add, remove, or prioritize?"
2. **Delivery format** -- "How would you like the report delivered? Options: local Markdown file, shareable Drive link, published web page, or a combination."
3. **Image generation** -- "May I generate illustrations (diagrams, comparisons) where they would aid understanding? Or should I only use original images from sources?"
4. **Depth vs breadth** -- If the topic is large, ask whether the user wants broad coverage or a deep dive on specific aspects.

Wait for the user's response. You may need multiple rounds of clarification -- use your judgment to decide when you have enough information to proceed. If the user's initial request is already very specific and detailed, one round may suffice. If the topic is broad or ambiguous, ask follow-up questions until the scope is clear.

**Exit clarification when:**
- You have a clear, confirmed list of sub-questions to investigate
- You know the user's preferred delivery format (or have a reasonable default)
- Any ambiguity in the original request has been resolved

Do not over-clarify. Once the research direction is clear, start working.

## Step 3: Decompose and Plan

Break the user's request into sub-questions. A good decomposition produces 3-10 sub-questions that, when answered together, form a comprehensive response.

Example: "Research the current state of WebAssembly outside the browser"

- What server-side WASM runtimes exist and how do they compare?
- How is WASM used in edge computing (Cloudflare, Fastly, etc.)?
- What is the WASM Component Model and what is its status?
- What production use cases exist for WASM as a plugin system?
- What are the performance characteristics vs native code?
- What languages have mature WASM compilation support?
- What are the current limitations and open challenges?

## Design Search Strategy

For each sub-question, decide on your approach:

| Strategy | When to use |
|----------|-------------|
| `search --query` | Find specific pages, data points, or source material |
| `search --query --no-crawl` | Quick scan to understand what exists before deep-reading |
| `search --prompt` | Get an AI Grounded synthesis with citations for complex questions |
| `crawl <url>` | Read a specific known page (documentation, spec, blog post) in full |

Plan to search broadly. Multiple searches per sub-question is normal -- start wide, then narrow.

**Prefer grounding search for complex questions.** `--prompt` mode is your most powerful research tool -- it synthesizes across multiple web sources and provides structured citations. Use it liberally for definitional questions, comparisons, and state-of-the-art surveys.

**Plan for parallelism.** Identify sub-questions that are independent of each other and can be researched simultaneously. If your agent supports parallel tool calls, batch independent searches together to save time.

## Set Up Workspace

Create a local directory structure for intermediate files:

```
research-{topic}/
  notes.md            # Running notes, observations, hypotheses
  sources/            # Saved search results and crawled pages
  assets/             # Downloaded images and generated illustrations
```

```bash
mkdir -p research-{topic}/sources research-{topic}/assets
```

The notes file is your research journal. Update it continuously as you gather and analyze information.

## Record User Preferences

At the top of `notes.md`, record the user's answers from the clarification step:

```markdown
## Research Preferences
- Delivery: [local / drive / page / drive+page]
- Image generation: [allowed / originals only]
- Focus: [broad coverage / deep dive on X, Y]
- User notes: [any specific guidance from the user]
```

Refer back to these preferences throughout the research process.
