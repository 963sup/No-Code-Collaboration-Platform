# Repository Invariants

## Absolute Product axiom

> **Repository = No-Code Collaboration Container**

This is the single non-negotiable Product axiom. Benchmark vocabulary, framework behavior, provider constraints, persistence, or existing implementation cannot reinterpret it.

GitHub is a semantic benchmark for mature ownership, organization, authority, URL/IA, navigation, and collaboration interaction. It is not implementation authority.

Before adapting a GitHub concept, prove that the same collaboration or organizational problem remains valid for an arbitrary no-code Repository. If its value depends on software-development-specific implementation assumptions, reject it entirely. Do not preserve it through renaming, analogy, metaphor, or a generic wrapper.

Semantic roles are a reasoning lens, not an entity/package/table taxonomy:

```text
Actor        = who acts
Scope        = which ownership/governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how identities, owners, principals, scopes, and containers connect
Artifact     = collaborative work inside a Container
Process      = how Artifact/Relationship state validly changes
```

Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and historical evidence remain separate cross-cutting semantics.

Current canonical ownership/routing:

```text
Repository Owner = User | Organization
Canonical URL    = /{ownerSlug}/{repositorySlug}
/app             = authenticated Repository discovery/dashboard
```

Organization is a Membership/administration Scope and possible Owner, not a mandatory Repository parent or collaboration Container.

## Current truth order

1. Current task + complete applicable `AGENTS.md` chain.
2. `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, narrowest current Domain contract, `docs/architecture/README.md`.
3. `docs/IMPLEMENTATION_GAPS.md` for current Open/Contained mismatch.
4. Executable code, `supabase/schemas`, policies, tests, CI.
5. Direct provider/production observation and current official external docs.
6. Generated projections and transient context.

Use `docs/README.md` as the truth router.

## Context continuity and skill routing

Preserve task/session context and established decisions. Ground them against the task, applicable `AGENTS.md` chain, `docs/README.md`, the narrowest current contract, then executable evidence. This order validates continuity; it does not require discarding context or simulating a fresh start. Prior conversation, summaries, project memory, and history may be used when relevant; they are evidence, not current truth by themselves.

Select skills by narrowest ownership. Explicit user-named skills win. `github-semantics-first-principles` owns GitHub-derived Product decisions and uses `github-product-semantics` only as its policy reference; `first-principles-architecture` owns broader or non-GitHub decisions. Combine decision skills only for separate decisions. `plugin-development-workflow` routes only necessary external tools/evidence. Operational skills may compose only for distinct responsibilities. Do not invoke overlaps for consensus.

Do not recursively reconstruct current state from broad history. When required current context is missing or authorities disagree, do not invent the missing architecture; resolve the nearest current contract and executable evidence or register the mismatch.

## Architecture boundaries

- `packages/domain`: business truth, invariants, transitions, Capability semantics; no framework/provider dependency.
- `packages/application`: use cases and provider-neutral Ports; depends on Domain only.
- `packages/infrastructure/supabase`: Application Port implementations, provider clients/DTO mapping, generated DB projection.
- `apps/web`: Next.js delivery/composition; provider wiring only in `src/composition`.
- `packages/ui`: presentation primitives only.
- `supabase/schemas`: current desired DB truth.
- `supabase/migrations`: replayable transition history.
- `database.types.ts`: generated projection only.

```text
Web -> Application -> Domain
         ^
         |
Infrastructure
```

RLS is independent database enforcement; it does not replace Domain/Application authorization explanation.

## Product non-confusion

- Repository Owner is a typed User/Organization ownership Relationship, not a synthetic Grant.
- User may play Actor, Principal, and Owner roles in different causal positions; those roles are not interchangeable.
- Organization may own Repository but never acts as the authenticated request Actor.
- Membership answers belonging; it does not imply Repository access.
- Principal receives explicit authority; selected Context does not.
- Role bundles Capabilities; Capability is the authorization decision primitive.
- Collaborator/Outside collaborator are derived labels, not identity types.
- Historical Evidence is distinct from Feed/Notification/Audit/Analytics projections.
- Team/Enterprise remain Deferred until their Product/Ontology discriminating tests require them.
- Page, Issue, and Discussion are accepted Repository-contained Resource kinds. Page has an executable command lifecycle; Issue currently has an executable read-only Domain/Application/persistence/Web slice whose undefined mutations remain fail closed. Discussion remains an Open delivery gap. All reuse Repository containment/authorization. Project-style planning remains a Projection, not another Resource owner or Container.

## Working rules

- Read nested instructions before editing their scope.
- Prefer the smallest sufficient reversible change. When the task explicitly corrects a false canonical boundary, replace the false definition and every affected projection rather than layering compatibility prose over it.
- Do not redesign architecture while solving a local task unless the explicit task requires that correction.
- Do not add speculative frameworks, services, stores, APIs, abstractions, persistence supertypes, or dependencies.
- Prefer machine-verifiable evidence over prose.
- Treat Sentry and PostHog as production observation evidence, not Product/Domain truth or substitutes for deterministic verification.
- Minimize telemetry and never intentionally capture credentials, auth tokens, secrets, or raw private Repository content merely for observability or analytics.
- Never publish secrets, credentials, `.env` files, project references, or private production data.
- External mutation/destruction requires explicit user intent.

## Code Review Rules

- **Product semantic drift:** flag any weakening of the Repository axiom, mandatory Organization ownership, Context-derived authority, or benchmark feature that failed no-code admission.
- **Architecture truth-boundary violations:** flag framework/provider leakage into Domain/Application or obsolete routes, adapters, docs, and checkers that preserve superseded current truth.
- **Authorization enforcement bypass:** flag authentication treated as authorization, UI visibility as sole enforcement, browser service credentials, weakened RLS, or authority derived from untrusted presentation/provider metadata.

## Verification

- `pnpm` only; keep TypeScript strict.
- `oxfmt` formats; `oxlint` lints.
- Run `pnpm codex:check` when instructions/skills/hooks/environment rules change.
- Run `pnpm verify:fast` after normal changes and `pnpm verify:full` before integration when build/exports/dependencies/reachability change.
- Playwright must cover `/app` → canonical `/{owner}/{repository}` → currently implemented Page/Activity journeys; newly implemented accepted surfaces must extend this journey coverage before their gaps close.
- Supabase changes start from `supabase/schemas`, include reviewed replayable migrations, and regenerate checked-in DB types rather than hand-editing projections.
- Use `docs/CODEX_DESKTOP.md` for Codex context/trust boundaries and `docs/DEVELOPMENT_ENVIRONMENT.md` for workstation setup.
