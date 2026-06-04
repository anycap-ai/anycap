# AnyCap Agent Guidelines

This directory contains area-specific rules for agents. `AGENTS.md` is the
mandatory entry point; these files hold the detailed guidance.

## Files

| File | Use when |
|---|---|
| `architecture.md` | Changing server layers, application services, domain models, ports, or infrastructure adapters |
| `external-id.md` | Exposing, accepting, mapping, or storing externally visible resource IDs |
| `feature-gating.md` | Adding or changing capability endpoints, feature access, or rate limits |
| `upload-refs.md` | Handling user-provided URLs, local file uploads, or provider reference media |
| `migrations.md` | Adding or changing SQL migrations or local seed SQL |
| `cli.md` | Adding or changing CLI commands, flags, output, config, or local tools |
| `skills.md` | Updating agent-facing skill files under `skills/` |
| `web.md` | Editing the website, dashboard, auth pages, or web components |
| `seo.md` | Editing SEO pages, metadata, sitemap, robots, `llms.txt`, or SEO docs |
| `testing.md` | Choosing or updating test coverage |
| `release.md` | Preparing CLI, skills, server, or web releases/deploys |

## Maintenance Rule

Guidelines should describe durable rules and point to source files for
fast-changing facts. If a fact is already encoded in code or config, prefer a
source-of-truth link over copying a complete table into docs.
