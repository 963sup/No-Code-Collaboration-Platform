# Domain Contract: Access Authority

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-11

## Problem owned and success condition

The platform must determine and explain:

> Which authenticated actor may perform which action on which Repository-scoped target, through which authority source, under which constraints, and why?

This contract succeeds when Domain decisions, Application use cases, database enforcement, and UI explanations agree without treating session existence, selected context, or a role label as the authorization fact.

## Evidence ledger

### Observations

- The current Domain defines Repository Roles and explicit Repository Capabilities.
- The current database stores direct User-to-Repository grants.
- `Collaborator` is already modeled as a relationship-derived classification rather than a User subtype.
- Repository reads pass through authorization-sensitive Application and database boundaries.
- RLS and helper functions enforce row access independently of UI visibility.
- Operation capability and role-delegation authority are distinct authorization decisions.

### Constraints

- Authentication and authorization remain separate.
- UI context cannot alter server-side authorization facts.
- Domain and Application cannot depend on Supabase clients, DTOs, Rows, or generated database types.
- Database enforcement must fail closed.
- An actor cannot grant authority beyond the accepted delegation rules.
- Provider service credentials must never become browser authority.

### Assumptions

- The first model can use additive capability sources without explicit deny precedence.
- Direct User grants are sufficient for the current implemented slice.
- Roles remain a small fixed set while Capabilities are the decision primitive.
- Repository is the primary grant scope.
- Database RLS can project the same accepted semantics without becoming the Domain owner.

### Unknowns

- When Organization membership should contribute a baseline grant.
- Whether Team or another Organization-scoped group principal is required.
- Whether Enterprise or Organization policies must cap granted Capabilities.
- Whether custom roles are needed.
- Whether temporary, expiring, conditional, or resource-specific grants are needed.
- Whether explicit deny is necessary and, if so, how precedence remains explainable.

### Value choices

- Prefer explicit Capabilities over scattered role-name conditionals.
- Prefer explainable additive authority before adding deny precedence.
- Prefer least privilege and fail-closed behavior over convenience.
- Prefer one semantic decision projected into several enforcement layers over duplicated business rules.
- Prefer derived labels over permanent actor subtypes.

## Boundary and owner

This contract owns:

- Principal-to-Repository Grant semantics;
- Repository Role definitions as Capability bundles;
- effective Capability calculation;
- delegation rules for creating, changing, and revoking grants;
- authorization explanations; and
- semantic consistency between Domain decisions and enforcement projections.

This contract does not own:

- authentication credential lifecycle;
- Organization or Team membership lifecycle;
- Repository or Resource lifecycle;
- UI navigation and selected context;
- provider session transport;
- PostgreSQL policy syntax; or
- audit-feed presentation.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Actor | Authenticated User attempting an action |
| Principal | Subject eligible to receive authority; currently a User |
| Grant | Relationship assigning one Role to one Principal for one Repository |
| Role | Named Capability bundle |
| Capability | Specific allowed action on a defined target |
| Effective Capabilities | Capabilities produced by accepted authority sources after accepted constraints |
| Delegation | Authority to create, change, or revoke another Grant |
| Context | Selected view or filter; never an authority source by itself |
| Collaborator | User with effective Repository access |
| Authorization explanation | Trace of authority sources and constraints producing a decision |

## Entities, relationships, and derived concepts

### Grant

Grant is a relationship, not an actor type:

```text
Principal ── receives Role for ──> Repository
Role      ── expands to ─────────> Capabilities
Actor     ── exercises ──────────> Effective Capabilities
```

The current minimum implementation allows one direct User grant per Repository.

### Role and Capability

Current Role bundles are:

| Role | Capabilities |
| --- | --- |
| Viewer | `repository.view`, `resource.view` |
| Contributor | Viewer plus `resource.create`, `resource.update` |
| Manager | Contributor plus `resource.delete`, `member.manage` |
| Admin | All current Repository Capabilities, including `repository.manage` |

Role rank is an assignment and conflict-resolution aid. It does not replace explicit Capability checks.

### Derived classifications

- `Collaborator`: User with effective Repository access.
- `Outside collaborator`: User with Repository access and no relevant Organization membership.
- `Highest role`: explanatory projection when several additive Role sources exist.

These classifications do not create independent identities or lifecycles.

## States and transitions

A direct Repository grant has these states:

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

