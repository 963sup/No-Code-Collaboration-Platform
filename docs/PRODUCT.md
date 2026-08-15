# Product Contract

- Status: Canonical
- Contract owner: Repository owner
- Scope: Product meaning and semantic boundaries
- Last reviewed: 2026-08-16

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

## Axiom

> **Repository = No-Code Collaboration Container**

This is the only product axiom. It is not conditional, contextual, or implementation-dependent.

Every accepted product concept must preserve all of the following:

- collaboration has one primary Container: Repository;
- collaborative work is contained by a Repository;
- Repository is the primary authorization target for contained work;
- structural containment, grouping, or an isolated state line inside a Repository does not create another collaboration Container or authority boundary;
- ownership, governance, identity, grouping, presentation, and evidence may surround Repository but cannot replace it as the collaboration Container; and
- framework, provider, database, routing, or benchmark vocabulary cannot redefine Repository.

Any proposed semantic that requires a second Repository-equivalent collaboration Container is rejected unless direct product evidence first falsifies this axiom.

## Benchmark rule

GitHub is the benchmark for mature ownership, organization, access, information architecture, navigation, and collaboration interaction semantics. It is not an implementation template.

For every GitHub concept considered:

1. identify the collaboration or organizational problem it solves;
2. verify that the problem still exists when Repository is a no-code collaboration Container;
3. identify its identity, owner, lifecycle, relationships, authorization role, and user-visible interaction;
4. reject the candidate when its usefulness depends on software-development-specific mechanics rather than the collaboration problem itself;
5. treat the sanitized public and read-only authenticated URL hierarchy, information architecture, navigation, responsive composition, and interaction behavior recorded in `.playwright-mcp/github/` as the constitutional presentation baseline after the concept passes semantic admission; record an explicit Product reason and discriminating test for deviations; and
6. require a minimum discriminating test before persistence or architecture is added.

The target does not preserve a benchmark feature merely by renaming it. If the feature has no independent no-code collaboration problem, it is out of scope.

## Semantic admission lens

Before a concept becomes an Entity, Domain contract, package, table, or surface, classify only the roles it actually plays:

| Semantic role | Question answered | Current examples |
| --- | --- | --- |
| Actor | Who performs the action? | Authenticated User |
| Scope | Which ownership, administration, or governance boundary applies? | User/Organization owner namespace; Organization administration |
| Principal | Which subject may receive explicit authority? | User; future Team or App only when proven |
| Container | Where does collaboration have one stable boundary? | Repository |
| Relationship | How are identities, owners, principals, scopes, and containers connected? | Membership, Repository ownership, Grant |
| Artifact | What collaborative work exists inside a Container? | Page, Issue, Discussion |
| Process | How may an Artifact or Relationship validly change? | Page commands, Grant changes, identity lifecycle transitions |

These are reasoning roles, not generic architecture supertypes.

Cross-cutting semantics remain separate:

- **Authorization**: Role, Capability, Policy, delegation, effective authorization.
- **Presentation**: Context and Projection.
- **Evidence**: Activity Event and any stronger historical-evidence contract proven necessary later.

## Canonical semantic model

