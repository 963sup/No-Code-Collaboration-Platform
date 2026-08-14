# Repository Invariants

## Absolute product axiom

> **Repository = No-Code Collaboration Container**

This is the project's single non-negotiable Product axiom. It cannot be conditioned, weakened, partially applied, or reinterpreted by benchmark vocabulary, framework behavior, provider constraints, persistence shape, or existing implementation.

GitHub is a semantic benchmark for mature ownership, organization, authority, information architecture, navigation, and collaboration interaction. It is not implementation authority.

When adapting a GitHub concept, first prove that the collaboration or organizational problem remains valid for an arbitrary no-code Repository. If the concept's value depends on software-development-specific implementation assumptions rather than that durable collaboration problem, reject the concept entirely. Do not preserve it through renaming, analogy, metaphor, or a generic wrapper.

Classify only surviving concepts with the smallest applicable semantic roles before creating entities or boundaries:

```text
Actor        = who acts
Scope        = which ownership or governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how actors, principals, scopes, owners, and containers are connected
Artifact     = what collaborative work exists inside a container
Process      = how artifacts or relationships validly change
```

These are reasoning roles, not a seven-package, seven-table, or seven-entity architecture. Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and historical evidence remain separate cross-cutting semantics. A concept may play more than one semantic role in different causal positions.

Current canonical ownership/routing:

```text
Repository Owner = User | Organization
Canonical URL    = /{ownerSlug}/{repositorySlug}
```

Organization is a Membership/administration Scope and possible Owner, not a mandatory Repository parent. `/app` is Repository discovery/dashboard, not Repository identity.

## Current truth order

For normal development, resolve questions in this order:

1. Current explicit task and the applicable `AGENTS.md` chain.
2. `docs/PRODUCT.md`, accepted/current Domain contracts, and `docs/architecture/README.md`.
3. `docs/IMPLEMENTATION_GAPS.md` for current Open or Contained target-to-executable differences.
4. Executable code, `supabase/schemas`, policies, tests, and CI evidence.
5. Direct provider or production observation and current official external documentation.
6. Generated projections and transient agent/session context.

Pull requests, source-history records, closed-gap archives, migration history, and ADR rationale are historical evidence. Do not use them as current truth unless the task asks why a decision changed or requires regression archaeology.

## Zero-context cold start

A fresh agent must resolve current work through the current task, the applicable `AGENTS.md` chain, `docs/README.md`, the narrowest task-specific current contract, and then executable evidence.

Historical evidence is opt-in. Do not reconstruct current project state from ADR bodies, closed-gap archives, pull requests, source history, or migration history unless the task explicitly requires why, regression analysis, or provenance.

Do not recursively read documentation directories or broad repository history to build context. Use `docs/README.md` as the current-truth router and load only the smallest authoritative context that can falsify or support the task.

When current authorities disagree or required context is missing, do not invent the missing architecture. Resolve the conflict from the nearest current contract and executable evidence; if the mismatch is real, register or update the current gap.

## Architecture boundaries

- `packages/domain` owns business truth, invariants, state transitions, and Capability semantics. It does not depend on framework or provider code.
- `packages/application` owns use cases and provider-neutral Ports. It may depend on Domain, never on Next.js or Supabase implementation.
- `packages/infrastructure/supabase` implements Application Ports and owns Supabase clients, queries, DTOs, mappers, and generated database projections.
- `apps/web` is Next.js delivery and composition. Provider wiring is allowed only in `apps/web/src/composition`.
- `packages/ui` owns presentation primitives; it cannot define Product/Domain semantics.
- `supabase/schemas` is current desired database truth. `supabase/migrations` is append-only transition history. `database.types.ts` is generated projection only.
- Grants control object/Data API reachability; RLS controls row access. Neither replaces Domain/Application authorization.

Dependency direction:

```text
Web -> Application -> Domain
         ^
         |
Infrastructure
```

## Product non-confusion rules

