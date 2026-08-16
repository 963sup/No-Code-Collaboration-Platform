# Repository-Wide Instructions

## Absolute Product axiom

> **Repository = No-Code Collaboration Container**

This is the single non-negotiable Product axiom. Benchmark vocabulary, framework behavior, provider constraints, persistence, and existing implementation cannot reinterpret it.

GitHub is evidence for mature collaboration mechanisms, not implementation authority. Admit a GitHub-derived concept only when the same collaboration or organizational problem remains valid for an arbitrary no-code Repository. Reject concepts whose value depends on software-development-specific assumptions; do not preserve them through renaming, a Data-prefixed alias, metaphor, or a generic wrapper.

Semantic roles are a reasoning lens, not an entity, package, table, service, or bounded-context taxonomy:

```text
Actor        = who acts
Scope        = which ownership/governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how identities, owners, principals, scopes, and containers connect
Artifact     = collaborative work inside a Container
Process      = how Artifact/Relationship state validly changes
```

Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and historical Evidence remain separate cross-cutting semantics.

## Current truth order

1. Current task and the complete applicable `AGENTS.md` chain.
2. `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, the narrowest current Domain contract, and `docs/architecture/README.md`.
3. `docs/IMPLEMENTATION_GAPS.md` for current Open/Contained target-to-executable mismatch.
4. Executable code, `supabase/schemas`, policies, tests, and CI.
5. Direct provider/production observation and current official external documentation.
6. Generated projections and transient context.

Use `docs/README.md` as the question-specific truth router. Current implementation status belongs to executable evidence and the gap register, not to instruction snapshots.

## Context continuity and skill routing

Preserve task/session context and established decisions. Ground them against the current task, applicable `AGENTS.md` chain, `docs/README.md`, the narrowest current contract, then executable evidence. This does not require discarding context or simulating a fresh start. Prior conversation, summaries, project memory, and history are evidence, not current truth by themselves.

Select skills by narrowest ownership. Explicit user-named skills win. `github-semantic-reverse` owns GitHub-derived Product decisions and repository-wide GitHub semantic repair; `first-principles` owns broader or non-GitHub decisions. Skills route work and never replace current repository contracts. Do not create overlapping Skills for the same decision merely to obtain consensus.

When required context is missing or authorities disagree, do not invent the missing architecture. Resolve the nearest current contract and executable evidence or register the mismatch.

## Architecture boundaries

```text
Web -> Application -> Domain
         ^
         |
Infrastructure
```

- `packages/domain`: business truth, invariants, transitions, and Capability semantics; provider/framework neutral.
- `packages/application`: use cases and provider-neutral Ports; depends on Domain only.
- `packages/infrastructure/supabase`: Application Port implementations, provider DTO mapping, and generated database projection.
- `apps/web`: Next.js delivery and composition; provider wiring only in `src/composition`.
- `packages/ui`: accessible presentation primitives only.
- `supabase/schemas`: current desired database truth.
- `supabase/migrations`: replayable transition history.
- `database.types.ts`: generated Infrastructure projection, never an authoring surface.

RLS is independent database enforcement; it does not replace Domain/Application authorization explanation.

## Cross-cutting invariants

- Repository Owner is a typed User/Organization ownership Relationship, not a synthetic Grant.
- Repository is the only primary collaboration/authorization Container; structural containment does not create another Container.
- Organization may own Repository but never acts as the authenticated request Actor.
- Membership answers belonging; it does not imply Repository access.
- Principal receives explicit authority; selected Context does not.
- Role bundles Capabilities; Capability is the authorization decision primitive.
- Authentication is not authorization. UI visibility is not enforcement.
- Identity establishes a trusted Actor; Access resolves effective authority.
- Account is a settings/administration surface family, not a generic entity.
- Context, Projection, comparison selection, planning filters, and Notification state never create or change authority.
- Governance constrains future action; Audit explains past action.
- Historical Evidence is distinct from Feed, Notification, Audit, and Analytics projections.
- Collaboration mutation uses concrete Resource commands, an expected current revision when concurrency requires it, an accepted State Transition, and separate Activity Event evidence.
- Current-state law: `Concrete Resource Command + Expected Revision → State Transition → Current State + Activity Event`.
- No source-control-shaped Data Change, alternate state-line, history-graph, proposal-merge, or upstream-derived Repository envelope is accepted as Product semantics.
- A future typed transfer or independent Repository duplication requires a separately accepted user problem, authority model, lifecycle, and discriminating test.
- Secrets, credentials, `.env` files, project references, private production data, and raw private Repository content must not be published or captured for convenience.

## Working rules

- Read the full applicable nested instruction chain before editing a scope.
- Prefer the smallest sufficient reversible change that fixes the earliest incorrect truth boundary.
- Do not redesign architecture while solving a local task unless the explicit task requires that correction.
- Do not add speculative frameworks, services, stores, APIs, abstractions, persistence supertypes, or dependencies.
- Treat existing code, docs, names, and tests as evidence rather than proof that the model is correct.
- Prefer machine-verifiable evidence over duplicated prose.
- External mutation or destruction requires explicit user intent.

## Code Review Rules

- **Product semantic drift:** flag weakening of the Repository axiom, mandatory Organization ownership, Context-derived authority, or a benchmark feature that failed no-code admission.
- **Architecture truth-boundary violations:** flag provider/framework leakage into Domain/Application, reversed workspace dependencies, or obsolete adapters/routes that preserve superseded truth.
- **Authorization enforcement bypass:** flag authentication treated as authorization, UI-only enforcement, browser service credentials, weakened RLS, or authority derived from presentation/provider metadata.
- **Source-control mental-model drift:** flag any target primitive that introduces change-history nodes, alternate state lines, merge-like convergence, movable state pointers, or continuing upstream authority without an independently proven no-code problem.

## Verification

- Use `pnpm` only; keep TypeScript strict; use `oxfmt` and `oxlint`.
- Run `pnpm codex:check` when instructions, skills, hooks, environment rules, or their checkers change.
- Run `pnpm verify:fast` after normal code/configuration changes.
- Run `pnpm verify:full` before integration when build, exports, dependencies, or reachability change.
- Supabase changes start from `supabase/schemas`, include reviewed replayable migration evidence, and regenerate checked-in database types.
- Use `docs/CODEX_DESKTOP.md` for Codex trust/context boundaries and `docs/DEVELOPMENT_ENVIRONMENT.md` for workstation setup.
