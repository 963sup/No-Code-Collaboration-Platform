# Product Contract

- Status: Canonical
- Contract owner: Repository owner
- Scope: Product meaning and semantic boundaries
- Last reviewed: 2026-08-16

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

## Axiom

> **Repository = No-Code Collaboration Container**

This is the only Product axiom. It is unconditional and implementation-independent.

Every accepted Product concept must preserve these facts:

1. collaboration has one primary Container: Repository;
2. every collaborative Artifact has one stable Repository boundary;
3. Repository is the primary authorization target for contained work;
4. structural containment, grouping, presentation, or retained state does not create another collaboration or authority boundary;
5. ownership, governance, identity, grouping, presentation, and Evidence may surround Repository but cannot replace it; and
6. benchmark, framework, provider, route, or persistence vocabulary cannot redefine it.

## Benchmark and admission rule

GitHub is evidence for mature ownership, organization, access, information architecture, navigation, and collaboration interaction. It is not an implementation template.

Repository-wide GitHub semantic work uses the locked benchmark and canonical mapping in:

- [GitHub Docs reference snapshot](../.agents/skills/github-semantic-reverse/REFERENCE_SNAPSHOT.md)
- [GitHub-to-no-code glossary](../.agents/skills/github-semantic-reverse/GLOSSARY.md)
- [latest semantic audit](../.agents/skills/github-semantic-reverse/audit-reports/2026-08-16.md)

For every benchmark concept:

1. identify the real collaboration or organizational problem;
2. remove Source Code, source-control, arbitrary-execution, CI/CD, build, test, and deployment assumptions;
3. reject the concept if the problem disappears;
4. classify only the surviving role, identity, relationship, lifecycle, authority effect, URL/IA, and interaction;
5. map it back to Repository as the only primary collaboration and authorization boundary; and
6. require a minimum discriminating test before adding persistence or architecture.

Renaming an excluded concept does not admit it.

## Semantic admission lens

| Semantic role | Question answered | Current examples |
| --- | --- | --- |
| Actor | Who performs the action? | Authenticated User |
| Scope | Which ownership, administration, or governance boundary applies? | User/Organization owner namespace; Organization administration |
| Principal | Which subject may receive explicit authority? | User; future Team or App only when proven |
| Container | Where does collaboration have one stable boundary? | Repository |
| Relationship | How are identities, owners, principals, scopes, and containers connected? | Membership, Repository ownership, Grant |
| Artifact | What collaborative work exists inside a Container? | Page, Issue, Discussion |
| Process | How may an Artifact or Relationship validly change? | Resource commands, Grant changes, identity transitions |

These are reasoning roles, not generic entities, packages, tables, or bounded contexts.

Cross-cutting semantics remain separate:

- **Authorization**: Role, Capability, Policy, delegation, effective authorization.
- **Presentation**: Context and Projection.
- **Evidence**: Activity Event and any stronger evidence contract independently proven later.

## Canonical semantic model

| Term | Canonical meaning | Must not be confused with |
| --- | --- | --- |
| User | Persistent human Product identity; may act, receive authority, and own Repositories | Membership, Role, selected Context |
| Account | Administrative, settings, and presentation surface family for a User or Organization | Generic Account entity, Actor, Owner, or Principal |
| Organization | Persistent organizational identity plus Membership/administration Scope; may own Repositories | Mandatory Repository parent, Actor, collaboration Container |
| Repository Owner | Exactly one User or Organization that owns a Repository | Actor, explicit Grant, Enterprise governance |
| Owner Namespace | Globally unambiguous User username or Organization slug used for human routing | Authorization, stable Repository identity |
| Principal | Subject that may receive explicit authority; implemented minimum is User | Actor, owner, Role, selected Context |
| Repository | Primary no-code collaboration, authorization, containment, and Evidence boundary | Organization, planning view, folder, tenant |
| Resource | Repository-scoped collaborative work abstraction | Repository itself or an opaque generic bucket |
| Page | Repository knowledge/work Resource | Generic placeholder for every future work type |
| Issue | Repository-scoped actionable Resource | Developer-only ticket or cross-Repository inbox |
| Discussion | Repository-scoped shared-understanding Resource | Forum Container or Issue alias |
| Project-style planning view | Projection over already-authorized work | Artifact owner, collaboration Container, authority boundary |
| Membership | User ↔ Organization belonging Relationship | Repository access |
| Grant | Principal ↔ Repository authority Relationship carrying a Role | Ownership or effective-access cache |
| Role | Named Capability bundle for assignment and explanation | Authorization decision primitive |
| Capability | Atomic allowed action on a defined target | UI visibility or job title |
| Context | Selected navigation, query, filter, or view state | Identity, ownership, persisted relationship, authority fact |
| State Transition | One authorized atomic change from accepted current state to another | User-visible history node or alternate state line |
| Expected Revision | Concurrency precondition used to reject a stale command | History identity, branch-like state, or authority |
| Activity Event | Immutable evidence that an accepted action occurred | Current state, notification, feed item, or mutable status |
| State Comparison | Derived presentation over two independently retained authorized states | Artifact, authority source, patch, or default capability |

