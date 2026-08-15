# Domain Contract: Repository Collaboration

- Status: Accepted
- Contract owner: Product and Domain
- Last reviewed: 2026-08-15

## Problem owned and success condition

Collaborative work needs one stable Container that owns containment, authorization target, lifecycle coordination, human navigation identity, and historical scope while ownership of that Container remains a separate relationship.

This contract succeeds when User-owned and Organization-owned Repositories contain the same admitted collaborative work families and use the same collaboration, authorization, URL, and evidence semantics without turning Organization, Owner, Context, Project, or presentation into a second collaboration Container.

## Acceptance decision

Repository Collaboration is Accepted because all nine Domain acceptance gates are satisfied by current Product, architecture, and executable evidence:

1. **Owned problem survives benchmark admission.** Arbitrary no-code collaboration still needs one stable collaboration/authorization Container; this value does not depend on Source Code or Git.
2. **Vocabulary reduces ambiguity.** Repository, Owner, Resource/Artifact, Context, Projection, Principal, Grant, Capability, and Activity Evidence remain distinct.
3. **Semantic roles do not substitute for ownership evidence.** Repository has explicit ownership, containment, authorization, URL, lifecycle, and evidence responsibilities rather than being accepted merely because it is classified as a Container.
4. **Relationships, states, invariants, and failure behavior are explicit.** Typed User/Organization ownership, visibility, containment, canonical identity, creation rules, undefined destructive lifecycle, and fail-closed behavior are defined below.
5. **Dependencies remain one-way.** Domain owns semantics; Application orchestrates use cases; Supabase translates/persists/enforces; Web resolves and presents human routes. Provider/framework representations do not redefine Repository.
6. **Known gaps are registered and contained.** [`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md) tracks remaining delivery, identity, and exact-head evidence gaps without reintroducing obsolete Organization-only semantics or claiming production validation.
7. **Authorization-sensitive vertical slice exists.** Page create/read/update proves stable Repository identity, Capability authorization, independent RLS enforcement, optimistic concurrency, canonical routing, and required historical Evidence.
8. **Additional real use cases reuse the boundary.** Issue and Discussion independently reuse the same Repository containment, Capability vocabulary, canonical Owner/Repository shell, authorization boundary, and Activity Evidence without circular ownership or a second Container.
9. **Major architecture decisions are recorded.** ADR-001 owns truth boundaries; ADR-010 owns current User/Organization Repository ownership and routing identity; ADR-011 owns Repository presentation composition; ADR-012 owns Issue/Discussion lifecycle and Projection boundaries.

Acceptance means this Repository collaboration boundary is reusable current Domain truth. It does **not** accept every Repository lifecycle, create a microservice/bounded deployment, or authorize speculative Team, Enterprise, Data Change, Data Exchange, Repository Derivation, archive, transfer, or destructive behavior.

## Evidence ledger

### Observations

- Product axiom defines Repository as the No-Code Collaboration Container.
- Current Repository ownership is typed `User | Organization` with one global human Owner namespace.
- Repository-scoped authorization and historical Evidence use stable Repository identity.
- Canonical Web routing uses `/{ownerSlug}/{repositorySlug}` while stable IDs remain relationship/authorization identity.
- Page is an executable Repository-contained work type using provider-neutral Application commands, command-specific database mutation boundaries, RLS, optimistic concurrency, and Activity Evidence.
- Issue is an executable Repository-contained actionable-work type with Repository-local number, labels, assignment, flat comments, concurrency, commands, and Activity Evidence.
- Discussion is an executable Repository-contained shared-understanding type with Repository-local number, category, moderation, flat comments, question Answer semantics, concurrency, commands, and Activity Evidence.
- Project-style planning remains a non-owning planning Projection over work; it does not become a Repository-equivalent Container or source-work owner.
- Sanitized benchmark evidence supports Owner/Repository navigation and the distinct Issue/Discussion/Project presentation semantics without importing Source Code, Git, CI/CD, or arbitrary execution into the target.

### Hard constraints

- Repository is the only accepted primary collaboration/authorization Container.
- Repository ownership, Repository identity, collaborative Artifact containment, Principal Grants, and Context remain distinct.
- Exactly one accepted Owner owns a Repository at a time.
- User and Organization are the accepted Repository Owner types.
- Domain semantics cannot depend on framework folders, provider DTOs, generated rows, or a specific UI composition.
- Cross-Repository presentation cannot bypass Repository authorization or Evidence invariants.
- A benchmark capability that has no independent no-code collaboration problem is not adapted into this Domain.
- Structural containment inside Issue, Discussion, Page, Project views, Notification state, or change-state lines does not create another primary collaboration boundary.

### Current executable alignment

The executable ownership and delivery model now matches the accepted target:

```text
Repository Owner = User | Organization

canonical human route
= /{ownerSlug}/{repositorySlug}

stable authorization/evidence target
= Repository ID
```

The remaining `GAP-OWNERSHIP-001` concern is exact-head integration evidence, not a known semantic mismatch. An Open evidence gap cannot be used to restore obsolete Organization-only Product/Domain assumptions.

### Assumptions under validation

- Exactly one Owner is sufficient at a time.
- User and Organization are sufficient Owner kinds for the current product horizon.
- A collaborative Artifact belongs to exactly one Repository at a time unless a future real use case falsifies that assumption.
- `private | public` is sufficient visibility vocabulary while ordinary Organization Membership contributes no Repository read baseline.
- Page, Issue, and Discussion can share Repository containment/authority/history semantics while retaining independent subtype state and persistence; `Resource` is not a universal persistence supertype.

### Unknowns

- Whether Repository ownership transfer requires intermediate states.
- Whether archive/restore/templates need explicit Repository lifecycle states.
- Which future collaborative Artifact kinds need independent subtype storage/contracts.
- Whether a normal use case requires one Artifact to belong to multiple Repositories.
- Whether a future Organization-wide Repository visibility/base-access mode is necessary.

### Value choices

- Prefer one explicit collaboration Container over feature-specific containers.
- Prefer typed User/Organization ownership over a weak polymorphic owner record.
- Prefer globally unambiguous Owner namespaces for human URLs.
- Prefer stable Repository IDs for relationships, authorization, and Evidence while slugs remain mutable human routing identifiers.
- Prefer subtype-specific state/invariants over forcing all work into one generic persistence bucket.
- Prefer deferred lifecycle states over speculative completeness.

## Boundary and owner

This contract owns:

- Repository stable identity;
- typed Repository ownership (`User | Organization`);
- Owner namespace and Repository slug rules;
- how a valid Repository creation draft is normalized, validated, and persisted after authorization;
- Repository visibility vocabulary;
- Repository-to-collaborative-Artifact containment;
- rules for ownership transfer/archive/destructive lifecycle when accepted; and
- the requirement that Repository-scoped authority and historical Evidence target the same stable Repository identity.

This contract does not own:

- authentication credential lifecycle;
- User profile/onboarding beyond Owner namespace identity needed for routing;
- Organization Membership lifecycle;
- who may create under an Owner Scope, Principal Grant evaluation, Role bundles, or delegation;
- Page/Issue/Discussion subtype state;
- feed/notification/analytics/search/planning projections;
- framework route composition; or
- database mechanics.

## Semantic role mapping

```text
Actor        = authenticated User performing a Repository-scoped action
Scope        = Repository Owner relationship plus applicable Organization/future Enterprise governance scope
Principal    = authority-receiving subject resolved by Access Authority
Container    = Repository
Relationship = Repository ownership, Membership, Artifact containment, Repository Grants
Artifact     = Page, Issue, Discussion, and future independently proven Repository-scoped work types
Process      = Repository, Artifact, ownership, and authority state transitions
```

`Activity Event` is historical Evidence. `Context` and `Projection` are presentation/read-model semantics. `Role`, `Capability`, and future Policy are authorization semantics.

Semantic roles are not persistence supertypes.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Repository | Persistent No-Code Collaboration Container |
| Repository ID | Stable identity used by relationships, authorization, and Evidence |
| Repository Owner | Exactly one User or Organization owning the Repository |
| Owner namespace | Globally unambiguous User username or Organization slug used as URL owner segment |
| Repository slug | Human-readable name unique within one Owner namespace |
| Visibility | Discovery/read baseline; current accepted states are `private` and `public` |
| Collaborative Artifact | Persistent Repository-scoped unit of collaborative work; semantic family, not one mandatory table shape |
| Page | Repository-contained durable page/knowledge work type |
| Issue | Repository-contained actionable work with stable Repository-local number |
| Discussion | Repository-contained shared-understanding work with stable Repository-local number |
| Project-style planning | Derived planning/attachment Projection; not source-work owner or collaboration Container |
| Workspace | Presentation of one Repository; not a separate Entity or Container |

## Repository ownership

Canonical relationship:

```text
User         1 ── may own ── * Repository
Organization 1 ── may own ── * Repository
```

Each Repository has exactly one active Owner relationship.

A Repository does not require an Organization ancestor.

Ownership does not fabricate an explicit Principal Grant.

## Owner namespace and URL identity

User username and Organization slug participate in one globally unambiguous Owner namespace:

```text
/{ownerSlug}/{repositorySlug}
```

Examples:

```text
/alice/personal-crm
/acme/customer-success
```

The Owner slug is human routing identity. Repository relationships and authorization continue to target stable IDs.

Reserved root product routes cannot be claimed as Owner namespaces.

## Collaborative Artifact containment

Every accepted Page, Issue, and Discussion belongs to exactly one Repository boundary:

```text
Repository
├─ Page
├─ Issue
└─ Discussion
```

The shared semantic fact is Repository containment, not one universal database row or TypeScript superclass. Subtype-specific identity, state, commands, relationships, and storage remain explicit.

A collaborative Artifact subtype cannot redefine Repository ownership, authorization, visibility baseline, or historical scope.

Future work types are admitted only after a real use case proves independent identity/lifecycle. They remain Repository-contained unless evidence falsifies the single-Repository assumption.

## States and transitions

### Current Repository states

Current active visibility states:

```text
private
public
```

A future Organization-wide visibility state requires explicit effective-access semantics and discriminating tests before acceptance.

Archive, transfer, templates, restore, ownership transfer, and destructive lifecycle remain separate product decisions.

### Transition rules

- Before Repository identity exists, Access Authority must authorize `repository.create` against the requested typed Owner Scope.
- After authorization, Repository creation owns the mechanics: normalize and validate name, owner-scoped slug, optional description, visibility, attribution, and persistence.
- Creating a personal Repository requires an authenticated User Owner with an established Owner namespace; Access Policy permits only the matching User Actor.
- Creating an Organization-owned Repository requires an existing Organization; Access Policy permits only an Organization owner/admin Actor, not an ordinary member.
- Repository slug is unique inside the chosen Owner namespace.
- Renaming Repository display name does not change stable identity.
- Changing Repository slug changes human URL but not stable identity.
- Changing visibility does not rewrite ownership, Membership, or explicit Grant facts.
- Creating or mutating a Page/Issue/Discussion requires the accepted Repository authorization boundary and subtype transition invariants.
- Cross-Repository movement or copying, if later accepted, requires explicit source/target authorization and Evidence semantics.
- Ownership transfer, if accepted, must preserve Repository/Artifact stable identities and define authority/Evidence consequences.
- Repository deletion remains unavailable until contained Artifacts, Grants, namespace reuse, history, retention, recovery, and authority consequences are defined.

## Invariants

1. Repository always means No-Code Collaboration Container.
2. Every Repository has exactly one Owner.
3. Repository Owner is User or Organization in the current model.
4. User-owned and Organization-owned Repositories share collaboration semantics.
5. Repository slug uniqueness is scoped to Owner.
6. User usernames and Organization slugs cannot create ambiguous canonical Owner namespaces.
7. Every accepted collaborative Artifact belongs to exactly one Repository at a time unless this assumption is explicitly falsified and replaced.
8. Artifact read/mutation cannot bypass Repository authorization.
9. Visibility does not change Actor identity, ownership, Membership, or explicit Grant facts.
10. Workspace is a presentation of Repository, not a second Container.
11. Artifact subtype content/state cannot redefine Repository ownership/authority.
12. Repository-scoped Activity Events reference stable Repository ID.
13. Provider IDs or framework routes cannot become the canonical Repository model.
14. Internal delivery prefixes such as `/app` are not Repository identity.
15. Semantic-role classification cannot by itself create a new Domain, table, package, or persistence supertype.
16. A benchmark feature is not admitted merely because GitHub exposes it.
17. Repository creation mechanics cannot decide authority, and Access Policy cannot construct or persist a Repository.
18. Project filters, Notification state, selected Context, or future Branch/Proposal presentation cannot create Repository authority.

## Actors, owners, principals, contexts, and permissions

- Authenticated User is the request Actor for authenticated actions.
- User may independently be Repository Owner and/or explicit-grant Principal.
- Organization may be Repository Owner but is never the authenticated Actor.
- Owner relationship is not an explicit Grant row.
- Principal may receive explicit Repository authority through Grant.
- Selected Organization, Team, tab, Workspace, Project filter, or presentation mode is Context/Projection only.
- Access Authority determines effective Capabilities.
- Repository/Artifact commands are authorized server-side regardless of UI visibility.

## URLs and delivery projection

Canonical Repository namespace:

```text
/{ownerSlug}/{repositorySlug}
/{owner}/{repository}/issues
/{owner}/{repository}/issues/{issueNumber}
/{owner}/{repository}/projects
/{owner}/{repository}/discussions
/{owner}/{repository}/discussions/{discussionNumber}
/{owner}/{repository}/pages
/{owner}/{repository}/pages/{pageId}
/{owner}/{repository}/activity
/{owner}/{repository}/security
/{owner}/{repository}/settings
```

`/app` is an authenticated dashboard and discovery surface. A Repository card navigates to the canonical Owner/Repository URL.

A stable-ID compatibility route may resolve access and redirect to canonical URL. It must not host a second Repository UI/business-flow tree.

The canonical Repository screen presents one Owner/Repository header, horizontal primary navigation, and one active child surface. Route-specific navigation, metadata, activity, or modal regions may compose independently only when their data/loading/recovery/responsive behavior is proven; they never become permanent Containers or URL identity.

Repository `/projects` is an attachment/planning Projection and cannot establish independent Project ownership or authorization. Wiki/knowledge semantics map to the accepted Page/knowledge model rather than Git-backed history.

## Historical evidence

Accepted Repository-scoped collaboration facts include Repository creation plus meaningful Page, Issue, and Discussion mutations defined by their subtype contracts.

Candidate Repository lifecycle facts are not created until the corresponding lifecycle transition is accepted.

A label in a feed is not sufficient reason to invent a historical fact.

A mutation that requires historical Evidence cannot report success unless required Evidence is durably recorded in the accepted transaction boundary.

## Dependencies and failure behavior

- **Identity / Owner namespace**: personal Repository creation fails closed if User Owner namespace is missing or ambiguous.
- **Organization**: Organization-owned Repository creation fails closed if Organization does not exist or Actor lacks applicable governance authority.
- **Access Authority**: Repository/Artifact operations fail closed when effective Capabilities cannot be established.
- **Historical Evidence**: mutation requiring Evidence cannot report success if Evidence persistence fails.
- **Persistence adapter**: maps provider records to typed Repository/subtype contracts; it cannot decide Product ownership meaning.
- **Delivery**: resolves Owner/Repository human identifiers and presents output; it cannot create alternate Repository identity or permissions.

## Rejected alternatives

### Organization-only ownership

Rejected because it confuses one enterprise ownership mode with a Repository constraint, prevents personal ownership, and leaks Organization into unrelated authorization/routing decisions.

### Generic polymorphic Owner persistence

Rejected while typed User/Organization references provide stronger integrity.

### Organization as collaboration Container

Rejected because independent collaboration spaces require Repository-specific identity, authorization, containment, and Evidence boundaries.

### Feature-specific primary collaboration Containers

Rejected because they duplicate Repository responsibilities without evidence that Repository fails.

### Generic semantic-role persistence

Rejected because reasoning roles do not prove shared lifecycle or storage ownership.

### Universal Artifact persistence supertype

Rejected as a requirement because Page, Issue, and Discussion prove shared Repository semantics without requiring identical subtype state or storage shape.

## Falsification conditions

Reopen this boundary when:

- normal work requires collaborative Artifact multi-Repository ownership;
- additional real Repository Owner kinds cannot be represented without weakening integrity;
- Repository visibility cannot be separated from authority without pervasive exceptions;
- different Repository ownership modes require contradictory collaboration semantics;
- a collaboration capability genuinely requires an independent primary Container; or
- real Page/Issue/Discussion-style work cannot share Repository containment without leaking subtype rules into Repository itself.

## Minimum discriminating tests

1. User-owned and Organization-owned Repositories may use the same Repository slug under distinct Owner namespaces.
2. A User username and Organization slug cannot collide in canonical Owner namespace.
3. Personal Owner derives Repository admin authority without fabricated direct Grant.
4. Organization owner/admin derives admin only for Repositories owned by that Organization; ordinary member does not.
5. `/app` dashboard Repository card navigates to `/{owner}/{repository}`.
6. Stable-ID compatibility route redirects to the same canonical URL after access-aware resolution.
7. Create Page/Issue/Discussion without a valid Repository boundary → fail.
8. Access a collaborative Artifact through the wrong Repository identity → fail.
9. Change UI Context while Actor/Repository/persisted relationships remain fixed → authorization unchanged.
10. Page, Issue, and Discussion reuse Repository containment/authorization/Evidence while keeping subtype rules isolated.
11. Project planning remains a Projection and cannot acquire source-work ownership through filtering or attachment.
12. Repository transfer/destructive lifecycle tests remain unavailable until their lifecycle contracts are accepted.
