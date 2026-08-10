# Codex Desktop project layer

This directory contains repository-scoped Codex configuration. Codex loads this layer only after the repository is trusted.

## Ownership

- `config.toml` owns shared project defaults for approvals, sandboxing, bounded web search, subagent concurrency, shell environment inheritance, and repository MCP servers.
- `agents/` owns narrow project-scoped custom agents. Codex discovers standalone TOML files in this directory automatically.
- `hooks.json` and `hooks/` own bounded lifecycle context. Hook output is observational context, never architecture or product truth.
- `rules/` owns command approval boundaries. Read-only inspection may be automatic; destructive or external mutation remains approval-gated or forbidden.

## Model strategy

The primary thread does not pin a model in project configuration; the user or Desktop client remains free to choose the best model for the current task.

Read-only custom agents are intentionally specialized:

- `architecture_auditor` uses `gpt-5.6-terra` with high reasoning for consequential model and boundary review.
- `change_reviewer` uses `gpt-5.6-terra` with high reasoning for correctness and security review.
- `openai_docs_researcher` uses `gpt-5.6-luna` with medium reasoning because authoritative retrieval matters more than expensive synthesis.

Do not add a custom agent when a deterministic repository check or a built-in Codex agent already owns the job.

## Machine-local configuration

Do not commit authentication, provider routing, profiles, notifications, telemetry destinations, or personal editor preferences here. Those remain in the user's Codex configuration outside the repository.

## Verification

Run `pnpm codex:check` after changing repository Codex configuration, agents, skills, hooks, rules, or scoped instructions. Run `pnpm verify:full` before merging a baseline or dependency change.