Identity establishes a trusted Actor. Access resolves effective authority.

Governance constrains future action; Audit explains or proves past action.

## Repository ownership

```text
User ──────────┐
               ├── owns ──> Repository ── contains ──> Resource
Organization ──┘
```

Invariants:

1. Every Repository has exactly one Owner at a time.
2. Accepted Owner kinds are User and Organization.
3. User-owned and Organization-owned Repositories use the same collaboration, Resource, authorization, and Evidence semantics.
4. Ownership does not fabricate a direct Grant.
5. Repository stable identity is independent from mutable human routing names.
6. Repository slug uniqueness is scoped to its Owner namespace.
7. User usernames and Organization slugs share one globally unambiguous Owner namespace.
8. A future ownership transfer must preserve Repository and Resource stable identities.

Organization ownership is one ownership mode, not the definition of Repository.

## Organization and Membership

```text
User ── Membership ──> Organization
Organization ── may own ──> Repository
```

Organization is a persistent identity and administration Scope. It is not an authenticated Actor or Repository-equivalent workspace.

Ordinary Membership answers belonging and creates no Repository Role.

## Effective Repository authorization

```text
Actor
→ stable Repository target
→ inspect typed Owner relationship
→ collect accepted ownership/governance authority
→ collect explicit Principal Grants
→ add accepted visibility baseline
→ apply governance constraints
→ apply target-state preconditions
→ Capability decision
```

Accepted current authority sources:

1. User ownership of the target Repository.
2. Organization owner/admin relationship when that Organization owns the target Repository.
3. Direct User Repository Grant.
4. Public Repository visibility for accepted read semantics.

Ordinary Organization Membership contributes no Repository Role. Capability is decision truth; Role is assignment and explanation vocabulary.

Current visibility is:

```text
private | public
```

## Canonical URL and information architecture

```text
/
/dashboard
/repos
/issues
/issues/assigned
/projects
/discussions
/notifications
/search?q=&type=&owner=&repository=&status=&sort=&page=
/explore?sort=&ownerType=&artifact=&page=
/marketplace?category=&page=

/{ownerSlug}
/{ownerSlug}?tab=repositories|stars|projects
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/issues
/{ownerSlug}/{repositorySlug}/issues/{issueNumber}
/{ownerSlug}/{repositorySlug}/projects
/{ownerSlug}/{repositorySlug}/discussions
/{ownerSlug}/{repositorySlug}/discussions/{discussionNumber}
/{ownerSlug}/{repositorySlug}/wiki
/{ownerSlug}/{repositorySlug}/wiki/{pageId}
/{ownerSlug}/{repositorySlug}/activity
/{ownerSlug}/{repositorySlug}/security
/{ownerSlug}/{repositorySlug}/settings

/orgs/{organizationSlug}/dashboard
/orgs/{organizationSlug}/people
/orgs/{organizationSlug}/teams
/organizations/{organizationSlug}/settings/profile
/organizations/{organizationSlug}/settings/audit-log
/organizations/{organizationSlug}/settings/custom-properties

/settings/profile
/settings/organizations
/settings/enterprises
/settings/appearance
/settings/accessibility
/settings/billing
/settings/installations
/settings/applications
/settings/tokens
```

