# Main-Site SEO P0 Design

## Purpose

Turn the verified Codex-and-video search opportunity into a coherent main-site
conversion cluster. The work should help a visitor move from a concrete task
to an accurate command, an honest product decision, installation, and the next
workflow step.

This is not a keyword-density exercise. The four P0 pages must become mutually
supporting product evidence while preserving current route, localization,
metadata, and design-system behavior.

## Approved Scope

Update these existing routes:

- `/for/codex`
- `/capabilities/video-generation`
- `/capabilities/video-analysis`
- `/guides/how-to-add-video-generation-to-ai-agent`

Include the shared changes required to make those routes accurate and safe:

- current CLI command and output contracts;
- central video-model catalog mapping;
- English, Portuguese, Indonesian, and German content parity;
- localized metadata and TechArticle URLs;
- in-content links among the four P0 pages;
- P0-specific SEO contract checks;
- route `lastmod` handling for content and dedicated view changes;
- local production preview and browser verification.

No new public route is required. The existing URLs, canonical paths, and route
groups remain stable.

## Source-Of-Truth Boundaries

Product facts must come from current code and current product documentation:

- CLI commands and output shapes: `internal/cli/command/`, focused CLI tests,
  and `skills/anycap-cli/references/`;
- current capability behavior: `docs/anycap-current-status.md`;
- video model IDs, modes, cost estimates, best-fit guidance, and trade-offs:
  `web/src/lib/seo/model-catalog.ts`;
- localized canonical and alternate metadata:
  `web/src/lib/localized-metadata.ts`;
- public capability language: `web/src/lib/site.ts`,
  `web/src/lib/capability-inventory.ts`, and `web/public/llms.txt`.

The implementation must not create a second manually maintained model, mode,
price, or capability-availability table.

`reference-based` is an input pattern within generation, not a third public
operation. The page may explain reference inputs, but supported modes must be
derived from the current model catalog. Likewise, video analysis must describe
the real `anycap actions video-read` response: a JSON envelope containing a
content result, not a promised typed scene or event schema.

## Content Architecture

Each route keeps its existing typed locale-data pattern. New labels, headings,
descriptions, limitations, link text, CTA text, examples, and final sections
belong in locale content data rather than shared JSX.

Shared view components may own layout and rendering behavior, but must receive
all visible language as props. They must not hard-code English positioning,
search-intent labels, workflow labels, dates, or final CTA copy.

The display flow is:

1. Read current product facts from the CLI and model catalog.
2. Map those facts into a page-specific typed display model.
3. Select locale content from the request locale.
4. Render the existing route with localized metadata and schema URLs.
5. Link the visitor to the next P0 page or installation path from the relevant
   content section.

## `/for/codex`

The Codex page becomes a conversion hub organized around three tasks rather
than a broad inventory of unrelated capabilities.

### Task paths

1. **Generate video**
   - text-to-video use case;
   - current `anycap video generate` command;
   - representative JSON output fields grounded in the CLI contract;
   - when it fits and when a video-generation workflow is unnecessary;
   - link to the video-generation authority page and installation.
2. **Turn images into video**
   - reference-image input requirements;
   - explicit image-to-video mode and current `--param images` syntax;
   - expected result and a warning that model-specific parameters must be
     discovered from the live schema;
   - link to the evergreen video guide and installation.
3. **Analyze video**
   - current `anycap actions video-read` command for a local file or URL;
   - truthful response envelope example;
   - examples of turning the returned content into QA notes, extraction, or a
     workflow checkpoint;
   - link to the video-analysis authority page and installation.

Each task path has its own command, output example, limitation, and contextual
CTA. The primary page CTA remains installation or getting started.

Existing stale `anycap image read` and `anycap video read` references must be
replaced with the current `anycap actions image-read` and
`anycap actions video-read` commands wherever they remain visible on this page.

The page may retain relevant capability breadth below the three primary paths,
but it must not compete with or obscure them.

## `/capabilities/video-generation`

The video-generation page becomes the authoritative product-decision page.

