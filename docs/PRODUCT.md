# Product Contract

- Status: Canonical
- Contract owner: Repository owner
- Scope: Product meaning and semantic boundaries
- Last reviewed: 2026-08-15

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

## Axiom

> **Repository = No-Code Collaboration Container**

This is the only product axiom. It is not conditional, contextual, or implementation-dependent.

Every accepted product concept must preserve all of the following:

- collaboration has one primary Container: Repository;
- collaborative work is contained by a Repository;
- Repository is the primary authorization target for contained work;
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
| Commit / Data Commit | Immutable, actor-attributed batch of accepted structured-data changes inside one Repository | Source Code commit, arbitrary file tree, or authorization decision |
| Branch / Data Branch | Named isolated data-state line inside one Repository | Repository, independent visibility/Grant boundary, or git ref |
| Diff / Data Diff | Derived comparison of two authorized structured-data states | Source-code line diff, syntax analysis, or source Evidence |
| Pull Request / Change Proposal | Review-and-apply Process for an authorized structured-data change set | Code review, git merge, or a second collaboration Container |
| Actions / Data Transfer | Allowlisted declarative transfer of typed Repository data between approved endpoints | Script, shell, arbitrary runtime, CI/CD, build, test, or deploy |
| Gist / Data Capsule | Typed Repository-contained Artifact for sharing or transferring a bounded data payload | Executable snippet, independent workspace, or visibility bypass |
| Membership | User ↔ Organization belonging relationship | Repository access |
| Grant | Principal ↔ Repository authority relationship carrying a Role | Ownership relationship or effective-access cache |
| Role | Named Capability bundle for assignment and explanation | Authorization decision primitive |
| Capability | Atomic allowed action on a defined target | UI visibility or job title |
| Context | Selected navigation, filter, or view state | Identity, ownership, persisted relationship, authorization fact |
| Collaborator | Derived label for a User with effective Repository access | User subtype or independent entity |
| Activity Event | Append-oriented historical fact produced by an accepted action | Feed item, notification, metric, mutable status |

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

URL design follows resource identity, not GitHub's historical route vocabulary. The path owns stable identity and hierarchy; query parameters own search, filter, sort, pagination, and temporary projections; fragments own in-page location.

The target resource hierarchy is:

```text
/
/app
/{ownerSlug}
/{ownerSlug}?tab=repositories|projects
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/issues
/{ownerSlug}/{repositorySlug}/issues/{issueNumber}
/{ownerSlug}/{repositorySlug}/projects
/{ownerSlug}/{repositorySlug}/discussions
/{ownerSlug}/{repositorySlug}/discussions/{discussionNumber}
/{ownerSlug}/{repositorySlug}/pages
/{ownerSlug}/{repositorySlug}/pages/{pageId}
/{ownerSlug}/{repositorySlug}/activity
/{ownerSlug}/{repositorySlug}/security
/{ownerSlug}/{repositorySlug}/settings

/repositories
/issues?scope=assigned&q=&status=&sort=&page=
/projects
/discussions
/notifications
/search?q=&type=&sort=&page=

/organizations/{organizationSlug}/members
/organizations/{organizationSlug}/teams
/organizations/{organizationSlug}/settings
/organizations/{organizationSlug}/audit-log
/organizations/{organizationSlug}/custom-properties

/settings/profile
/settings/organizations
/settings/enterprises
/settings/appearance
/settings/accessibility
/settings/billing
/settings/integrations
/settings/applications
/settings/programmatic-access
```

Examples:

```text
/alice/personal-crm
/acme/customer-success
```

The first path segment resolves either a User or Organization Owner namespace. It does not imply Organization ownership and it is not authorization input by itself. `/{ownerSlug}` is the one canonical human identity projection; `/organizations/{organizationSlug}/...` is the Organization governance hierarchy, not a second Organization profile identity.

`/app` is an authenticated discovery/dashboard surface. It is not part of Repository identity.

