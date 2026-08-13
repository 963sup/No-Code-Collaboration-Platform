# Repository Invariants

This repository defines a no-code collaboration platform. `Repository` is a no-code collaboration container, not a Git code repository. GitHub is a semantic benchmark, not implementation authority.

When adapting a collaboration concept, classify its durable mechanism with the smallest applicable semantic roles before creating entities or boundaries:

```text
Actor        = who acts
Scope        = which ownership or governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how actors, principals, scopes, and containers are connected
Artifact     = what collaborative work exists inside a container
Process      = how artifacts or relationships validly change
```

These are reasoning roles, not a seven-package, seven-table, or seven-entity architecture. Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and historical evidence remain separate cross-cutting semantics. A concept may play more than one semantic role in different causal positions.

## Current truth order

For normal development, resolve questions in this order:

1. Current explicit task and the applicable `AGENTS.md` chain.
2. `docs/PRODUCT.md`, accepted Domain contracts, and `docs/architecture/README.md`.
3. `docs/IMPLEMENTATION_GAPS.md` for current Open or Contained target-to-executable differences.
4. Executable code, `supabase/schemas`, policies, tests, and CI evidence.
5. Direct provider or production observation and current official external documentation.
6. Generated projections and transient agent/session context.

PRs, commits, closed-gap archives, migration history, and ADR rationale are historical evidence. Do not use them as current truth unless the task asks why a decision changed or requires regression archaeology.

## Zero-context cold start

A fresh agent must resolve current work through the current task, the applicable `AGENTS.md` chain, `docs/README.md`, the narrowest task-specific current contract, and then executable evidence.

Historical evidence is opt-in. Do not reconstruct current project state from ADR bodies, Closed gaps, pull requests, commits, Git history, or migration history unless the task explicitly requires why, regression analysis, or provenance.

Do not recursively read documentation directories or broad repository history to build context. Use `docs/README.md` as the current-truth router and load only the smallest authoritative context that can falsify or support the task.

When current authorities disagree or required context is missing, do not invent the missing architecture. Resolve the conflict from the nearest current contract and executable evidence; if the mismatch is real, register or update the current gap.

## Architecture boundaries

- `packages/domain` owns business truth, invariants, state transitions, and capability semantics. It does not depend on framework or provider code.
- `packages/application` owns use cases and provider-neutral Ports. It may depend on Domain, never on Next.js or Supabase implementation.
- `packages/infrastructure/supabase` implements Application Ports and owns Supabase clients, queries, DTOs, mappers, and generated database projections.
- `apps/web` is Next.js delivery and composition. Provider wiring is allowed only in `apps/web/src/composition`.
- `supabase/schemas` is current desired database truth. `supabase/migrations` is append-only transition history. `database.types.ts` is generated projection only.
- Grants control object/Data API reachability; RLS controls row access. Neither replaces Domain/Application authorization.

Dependency direction:

```text
Web -> Application -> Domain
         ^
         |
Infrastructure
```

## Working rules

- Read the complete applicable `AGENTS.md` chain before editing. Nested instructions contain only scope-specific deltas.
- Make the smallest sufficient reversible change. Do not add speculative frameworks, services, stores, APIs, abstractions, or dependencies.
- Do not redesign architecture while solving a local task. A task-scoped implementation must not create a bounded context, move ownership between Domain/Application/Infrastructure/Web, change canonical routing composition, change authorization semantics, or change persistence ownership unless the explicit task requires that architectural decision.
- Prefer machine-verifiable evidence over prose. Verify the narrowest affected scope first, then broaden only when impact requires it.
- Keep command and tool output bounded. Do not dump generated files, lockfiles, full logs, recursive listings, or repository-wide diffs when a focused excerpt is sufficient.
- Never commit secrets, tokens, `.env` files, credentials, project references, or private production data.
- Treat external systems as separate trust boundaries. Mutating or destructive external actions require explicit user intent.
- Use focused agents, skills, and documentation tools only when they reduce uncertainty. They provide analysis or external evidence; they do not redefine repository truth.

## Code Review Rules

Report consequential violations and state the safe alternative.

- **Product semantic drift:** Flag changes that redefine `Repository` as a Git/code container, introduce a competing collaboration container without evidence, or copy benchmark concepts without first classifying their Actor/Scope/Principal/Container/Relationship/Artifact/Process role and proving the collaboration problem, lifecycle, invariants, and minimum sufficient model.
- **Architecture truth-boundary violations:** Flag framework/provider leakage into Domain or Application, provider queries outside the Infrastructure/composition boundary, generated database type leakage, or business decisions owned by delivery/adapters.
- **Authorization enforcement bypass:** Flag authentication treated as resource authorization, UI visibility as sole enforcement, service/secret credentials in browser code, weakened RLS without an equivalent invariant, user-editable metadata used as authority, or external mutation without explicit intent.

## Verification

- `pnpm` is the only JavaScript package manager. TypeScript strictness must not be weakened.
- `oxfmt` is the formatter; `oxlint` is the general JS/TS linter.
- Run `pnpm codex:check` when agents, skills, hooks, rules, environments, or instructions change.
- Run `pnpm verify:fast` after normal code changes. Run `pnpm verify:full` before merge when dependencies, exports, entry points, builds, or dead-code reachability may have changed.
- Playwright is the browser behavior boundary. Supabase database changes start from `supabase/schemas` and regenerate types rather than hand-editing projections.
- Use `docs/README.md` as the truth router, `docs/CODEX_DESKTOP.md` for Codex context/trust boundaries, and `docs/DEVELOPMENT_ENVIRONMENT.md` for workstation setup and verification.
