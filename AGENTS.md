# Repository Invariants

This repository defines a no-code collaboration platform by reverse-engineering mature GitHub product semantics and rebuilding them from first principles.

## Product semantics

- MUST treat `Repository` as a no-code collaboration container, not as a Git code repository.
- A Repository may contain data, pages, workflows, documents, tasks, settings, members, permissions, activity history, and other collaborative resources.
- GitHub is a semantic benchmark, not an implementation template. Do not add a concept merely because GitHub has it.
- For every new concept, identify the root problem it solves, whether it is a necessary entity, its scope, relationships, invariants, and what breaks if it is removed.
- Prefer semantic consistency, explicit boundaries, minimum sufficient models, and falsifiable decisions over preserving existing naming or UI conventions.

## Architecture truth boundaries

- Turbo is the application architecture graph. Workspace package manifests define architectural nodes and dependency edges; `turbo.json` defines task relationships over that graph.
- `packages/domain` owns business truth: canonical concepts, invariants, state transitions, and domain decisions. It must not depend on Supabase, application orchestration, or web delivery.
- `packages/application` owns use-case orchestration and provider-neutral Ports. It may depend on Domain but never on Next.js, Supabase SDKs, clients, DTOs, or generated database types.
- `packages/infrastructure/supabase` is the current Supabase adapter boundary. It implements Application Ports and owns provider-specific clients, queries, mappers, DTOs, and generated database projections.
- `apps/web` is the Next.js delivery and composition boundary. Supabase adapters may be wired only in `apps/web/src/composition`; routes, layouts, actions, handlers, and components call Application use cases instead of provider clients.
- `supabase/schemas` owns current database truth. `supabase/migrations` is append-only deployment history derived from reviewed schema changes, not an alternate current model.
- `packages/infrastructure/supabase/src/generated/database.types.ts` is a generated projection of the applied database schema. Never hand-author it as business truth or database truth.
- RLS is database enforcement. Grants determine API reachability; RLS determines row access. Neither replaces domain authorization semantics.
- Application code owns use-case orchestration. Web code is a delivery mechanism and must not become the owner of business rules or persistence truth.

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

## Instruction layering

- Codex loads at most one instruction file per directory from the repository root to the current working directory. Nearer scoped instructions override conflicting broader guidance.
- Use nested `AGENTS.md` files for durable subtree rules. Use `AGENTS.override.md` only for an intentional replacement at that directory and never as an undocumented workaround.
- A nested instruction file contains only the delta for its scope; do not duplicate the root contract.
- When changing a scoped area, read the complete applicable instruction chain before editing.

## Codex-native collaboration

- The primary thread owns the final decision, edits, and verification claims.
- Use `architecture_auditor` for independent read-only model review before consequential architecture changes.
- Use `change_reviewer` for independent read-only review of actual diffs and affected contracts.
- Use `openai_docs_researcher` when current OpenAI or Codex behavior must be verified against official OpenAI documentation.
- Use `dependency_docs_researcher` for version-sensitive third-party library or tooling behavior through Context7.
- Use `supabase_docs_researcher` for current Supabase CLI, PostgreSQL, Auth, RLS, or MCP behavior. The committed Supabase MCP is documentation-only; project-linked access remains machine-local.
- Use repository skills when their descriptions match the task. Do not invoke every skill or subagent by default; parallelism must reduce uncertainty, not multiply context.
- Session hooks may report dynamic workspace state, but hooks, memories, generated context, and agent output are never canonical product or architecture evidence.

## Codex operating rules

