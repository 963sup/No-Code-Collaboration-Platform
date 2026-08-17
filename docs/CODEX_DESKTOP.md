# Codex Desktop Baseline

This repository uses Codex Desktop as an execution environment, not as Product or architecture truth. The trusted project layer makes repository instructions, context sources, specialist roles, command boundaries, and verification explicit and machine-checkable.

## Trust and authority

Codex loads `.codex/config.toml`, project agents, rules, hooks, environments, and repository Skills only after the repository is trusted. Shared configuration is non-secret. Authentication, provider routing, personal profiles, notifications, API keys, project references, and production credentials remain machine-local.

Authority remains:

1. the current task and applicable `AGENTS.md` chain;
2. `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, the narrowest current Domain contract, and `docs/architecture/README.md`;
3. `docs/IMPLEMENTATION_GAPS.md` for current target-to-executable mismatch;
4. executable code, `supabase/schemas`, policies, tests, and CI;
5. direct provider/production observation and current official external documentation;
6. generated projections and transient context.

Relevant prior context is preserved rather than discarded. Conversation state, summaries, history, and prior audit evidence may recover rationale or provenance, but none overrides current repository contracts. For decision history, route through `docs/architecture/ADR_INDEX.md` before reading the narrowest relevant historical evidence.

## Context router

Use the narrowest source that answers the question. Do not recursively load documentation or broad history merely to create context.

| Question | Primary context | Project specialist |
| --- | --- | --- |
| GitHub-derived Product semantics or repository-wide semantic repair | Current repository contracts + locked semantic Skill evidence | `github_semantics_first_principles` when dedicated repository-local implementation is useful |
| Product semantics/architecture review | Current repository files and applicable instructions | `architecture_auditor` |
| Actual change correctness and affected contracts | Exact repository diff + deterministic checks | `change_reviewer` |
| Current OpenAI or Codex behavior | OpenAI Developer Docs | `openai_docs_researcher` |
| Version-sensitive third-party behavior | Context7 | `dependency_docs_researcher` |
| Current Supabase CLI/PostgreSQL/Auth/RLS behavior | Supabase Docs; Context7 as a second source when useful | `supabase_docs_researcher` |
| Local symbol navigation/refactoring | Serena | primary thread or bounded implementation agent |

External documentation may explain a benchmark or dependency. It must not silently redefine the platform model.

## Skill routing

Choose the narrowest applicable owner. Explicitly user-named Skills take precedence. Use one primary decision Skill and compose operational Skills only for distinct responsibilities.

| Need | Owning Skill | Composition rule |
| --- | --- | --- |
| Continuous GitHub-derived Product adaptation, naming, ownership, permissions, navigation, collaboration semantics, implementation, audit, or repair | `github-semantics-first-principles` | Primary GitHub semantic Skill. It embeds First Principles reduction, locked evidence, canonical glossary, no-code admission, root correction, and audit convergence. |
| Broader or non-GitHub Product, Domain, permission, navigation, workflow, data-model, or architecture decision | `first-principles` | Separate general method; compose only when the task contains another real decision outside GitHub admission. |
| Connected external coordination, provider, documentation, security, deployment, or production evidence | `plugin-development-workflow` | Tool/evidence router only; it does not replace the active domain or decision Skill and does not require ceremonial plugin calls. |
| Local semantic discovery/refactoring | `serena-jetbrains` | Operational only. |
| Cross-package ownership/dependency impact | `workspace-impact-analysis` | Operational only when workspace topology is affected. |
| Post-change deterministic validation | `verify-change` | Closure after repository changes. |

`first-principles` and `github-semantics-first-principles` are not substitutes. The former is the general decision method; the latter is the specialized continuous workflow for reverse-engineering GitHub product semantics into this no-code Repository model. Do not invoke overlapping Skills to manufacture consensus.

## Project agents and least authority

Project specialists are purpose-specific:

- `architecture_auditor` — high-reasoning, read-only Product/architecture review.
- `change_reviewer` — high-reasoning, read-only diff/correctness/security review.
- `github_semantics_first_principles` — high-reasoning, **workspace-write** specialist paired with `$github-semantics-first-principles`; may implement accepted root corrections inside the repository only.
- `openai_docs_researcher` — read-only OpenAI/Codex documentation retrieval.
- `dependency_docs_researcher` — read-only Context7-backed dependency research.
- `supabase_docs_researcher` — read-only Supabase documentation research.

Workspace-write is not publication authority. The paired semantic implementation agent must not independently commit, push, merge, deploy, promote, mutate a remote Supabase project, change production flags, or write external mirror state. Those remain explicit parent/user actions. Review/research agents remain read-only.

The primary thread owns publication/integration actions, final verification claims, and external mutations authorized by the user. Agents reduce uncertainty or perform bounded local implementation; they do not manufacture consensus or replace deterministic checks.

## Committed MCP boundary

The project config commits three documentation sources:

- `openaiDeveloperDocs` — official OpenAI Developer Docs and Codex documentation;
- `context7` — current version-sensitive third-party documentation, limited to library resolution and documentation queries;
- `supabaseDocs` — Supabase Docs only, restricted with `read_only=true&features=docs`.

Serena is local and optional. Its write-capable operations remain approval-gated.

The committed Supabase endpoint is documentation-only and contains no live project identifier, credential, database tooling, or production context.

## Optional machine-local Supabase project context

Direct project inspection is intentionally not committed. When justified, configure machine-local Supabase project context against a development project/branch, keep access **read-only by default**, expose only the smallest required features, and keep project identifiers and credentials outside Git.

A connected project is observational evidence. `supabase/schemas` remains desired database truth for this repository, and remote observation never silently replaces reviewed schema or migration evidence.

## Optional machine-local Context7 authentication

The committed Context7 endpoint requires no repository credential. Higher-limit credentials, if used, remain machine-local and must not appear in `.codex/config.toml`, agent files, scripts, or committed environment files.

## Session context

The single `SessionStart` hook emits bounded observations and routing instructions:

- context continuity rather than artificial fresh starts;
- current task → applicable instructions → `docs/README.md` → narrow current contract → executable evidence;
- narrowest-owner Skill routing;
- canonical `github-semantics-first-principles` routing for GitHub-derived decisions;
- the paired implementation agent's workspace-only authority boundary;
- project root/workspace package summary;
- lockfile/dependency availability;
- branch/changed-path count;
- OpenAI Developer Docs, Context7, and Supabase Docs routing;
- verification entry points.

The hook does not inspect secrets, call remote services, recursively load documentation, infer current architecture from history, or mutate repository state.

## History compaction

The inline `compact_prompt` and file-backed `experimental_compact_prompt_file` intentionally contain the same continuation contract. Compaction preserves the minimum sufficient operational state: active intent, facts/constraints, decisions/invariants, evidence, authorization boundaries, user-owned dirty work, verification status, and the next concrete action. It omits secrets, unsupported completion claims, repetitive narrative, and superseded exploration.

`pnpm codex:check` rejects missing or divergent compaction inputs and enforces the context budget.

## Local worktree environment

The committed `.codex/environments/environment.toml` supplies deterministic worktree setup without provisioning infrastructure or copying secrets:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm codex:check
```

Shared actions may run the web app or repository verification, but setup deliberately does not start Supabase, install browser binaries, copy `.env` files, authenticate external services, or mutate infrastructure unless the task explicitly requires those operations.

## Code review and CI

Consequential changes should receive read-only review against the root Product and architecture invariants. A clean model review is evidence, not authority. TypeScript, Oxc, Vitest, Supabase tests, Playwright, actionlint, zizmor, and GitHub Actions remain deterministic gates where applicable.

Workflow guardrails validate Actions syntax/security while Repository, Supabase, and Browser jobs prove their own layers. Local/CI success is not production validation.

## Command boundary

Project rules allow bounded local inspection and verification. Destructive filesystem actions and remote mutations remain prompt-gated or forbidden. Linked Supabase database reset remains forbidden. When rules overlap, use the most restrictive result.

Git history is engineering/provenance evidence only. It may recover a decision or regression cause, but it never becomes Product source-control semantics.

## Verification

Run the narrowest falsifier first, then broaden by impact:

```sh
pnpm codex:check
pnpm verify:fast
pnpm verify:full
pnpm turbo:graph
```

For database changes, follow the repository-owned local Supabase path and start from `supabase/schemas`. Do not create or apply a remote migration merely because a local semantic change was made.
