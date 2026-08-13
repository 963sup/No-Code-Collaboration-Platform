# Domain Contract: Repository Collaboration

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-14

## Problem owned and success condition

Collaborative work needs one stable Container that owns its identity, contained work, authorization target, lifecycle, and history, while ownership of that Container remains a separate relationship.

This contract succeeds when a User-owned Repository and an Organization-owned Repository can contain the same Resource kinds and use the same collaboration/authorization/history semantics, while every URL, permission decision, and historical fact still resolves to one stable Repository identity.

## Evidence ledger

### Observations

- The Product invariant defines `Repository` as a no-code collaboration Container.
- GitHub's durable owner/repository URL and ownership mechanism demonstrates that a Repository can be owned by a personal identity or an Organization without changing what a Repository is.
- The current executable baseline incorrectly persists only Organization ownership.
- The current Resource model requires every Resource to reference one Repository.
- Repository-scoped authorization and activity use stable `repository_id` as their target boundary.
- The first web workspace composes navigation, work, context, and activity around one Repository.

### Hard constraints

- Repository must not inherit Git/source-code semantics.
- Repository ownership, Repository identity, Resource containment, Principal Grants, and Context remain distinct.
- Exactly one accepted Owner owns a Repository at a time.
- User and Organization are the accepted Repository Owner types for this contract.
- Domain semantics cannot depend on Next.js folders, Supabase DTOs, generated database Rows, or a specific UI composition.
- Cross-Repository behavior cannot bypass authorization/history invariants.
- No adapted feature may become a second primary collaboration Container without evidence that the Repository boundary fails.

### Current implementation mismatch

The existing database has `repositories.organization_id NOT NULL`. That is executable evidence of the current implementation, not Product evidence that Organization ownership is mandatory.

This contract explicitly corrects that mismatch:

```text
Current executable projection
Repository → Organization only

Target Domain truth
Repository Owner = User | Organization
```

The executable schema/routing/authorization projection must be changed to match this contract; the old projection must not be used to re-justify Organization-only ownership.

### Assumptions under validation

- Exactly one Owner is sufficient at a time.
- User and Organization are sufficient Owner kinds for the current product horizon.
- A Resource belongs to exactly one Repository at a time.
- `private | public` is sufficient visibility vocabulary while ordinary Organization Membership contributes no Repository read baseline.
- A shared Resource envelope plus explicit subtype behavior remains sufficient for the first Resource families.

### Unknowns

- Whether Repository transfer requires pending/accepted states or may be one accepted transition.
- Whether archive/restore/templates/cloning need explicit Repository lifecycle states.
- Which future Resource kinds need independent subtype storage/contracts.
- Whether a normal use case requires one Resource to belong to multiple Repositories.
- Whether a future Organization-wide Repository visibility/base-access mode is necessary.

### Value choices

- Prefer one explicit collaboration Container over feature-specific containers.
- Prefer typed User/Organization ownership over a generic polymorphic owner record.
- Prefer globally unambiguous owner namespaces for human URLs.
- Prefer stable Repository IDs for relationships/authorization while slugs remain mutable human routing identifiers.
- Prefer deferred lifecycle states over speculative completeness.

## Boundary and owner

This contract owns:

- Repository identity;
- typed Repository ownership relationship (`User | Organization`);
- Repository slug uniqueness within one Owner namespace;
- Repository visibility vocabulary;
- Repository-to-Resource containment;
- rules for ownership transfer/archive/delete when those transitions are accepted; and
- the requirement that Repository-scoped history/authority target the same stable Repository ID.

This contract does not own:

- authentication credential lifecycle;
- User profile/onboarding lifecycle beyond the owner namespace identifier required for Repository routing;
- Organization Membership lifecycle;
- Principal Grant evaluation/Role bundles/delegation;
- Resource subtype content model;
- feed/notification/analytics projections;
- Next.js route composition; or
- PostgreSQL mechanics.

## Semantic role mapping

```text
Actor        = authenticated User performing a Repository-scoped action
Scope        = Repository Owner namespace plus any applicable Organization/future Enterprise governance scope
Principal    = authority-receiving subject resolved by Access Authority
Container    = Repository
Relationship = Repository ownership, Membership, Resource containment, Repository Grants
Artifact     = Resource and accepted Repository-scoped work subtypes
Process      = Repository/Resource/ownership commands and state transitions
```

`Activity Event` remains historical Evidence. `Context` remains presentation. `Role`, `Capability`, and future Policy remain authorization semantics.