`/{ownerSlug}` is one public identity grammar for User and Organization. URL shape does not determine kind. Owner Namespace Resolution returns exactly one stable User or Organization identity.

`/{ownerSlug}/{repositorySlug}` is canonical Repository identity. `/wiki` is mature presentation vocabulary over the Page/Knowledge family. Query tabs and filters are Context only.

`/orgs/{organizationSlug}/...` is Organization operational presentation. `/organizations/{organizationSlug}/settings/...` is Organization administration/governance. Neither creates another Organization identity.

## Accepted collaboration semantics

Page, Issue, and Discussion are accepted Repository-contained Resource kinds. They reuse one collaboration loop:

```text
Actor
→ Repository authorization
→ concrete Resource command
→ expected current revision when required
→ accepted State Transition
→ Current State + Activity Event
→ authorized read Projection
→ user-visible result
```

A failed command creates neither a successful state change nor a success event.

Issue owns actionable work, Repository-scoped classification and responsibility, flat conversation, and `open | closed` completion. Discussion owns shared understanding, fixed categories, flat conversation, independent closed/locked state, and one optional Answer for a question. Assignment and participation never grant authority.

Project-style planning, Notification delivery, Search, Explore, Marketplace, and Audit are Projections. They cannot own Artifacts, create Grants, or change source truth.

## Current-state collaboration kernel

The Product stores authoritative current Resource state and separate immutable action Evidence.

```text
Actor + Authority + Command + Expected Revision
↓
Accepted State Transition
↓
Current State + Activity Event
```

This model solves the actual needs:

- **safe mutation** through Resource-specific validation and authorization;
- **concurrency** through transaction serialization, real-time coauthoring, or stale-command rejection;
- **accountability** through Activity Event evidence; and
- **read recovery** through independently justified retained state, backup, or audit policy.

It does not create a user-visible ancestry graph, named alternate state line, movable current-state pointer, proposal-merge process, or generic version-control engine.

State Comparison is not an accepted standalone feature. It may be introduced only as a derived, read-authorized Projection after a concrete use case independently justifies retaining both compared states.

## Deferred data movement and Repository copying

No generic data exchange or Repository ancestry capability is currently accepted.

A future typed transfer must prove:

- explicit source and destination endpoints;
- independent source-read and destination-write authorization;
- schema validation;
- idempotency and redacted Evidence;
- secret references rather than secret values; and
- no user-defined executable transformation.

A future Repository duplication process must create an independent Repository with its own Owner, authority, lifecycle, and current state. It must not copy Grants, credentials, Sessions, secrets, or installation tokens, and must not create continuing upstream authority or automatic synchronization.

Until those use cases pass admission, no entity, lifecycle, Capability, schema, route, API, or UI exists for them.

## Rejected Product semantics

The source-control concepts enumerated in the canonical glossary remain external benchmark or engineering vocabulary only. They create no target Product primitive, alias, route, Artifact, Process, data model, history graph, code-review surface, or generic version-control/automation engine.

Source Code, file trees, executable content, arbitrary expressions, CI/CD, build, test, deployment, Package, Release, and code-search surfaces remain rejected Product capabilities.

Engineering Git/GitHub workflow may use its native vocabulary to operate this source repository. That does not make the same vocabulary Product truth.

## Deferred product decisions

The following remain unaccepted until direct evidence requires them:

- Team Principal, Team Membership, Team Grants, and Team persistence;
- Enterprise identity and cross-Organization constraint model;
- App Principal, Installation, OAuth, credentials, Repository binding, and connector execution;
- Project entity, persistence, saved view, or detail identity;
- Organization-wide base permission for ordinary members;
- custom Roles, explicit deny precedence, nested groups, or a generic policy engine;
- Repository transfer, archive, restore, and destructive lifecycle;
- any Resource family beyond Page, Issue, and Discussion;
- State Comparison as a retained user-facing capability;
- typed Data Transfer or Repository duplication lifecycle.

## Derived concepts and projections

