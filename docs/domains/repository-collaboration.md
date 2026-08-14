# Domain Contract: Repository Collaboration

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-15

## Problem owned and success condition

Collaborative work needs one stable Container that owns containment, authorization target, lifecycle coordination, human navigation identity, and historical scope while ownership of that Container remains a separate relationship.

This contract succeeds when User-owned and Organization-owned Repositories contain the same accepted Resource kinds and use the same collaboration, authorization, URL, and evidence semantics without turning Organization, Owner, Context, or presentation into a second collaboration Container.

## Evidence ledger

### Observations

- Product axiom defines Repository as the No-Code Collaboration Container.
- GitHub's mature owner/Repository relationship shows that personal and Organization ownership can share one Repository interaction model.
- Current Resource semantics require every Resource to reference one Repository.
- Repository-scoped authorization and historical evidence use stable Repository identity.
- Canonical Web routing now uses an Owner namespace plus Repository slug.
- Page is the first accepted concrete Repository-contained Resource kind.
- Sanitized `.playwright-mcp/` benchmark evidence proves that Issue and Discussion each retain stable Repository-scoped identity across navigation, refresh, and responsive presentation, while Project-style planning remains a cross-scope Projection.

### Hard constraints

- Repository is the only accepted primary collaboration Container.
- Repository ownership, Repository identity, Resource containment, Principal Grants, and Context remain distinct.
- Exactly one accepted Owner owns a Repository at a time.
- User and Organization are the accepted Repository Owner types.
- Domain semantics cannot depend on framework folders, provider DTOs, generated rows, or a specific UI composition.
- Cross-Repository presentation cannot bypass Repository authorization or evidence invariants.
- A benchmark capability that has no independent no-code collaboration problem is not adapted into this Domain.

### Current implementation mismatch

The target Domain truth is:

```text
Repository Owner = User | Organization
```

Any executable projection that still assumes Organization-only ownership is an implementation gap, not evidence for redefining Product meaning.

### Assumptions under validation

- Exactly one Owner is sufficient at a time.
- User and Organization are sufficient Owner kinds for the current product horizon.
- A Resource belongs to exactly one Repository at a time.
- `private | public` is sufficient visibility vocabulary while ordinary Organization Membership contributes no Repository read baseline.
- The current Resource envelope remains sufficient for the executable Page slice. Accepted Issue and Discussion semantics require their own subtype contracts before persistence; they do not justify turning the Page envelope into a generic JSON runtime.

### Unknowns

- Whether Repository ownership transfer requires intermediate states.
- Whether archive/restore/templates need explicit Repository lifecycle states.
- Which future Resource kinds need independent subtype storage/contracts.
- Whether a normal use case requires one Resource to belong to multiple Repositories.
- Whether a future Organization-wide Repository visibility/base-access mode is necessary.

### Value choices

- Prefer one explicit collaboration Container over feature-specific containers.
- Prefer typed User/Organization ownership over a weak polymorphic owner record.
- Prefer globally unambiguous Owner namespaces for human URLs.
- Prefer stable Repository IDs for relationships, authorization, and evidence while slugs remain mutable human routing identifiers.
- Prefer deferred lifecycle states over speculative completeness.

## Boundary and owner

This contract owns:

- Repository stable identity;
- typed Repository ownership (`User | Organization`);
- Owner namespace and Repository slug rules;
- Repository visibility vocabulary;
- Repository-to-Resource containment;
- rules for ownership transfer/archive/destructive lifecycle when accepted; and
- the requirement that Repository-scoped authority/history target the same stable Repository identity.

This contract does not own:

- authentication credential lifecycle;
- User profile/onboarding beyond Owner namespace identity needed for routing;
- Organization Membership lifecycle;
- Principal Grant evaluation/Role bundles/delegation;
- Resource subtype content model;
- feed/notification/analytics projections;
- framework route composition; or
- database mechanics.

## Semantic role mapping