Semantic roles are not persistence supertypes. `Repository Owner` is a concrete Product relationship, not permission to create generic `scopes`, `owners`, or polymorphic `relationships` tables.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Repository | Persistent no-code collaboration Container |
| Repository ID | Stable identity used by relationships, authorization, and history |
| Repository Owner | Exactly one User or Organization owning the Repository |
| Owner namespace | Globally unambiguous User username or Organization slug used as URL owner segment |
| Repository slug | Human-readable name unique within one Owner namespace |
| Visibility | Discovery/read baseline; accepted target states are `private` and `public` |
| Resource | Persistent Repository-scoped unit of collaborative work |
| Resource kind | Explicit discriminator selecting subtype behavior |
| Workspace | Presentation composition of one Repository; not a separate entity |

## Entities, relationships, and derived concepts

### Repository

A Repository has stable identity, exactly one typed Owner, slug, name, optional description, visibility, creator attribution, and timestamps.

Canonical owner relationship:

```text
User         1 ── may own ── * Repository
Organization 1 ── may own ── * Repository

Each Repository chooses exactly one branch.
```

A Repository does not require an Organization ancestor.

### Resource

A Resource has stable identity, exactly one Repository, explicit kind, title, creator attribution, and timestamps. Shared fields form an envelope; subtype-specific behavior remains explicit.

### Owner namespace

User username and Organization slug participate in one globally unambiguous namespace for canonical Repository URLs:

```text
/{ownerSlug}/{repositorySlug}
```

Examples:

```text
/alice/personal-crm
/acme/customer-success
```

The owner slug is human routing identity. Repository authorization/relationships continue to target stable IDs.

### Relationships

```text
User | Organization ── owns ──> Repository
Repository           ── contains ──> Resource
Repository           ── scopes ──> Activity Event
Repository           ── receives ──> Principal Grant
```

`Workspace`, `Collaborator`, Project-style views, dashboard lists, and navigation sections are derived/presentation surfaces.

Candidate GitHub-inspired collaboration surfaces remain classified, not accepted:

- Issue → candidate actionable Artifact.
- Discussion → candidate conversation/shared-understanding Artifact.
- Pull Request → candidate proposed-change Artifact + review/decision Process, translated as Change Request if accepted.
- Workflow Definition → candidate Artifact describing a Process; Workflow Run → Process execution.
- Project → planning Projection, not Container.
- App → candidate machine Actor/Principal; Installation → Relationship.

## States and transitions

### Current Repository states

The corrected minimum target has active Repositories with visibility:

- `private`
- `public`

`organization` visibility is removed from target truth because ordinary Organization Membership currently grants no Repository read baseline. A future Organization-wide visibility state requires an explicit authority rule and discriminating tests before acceptance.

Archive, transfer, template, soft-delete, restore, and hard-delete remain separate lifecycle decisions.

### Transition rules

- Creating a personal Repository requires an authenticated User owner whose owner namespace is established.
- Creating an Organization-owned Repository requires an existing Organization and actor authority to create/administer Repository ownership under that Organization.
- Repository slug is unique only inside the chosen Owner namespace.
- Renaming Repository display name does not change stable identity.
- Changing Repository slug changes human URL but not stable identity.
- Changing visibility does not rewrite ownership, Membership, or Grant facts.
- Creating a Resource requires an existing accessible Repository.
- Moving/copying a Resource across Repositories requires an explicit accepted transition with source/target authorization/history.
- Repository ownership transfer, if accepted, must preserve Repository/Resource stable identities and define authority/history consequences.
- Repository deletion remains unavailable until contained Resources, Grants, namespace reuse, history, retention, and recovery are defined.

## Invariants

1. Repository is never a Git code store by implication.
2. Every Repository has exactly one Owner.
3. Repository Owner is User or Organization in the current target model.
4. User-owned and Organization-owned Repositories share the same collaboration semantics.
5. Repository slug uniqueness is scoped to Owner.
6. User username and Organization slug cannot create ambiguous canonical owner namespaces.
7. Every Resource belongs to exactly one Repository at a time.
8. Resource read/mutation cannot bypass Repository authorization.
9. Visibility does not change Actor identity, ownership, Membership, or explicit Grant facts.
10. Workspace is a presentation of Repository, not a second Container.
11. Resource subtype content cannot redefine Repository ownership/authority.
12. Repository-scoped Activity Events reference stable Repository ID.
13. Provider IDs/routes cannot become the canonical Repository model.
14. Internal delivery prefixes such as `/app` are not Repository identity.
15. Semantic-role classification cannot by itself create a new Domain/table/package.