| Term | Canonical meaning | Must not be confused with |
| --- | --- | --- |
| User | Persistent human product identity; may act, receive authority, and own Repositories | Membership, Role, selected Context |
| Account | Administrative, settings, and presentation surface family for a User or Organization | Generic Account entity, Actor, Owner, or Principal |
| Organization | Persistent organizational identity plus Membership/administration Scope; may own Repositories | Mandatory Repository parent, Actor, collaboration Container |
| Repository Owner | Exactly one User or Organization that owns a Repository | Actor, explicit Grant, future Enterprise governance |
| Owner Namespace | Globally unambiguous User username or Organization slug used for Repository human routing | Authorization, stable Repository identity |
| Principal | Subject that may receive explicit authority; implemented minimum is User | Actor, owner, Role, selected Context |
| Repository | No-code collaboration Container and primary Resource, authorization, and history boundary | Organization, Project-style view, folder |
| Resource | Repository-scoped unit of collaborative work | Repository itself or an opaque generic bucket |
| Page | First accepted concrete Resource kind | Generic placeholder for every future work type |
| Issue | Repository-scoped actionable Resource with assignment, classification, status, and conversation semantics | Developer ticket or cross-Repository inbox Projection |
| Discussion | Repository-scoped conversation Resource organized for shared understanding | Forum Container or Issue alias |
| Project-style planning view | Owner-scoped Projection over accepted work and Repository attachments | Repository child owner, collaboration Container, or authority boundary |
| Data Commit | Immutable, Actor-attributed batch of accepted structured-data changes inside one Repository | Source Code commit, arbitrary file tree, or authorization decision |
| Data Branch | Named isolated data-state line inside one Repository | Repository, independent visibility/Grant boundary, or Git ref |
| Data Diff | Read-authorized derived comparison of two structured-data states | Source-code line diff, syntax analysis, or authority source |
| Change Proposal | Process for proposing, reviewing, deciding, and applying one bounded structured-data change set | Code review, Git merge, Grant, or second collaboration Container |
| Data Transfer | Allowlisted declarative transfer of typed Repository data between approved endpoints | Script, shell, arbitrary runtime, CI/CD, build, test, or deploy |
| Data Capsule | Repository-contained, finite typed-data Artifact | Executable snippet, independent workspace, or visibility bypass |
| Repository Derivation | Process that creates a new Repository from an existing Repository while retaining provenance | Git fork, shared ownership, or copied authority |
| Membership | User ↔ Organization belonging relationship | Repository access |
| Grant | Principal ↔ Repository authority relationship carrying a Role | Ownership relationship or effective-access cache |
| Role | Named Capability bundle for assignment and explanation | Authorization decision primitive |
| Capability | Atomic allowed action on a defined target | UI visibility or job title |
| Context | Selected navigation, filter, or view state | Identity, ownership, persisted relationship, authorization fact |
| Collaborator | Derived label for a User with effective Repository access | User subtype or independent entity |
| Activity Event | Append-oriented historical fact produced by an accepted action | Feed item, notification, metric, mutable status |

`Commit`, `Branch`, `Diff`, `Pull Request`, `Actions`, `Gist`, `Fork`, `Pull`, and `Push` are external benchmark aliases only. They are not canonical target vocabulary and create no Git route, code surface, or generic version-control engine.

## Repository ownership

Repository ownership is a typed relationship independent from Repository containment and explicit Grants.

```text
User ──────────┐
               ├── owns ──> Repository ── contains ──> Resource
Organization ──┘
```

Canonical invariants:

1. Every Repository has exactly one Owner at a time.
2. The accepted Owner kinds are User and Organization.
3. User-owned and Organization-owned Repositories use the same collaboration, Resource, authorization, and evidence semantics.
4. Ownership does not fabricate a direct Grant row.
5. Ownership may contribute an explicit governance-derived authority source.
6. Repository stable identity is independent from mutable human routing names.
7. Repository slug uniqueness is scoped to its Owner namespace.
8. User usernames and Organization slugs share one globally unambiguous Repository-owner namespace.
9. A future ownership-transfer lifecycle, if accepted, must preserve Repository and contained Resource stable identities.

Organization ownership is one ownership mode. It is not the definition of Repository.

## Organization and Membership

Organization solves organizational identity, Membership, administration, grouping, and possible Repository ownership.

```text
User ── Membership ──> Organization
Organization ── may own ──> Repository
```

Organization is not a Repository-equivalent workspace.

Ordinary Organization Membership does not create Repository authority. Membership answers belonging; Repository authority is resolved independently.

## Effective Repository authorization

The current target authorization chain is:

```text
Actor
→ stable Repository target
→ inspect Repository Owner
→ collect accepted ownership/governance authority
→ collect explicit Principal Grants
→ add accepted visibility baseline
→ apply governance constraints
→ apply target-state preconditions
→ Capability decision
```

Accepted current authority sources:

1. User owns Repository → that User derives Repository admin authority.
2. Organization owns Repository + Actor is Organization owner/admin → Actor derives Repository admin authority for that Organization's Repository.
3. Direct User Repository Grant → assigned Repository Role.
4. Public Repository visibility → accepted read baseline.

Ordinary Organization Membership contributes no Repository Role.

Current target visibility vocabulary is:

```text
private | public
```

A visibility state is not accepted unless it has explicit effective-access semantics.

Capability is decision truth. Role is assignment and explanation vocabulary.

## Canonical URL and information architecture

After a concept passes semantic admission, the sanitized public and read-only authenticated GitHub URL hierarchy recorded in `.playwright-mcp/github/` is the presentation baseline. Domain renaming does not authorize URL rewriting. A material deviation requires a direct Product reason and a discriminating test.