- Repository Owner is a typed User/Organization ownership Relationship, not an explicit Grant row.
- User may be Actor, Principal, and Owner in different causal positions; those roles are not interchangeable.
- Organization may own Repository but never acts as the authenticated request Actor.
- Membership answers belonging; it does not automatically answer Repository access.
- Principal receives explicit authority; selected Context does not.
- Role bundles Capabilities; Capability is the decision primitive.
- Collaborator and Outside collaborator are derived labels, not identity types.
- Historical Evidence is distinct from Feed/Notification/Audit/Analytics projections.
- Team and Enterprise remain Deferred until the specific discriminating tests in Product/Ontology require them.
- A second Resource family remains Deferred until it proves behavior or lifecycle distinct from Page while reusing Repository containment/authorization.

## Working rules

- Read the complete applicable `AGENTS.md` chain before editing. Nested instructions contain only scope-specific deltas.
- Make the smallest sufficient reversible change, except when the explicit task requires correcting the earliest invalid canonical boundary; in that case replace the invalid definition and all affected projections rather than layering compatibility prose over it.
- Do not add speculative frameworks, services, stores, APIs, abstractions, or dependencies.
- Do not redesign architecture while solving a local task unless the explicit task requires that architectural correction.
- Prefer machine-verifiable evidence over prose. Verify the narrowest affected scope first, then broaden only when impact requires it.
- Keep command and tool output bounded. Do not dump generated files, lockfiles, full logs, or broad repository output when focused evidence is sufficient.
- Never publish secrets, tokens, `.env` files, credentials, project references, or private production data.
- Treat external systems as separate trust boundaries. Mutating or destructive external actions require explicit user intent.
- Use focused agents, skills, and documentation tools only when they reduce uncertainty. They provide analysis or external evidence; they do not redefine repository truth.

## Code review rules

Report consequential violations and state the safe alternative.

- **Product semantic drift:** flag any change that weakens `Repository = No-Code Collaboration Container`, creates a competing collaboration Container without falsifying evidence, makes Organization mandatory for Repository ownership, lets Context alter authorization, or imports a benchmark capability without proving that its durable collaboration problem survives the target model.
- **Benchmark admission failure:** flag any attempt to keep an out-of-scope GitHub capability through renaming, analogy, abstraction, or generic wrapping after its usefulness depends on excluded implementation assumptions.
- **Architecture truth-boundary violations:** flag framework/provider leakage into Domain or Application, provider queries outside the Infrastructure/composition boundary, generated database type leakage, or business decisions owned by delivery/adapters.
- **Authorization enforcement bypass:** flag authentication treated as resource authorization, UI visibility as sole enforcement, service/secret credentials in browser code, weakened RLS without an equivalent invariant, user-editable metadata used as authority, or external mutation without explicit intent.
- **Duplicate current truth:** flag obsolete route trees, adapters, documentation, or checkers that continue to encode a superseded ownership/URL/UI contract beside the canonical implementation.

## Verification

- `pnpm` is the only JavaScript package manager. TypeScript strictness must not be weakened.
- `oxfmt` is the formatter; `oxlint` is the general JS/TS linter.
- Run `pnpm codex:check` when agents, skills, hooks, rules, environments, or instructions change.
- Run `pnpm verify:fast` after normal code changes. Run `pnpm verify:full` before integration when dependencies, exports, entry points, builds, or dead-code reachability may have changed.
- Playwright is the browser behavior boundary. Repository navigation verification must cover `/app` to canonical `/{owner}/{repository}` and accepted Page/Activity journeys.
- Supabase database changes start from `supabase/schemas`, include reviewed replayable migrations when state changes, and regenerate checked-in types rather than hand-editing projections.
- Use `docs/README.md` as the truth router, `docs/CODEX_DESKTOP.md` for Codex context/trust boundaries, and `docs/DEVELOPMENT_ENVIRONMENT.md` for workstation setup and verification.
