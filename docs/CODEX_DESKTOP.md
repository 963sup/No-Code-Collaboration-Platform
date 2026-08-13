# Codex Desktop Baseline

This repository uses Codex Desktop as an execution environment, not as a source of product or architecture truth. The trusted project layer makes repository instructions, context sources, command boundaries, workspace topology, worktree setup, review criteria, and verification entry points explicit and machine-checkable.

## Trust and ownership

Codex loads `.codex/config.toml`, project agents, rules, hooks, environments, and skills only after the repository is trusted. Repository configuration contains shared, non-secret defaults. Authentication, personal profiles, notifications, provider routing, API keys, project references, and production credentials remain machine-local.

Authority remains:

1. the current task and applicable `AGENTS.md` chain;
2. `docs/PRODUCT.md`, accepted Domain contracts, and `docs/architecture/README.md` for current target truth;
3. `docs/IMPLEMENTATION_GAPS.md` for current Open or Contained target-to-executable differences;
4. executable code, `supabase/schemas`, policies, and tests for current behavior;
5. direct provider observations and current official external documentation;
6. generated or session context as non-authoritative projections.

Historical evidence is opt-in. For why, regression analysis, or provenance, route through `docs/architecture/ADR_INDEX.md` before the relevant ADR, Closed-gap archive, pull request, commit, CI evidence, or migration history. Do not reconstruct current project state from historical evidence during normal task execution.

## Context router

Use the narrowest authoritative source that answers the question. Do not recursively load documentation directories or broad Git history to create context.

| Question | Primary context | Project agent |
| --- | --- | --- |
| Repository semantics, target architecture, or current implementation | Repository files and applicable `AGENTS.md` chain | Primary thread; `architecture_auditor` for independent review |
| Current OpenAI or Codex behavior | OpenAI Developer Docs MCP | `openai_docs_researcher` |
| Version-sensitive third-party libraries and tooling | Context7 MCP | `dependency_docs_researcher` |
| Current Supabase CLI, PostgreSQL, Auth, RLS, or MCP behavior | Supabase Docs MCP; Context7 only as a second source view | `supabase_docs_researcher` |
| Local symbol navigation and bounded refactoring | Serena | Primary thread |
| Actual change correctness and affected contracts | Repository diff and deterministic checks | `change_reviewer` |
| Why a decision changed, regression archaeology, or provenance | `docs/architecture/ADR_INDEX.md`, then only the relevant historical evidence | Primary thread; focused reviewer only when useful |

External documentation may explain a benchmark or dependency, but it must not silently redefine the platform model.

## Committed MCP boundary

The project config commits three read-only documentation sources:

- `openaiDeveloperDocs` — official OpenAI and Codex documentation;
- `context7` — current version-sensitive third-party documentation, limited to library resolution and documentation queries;
- `supabaseDocs` — Supabase documentation only, restricted to `search_docs` with `read_only=true&features=docs`.

Serena is local and optional. Its write-capable operations remain approval-gated.

The committed Supabase server is documentation-only and deliberately has no live project identifier, credential, database tooling, or production context. It supplies product documentation, not live-project state.

## Optional machine-local Supabase project context

Direct Supabase project inspection is intentionally not specified in repository configuration. When it is justified, follow the current official Supabase MCP setup on the workstation, target a development project or branch, keep access read-only by default, and expose only the smallest required feature groups. Authenticate through Codex MCP management and keep every project identifier and credential outside Git.

A connected project is observational context. `supabase/schemas` remains current database truth for this repository, and remote observations never silently replace reviewed schema or migration evidence.

## Optional machine-local Context7 authentication

The committed Context7 endpoint works without repository credentials. When an API key is useful for higher limits, configure it only in machine-local Codex settings or the approved local authentication boundary. Do not place it in `.codex/config.toml`, agent files, shell scripts, or committed environment files.

## Project agents

- `architecture_auditor` — high-reasoning, read-only review of product semantics and boundaries.
- `change_reviewer` — high-reasoning, read-only review of actual diffs, correctness, security, and missing verification.
- `openai_docs_researcher` — official OpenAI/Codex documentation retrieval.
- `dependency_docs_researcher` — Context7-backed version-sensitive dependency research.
- `supabase_docs_researcher` — Supabase documentation retrieval with explicit schema, RLS, and remote-project cautions.

The primary thread owns edits, decisions, and verification claims. Agents reduce uncertainty; they do not replace deterministic checks or create consensus by repetition.

## Session context

The single `SessionStart` hook emits bounded observations and routing instructions:

- zero-context cold-start order through the current task, applicable `AGENTS.md` chain, and `docs/README.md`;
- explicit historical-evidence opt-in for why, regression analysis, or provenance;
- project root and applicable instruction reminder;
- workspace packages;
- Turbo presence;
- lockfile and dependency availability;
- branch and changed-path count;
- documentation-context routing;
- verification entry points.

The hook does not inspect secrets, call remote services, recursively load documentation, infer architecture from history, or mutate repository state. When current authorities disagree, the agent must resolve the nearest current contract against executable evidence rather than inventing architecture; a real mismatch belongs in the current gap register.

## Local worktree environment

Codex Desktop can create isolated Git worktrees for parallel tasks. The committed `.codex/environments/environment.toml` provides the minimum deterministic setup:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm codex:check
```

It also exposes three bounded actions:

- `Run web` starts the Next.js development server;
- `Verify worktree` runs `pnpm verify:fast`;
- `Verify full` runs the merge-level `pnpm verify:full` gate.

Setup deliberately does not start Supabase, install browser binaries, copy `.env` files, authenticate external services, or mutate infrastructure. Those operations remain explicit and task-scoped.

## Code review

Use a read-only Codex review before proposing consequential changes. The root `AGENTS.md` defines project-specific checks that mechanical tools cannot prove, including product semantic drift, architecture truth-boundary violations, authorization or external-trust-boundary bypasses, and task-scoped attempts to redesign architecture without explicit scope.

A clean model review is evidence, not authority. TypeScript, Oxc, Vitest, Supabase tests, Playwright, actionlint, zizmor, and GitHub Actions remain the deterministic gates.

## CI guardrails

The workflow guardrail job runs in parallel with Repository and Supabase verification so security analysis does not delay other feedback. It validates GitHub Actions syntax with actionlint and analyzes workflow security with zizmor. Every reusable Action is pinned to an immutable commit SHA, checkout credentials are not persisted, and workflow permissions remain read-only by default.

Secret scanning is not duplicated in this workflow. Repository-level GitHub secret scanning and push protection should remain the primary controls; add a separate scanner only when a concrete custom-pattern or local-parity requirement exists.

## Command boundary

Project rules allow routine bounded inspection and local verification. They prompt before destructive filesystem operations and remote Supabase mutations. Resetting a linked Supabase database remains forbidden. When rules overlap, the most restrictive matching rule is expected to win.

Git history remains available for explicit why, regression, security investigation, or provenance tasks. It is not forbidden and does not require a blanket history gate; semantic routing keeps it out of normal cold-start context.

## Verification

Run the narrowest check that can falsify the change, then broaden when impact requires it.

```sh
pnpm codex:check
pnpm verify:fast
pnpm verify:full
pnpm turbo:graph
```

For database changes:

```sh
pnpm supabase:start
pnpm supabase:reset
pnpm supabase:lint
pnpm supabase:test
pnpm supabase:types:local
pnpm supabase:stop
```

The development baseline is complete only when a clean install is deterministic, the Codex and operational contracts pass, the workspace graph is explicit, local Supabase can rebuild from repository state, and CI runs guardrail, repository, database, and browser contracts without hidden machine state.