The current accepted URL model is:

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
/{ownerSlug}?tab=repositories
/{ownerSlug}?tab=stars
/{ownerSlug}?tab=projects
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

`/{ownerSlug}` is one shared public identity grammar for User and Organization. The path does not identify the kind. Owner Namespace Resolution maps the globally unique slug to exactly one stable User or Organization identity. The bare path is Overview; `?tab=repositories|stars|projects` is Presentation Context only and never changes identity, ownership, Membership, Principal resolution, or authorization.

`/orgs/{organizationSlug}/...` is Organization operational/dashboard presentation. `/organizations/{organizationSlug}/settings/...` is Organization administration/governance. Neither is a second Organization profile identity.

`/{ownerSlug}/{repositorySlug}` remains the canonical Repository identity. GitHub Wiki URL vocabulary is preserved as `/wiki` while the target Domain remains Page/Knowledge. The current detail suffix uses stable `pageId`; a human Wiki-page slug is not invented until its identity and rename semantics are independently proven.

GitHub `/dashboard`, `/repos`, `/issues/assigned`, `/orgs/{slug}/...`, and `/organizations/{slug}/settings/...` survive removal of Git and Code assumptions and are therefore preserved. `/issues` is an entry alias that canonicalizes to `/issues/assigned`.

Creation and session termination are Processes/Commands rather than stable resources. `/new` remains the Repository creation entry. Organization creation may use `/organizations/new` instead of GitHub's `/organizations/plan` because the latter is a commercial plan-selection process and Billing/Licensing is explicitly deferred. Sign-out remains a command, not a bookmarkable GET resource.

Repository presentation follows one owner/Repository header and primary navigation. An active child surface may compose independently recoverable route-specific supporting regions when benchmark evidence and target behavior prove their necessity. Framework route groups and parallel/intercepting routes never create Product identity, authority, or collaboration boundaries.

## Accepted collaboration semantics

Page, Issue, and Discussion are accepted Repository-contained Resource kinds. They reuse one collaboration loop:

```text
Actor
→ Repository authorization
→ Resource command
→ state transition
→ Activity Event
→ read projection
→ user-visible result
```

Issue owns actionable work, Repository-scoped classification and responsibility, flat conversation, and `open | closed` completion with `completed | cancelled` close reasons. Discussion owns shared understanding, `general | question | announcement` categories, flat conversation, independent closed/locked state, and one optional Answer for `question`. Both use Repository-local atomic numbers, expected-version mutation, Repository Capabilities, and same-transaction Activity Evidence.

Project-style planning, Notification delivery, Search, Explore, and Integrations are Projections. Their v1 query, ranking, recipient, privacy, and availability semantics are owned by [`domains/collaboration-projections.md`](./domains/collaboration-projections.md). None owns an Artifact, Repository, Principal, Grant, or authorization boundary.

Product acceptance never proves executable support. Current schema, API, route, UI, and environment status belongs to [`IMPLEMENTATION_GAPS.md`](./IMPLEMENTATION_GAPS.md) plus code, policies, tests, CI, and direct provider evidence.

## No-code data change and transfer semantics

The following semantics are accepted as a Product envelope. Acceptance establishes meaning and safety boundaries only; it does not authorize a concrete identity, lifecycle, Capability, schema, API, route, or UI:

- **Data Commit** is an immutable, Actor-attributed batch of typed structured-data changes inside one Repository.
- **Data Branch** is an isolated Repository data-state line. Selecting one is Context, never an authority Scope.
- **Data Diff** is a derived comparison filtered by the requesting Actor's read authority.
- **Change Proposal** proposes, reviews, decides, and applies typed data changes. Participation, review, or approval never creates a Capability.
- **Data Transfer** moves typed data through allowlisted connectors and endpoints. `Pull` and `Push` describe transfer direction only.
- **Data Capsule** is a finite, typed, Repository-contained data Artifact.
- **Repository Derivation** creates a new Repository with provenance from an existing Repository. The new Repository has independent Owner and authority; secrets, Sessions, and Grants are not copied by default.

Opaque text is never parsed or executed as code. Every change or transfer reuses the target Resource's validation and Repository authorization; allowlisted connectors/endpoints cannot introduce arbitrary execution or bypass source and destination authority.

## Rejected implementation surfaces

Source Code, file trees, Git references and merge mechanics, code review, executable content, arbitrary expressions, CI/CD, build, test, deployment, Package, and Release remain rejected. The external aliases above authorize no `/pulls`, `/gist`, Git route, code surface, or generic version-control/automation engine.

