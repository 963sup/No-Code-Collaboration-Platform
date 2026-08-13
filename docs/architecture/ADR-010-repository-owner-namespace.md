# ADR-010: Repository Owner Namespace and Owner-Neutral Semantic Routing

- Status: Accepted
- Date: 2026-08-14
- Decision owner: Product and Architecture
- Affected scopes: Product ontology, Repository ownership, authorization, PostgreSQL schema/RLS, Application ports, Next.js routing, browser contracts

## Decision

Repository ownership is corrected from Organization-only to exactly one typed Owner, `User | Organization`. Canonical human Repository URLs use `/{ownerSlug}/{repositorySlug}` where the owner segment resolves a globally unambiguous User username or Organization slug. Repository stable UUID remains the authorization/history identity. Ownership is an authority source, not a fabricated direct Grant. Personal owner and Organization owner/admin governance derive Repository admin authority according to the concrete owner relationship.

## Problem and success condition

The previous executable baseline made `repositories.organization_id` mandatory and ADR-008 made `/app/{organizationSlug}/{repositorySlug}` canonical. That implementation shortcut was later used as Product evidence, creating circular reasoning and incorrectly deferring personal Repository ownership.

Success requires:

- User-owned and Organization-owned Repositories to be first-class;
- one Repository collaboration/Resource/Capability model across both ownership modes;
- unambiguous GitHub-style owner/repository URLs;
- owner-neutral Application authorization inputs;
- typed persistence integrity rather than a generic polymorphic owner record; and
- browser evidence that the dashboard can navigate into the canonical Repository workspace.

## Evidence ledger

### Observations

- `Repository = No-Code Collaboration Container` does not imply an Organization parent.
- User and Organization are both durable owner identities for the target Repository concept.
- Existing code/schema currently assumes Organization ownership because `organization_id` is mandatory.
- Existing canonical Web URL includes `/app` and `organizationSlug`, leaking implementation/ownership assumptions into product identity.
- Existing browser coverage exercises Page collaboration but previously did not assert the dashboard card-click journey.
- Existing `organization` visibility has no ordinary-member read semantics; database read baseline distinguishes only public versus capability-derived access.

### Constraints

- Exactly one Owner per Repository.
- Ownership, Membership, Principal Grant, Context, and effective authorization remain distinct.
- Repository stable ID remains target identity for authorization/history.
- Domain/Application remain provider neutral.
- Current persistence should preserve strong User/Organization FKs.
- Team/Enterprise candidate semantics remain deferred.

### Assumptions

- User and Organization are sufficient Owner kinds for the current product horizon.
- A globally unique owner namespace is preferable to ambiguous route resolution.
- `private | public` is sufficient visibility vocabulary until a real Organization-wide baseline exists.

### Unknowns

- Future transfer state machine and namespace reservation timing.
- Whether future account types justify an owner supertype.
- Whether Organization-wide visibility/base permission becomes necessary.

### Value choices

- Prefer mature GitHub owner/repository URL grammar over an implementation-specific `/app` prefix.
- Prefer typed XOR owner FKs over polymorphic owner IDs.
- Prefer correcting Product truth over preserving backward compatibility with an invalid ownership invariant.
- Preserve legacy stable-ID URL redirects where they do not create a second Repository UI.

## Minimum sufficient model

```text
User ──────────┐
               ├── owns ──> Repository ── contains ──> Resource
Organization ──┘                  │
                                  ├─ authorization target
                                  └─ historical evidence scope
```

Persistence target:

```text
repositories.owner_user_id         nullable FK
repositories.owner_organization_id nullable FK
CHECK exactly one is non-null
```

Routing target:

```text
User.username ───────┐
                     ├─ globally unique owner namespace ─> /{owner}/{repository}
Organization.slug ───┘
```

Authority target:

```text
Personal owner == Actor
→ Repository admin authority

Organization owns Repository
+ Actor Organization role owner/admin
→ Repository admin authority

Direct User Grant
→ assigned Repository Role

Public visibility
→ read baseline
```

Application authorization query:

```text
(actorId, repositoryId)
```

not:

```text
(actorId, organizationId, repositoryId)
```

because the caller must not supply ownership as an assumption.

## Alternatives and counterfactuals

### Keep Organization-only ownership

Rejected. It confuses a common enterprise path with a first-principles Repository constraint, prevents personal ownership, forces Organization into authorization and URL contracts, and lets persistence define Product truth.

### Make `organization_id` nullable and add `user_id` ad hoc

Rejected as insufficient by itself. Without an explicit owner invariant, global owner namespace, authorization correction, route correction, and tests, it only creates nullable ambiguity.

### Generic `owner_type + owner_id`

Rejected for the current model because it weakens FK integrity while only two accepted concrete owner types exist.

### Keep `/app/{owner}/{repository}` canonical

Rejected. `/app` is an authenticated delivery/dashboard concept rather than Repository identity. The owner/repository relation is sufficient and matches the mature benchmark mental model.

## Consequences

Benefits:

- Personal and organizational collaboration become symmetrical around Repository.
- URL/IA reflects Product ontology rather than Next.js implementation.
- Authorization becomes owner-neutral and easier to extend.
- False `organization` visibility semantics are removed.

Costs:

- Database desired state and migration history require ownership conversion.
- Generated database types and adapters change.
- Repository route tree and tests move.
- Sign-up/profile requires a personal owner namespace identifier.

Risks:

- Namespace migration can collide if User/Organization slugs are not globally coordinated.
- Route moves can break hard navigation if Parallel Route defaults are not preserved.
- Authorization can regress if personal owner authority and Organization governance are not tested independently in Domain and RLS.

## Falsification conditions

Reopen if:

- demonstrated requirements need a third Owner kind with lifecycle semantics that typed XOR no longer models safely;
- globally unique User/Organization owner namespace proves unacceptable for the product;
- personal and Organization-owned Repositories require contradictory collaboration semantics; or
- `/{owner}/{repository}` cannot coexist with required top-level product routes without an explicit routing strategy.

## Minimum discriminating test

1. Create a User-owned Repository and an Organization-owned Repository with the same Repository slug under different owner namespaces.
2. Prove User username/Organization slug collisions are rejected.
3. Prove personal owner gets Repository admin without a Grant.
4. Prove Organization admin/owner gets admin only on that Organization's Repository; ordinary member does not.
5. Click a Repository card from `/app` and land on `/{owner}/{repository}`.
6. Verify legacy stable-ID route redirects to that same canonical URL.
7. Verify Page create/update/activity continues to work through the canonical owner-neutral Repository route.

## Follow-up contract changes

- `docs/PRODUCT.md`
- `docs/ONTOLOGY.md`
- `docs/domains/repository-collaboration.md`
- `docs/domains/access-authority.md`
- `docs/architecture/README.md`
- `docs/architecture/ADR_INDEX.md`
- Domain/Application ownership and authority types/ports/tests
- Supabase declarative schemas, RLS, routing functions, seed, migration, generated types, pgTAP tests
- Web Repository route tree, route builders, auth-routing ownership cleanup, Repository creation surface, Playwright contracts
