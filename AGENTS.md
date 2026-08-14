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

## Zero-context cold start

A fresh agent starts from the current task, applicable `AGENTS.md` chain, `docs/README.md`, the narrowest current contract, then executable evidence. Historical evidence is opt-in for why, regression, or provenance; it is not current truth by default.

Do not recursively reconstruct current state from broad history. When required current context is missing or authorities disagree, do not invent the missing architecture; resolve the nearest current contract and executable evidence or register the mismatch.

For non-trivial product, implementation, review, release, or provider-validation work, use `.agents/skills/plugin-development-workflow/SKILL.md` to route connected Linear, GitHub, Notion, Context7, Codex Security, Vercel, and Supabase tools by truth class. Never invoke all seven ceremonially or let an external tool redefine repository truth.

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
- Page is the only accepted concrete Resource kind until a second real Resource proves distinct behavior/lifecycle while reusing Repository containment/authorization.

## Working rules

- Read nested instructions before editing their scope.
- Prefer the smallest sufficient reversible change. When the task explicitly corrects a false canonical boundary, replace the false definition and every affected projection rather than layering compatibility prose over it.
- Do not redesign architecture while solving a local task unless the explicit task requires that correction.
- Do not add speculative frameworks, services, stores, APIs, abstractions, persistence supertypes, or dependencies.
- Prefer machine-verifiable evidence over prose.
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
- Playwright must cover `/app` → canonical `/{owner}/{repository}` → accepted Page/Activity journeys.
- Supabase changes start from `supabase/schemas`, include reviewed replayable migrations, and regenerate checked-in DB types rather than hand-editing projections.
- Use `docs/CODEX_DESKTOP.md` for Codex context/trust boundaries and `docs/DEVELOPMENT_ENVIRONMENT.md` for workstation setup.