GitHub `/dashboard`, `/repos`, `/issues/assigned`, `/orgs/{slug}/...`, and `/organizations/{slug}/settings/...` are observed external routes, not target canonical names. Their admitted meanings map respectively to `/app`, `/repositories`, `/issues?scope=assigned`, and the single `/organizations/{organizationSlug}/...` governance hierarchy. This removes provider history from the target resource model.

Creation, import, and session termination are Processes or Commands rather than canonical resources. Target command entry routes may use `/repositories/new`, `/repositories/import`, and `/organizations/new`; a new Issue opened in a dialog has no Issue URL until creation assigns stable identity. Sign-out is an authenticated command, not a bookmarkable `GET /logout` resource.

Repository presentation follows one owner/Repository header and primary navigation. An active child surface may compose independently recoverable, route-specific supporting regions when sanitized public or read-only authenticated GitHub benchmark evidence and target behavior prove their necessity. Framework layout mechanisms never create additional Product boundaries or URL identities.

`/projects` is a Repository attachment/list Projection; Project detail does not inherit Repository ownership and therefore does not use `/{owner}/{repository}/projects/{id}`. GitHub Wiki maps to the existing Page Resource family, so Git-backed `/wiki/{slug}` is not a second target canonical identity. `/security` contains only admitted governance, access-posture, policy, and security-evidence projections; code/dependency/secret scanning is excluded.

## Accepted collaboration semantics and executable baseline

The currently executable collaboration family is intentionally small:

```text
Repository
└─ Page
```

Page proves the first complete Repository-contained collaboration loop:

```text
Actor
→ Repository authorization
→ Page command
→ state transition
→ Activity Event
→ read projection
→ user-visible result
```

Issue and Discussion are also accepted Repository-contained Resource kinds. Issue represents actionable work with assignment/status/completion behavior; Discussion represents category/answer/conversation behavior. Both retain stable Repository-scoped identity and reuse Repository authorization. Issue now has an executable read-only identity, persistence, authorization, list/detail, and full-page/dialog delivery slice; its commands, relationships, conversation, and historical evidence remain unsupported and fail closed. Discussion remains entirely non-executable and is an explicitly registered gap.

## No-code data change and transfer semantics

`Commit`, `Branch`, `Diff`, `Pull Request`, `Actions`, and `Gist` are not prohibited names. They are admitted only when their complete Product meaning is structured-data collaboration inside Repository:

```text
accepted Repository Resource state
→ optional isolated Data Branch
→ immutable Data Commit
→ derived Data Diff
→ optional Change Proposal review
→ authorized apply
→ optional allowlisted Data Transfer or Repository-contained Data Capsule
```

This flow never introduces Source Code, a file tree, executable content, arbitrary expressions, git refs, code review, CI/CD, build, test, deployment, Package, or Release source behavior.

Mandatory boundaries:

1. Payloads conform to accepted Repository Resource schemas; opaque text is never parsed or executed as code.
2. Every snapshot, comparison, proposal, apply, capsule read, and transfer re-evaluates Actor, Repository, Capability, and target Resource state.
3. Data Branch, Change Proposal, Data Transfer, and Gist/Data Capsule never own Repository, Membership, Grant, Role, visibility, or a second collaboration space.
4. Data Diff is a Projection and cannot rewrite Commit/Evidence.
5. Data Transfer is limited to typed payloads, allowlisted connectors/endpoints, fixed mappings, bounded size/retention, and explicit delivery evidence. User-provided scripts or general-purpose transforms are impossible by contract.
6. Credentials and secrets are referenced only through controlled Infrastructure; their values never enter Product payloads, Diff, Gist, logs, or user-visible Evidence.

The semantic envelope is accepted. Concrete identity, lifecycle, concurrency, conflict, retention, authorization Capabilities, URL, persistence, and Application contracts remain Deferred until a dedicated Domain contract passes discriminating tests.

## GitHub-derived admissions and remaining candidates

Accepted Product semantics:

- **Issue**: Repository-scoped actionable work Artifact with stable Repository + issue-number identity.
- **Discussion**: Repository-scoped shared-understanding Artifact with stable Repository + discussion-number identity.
- **Project-style planning view**: Projection over Repository-scoped work; never ownership or authorization boundary. Repository `/projects` lists attachments; detail identity is owner-scoped.
- **No-code data change/transfer envelope**: Commit, Branch, Diff, Pull Request, Actions, and Gist may represent structured-data Evidence, Process state, Projection, Proposal, transfer, and Data Capsule semantics under the mandatory no-code boundaries above.

The following remain candidates until a real use case proves lifecycle and reuse:

- **Team**: Organization-scoped group Principal for shared Repository authority.
- **Enterprise**: cross-Organization governance Scope; never a Repository Owner by implication.
- **App/Installation**: machine identity/Principal plus explicit access Relationship when integrations require it.

A future product capability not justified by these durable GitHub collaboration semantics must be derived independently from this platform's own user problem.

## Derived concepts and projections

- **Workspace**: presentation of one Repository; not a second Container.
- **Collaborator**: User with effective Repository access.
- **Outside collaborator**: for an Organization-owned Repository, a User with effective Repository access who lacks Membership in that Organization.
- **Current organization / current team**: selected presentation/filter state only.
- **Planning view**: Projection over accepted work; never ownership/authorization boundary merely because it crosses Repositories.
- **Activity feed / notification / audit view / analytics**: projections over sufficient historical evidence; they do not redefine source facts.

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
18. Page, Issue, and Discussion are accepted concrete Repository-contained Resource kinds; Page commands and Issue reads are currently executable, while undefined Issue mutations and all Discussion behavior fail closed.
19. Canonical Repository URL is Owner namespace + Repository slug; internal delivery prefixes are not product identity.
20. Domain semantics remain provider-neutral; implementation technologies project rather than define Product truth.
21. Generated types, migrations, diagrams, CI output, and runtime observations cannot silently replace this contract.
22. A benchmark concept is rejected when its value does not survive removal of Source Code, arbitrary execution, CI/CD, and software-development-specific assumptions.
23. Commit/Branch/Diff/Pull Request/Actions/Gist semantics, when present, operate only on accepted structured Repository data and never create code capability, independent authority, or a second collaboration Container.

## Deferred product decisions

These remain unaccepted until direct evidence requires them:

- Team persistence and Team Repository Grants.
- Enterprise persistence and typed cross-Organization policies.
- Issue creation, number allocation, state transitions, relationships, conversation, historical evidence, and destructive lifecycle; the read slice is executable but mutations are not.
- Discussion Domain lifecycle, persistence, authorization, evidence, and delivery implementation; Product identity is accepted, executable contracts are not.
- Project-style planning persistence beyond a derivable Projection.
- App Principal and Installation lifecycle.
- Organization-wide Repository base permission for ordinary members.
- Custom Roles, explicit deny precedence, nested groups, or generic policy engines.
- Repository transfer, archive, restore, and destructive lifecycle semantics.
- Any new Resource family beyond Page, Issue, and Discussion.
- Concrete Data Commit, Data Branch, Data Diff, Change Proposal, Data Transfer, and Gist/Data Capsule Domain lifecycle, identity, persistence, URL, Capability, conflict, retention, and delivery contracts.
- Any automation or transfer capability beyond typed, allowlisted, fixed-mapping data delivery with no arbitrary execution.

## Success model

The Product Contract is working when:

- a User-owned and an Organization-owned Repository both use the same Repository collaboration semantics;
- every accepted work item has an unambiguous Repository boundary;
- the system can explain why an Actor can or cannot perform an action;
- `/app` navigates to canonical `/{owner}/{repository}` Repository identity;
- Page collaboration works through the same authorization and evidence boundary for both ownership modes;
- accepted Issue and Discussion identities remain Repository-scoped, canonical, and authorization-equivalent across full-page/modal presentation;
- any admitted data Commit/Branch/Diff/Proposal/Action/Gist flow remains Repository-scoped, schema-validated, authorization-equivalent, secret-free, and incapable of executing code;
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
