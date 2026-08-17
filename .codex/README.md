# Codex Desktop Project Layer

This directory contains the shared repository-scoped Codex configuration. Codex loads it only after the repository is trusted.

## Ownership

- `config.toml` owns non-secret project defaults, sandboxing, approvals, bounded web search, history compaction, agent concurrency, environment inheritance, and repository MCP servers.
- `compact-prompt.md` owns the readable copy of the first-principles state-transfer prompt. The inline and file-backed settings intentionally contain the same prompt, and `pnpm codex:check` rejects drift between them.
- `agents/` owns narrow specialists. Review/research specialists remain read-only; `github_semantics_first_principles` is the single bounded workspace-write implementation specialist for the canonical GitHub semantic Skill. Publication and external mutations remain separate authorization boundaries.
- `hooks.json` and `hooks/` own bounded lifecycle observations. Hook output is never product or architecture truth.
- `environments/environment.toml` owns deterministic worktree setup and a minimal set of shared terminal actions.
- `rules/` owns command approval boundaries. Routine local inspection may be automatic; destructive or external mutation remains prompt-gated or forbidden.

## Context routing

- OpenAI or Codex behavior: `openaiDeveloperDocs` and `openai_docs_researcher`.
- Version-sensitive third-party dependencies: `context7` and `dependency_docs_researcher`.
- Supabase behavior: documentation-only `supabaseDocs` and `supabase_docs_researcher`.
- GitHub-derived Product semantic reverse-engineering and root-level implementation: `$github-semantics-first-principles` and `github_semantics_first_principles` when a dedicated implementation subagent is useful.
- Local semantic code navigation: optional Serena.

The committed Supabase MCP endpoint is documentation-only. Project references, OAuth/PAT credentials, database tools, and production access remain machine-local. See [`docs/CODEX_DESKTOP.md`](../docs/CODEX_DESKTOP.md).

## Execution loop

The shared loop is intentionally small:

```text
new worktree
    ↓
deterministic setup
    ↓
Codex change
    ↓
pnpm verify:fast
    ↓
/read-only review against project invariants
    ↓
pnpm verify:full before merge
```

For GitHub-derived Product semantic work the canonical Skill adds the evidence snapshot, glossary, First Principles admission/rejection decision, audit convergence, and mirror synchronization before integration.

Verification remains explicit. The repository does not install an automatic Stop hook because every turn should not pay the cost of a full worktree gate, and a model continuation is not a deterministic merge boundary.

## Model strategy

The primary thread does not pin a model in project configuration; the Desktop user chooses the model appropriate to the task. Specialists use purpose-fit models and reasoning levels:

- `architecture_auditor`: `gpt-5.6-terra`, high reasoning, read-only.
- `change_reviewer`: `gpt-5.6-terra`, high reasoning, read-only.
- `github_semantics_first_principles`: `gpt-5.6-terra`, high reasoning, workspace-write for repository-local semantic implementation only.
- `openai_docs_researcher`: `gpt-5.6-luna`, medium reasoning, read-only.
- `dependency_docs_researcher`: `gpt-5.6-luna`, medium reasoning, read-only.
- `supabase_docs_researcher`: `gpt-5.6-luna`, medium reasoning, read-only.

Do not add a custom agent when a deterministic check or an existing specialist already owns the problem. Workspace-write in an agent role does not authorize Git publication, deployment, or remote-provider mutation.

## Machine-local configuration

Do not commit authentication, provider routing, project references, profiles, notifications, telemetry destinations, personal editor preferences, API keys, or database credentials. Keep those in the user's Codex configuration or an approved workstation authentication boundary.

Auto-review, approval routing, and notifications remain user or enterprise policy rather than committed project defaults.

## Verification

Run `pnpm codex:check` after changing Codex configuration, agents, skills, environments, hooks, rules, or scoped instructions. Use `pnpm verify:fast` for normal worktree evidence and `pnpm verify:full` before merging a baseline, dependency, export, or build-boundary change.