```text
Actor        = authenticated User performing a Repository-scoped action
Scope        = Repository Owner relationship plus applicable Organization/future Enterprise governance scope
Principal    = authority-receiving subject resolved by Access Authority
Container    = Repository
Relationship = Repository ownership, Membership, Resource containment, Repository Grants
Artifact     = Resource/Page/Issue/Discussion and future independently proven Repository-scoped work types
Process      = Repository, Resource, ownership, and authority state transitions
```

`Activity Event` is historical Evidence. `Context` is presentation. `Role`, `Capability`, and future Policy are authorization semantics.

Semantic roles are not persistence supertypes.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Repository | Persistent No-Code Collaboration Container |
| Repository ID | Stable identity used by relationships, authorization, and evidence |
| Repository Owner | Exactly one User or Organization owning the Repository |
| Owner namespace | Globally unambiguous User username or Organization slug used as URL owner segment |
| Repository slug | Human-readable name unique within one Owner namespace |
| Visibility | Discovery/read baseline; current target states are `private` and `public` |
| Resource | Persistent Repository-scoped unit of collaborative work |
| Page | First accepted concrete Resource kind |
| Issue | Accepted actionable Repository Resource with stable issue identity; implementation contract remains Open |
| Discussion | Accepted conversational Repository Resource with stable discussion identity; implementation contract remains Open |
| Project-style planning | Derived planning/attachment Projection; not a Repository-owned Resource or Container |
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

## Resource containment

A Resource has stable identity and exactly one Repository boundary.

```text
Repository ── contains ──> Resource
Resource kind = page (current accepted kind)
```

Shared Resource fields form an envelope; subtype-specific behavior remains explicit.

A Resource subtype cannot redefine Repository ownership, authorization, or historical scope.

Future work-item or conversation Artifacts are admitted only after a real use case proves independent identity/lifecycle. They remain Repository-contained if accepted.

## States and transitions

### Current Repository states

Current active visibility states:

```text
private
public
```

A future Organization-wide visibility state requires explicit effective-access semantics and discriminating tests before acceptance.

Archive, transfer, templates, restore, and destructive lifecycle remain separate product decisions.

### Transition rules

- Creating a personal Repository requires an authenticated User Owner with an established Owner namespace.
- Creating an Organization-owned Repository requires an existing Organization and Actor authority to administer Repository ownership under it.
- Repository slug is unique inside the chosen Owner namespace.
- Renaming Repository display name does not change stable identity.
- Changing Repository slug changes human URL but not stable identity.
- Changing visibility does not rewrite ownership, Membership, or explicit Grant facts.
- Creating a Resource requires an existing accessible Repository.
- Cross-Repository movement or copying, if later accepted, requires explicit source/target authorization and evidence semantics.
- Ownership transfer, if accepted, must preserve Repository/Resource stable identities and define authority/evidence consequences.
- Repository deletion remains unavailable until contained Resources, Grants, namespace reuse, history, retention, recovery, and authority consequences are defined.

## Invariants

1. Repository always means No-Code Collaboration Container.
2. Every Repository has exactly one Owner.
3. Repository Owner is User or Organization in the current target model.
4. User-owned and Organization-owned Repositories share collaboration semantics.
5. Repository slug uniqueness is scoped to Owner.
6. User usernames and Organization slugs cannot create ambiguous canonical Owner namespaces.
7. Every Resource belongs to exactly one Repository at a time.
8. Resource read/mutation cannot bypass Repository authorization.
9. Visibility does not change Actor identity, ownership, Membership, or explicit Grant facts.
10. Workspace is a presentation of Repository, not a second Container.
11. Resource subtype content cannot redefine Repository ownership/authority.
12. Repository-scoped Activity Events reference stable Repository ID.
13. Provider IDs or framework routes cannot become the canonical Repository model.
14. Internal delivery prefixes such as `/app` are not Repository identity.
15. Semantic-role classification cannot by itself create a new Domain, table, package, or persistence supertype.
16. A benchmark feature is not admitted merely because GitHub exposes it.

## Actors, owners, principals, contexts, and permissions

