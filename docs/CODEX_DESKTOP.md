# Codex Desktop Baseline

This repository uses Codex Desktop as an execution environment, not as a source of product or architecture truth. The trusted project layer makes repository instructions, context sources, command boundaries, workspace topology, and verification entry points explicit and machine-checkable.

## Trust and ownership

Codex loads `.codex/config.toml`, project agents, rules, and hooks only after the repository is trusted. Repository configuration contains shared, non-secret defaults. Authentication, personal profiles, notifications, provider routing, API keys, project references, and production credentials remain machine-local.

Authority remains:

1. the current task and applicable `AGENTS.md` chain;
2. accepted target contracts and ADRs;
3. executable code, schema, migrations, and tests;
4. external documentation as evidence about external behavior;
5. generated or session context as non-authoritative projections.

## Context router

Use the narrowest authoritative source that answers the question.

| Question | Primary context | Project agent |
| --- | --- | --- |
| Repository semantics, target architecture, or current implementation | Repository files and applicable `AGENTS.md` chain | Primary thread; `architecture_auditor` for independent review |
| Current OpenAI or Codex behavior | OpenAI Developer Docs MCP | `openai_docs_researcher` |
| Version-sensitive third-party libraries and tooling | Context7 MCP | `dependency_docs_researcher` |
| Current Supabase CLI, PostgreSQL, Auth, RLS, or MCP behavior | Supabase Docs MCP; Context7 only as a second source view | `supabase_docs_researcher` |
| Local symbol navigation and bounded refactoring | Serena | Primary thread |
| Actual change correctness and affected contracts | Repository diff and deterministic checks | `change_reviewer` |

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

The single `SessionStart` hook emits bounded observations:

- project root and applicable instruction reminder;
- workspace packages;
- Turbo presence;
- lockfile and dependency availability;
- branch and changed-path count;
- documentation-context routing;
- verification entry points.

The hook does not inspect secrets, call remote services, infer architecture, or mutate repository state.

## Command boundary

Project rules allow routine bounded inspection and local verification. They prompt before destructive filesystem operations and remote Supabase mutations. Resetting a linked Supabase database remains forbidden. When rules overlap, the most restrictive matching rule is expected to win.

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
pnpm supabase:types:local
pnpm supabase:stop
```

The development baseline is complete only when a clean install is deterministic, the Codex contract passes, the workspace graph is explicit, local Supabase can rebuild from repository state, and CI runs repository plus database contracts without hidden machine state.