- **Workspace**: presentation of one Repository; not a second Container.
- **Collaborator**: User with effective Repository access.
- **Outside collaborator**: for an Organization-owned Repository, a User with effective access who lacks Membership.
- **Planning view**: Projection over accepted work; never ownership or authority.
- **Activity feed / notification / audit view / analytics**: Projections over sufficient Evidence; they do not redefine source facts.
- **Identity / Access**: Identity establishes a trusted Actor; Access resolves effective authority.
- **Governance / Audit**: Governance constrains future action; Audit explains or proves past action.

A Projection becomes an Entity only when independent identity, lifecycle ownership, invariants, and non-derivable behavior are proven.

## Product invariants

1. Repository is the only accepted primary collaboration and authorization Container.
2. Repository Owner is exactly one User or Organization.
3. Organization may own Repositories but is not the collaboration Container or authenticated Actor.
4. Membership does not imply Repository access.
5. Ownership and explicit Grant remain separate authority facts.
6. Authentication establishes Actor identity only.
7. Capability is the authorization decision primitive; Role is a named bundle.
8. Context and Projection never create authority.
9. Every accepted collaborative Artifact belongs to exactly one Repository at a time.
10. User-owned and Organization-owned Repositories reuse the same contained-work and authorization semantics.
11. Page, Issue, and Discussion are the accepted concrete Resource kinds.
12. State mutation uses concrete Resource commands, expected revision when required, one accepted State Transition, and separate Activity Event Evidence.
13. Activity Event is historical Evidence and never current Resource state.
14. Comparison is derived presentation and cannot own authority or source truth.
15. No source-control-shaped Product primitive may be recovered through renaming or a Data-prefixed alias.
16. Future data movement or Repository copying requires independent admission and cannot carry hidden authority.
17. Domain semantics remain provider-neutral; implementation technologies project rather than define Product truth.
18. Generated types, migrations, diagrams, tests, CI, and runtime observations cannot silently replace this contract.
19. Governance constrains future action; Audit and historical Evidence explain or prove past action.
20. Public presentation never publishes private Evidence or inaccessible Resource content by implication.

## Success model

The Product Contract is working when:

- User-owned and Organization-owned Repositories use the same collaboration semantics;
- every work item has an unambiguous Repository boundary;
- the system can explain why an Actor can or cannot perform an action;
- `/dashboard` reaches canonical `/{ownerSlug}/{repositorySlug}` Repository identity;
- Page, Issue, and Discussion commands are revision-safe, authorization-equivalent across presentation modes, and Evidence-backed;
- projections cannot create authority, mutate source truth, leak inaccessible data, or imply unavailable success;
- two concurrent edits resolve without creating alternate user-visible state lines or a merge-like Product process;
- an accepted state change and its Activity Event are committed consistently;
- ownership, Membership, Grants, Roles, Capabilities, Context, and projections are not conflated; and
- new benchmark concepts are classified and falsifiably tested before persistence or architecture is introduced.

## Falsification conditions

Reopen this contract only when evidence shows that:

- valuable collaboration normally cannot be contained by Repository;
- a second primary collaboration Container is necessary;
- normal Artifacts require multi-Repository ownership as the default;
- User and Organization are insufficient Owner kinds for demonstrated use cases;
- Capability-based authorization cannot explain real decisions without pervasive exceptions;
- current-state mutation plus Activity Event Evidence cannot meet demonstrated collaboration, concurrency, accountability, or recovery needs; or
- two real vertical slices require contradictory meanings for a canonical term.

## Contract update protocol

1. Separate Observation, Hard Constraint, Assumption, Unknown, Value Choice, Convention, and Evidence State.
2. Identify the earliest truth boundary that is wrong.
3. Apply the Repository axiom before any benchmark convention.
4. Remove software-development assumptions before naming target concepts.
5. Reject any candidate whose collaboration value disappears after that subtraction.
6. Update Product and affected Domain/Architecture contracts before or atomically with executable projections.
7. Update schema, migrations, generated projections, code, policies, UI copy, and tests as downstream evidence.
8. Verify a minimum discriminating user journey, not merely document presence or green unit tests.
9. Preserve superseded decisions only as history; never leave them in current canonical truth.

See the [ontology expansion](./ONTOLOGY.md), [documentation map](./README.md), [architecture contract](./architecture/README.md), [Domain catalog](./domains/README.md), and [operations runbook](./operations/RUNBOOK.md).