### Required sections

- an input and mode explanation covering text prompts, reference images, and
  existing-video editing only where the current catalog exposes that mode;
- a model decision table derived from the central catalog;
- current CLI workflows for model discovery, text-to-video, image-to-video,
  and supported existing-video editing;
- output handling and the next review or delivery step;
- common failures and recovery guidance;
- explicit fit and not-fit guidance;
- contextual links to Codex, video analysis, and the evergreen video guide.

The model table should expose the catalog fields that help a real decision:

- model;
- supported modes;
- cost estimate when available;
- best fit;
- trade-off or limitation.

Numeric latency, duration, price, or quality claims may appear only when a
current authoritative source supplies them. When timing or cost varies, the
page says that it varies and directs the agent to live catalog or schema
discovery rather than inventing a stable value.

Remove public-facing editorial or SEO-process language such as “Trending now,”
“Search intent,” “The page must prove,” “Searchers want,” “Hot model capture,”
and “Conversion path.” Replace all-uppercase display copy with sentence-case
copy consistent with the web design guideline.

## `/capabilities/video-analysis`

The video-analysis page remains distinct from generation and serves recording
understanding, review, extraction, and downstream automation intent.

### Required sections

- local-file and URL command examples using `anycap actions video-read`;
- an accurate JSON envelope example and an explanation of the returned content;
- quality-review, content-extraction, and workflow-checkpoint use cases;
- a Read → Interpret → Route workflow that does not promise unsupported typed
  fields;
- examples of valid downstream actions an agent can take;
- contextual links to Codex, video generation, and the evergreen video guide.

All currently hard-coded English hero, proof, workflow, search-intent, and final
CTA content moves into localized content data. TechArticle URLs and
`mainEntityOfPage` must use the selected locale.

## Evergreen Video Guide

The guide is organized around durable workflow decisions instead of transient
model news.

### Source decision tree

- **Start with text:** choose text-to-video when the brief defines the scene
  without a required source frame.
- **Start with an image:** choose image-to-video when visual identity, layout,
  or composition must begin from an existing still.
- **Start with existing footage:** choose an edit-video path only when the live
  catalog and schema expose it for the selected model.

The main guide flow is:

1. discover the current model and mode;
2. inspect the live schema;
3. call the capability with an accurate command;
4. receive and inspect the result;
5. review, retry, analyze, store, share, or publish as the next step.

Codex, Cursor, and Claude Code differences stay in a compact setup matrix. The
rest of the guide remains agent-independent so the same workflow principles do
not need three duplicated articles.

Any copy implying that the user or agent must manually poll a job must be
reconciled with the current synchronous user-facing CLI behavior.

## Internal-Link Contract

The four P0 pages form one small content cluster. Each page includes contextual
body links to the other three pages:

- Codex → video generation, video analysis, video guide;
- video generation → Codex, video analysis, video guide;
- video analysis → Codex, video generation, video guide;
- video guide → Codex, video generation, video analysis.

These links must appear inside relevant sections, not only in the header,
footer, or generic final CTA. This arrangement gives every P0 page at least
three content-originated inbound links within the cluster.

A hosted `/page/**` link is added only after its live URL, canonical, indexability,
and intent are verified. If the proposed “Can Codex analyze video?” page does
not yet exist as a stable canonical URL, the main-site work must not invent or
publish a dead link.

## Metadata And Structured Data

- Preserve current canonical route paths and hreflang behavior.
- Preserve the original publication date when known and update the modification
  date for this content release.
- TechArticle URLs, Open Graph URLs, and `mainEntityOfPage` must match the
  selected locale.
- Keep visible FAQ content, but do not restore FAQPage rich-result markup.
- Do not add HowTo schema.
- Keep VideoObject only where the page has a real matching video asset.
- Avoid rendering empty JSON-LD script elements.
- Keep preview and non-production deployments noindexed through the existing
  metadata helpers.