## GitHub-derived admissions and remaining candidates

Accepted Product semantics:

- **Issue**: Repository-scoped actionable work Artifact with stable Repository + issue-number identity.
- **Discussion**: Repository-scoped shared-understanding Artifact with stable Repository + discussion-number identity.
- **Project-style planning view**: derivable Projection over Repository-scoped work; never an entity, owner, Container, or authorization boundary. No project detail identity exists in v1.
- **Notification/Search/Explore**: actor-delivery and discovery Projections with authorization-before-content/ranking rules.
- **Integrations**: reviewed provider-neutral catalog Projection only; connection and machine authority are not implemented.
- **Structured data change and transfer**: the seven semantics in the accepted envelope above, with concrete lifecycle and implementation still deferred.

The following meanings may be described for non-confusion, but their concrete identities, persistence, routes, Capabilities, and lifecycles remain deferred until a real use case proves them:

- **Team**: explicitly not established in this milestone. Reconsider only for a proven durable group-authority need.
- **Enterprise**: explicitly not established in this milestone. Reconsider only for a proven cross-Organization constraint that grants no Repository content access.
- **App/Installation**: explicitly not established in this milestone. Reconsider only when an external machine must act as a typed Principal on a Repository.
- **Workflow/Run**: a future orchestration definition and one execution record, never authority or permission to execute arbitrary code.
- **Billing/Licensing**: commercial entitlement and administration semantics, never Repository ownership or content authority.

GitHub Knowledge maps to the Page family that carries Repository knowledge. Project, Notification, Search, Explore, and Audit remain non-owning Projections.

A future product capability not justified by these durable GitHub collaboration semantics must be derived independently from this platform's own user problem.

## Derived concepts and projections

- **Workspace**: presentation of one Repository; not a second Container.
- **Collaborator**: User with effective Repository access.
- **Outside collaborator**: for an Organization-owned Repository, a User with effective Repository access who lacks Membership in that Organization.
- **Current organization / current team**: selected presentation/filter state only.
- **Planning view**: Projection over accepted work; never ownership/authorization boundary merely because it crosses Repositories.
- **Activity feed / notification / audit view / analytics**: projections over sufficient historical evidence; they do not redefine source facts.
- **Governance / Audit**: Governance constrains future action; Audit explains or proves past action. Neither is a synonym for the other.
- **Identity / Access**: Identity establishes a trusted Actor; Access resolves effective authority. Authentication alone never supplies a Capability.

A projection becomes an Entity only when independent identity, lifecycle ownership, invariants, and non-derivable behavior are proven.

## Product invariants

1. Repository always means No-Code Collaboration Container.
2. Repository is the only accepted primary collaboration Container.
3. GitHub supplies benchmark evidence; it cannot override the axiom or target Product Contract.
4. Actor, Scope, Principal, Container, Relationship, Artifact, and Process are semantic roles, not generic persistence or package categories.
5. Repository Owner is exactly one User or Organization; Organization ownership is not mandatory.
6. Organization may own Repositories but is not itself the collaboration Container.
7. User identity is distinct from Membership, Collaborator, Role, Context, and Repository authority.
8. Membership is a belonging Relationship; it does not imply Repository access.
9. Ownership and explicit Grant remain separate authority facts.
10. Authentication establishes Actor identity only.
11. Capability is the authorization decision primitive; Role is a named bundle.
12. Context can change navigation, query, filter, or explanation but cannot alter persisted authorization facts.
13. Every accepted collaborative Artifact belongs to exactly one Repository at a time unless a future use case explicitly proves otherwise.
14. User-owned and Organization-owned Repositories reuse the same contained-work and authorization semantics.
15. Collaborator and Outside collaborator are derived classifications, never identity types.
16. Policy may constrain accepted authority but cannot silently create Repository content authority.
17. Historical Evidence is append-oriented; presentation projections cannot rewrite its product meaning.
18. Page, Issue, and Discussion are the accepted concrete Repository-contained Resource kinds; Issue and Discussion v1 lifecycle, capability, concurrency, relationship, and evidence semantics are decision-complete.
19. Canonical human routing uses one shared User/Organization Owner namespace: /{ownerSlug} for identity and /{ownerSlug}/{repositorySlug} for Repository identity; query tabs are Presentation Context only.
20. Domain semantics remain provider-neutral; implementation technologies project rather than define Product truth.
21. Generated types, migrations, diagrams, CI output, and runtime observations cannot silently replace this contract.
22. A benchmark concept is rejected when its value does not survive removal of Source Code, arbitrary execution, CI/CD, and software-development-specific assumptions.
23. Data Commit, Data Branch, Data Diff, Change Proposal, Data Transfer, Data Capsule, and Repository Derivation are accepted no-code semantic envelopes; benchmark aliases provide no route, Git, code, execution, or implementation authority.
24. Branch selection, proposal participation or approval, Project filters, Notification state, Context, and Projection cannot alter effective authority.
25. Governance constrains future action; Audit and Activity Evidence explain or prove past action without becoming Feed, Notification, or Analytics source ownership.

