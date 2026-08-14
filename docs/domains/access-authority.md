# Domain Contract: Access Authority

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-14

## Problem owned and success condition

The platform must determine and explain:

> Which authenticated Actor may perform which accepted action on which Repository-scoped target, through which authority source, under which constraints, and why?

This contract succeeds when User-owned and Organization-owned Repositories produce the same Capability vocabulary and decision semantics without treating ownership, Membership, selected Context, or Role labels as interchangeable authority facts.

## Evidence ledger

### Observations

- Domain defines Repository Roles and explicit Repository Capabilities.
- Database stores direct User-to-Repository Grants.
- Current executable Repository ownership is typed User-or-Organization ownership.
- Current executable authority resolution derives personal-owner governance, Organization owner/admin governance, and direct User Grant sources without caller-supplied Organization ownership.
- Ordinary Organization Membership contributes no Repository Role.
- `Collaborator` is relationship-derived rather than User subtype.
- RLS independently enforces row access; UI visibility is not sufficient enforcement.
- Operation Capability and delegation authority are distinct decisions.
- Resource hard deletion is not an accepted Product operation, so it is absent from the current Capability vocabulary.

### Hard constraints

- Authentication and authorization remain separate.
- Ownership and Grant remain separate relationships.
- UI Context cannot alter server-side authorization facts.
- Domain/Application cannot depend on Supabase Rows/DTOs/clients/generated types.
- Database enforcement fails closed.
- Actor cannot delegate beyond accepted delegation rules.
- Service credentials never become browser/end-user authority.
- Semantic-role classification cannot replace persisted authority facts.
- An unaccepted Product operation cannot remain as a latent current Capability merely because enforcement later denies it.

### Corrected ownership authority model

Repository ownership contributes governance authority without fabricating direct Grant rows:

```text
Personal Repository
Repository.owner = User U
Actor = U
→ Repository admin authority

Organization-owned Repository
Repository.owner = Organization O
Actor Membership in O = owner | admin
→ Repository admin authority
```

Ordinary Organization Membership contributes no Repository Role.

A User-owned Repository has no Organization governance source by implication.

### Assumptions

- First model can use additive authority sources without explicit deny precedence.
- Personal ownership + Organization governance + direct User Grants are sufficient for the corrected executable slice.
- Roles remain small fixed bundles while Capability is decision primitive.
- Repository remains primary explicit Grant scope.
- RLS can project the same accepted semantics without becoming Domain owner.

### Unknowns

- Whether ordinary Organization Membership should later contribute a Repository base permission.
- Whether Team or another group Principal is required.
- Whether Enterprise/Organization Policies must cap granted Capabilities.
- Whether custom roles, temporary/conditional/resource-specific Grants, or explicit deny are required.
- How ownership transfer should modify effective authority during a pending transition, if transfer is accepted.
- Which lifecycle operation and Capability should represent Resource removal if archive/destructive lifecycle is later accepted.

### Value choices

- Personal Owner and Organization owner/admin governance are accepted authority sources because ownership must include administration of the owned collaboration Container.
- Do not create one direct Grant per owner/governor merely to represent authority already explained by ownership/governance relationships.
- Prefer explicit accepted Capabilities over scattered Role checks or latent unusable permissions.
- Prefer explainable additive sources before deny precedence.
- Prefer least privilege and fail closed.
- Prefer one semantic decision projected into Domain/Application/RLS/UI explanation.

## Boundary and owner

This contract owns:

- direct Principal-to-Repository Grant semantics;
- ownership/governance-derived Repository authority sources;
- Repository Role definitions as Capability bundles;
- effective Capability calculation;
- delegation rules for Grant mutation;
- authorization explanations; and
- semantic consistency between Domain decisions and enforcement projections.

This contract does not own:

- authentication credential lifecycle;
- Repository ownership lifecycle itself;
- Organization/Team Membership lifecycle;
- Repository/Resource lifecycle;
- UI navigation/selected Context;
- provider session transport;
- PostgreSQL policy syntax; or
- audit/feed presentation.

## Semantic role mapping

```text
Actor        = authenticated User attempting action
Scope        = Repository Owner relationship + applicable Organization/future Enterprise governance scope
Principal    = subject eligible to receive Repository authority; currently User
Container    = Repository
Relationship = Repository ownership, Membership, direct Grant; future Team Membership/Grant or App Installation
Artifact     = Repository-contained target such as Resource
Process      = authorization-sensitive accepted command/transition, including Grant mutation
```

