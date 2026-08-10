# Repository Invariants

This repository defines a no-code collaboration platform by reverse-engineering mature GitHub product semantics and rebuilding them from first principles.

## Product semantics

- MUST treat `Repository` as a no-code collaboration container, not as a Git code repository.
- A Repository may contain data, pages, workflows, documents, tasks, settings, members, permissions, activity history, and other collaborative resources.
- GitHub is a semantic benchmark, not an implementation template. Do not add a concept merely because GitHub has it.
- For every new concept, identify the root problem it solves, whether it is a necessary entity, its scope, relationships, invariants, and what breaks if it is removed.
- Prefer semantic consistency, explicit boundaries, minimum sufficient models, and falsifiable decisions over preserving existing naming or UI conventions.

## First-principles workflow

For architecture, product, data-model, permission, navigation, or interaction work:

1. Frame the real decision and success condition.
2. Separate observations, constraints, assumptions, unknowns, and value choices.
3. Study mature solutions for mechanisms, not surface patterns.
4. Rebuild the minimum sufficient model: entities, relationships, state, mechanisms, invariants, and boundaries.
5. Remove unnecessary abstractions and duplicated concepts.
6. Identify leverage points, bottlenecks, and reversible interventions.
7. Define the smallest discriminating test that could change the decision.
8. Update the model when evidence contradicts the prediction.

## Codex operating rules

- Read the applicable `AGENTS.md` chain before editing. The nearest file wins for its subtree.
- Inspect repository state and relevant contracts before changing behavior.
- Make the smallest sufficient reversible change. Do not introduce speculative services, stores, APIs, dependencies, or frameworks.
- Prefer machine-verifiable evidence over prose claims.
- Keep command output bounded. Narrow scope before running noisy commands; prefer quiet, summary, JSON, count, and limit options when available.
- Never dump complete build logs, generated files, lockfiles, recursive listings, or repository-wide diffs into context when a smaller excerpt is sufficient.
- Validate the narrowest affected scope first, then broaden only when impact requires it.
- Before finishing a code-changing task, inspect `git diff`, `git diff --check`, `git status --short`, and untracked files when those commands are available.
- Do not commit secrets, tokens, `.env` files, credentials, or private production data.
- Treat external systems and mutable infrastructure as separate trust boundaries. Reads may be automatic only when explicitly configured; destructive or mutating actions require user intent.

## Toolchain contract

- `pnpm` is the only JavaScript package manager for this repository.
- TypeScript strict mode is the default type contract. Do not weaken strictness to make a change pass.
- `oxfmt` is the only formatter and `oxlint` is the only general JavaScript/TypeScript linter. Do not add overlapping formatter/linter stacks.
- Run `pnpm verify:fast` after normal code changes. Run `pnpm verify:full` before proposing a merge when dependencies or exports may have changed.
- Playwright is the behavioral test boundary for user-visible browser flows. Start with Chromium; add browsers only for a demonstrated compatibility requirement.
- Supabase schema is the source of truth for database structure. Once a schema exists, regenerate TypeScript database types instead of hand-authoring substitutes.
- `ast-grep` rules must encode proven architecture invariants. Do not create structural rules merely because the tool is installed.
- Knip findings should normally be fixed by removing dead code or repairing references, not hidden behind broad ignores.
- Lefthook is a local deterministic guardrail, not a substitute for repository verification or future CI.
- Do not add Turbo until at least two independently buildable workspaces create a real orchestration or affected-build problem.
- Keep `rg`, `jq`, `gh`, Serena, JetBrains integrations, and Repomix as workstation/agent tools rather than application dependencies unless product code genuinely requires them.

## Evidence hierarchy

For external product behavior, prefer current official documentation or direct observation over memory. For this repository's target design, the current task and repository contracts are authoritative. Generated projections, agent memories, examples, and benchmark implementations must not silently redefine the target model.

## Environment

Use `docs/DEVELOPMENT_ENVIRONMENT.md` for the workstation bootstrap and verification entry points. If the environment is uncertain, run `pnpm env:check` and use its bounded JSON result instead of manually probing many commands.