## Deferred product decisions

These remain unaccepted until direct evidence requires them:

- Team Principal, Team membership, Team Grants, detail route, and persistence; reconsideration requires proven group authority.
- Enterprise identity, ownership, policy engine, and persistence; reconsideration requires a proven cross-Organization constraint without content access.
- App Principal, Installation, OAuth, credentials, Repository binding, and connector execution; reconsideration requires proven machine authority.
- Project entity, persistence, create command, saved view, or detail identity. Project-style planning remains derivable only.
- Organization-wide Repository base permission for ordinary members.
- Custom Roles, explicit deny precedence, nested groups, or generic policy engines.
- Repository transfer, archive, restore, and destructive lifecycle semantics.
- Any new Resource family beyond Page, Issue, and Discussion.
- Concrete identity, lifecycle, Capability, persistence, route, API, and UI for the accepted structured-data change, exchange, and Repository Derivation envelope.

## Success model

The Product Contract is working when:

- a User-owned and an Organization-owned Repository both use the same Repository collaboration semantics;
- every accepted work item has an unambiguous Repository boundary;
- the system can explain why an Actor can or cannot perform an action;
- `/dashboard` navigates to canonical `/{owner}/{repository}` Repository identity;
- Page collaboration works through the same authorization and evidence boundary for both ownership modes;
- accepted Issue and Discussion identities and lifecycle mutations remain Repository-scoped, canonical, version-safe, evidence-backed, and authorization-equivalent across presentation modes;
- Project, Notification, Search, Explore, and Integration catalog projections cannot create authority, mutate source truth, leak inaccessible data, or imply unavailable connection success;
- all navigation and executable capability remain free of Source Code, Git, arbitrary execution, and code-review semantics;
- Data Change and Transfer fixtures reject script, expression, Git ref, code payload, secret material, and cross-Repository authority bypass;
- ownership, Membership, Grants, Roles, Capabilities, Context, and projections are not conflated;
- new GitHub benchmark concepts are classified and tested before persistence or architecture is introduced; and
- production/provider observations may correct the earliest invalid contract without turning undocumented runtime behavior into Product truth.

## Falsification conditions

Reopen this contract only when evidence shows that:

- valuable collaboration normally cannot be contained by Repository;
- a second primary collaboration Container is necessary;
- normal Artifacts require multi-Repository ownership as the default case;
- User and Organization are insufficient Owner kinds for demonstrated use cases;
- capability-based authorization cannot explain real decisions without pervasive special cases;
- event-derived evidence cannot meet required history/recovery guarantees; or
- two real vertical slices require contradictory meanings for a canonical term.

## Contract update protocol

1. Separate Observation, Hard Constraint, Assumption, Unknown, Value Choice, Convention, and Evidence State.
2. Identify the earliest truth boundary that is wrong.
3. Apply the Repository axiom before any benchmark convention.
4. Classify the candidate by semantic roles plus authorization/presentation/evidence semantics.
5. Reject any benchmark candidate whose collaboration value disappears after Source Code, arbitrary execution, CI/CD, build/test/deploy, and software-development-specific assumptions are removed; retain only independently proven structured-data semantics under the no-code transfer boundary.
6. Update Product and affected Domain/Architecture contracts before or atomically with executable projections.
7. Update schema, migrations, generated projections, code, policies, UI copy, and tests as downstream evidence.
8. Verify a minimum discriminating user journey, not merely document presence or green unit tests.
9. Compare predicted behavior with provider/production observations only when those environments exist.
10. Preserve historical decisions only as history; never leave a superseded definition in current canonical truth.

See the [ontology expansion](./ONTOLOGY.md), [documentation map](./README.md), [architecture contract](./architecture/README.md), [domain catalog](./domains/README.md), and [operations runbook](./operations/RUNBOOK.md).
