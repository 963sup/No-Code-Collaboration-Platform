# Codex Desktop Project Layer

This directory contains the shared repository-scoped Codex configuration. Codex loads it only after the repository is trusted.

## Ownership

- `config.toml` owns non-secret project defaults, sandboxing, approvals, bounded web search, agent concurrency, environment inheritance, and repository MCP servers.
- `agents/` owns narrow read-only specialists. The primary thread retains decision, edit, and verification responsibility.
- `hooks.json` and `hooks/` own bounded lifecycle observations. Hook output is never product or architecture truth.
- `rules/` owns command approval boundaries. Routine local inspection may be automatic; destructive or external mutation remains prompt-gated or forbidden.

## Context routing

- OpenAI or Codex behavior: `openaiDeveloperDocs` and `openai_docs_researcher`.
- Version-sensitive third-party dependencies: `context7` and `dependency_docs_researcher`.
- Supabase behavior: documentation-only `supabaseDocs` and `supabase_docs_researcher`.
- Local semantic code navigation: optional Serena.

The committed Supabase MCP endpoint is documentation-only. Project references, OAuth/PAT credentials, database tools, and production access remain machine-local. See [`docs/CODEX_DESKTOP.md`](../docs/CODEX_DESKTOP.md).

## Model strategy

The primary thread does not pin a model in project configuration; the Desktop user chooses the model appropriate to the task. Read-only specialists use purpose-fit models and reasoning levels:

- `architecture_auditor`: `gpt-5.6-terra`, high reasoning.
- `change_reviewer`: `gpt-5.6-terra`, high reasoning.
- `openai_docs_researcher`: `gpt-5.6-luna`, medium reasoning.
- `dependency_docs_researcher`: `gpt-5.6-luna`, medium reasoning.
- `supabase_docs_researcher`: `gpt-5.6-luna`, medium reasoning.

Do not add a custom agent when a deterministic check or an existing specialist already owns the problem.

## Machine-local configuration

Do not commit authentication, provider routing, project references, profiles, notifications, telemetry destinations, personal editor preferences, API keys, or database credentials. Keep those in the user's Codex configuration or an approved workstation authentication boundary.

## Verification

Run `pnpm codex:check` after changing Codex configuration, agents, skills, hooks, rules, or scoped instructions. Run `pnpm verify:full` before merging a baseline or dependency change.