Cross-cutting authorization semantics:

- `Role` = assignment/explanation bundle.
- `Capability` = decision primitive for an accepted action.
- `Policy`/constraint = restriction on candidate authority; cannot silently fabricate content access.
- `Context` = presentation only.
- `Activity Event` = historical evidence for accepted mutations.

A User can be request Actor, Repository Owner, and direct-grant Principal in different causal positions. Those roles must not be merged.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Actor | Authenticated User attempting action |
| Repository Owner | User or Organization owning the target Repository |
| Principal | Subject eligible to receive explicit authority; currently User |
| Grant | Relationship assigning one Repository Role to one Principal |
| Governance authority source | Ownership/administration relationship deriving Repository authority without Grant |
| Role | Named Capability bundle |
| Capability | Specific accepted action on a defined target |
| Effective Capabilities | Capabilities produced from accepted sources after constraints/state preconditions |
| Delegation | Authority to create/change/revoke another Grant |
| Context | Selected view/filter; never authority source by itself |
| Collaborator | User with effective Repository access |
| Authorization explanation | Trace of owner/governance/Grant/visibility/constraint evidence producing decision |

## Authority sources

### Personal ownership

```text
Repository.owner = User U
Actor = U
→ Repository admin
```

This is not a Grant row.

### Organization governance

```text
Repository.owner = Organization O
Actor Membership in O = owner | admin
→ Repository admin
```

This is not an Organization-wide ordinary-member base permission and not a direct Grant row.

### Direct User Grant

```text
User Principal ── receives Role for ──> Repository
Role ── expands to ──> Capabilities
```

### Public visibility

Public visibility contributes accepted Repository/Resource read baseline semantics; it is not a Principal Grant and does not create a Role identity.

Public visibility does not automatically publish the raw historical-evidence envelope. Current raw Activity access requires authenticated Repository read authority.

`organization` visibility is not accepted until a specific Organization-member baseline is defined.

## Role and Capability

Current Role bundles:

| Role | Capabilities |
| --- | --- |
| Viewer | `repository.view`, `resource.view` |
| Contributor | Viewer + `resource.create`, `resource.update` |
| Manager | Contributor + `member.manage` |
| Admin | all current Repository Capabilities + `repository.manage` |

Current Repository Capability vocabulary:

```text
repository.view
repository.manage
resource.view
resource.create
resource.update
member.manage
```

Resource hard deletion is not an accepted Product operation. No current Role grants a `resource.delete` Capability.

Role rank may help assignment/explanation while bundles remain nested. Capability remains decision truth.

## Effective authorization

Conceptual chain:

```text
Actor
→ resolve target Repository
→ inspect Repository Owner
→ collect ownership/governance authority
→ collect direct Principal Grants
→ add accepted visibility baseline
→ apply governance constraints
→ apply target-state/transition preconditions
→ Capability decision
```

Application authority readers accept stable `actorId + repositoryId`; callers must not supply `organizationId` as an authorization assumption. The authority adapter resolves Repository ownership from stable Repository facts.

`Highest role` is an explanation projection, not canonical persisted access state.

## Direct Grant states and delegation

```text
Absent
  ├── grant viewer
  ├── grant contributor
  ├── grant manager
  └── grant admin

viewer / contributor / manager / admin
  ├── change role
  └── revoke
```

Every transition evaluates:

1. Actor may enter member-management operation;
2. Actor may manage target current Role;
3. Actor may assign proposed Role;
4. ownership/governance continuity invariants remain valid; and
5. attribution records authenticated Actor.

`member.manage` alone does not imply unlimited Role assignment.

## Invariants