The sitemap `lastmod` calculation must recognize changes to route-local
`content.ts`, `metadata.ts`, and dedicated view components, not only changes to
`page.tsx`, so this release is reflected accurately.

## Localization

The release covers `en`, `pt-br`, `id`, and `de` together. New content fields
are required in every indexed locale before the route is considered complete.

Localized pages must have matching:

- title, description, H1, and section headings;
- task and workflow labels;
- command explanations and limitations;
- CTA and internal-link labels;
- final-section copy;
- metadata and schema URLs.

Commands, model IDs, JSON keys, and literal product names remain unchanged when
they are code facts. Surrounding explanations are localized.

The locale-rollout checker should support all three non-default indexed locales
and recognize locale maps that reference named content constants rather than
requiring every object to be inline.

## Failure And Fallback Behavior

- If a model catalog value is unknown or variable, display an honest variable
  or discovery instruction instead of a fabricated number.
- If a CLI example cannot be confirmed by source or tests, omit it until it is
  verified.
- If a hosted-page canonical cannot be confirmed, keep the main-site cluster
  complete without that link and record the hosted link as follow-up work.
- If a locale field is missing, fail the P0 contract check instead of silently
  falling back to English on an indexed localized page.
- If a shared SEO component needs English-only copy for another route, expose a
  prop with a safe caller migration rather than changing unrelated pages.

## Verification Design

Implementation follows test-driven development for new contracts and fixes.

### Automated checks

- focused CLI tests for video generation, model discovery, and video read;
- a P0 contract check covering the four routes, three Codex task paths,
  commands, limitations, CTAs, and mutual body links;
- localized metadata and schema URL checks for all four locales;
- locale-rollout checks for `pt-br`, `id`, and `de`;
- sitemap `lastmod` dependency coverage;
- existing edge-runtime, breadcrumb, information-architecture, locale-rollout,
  and hub-rollout checks;
- TypeScript `--noEmit` validation;
- the production web build.

`build:cf` is not a verification command because it publishes IndexNow as an
external side effect.

### Browser checks

After the production build passes, start the local site and inspect:

- all four P0 routes in English;
- `/pt-br`, `/id`, and `/de` variants for localized content parity;
- desktop and mobile layouts;
- commands, tables, limitations, CTA destinations, mutual links, metadata,
  and visible structured-content sections;
- `robots.txt`, sitemap output, and `llms.txt` availability.

The final handoff opens the local `/for/codex` preview in the Codex in-app
browser. The page's P0 content links let the user navigate through every changed
page. No public preview route is added.

## Success Criteria

The implementation is complete when:

- all four P0 pages satisfy their page-specific content contract;
- all commands and output examples match current product behavior;
- the model decision table derives product facts from the central catalog;
- every P0 page receives at least three contextual inbound links from the other
  P0 pages;
- all four indexed locales render complete localized content and metadata;
- no internal SEO-planning language remains visible on the P0 pages;
- automated checks and the production build pass;
- the local preview is running and opened for the user in the in-app browser.

Post-release performance is measured over complete GSC periods, separating
evergreen product pages from news and current-event content. Until product and
analytics attribution is connected, this work must not claim that organic
traffic caused installation, activation, or revenue.

## Out Of Scope

- landing-page or `web/src/lib/landing-content.ts` changes;
- P1 work on `/for/cursor`, image generation, skills guides, or comparison
  pages except for a safe shared-component migration required by a P0 fix;
- new hosted `/page/**` articles;
- GA4 event taxonomy, web-to-product identity correlation, installation
  attribution, or revenue attribution;
- provider API changes, server capability changes, or CLI behavior changes;
- broad navigation redesign;
- a new public preview page;
- restoring FAQPage or adding HowTo schema.

## Work Isolation

Implementation will use an isolated `codex/seo-main-site-p0` worktree based on
the current approved code state. The untracked `anycap.ai-audit/` evidence in
the original checkout remains untouched and must not be staged or committed.

## Approval

The user approved the focused P0 scope on 2026-07-11 and approved this design
direction, including the requirement to open a local preview after
implementation.