## Actors, owners, principals, contexts, and permissions

- Authenticated User is the request Actor.
- User may independently be a Repository Owner and/or Principal.
- Organization may be Repository Owner but is never the authenticated Actor.
- Owner relationship is not a direct Grant row.
- Principal may receive explicit Repository authority through Grant.
- Selected Organization/Team/tab/Workspace is Context only.
- Access Authority determines effective Capabilities.
- Repository/Resource commands are authorized server-side regardless of UI visibility.

## URLs and delivery projection

Canonical Repository namespace:

```text
/{ownerSlug}/{repositorySlug}
```

Repository sub-surfaces extend this namespace rather than inserting an implementation container prefix:

```text
/{owner}/{repository}/pages
/{owner}/{repository}/pages/{pageId}
/{owner}/{repository}/activity
```

`/app` may remain an authenticated dashboard. A Repository card from that dashboard must navigate to the canonical owner/repository URL.

A legacy stable-ID route may redirect to canonical URL; it must not host a second Repository UI/business-flow tree.

## Events and workflows

Candidate immutable events include:

- `repository.created`
- `repository.renamed`
- `repository.slug_changed`
- `repository.visibility_changed`
- `repository.transferred`
- `repository.archived`
- `repository.deleted`
- `resource.created`
- `resource.updated`
- `resource.moved`
- `resource.deleted`

Only events tied to accepted commands/facts are emitted. A feed label is not sufficient reason to create an event.

## Dependencies and failure behavior

- **Identity/owner namespace**: personal Repository creation fails closed if the User owner namespace is missing/ambiguous.
- **Organization**: Organization-owned Repository creation fails closed if Organization does not exist or actor lacks applicable governance authority.
- **Access Authority**: Repository/Resource operations fail closed when effective Capabilities cannot be established.
- **Activity recording**: mutation requiring historical evidence cannot report success unless required event is durably recorded.
- **Persistence adapter**: maps provider records to typed Owner/Repository contracts and cannot decide Product ownership meaning.
- **Delivery**: resolves owner/repository URL identifiers and presents output; it cannot create alternate Repository identity/permissions.

## Alternatives and removal test

### Organization-only ownership

Rejected as Product truth. It confuses an enterprise collaboration path with a first-principles Repository constraint, prevents personal Repository ownership, leaks Organization into URLs/authorization, and causes persistence to dictate Product meaning.

### Generic polymorphic owner table

A generic `owner_type + owner_id` without typed FKs weakens referential integrity. Current persistence should preserve concrete User/Organization owner relationships.

### Organization as work Container

Rejected because independent collaboration spaces require separate Repository ownership/authorization/history boundaries.

### Feature-specific Containers

Rejected because they duplicate ownership, authorization, navigation, activity, lifecycle.

### Generic semantic-role entities

Rejected because semantic lens vocabulary does not prove lifecycle/persistence abstractions.

### Generic `type + json` Resource bucket

Rejected as a universal model because it predicts weak invariants and subtype behavior hidden in conditionals.

Removing this contract would force every feature/owner type to invent its own collaboration boundary.

## Falsification conditions

Reopen the boundary when:

- normal work requires Resource multi-Repository ownership;
- additional real Repository Owner kinds cannot be represented without weakening integrity;
- Repository visibility cannot be separated from authority without pervasive exceptions;
- different Repository ownership modes require contradictory collaboration semantics;
- a collaboration feature genuinely requires an independent Container; or
- two real Resource vertical slices cannot share Repository containment without leaking subtype rules.

## Minimum discriminating tests

1. User-owned Repository and Organization-owned Repository may use the same Repository slug under distinct owner namespaces.
2. A User username and Organization slug cannot collide in canonical owner namespace.
3. Personal owner derives Repository admin authority without fabricated direct Grant.
4. Organization owner/admin derives admin only for Repositories owned by that Organization; ordinary member does not.
5. `/app` dashboard Repository card navigates to `/{owner}/{repository}`.
6. Stable-ID compatibility route redirects to the same canonical URL.
7. Create a Resource without Repository → fail.
8. Access Resource through wrong Repository ID → fail.
9. Change UI Context while Actor/Repository/relationships remain fixed → authorization unchanged.
10. Add a second real Resource kind → Repository behavior stable; subtype rules isolated.
11. Repository transfer/delete tests remain unavailable until lifecycle contract is accepted.