1. Valid Session proves identity only, never Repository access.
2. Authorization targets stable Repository/Resource IDs, not owner slug, Repository slug, URL, tab, or selected Context.
3. UI visibility/Context is never sole enforcement.
4. Capability is authorization decision primitive; Role is bundle/explanation.
5. Grant connects one Principal, one Repository, one Role.
6. Repository ownership and direct Grants remain distinct facts.
7. Personal owner derives Repository admin only for that User-owned Repository.
8. Organization owner/admin derives Repository admin only when that Organization owns the Repository.
9. Ordinary Organization Membership derives no Repository Role.
10. Governance-derived authority and direct Grants remain distinct evidence even if they produce same effective Role.
11. Actor cannot delegate beyond accepted rules.
12. Grant attribution identifies authenticated Actor.
13. Lower-authority manager cannot mutate higher-authority Grants merely because it has `member.manage`.
14. Domain/Application and RLS must agree; either layer being more permissive is a security defect.
15. Authorization fails closed when Actor, owner relationship, authority sources, constraints, or target identity cannot be established.
16. Service/secret credentials never substitute for end-user authorization.
17. Collaborator/Outside Collaborator/Highest Role remain derived classifications/projections.
18. Semantic-role classification never grants authority by itself.
19. A Product operation that is not accepted is absent from current Capability bundles.

## Derived classifications

- `Collaborator(user, repository)`: User has effective Repository read access.
- `Outside collaborator(user, organization)`: for an Organization-owned Repository, User has effective Repository access but no Membership in the owning Organization.
- Personal Repository ownership does not create an "outside collaborator" classification because no Organization relationship exists.

## Events and explanations

Candidate historical evidence for accepted Grant mutations may include:

- `repository_grant.created`
- `repository_grant.role_changed`
- `repository_grant.revoked`

Grant mutation history should record Actor, target Principal, Repository, previous/proposed Role, source, timestamp without secrets when that evidence contract is accepted.

Authorization denials are decision outcomes, not automatically persistent Activity Events. Persisting denied attempts requires its own security/audit purpose and retention contract.

## Dependencies and failure behavior

- **Identity provider**: if Actor cannot be established where authentication is required, fail closed.
- **Repository Collaboration**: ownership and target Repository/Resource must resolve by stable IDs.
- **Organization Membership**: consulted only when Repository owner is Organization; stale/unavailable data must not increase access.
- **Database enforcement**: RLS projects least privilege; SQL does not own Role/Capability meaning.
- **Application**: coordinates authorization-sensitive use cases and safe denied results.
- **Delivery**: may hide/explain actions for usability but cannot authorize.

## Rejected alternatives

### Organization-only authority assumption

Rejected because User-owned Repositories are first-class and have no mandatory Organization. Requiring caller-supplied `organizationId` makes authorization depend on a false ownership invariant.

### Fabricated owner Grants

Rejected because ownership/governance already explains authority and must remain separately revocable/transferable from direct Grant facts.

### UI-only authorization

Rejected because direct/stale/alternate clients bypass presentation.

### Scattered Role checks

Rejected because duplicated role-name conditionals diverge across Web/Application/SQL.

### Latent unavailable Capabilities

Rejected because a Role must describe actions the Product actually accepts; unavailable lifecycle operations are not kept as current permissions merely to be denied later.

### Generic Principal/Relationship persistence too early

Rejected until multiple accepted lifecycles justify a supertype without weakening FK integrity.

### Database as only Domain model

Rejected because RLS is enforcement projection, not provider-neutral Product explanation.

## Falsification conditions

Reopen when:

- real decisions require Resource-level Grants as common case;
- additive sources cannot express required restrictions without explicit deny;
- personal-owner or Organization-governance authority proves too broad;
- fixed Role bundles cause pervasive exceptions;
- new Principal types require incompatible delegation/revocation semantics;
- policy caps cannot remain separate from Grants; or
- Domain and RLS cannot implement the same decisions without contradictory logic.

## Minimum discriminating tests

1. Personal owner receives Repository admin without direct Grant.
2. Organization owner/admin receives Repository admin for Organization-owned Repository without direct Grant; ordinary member does not.
3. Personal owner of Repository A gains no authority over unrelated Repository B.
4. Organization admin of O gains no governance authority over User-owned Repository or Repository owned by another Organization.
5. Viewer/Contributor/Manager/Admin receive exactly defined accepted Capabilities.
6. Manager cannot create/alter/remove Manager/Admin authority unless an accepted delegation rule allows it.
7. Changing UI Context cannot change access for identical Actor/Repository/persisted relationships.
8. Direct request to hidden UI action is denied server-side.
9. Grant attribution differing from authenticated Actor is rejected.
10. Domain tests and database tests produce same decision matrix for representative owner modes, Grants, visibility, targets.
11. Any unaccepted lifecycle operation is absent from current Capability bundles and remains inaccessible through RLS/table privileges.