- Read the applicable `AGENTS.md` chain before editing. The nearest applicable instruction wins on conflict.
- Inspect repository state and relevant contracts before changing behavior.
- Make the smallest sufficient reversible change. Do not introduce speculative services, stores, APIs, dependencies, or frameworks.
- Prefer machine-verifiable evidence over prose claims.
- Keep command output bounded. Narrow scope before running noisy commands; prefer quiet, summary, JSON, count, and limit options when available.
- Never dump complete build logs, generated files, lockfiles, recursive listings, or repository-wide diffs into context when a smaller excerpt is sufficient.
- Validate the narrowest affected scope first, then broaden only when impact requires it.
- Before finishing a code-changing task, inspect `git diff`, `git diff --check`, `git status --short`, and untracked files when those commands are available.
- Do not commit secrets, tokens, `.env` files, credentials, project references, or private production data.
- Treat external systems and mutable infrastructure as separate trust boundaries. Reads may be automatic only when explicitly configured; destructive or mutating actions require user intent.

## Code Review Rules

Apply these rules when Codex or a read-only reviewer inspects a diff. Report only consequential violations and state the safe alternative.

- **Product semantic drift:** Flag changes that treat `Repository` as a Git/code container or copy a GitHub concept without proving the collaboration problem, scope, relationships, invariants, and minimum sufficient model. The safe alternative preserves Repository as the no-code collaboration boundary.
- **Architecture truth-boundary violations:** Flag Domain or Application imports of Next.js, React runtime, Supabase SDKs, clients, DTOs, Rows, or generated database types; provider queries in routes, layouts, actions, handlers, or components; Supabase-specific implementation outside `packages/infrastructure/supabase` and `apps/web/src/composition`; generated-type leakage; or business decisions inside delivery, mapper, or repository adapters. Move the decision to its owning boundary and keep provider wiring explicit.
- **Authorization enforcement bypass:** Flag session existence treated as resource authorization, UI visibility as the only enforcement, service or secret credentials reaching browser code, weakened RLS without an equivalent invariant, user-editable metadata used as authority, or external mutations without explicit intent. Use Domain capability semantics, Application decisions, least-privilege RLS, and explicit approval at trust boundaries.

## Toolchain contract

- `pnpm` is the only JavaScript package manager for this repository.
- TypeScript strict mode is the default type contract. Do not weaken strictness to make a change pass.
- `oxfmt` is the only formatter and `oxlint` is the only general JavaScript/TypeScript linter. Do not add overlapping formatter/linter stacks.
- Run `pnpm codex:check` when Codex configuration, agents, skills, environments, hooks, rules, or scoped instructions change.
- Run `pnpm verify:fast` after normal code changes. Run `pnpm verify:full` before proposing a merge when dependencies, exports, entry points, builds, or dead-code reachability may have changed.
- Playwright is the behavioral test boundary for user-visible browser flows. Start with Chromium; add browsers only for a demonstrated compatibility requirement.
- Supabase schema is the source of truth for database structure. Once a schema exists, regenerate TypeScript database types instead of hand-authoring substitutes.
- `ast-grep` rules must encode proven architecture invariants. Do not create structural rules merely because the tool is installed.
- Knip findings should normally be fixed by removing dead code or repairing references, not hidden behind broad ignores.
- Lefthook is a local deterministic guardrail, not a substitute for repository verification or future CI.
- Keep Turbo configuration aligned with the actual workspace dependency graph; do not invent packages or task edges merely to make the graph look complete.
- Keep `rg`, `jq`, `gh`, Serena, JetBrains integrations, and Repomix as workstation/agent tools rather than application dependencies unless product code genuinely requires them.

## Evidence hierarchy

For external product behavior, prefer current official documentation or direct observation over memory. Route current OpenAI/Codex questions to OpenAI Developer Docs, version-sensitive dependency questions to Context7, and Supabase questions to Supabase Docs. These sources describe external systems; the current task, repository contracts, accepted ADRs, and executable evidence remain authoritative for this platform's target design. Generated projections, agent memories, examples, hooks, and benchmark implementations must not silently redefine the target model.

## Environment

Use `docs/README.md` as the documentation router, `docs/CODEX_DESKTOP.md` for Codex context and trust boundaries, and `docs/DEVELOPMENT_ENVIRONMENT.md` for workstation bootstrap and verification entry points. If the environment is uncertain, run `pnpm env:check` and use its bounded JSON result instead of manually probing many commands.