1. whether the actor may enter the member-management use case;
2. whether the actor may manage the target's current Role;
3. whether the actor may assign the proposed Role;
4. whether governance and continuity invariants remain valid; and
5. whether attribution records the authenticated actor.

`member.manage` alone does not imply unlimited role assignment.

## Invariants

1. A valid session proves identity only; it never proves Repository access.
2. Effective authorization is evaluated against the stable Repository and target Resource identities.
3. UI visibility and selected context are never the only enforcement.
4. Capability is the authorization decision primitive; Role is a bundle and explanation.
5. A Grant connects one Principal, one Repository, and one Role.
6. The actor cannot assign, change, or revoke authority beyond accepted delegation rules.
7. Grant attribution must identify the authenticated actor responsible for the change.
8. A lower-authority manager cannot create, alter, or remove higher-authority grants merely because the manager has `member.manage`.
9. Domain/Application semantics and database enforcement must agree; either layer being more permissive is a security defect.
10. Authorization fails closed when identity, authority sources, constraints, or target identity cannot be established.
11. Service-role or secret credentials never reach browser code and never substitute for an end-user authorization decision.
12. `Collaborator`, `Outside collaborator`, and `Highest role` remain derived from relationships.

## Actors, principals, contexts, and permissions

- **Actor** answers “who is making this request?”
- **Principal** answers “which subject received authority?”
- **Context** answers “which view or scope is selected?”
- **Repository/Resource** answers “what is the target?”
- **Capability** answers “which action is being decided?”
- **Grant and policy evidence** answers “why is it allowed or denied?”

A User may eventually act through several effective Principals, such as direct User authority and an accepted group principal. Adding a Principal type requires its own lifecycle, membership, trust, and revocation model.

## Events and workflows

Candidate immutable events include:

- `repository_grant.created`
- `repository_grant.role_changed`
- `repository_grant.revoked`
- `authorization.denied`
- `authorization.policy_capped`

Grant changes should record actor, target Principal, Repository, previous Role, proposed Role, authority source, and timestamp without exposing secrets.

Authorization-denied events require sampling and privacy rules before broad use; denial telemetry is useful evidence but can become noisy or sensitive.

## Dependencies and failure behavior

- **Identity provider**: if the authenticated actor cannot be established, fail closed.
- **Repository Collaboration**: if the Repository or target Resource cannot be resolved, fail without revealing inaccessible existence.
- **Organization membership**: when used as an authority source or derived classification, stale or unavailable membership data must not silently increase access.
- **Database enforcement**: RLS and grants project least-privilege row access; provider policy syntax does not own Role or Capability meaning.
- **Application layer**: coordinates authorization-sensitive use cases and maps denied decisions to safe delivery responses.
- **Delivery layer**: may hide or explain actions for usability but cannot authorize them.

## Alternatives and removal test

### UI-only authorization

This is simple but predicts direct requests, stale clients, and alternate delivery paths can bypass restrictions.

### Scattered Role checks

Checking `role === 'admin'` or `role !== 'viewer'` throughout routes, SQL, and components duplicates meaning and makes delegation rules inconsistent.

### Database as the only Domain model

RLS is essential enforcement, but making SQL policy expressions the only business language couples product meaning to persistence and weakens provider-neutral testing and explanation.

### External authorization service now

A separate policy service adds network, consistency, deployment, and failure boundaries before the current Role/Capability model has proven insufficient.

Removing this contract would leave no single owner for access decisions or explanations.

## Falsification conditions

Reopen the model when:

- real decisions require resource-level grants as the common case;
- additive Capability sources cannot express required restrictions without explicit deny;
- fixed Role bundles cause pervasive exceptions;
- group principals require delegation or revocation behavior incompatible with direct User grants;
- policy caps cannot be separated from grants; or
- Domain and RLS cannot implement the same decisions without duplicated, contradictory logic.

## Minimum discriminating tests

1. A User with no accepted authority source cannot read a private Repository.
2. Viewer, Contributor, Manager, and Admin receive exactly their defined Capabilities.
3. A Manager can manage permitted lower Roles but cannot create, alter, or remove Manager/Admin authority unless an accepted delegation rule allows it.
4. Changing only UI context cannot change access for the same actor and Repository.
5. A direct request to a hidden UI action is denied server-side.
6. Grant attribution differing from the authenticated actor is rejected.
7. Domain tests and database tests produce the same decision matrix for representative actors, Roles, and targets.
8. Introducing a second authority source must not require Role-name conditionals outside the owning contract.