- Authenticated User is the request Actor for authenticated actions.
- User may independently be Repository Owner and/or explicit-grant Principal.
- Organization may be Repository Owner but is never the authenticated Actor.
- Owner relationship is not an explicit Grant row.
- Principal may receive explicit Repository authority through Grant.
- Selected Organization, Team, tab, or Workspace is Context only.
- Access Authority determines effective Capabilities.
- Repository/Resource commands are authorized server-side regardless of UI visibility.

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

`/app` is an authenticated dashboard and discovery surface. A Repository card must navigate to the canonical Owner/Repository URL.

A stable-ID compatibility route may resolve access and redirect to canonical URL. It must not host a second Repository UI/business-flow tree.

The canonical Repository screen presents one Owner/Repository header, horizontal primary navigation, and one active child surface. Route-specific navigation, metadata, activity, or modal regions may compose independently only when their data/loading/recovery/responsive behavior is proven; they never become permanent Containers or URL identity. Repository `/projects` is an attachment Projection and cannot own Project detail; target Project-detail identity remains deferred. Wiki knowledge maps to Page canonical identity.

## Historical evidence

Current accepted collaboration facts include Page create/update and Repository creation where executable contracts require them.

Candidate Repository lifecycle facts are not created until the corresponding lifecycle transition is accepted.

A label in a feed is not sufficient reason to invent a historical fact.

Mutation that requires historical evidence cannot report success unless required evidence is durably recorded in the accepted transaction boundary.

## Dependencies and failure behavior

- **Identity / Owner namespace**: personal Repository creation fails closed if User Owner namespace is missing or ambiguous.
- **Organization**: Organization-owned Repository creation fails closed if Organization does not exist or Actor lacks applicable governance authority.
- **Access Authority**: Repository/Resource operations fail closed when effective Capabilities cannot be established.
- **Historical evidence**: mutation requiring evidence cannot report success if evidence persistence fails.
- **Persistence adapter**: maps provider records to typed Owner/Repository contracts; it cannot decide Product ownership meaning.
- **Delivery**: resolves Owner/Repository human identifiers and presents output; it cannot create alternate Repository identity or permissions.

## Rejected alternatives

### Organization-only ownership

Rejected because it confuses one enterprise ownership mode with a Repository constraint, prevents personal ownership, and leaks Organization into unrelated authorization/routing decisions.

### Generic polymorphic Owner persistence

Rejected while typed User/Organization references provide stronger integrity.

### Organization as collaboration Container

Rejected because independent collaboration spaces require Repository-specific identity, authorization, containment, and evidence boundaries.

### Feature-specific collaboration Containers

Rejected because they duplicate Repository responsibilities without evidence that Repository fails.

### Generic semantic-role persistence

Rejected because reasoning roles do not prove shared lifecycle or storage ownership.

### Generic Resource bucket as universal model

Rejected as a universal target because subtype behavior and invariants must remain explicit.

## Falsification conditions

Reopen this boundary when:

- normal work requires Resource multi-Repository ownership;
- additional real Repository Owner kinds cannot be represented without weakening integrity;
- Repository visibility cannot be separated from authority without pervasive exceptions;
- different Repository ownership modes require contradictory collaboration semantics;
- a collaboration capability genuinely requires an independent primary Container; or
- two real Resource vertical slices cannot share Repository containment without leaking subtype rules.

## Minimum discriminating tests

1. User-owned and Organization-owned Repositories may use the same Repository slug under distinct Owner namespaces.
2. A User username and Organization slug cannot collide in canonical Owner namespace.
3. Personal Owner derives Repository admin authority without fabricated direct Grant.
4. Organization owner/admin derives admin only for Repositories owned by that Organization; ordinary member does not.
5. `/app` dashboard Repository card navigates to `/{owner}/{repository}`.
6. Stable-ID compatibility route redirects to the same canonical URL after access-aware resolution.
7. Create Resource without Repository → fail.
8. Access Resource through wrong Repository identity → fail.
9. Change UI Context while Actor/Repository/persisted relationships remain fixed → authorization unchanged.
10. Add a second real Resource kind → Repository behavior remains stable while subtype rules remain isolated.
11. Repository transfer/destructive lifecycle tests remain unavailable until their lifecycle contracts are accepted.
