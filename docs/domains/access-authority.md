# Domain Candidate: Access Authority

- Status: Candidate
- Contract owner: `docs/PRODUCT.md` and `docs/ONTOLOGY.md`
- Last reviewed: 2026-08-16

## Problem

For one authenticated User and one stable Repository target, the platform must determine which Capabilities are allowed, explain the causal sources of that authority, and change explicit authority without allowing presentation state, Membership, responsibility, or participation to become authorization.

```text
Identity establishes a trusted Actor.
Access resolves effective authority.
```

## Canonical terms

```text
Actor
= authenticated User performing the request

Principal
= subject that may receive explicit authority

Grant
= explicit Principal → Repository authority Relationship carrying one Role

Role
= named Capability bundle used for assignment and explanation

Capability
= atomic authorization decision vocabulary on one defined target

Collaborator(user, repository)
= derived classification: effective authority includes repository.view
```

Current persisted Principal support is User only. Team and App remain deferred until a real workflow proves durable group or machine authority.

`Collaborator` is never a Grant type, table, Role, identity subtype, or authority source. A User becomes a collaborator only after ownership, governance, explicit Grant, and visibility rules resolve to effective Repository access.

For an Organization-owned Repository:

```text
OutsideCollaborator(user, organization)
= Collaborator(user, repository owned by organization)
AND NOT Member(user, organization)
```

This is also a derived classification. It grants nothing.

## Accepted authority sources

```text
User-owned Repository
+ Actor is owner User
→ governance-derived Admin authority

Organization-owned Repository
+ Actor Organization role ∈ {admin, owner}
→ governance-derived Admin authority for that Organization's Repository

Direct User Grant
→ assigned Repository Role

Public visibility
→ accepted read/participation baseline only
```

Ordinary Organization Membership contributes no Repository Role. Assignment, mention, comment participation, profile tab, selected Context, planning row, Notification state, comparison input, or UI visibility contributes no authority.

## Current Roles and Capabilities

Current Repository Roles:

```text
read | triage | write | maintain | admin
```

Capability is the decision truth. Role rank may explain nested bundles but does not authorize delegation.

Current Capability families include:

- Repository: `repository.view`, `repository.manage`, `repository.access.manage`
- Page: `resource.view`, `page.create`, `page.update`
- Issue: `issue.create`, `issue.comment`, `issue.edit`, `issue.manage`
- Discussion: `discussion.create`, `discussion.comment`, `discussion.comment.locked`, `discussion.edit`, `discussion.moderate`, `discussion.announce`

## Effective authorization

```text
Actor
→ resolve stable Repository
→ inspect typed User/Organization Owner Relationship
→ collect accepted ownership/governance authority
→ collect explicit Direct User Grant
→ add accepted visibility baseline
→ apply governance constraints
→ apply target-state preconditions
→ Capability decision + explanation
```

Explanation may expose accepted causal sources. It must not fabricate a persisted effective-access cache or treat a derived collaborator label as the cause.

## Direct User Grant lifecycle

Current explicit authority relationship:

```text
DirectUserGrant
├─ repositoryId
├─ userId
├─ role
├─ grantedBy
└─ createdAt
```

A Direct User Grant mutation is a controlled authority transition:

```text
Actor authority
+ target Repository
+ target User
+ expected current Role
+ proposed Role or revocation
↓
accepted Grant transition
+ Activity Event Evidence
```

Invariants:

1. Direct Grant management requires `repository.access.manage` and is currently Admin-only.
2. The target is one stable User and one stable Repository.
3. A Direct User Grant never replaces Repository ownership.
4. The acting User cannot delegate a Direct Grant to itself.
5. Expected current Role is a real compare-and-swap precondition; stale state changes nothing and emits no success Evidence.
6. Target existence is not disclosed before access-management authority is established.
7. `grantedBy` equals the authenticated Actor and cannot be client supplied.
8. Personal-owner Repository Grants remain constrained by the accepted role policy; Organization ownership does not authorize ordinary members by implication.
9. Raw table DML is not an alternate command API.
10. Successful Grant state and required Activity Event Evidence commit atomically.

## Non-confusion rules

```text
Authentication ≠ authorization
Organization Membership ≠ Repository Grant
Repository Owner ≠ synthetic Grant
Role ≠ Capability decision
Collaborator ≠ Direct User Grant
Outside collaborator ≠ identity subtype
Assignment / mention / participation ≠ authority
Context / Projection / UI visibility ≠ authority
Activity Event ≠ current Grant state
```

## Projection boundaries

- Web access-management UI presents Direct User Grants, not “direct collaborators.”
- A User with resulting effective access may be displayed as a collaborator in a derived read view.
- Search, planning, Notification, Feed, Audit, and analytics may project authority-safe facts but cannot create or change Grants.
- SQL and RLS independently enforce reachability and transitions; they do not redefine Product vocabulary.

## Minimum discriminating tests

1. Personal Repository Owner receives Admin authority without a fabricated Grant row.
2. Organization owner/admin authority applies only to Repositories owned by that Organization.
3. Ordinary Organization Membership produces no Repository Role.
4. Direct User Grant independently contributes its Role and Capabilities.
5. Removing the Direct User Grant removes that causal source and may remove derived collaborator status.
6. Changing selected Context or profile/planning state changes no authority.
7. Assignment or mention cannot make an unauthorized User a collaborator.
8. Read, Triage, Write, and Maintain cannot enumerate or mutate Direct User Grants.
9. A stale expected Role changes zero rows and emits no success Evidence.
10. The acting User cannot grant itself authority.
11. Unauthorized target lookup leaks no User existence.
12. The last accepted Organization owner cannot be removed.
13. An inaccessible Repository cannot be inferred through access-management errors.
14. Domain decision, Application orchestration, command RPC, RLS, constraints, and tests agree.

## Falsification

Revisit this boundary only when a proven workflow requires a new Principal kind, explicit deny precedence, custom Roles, nested durable groups, cross-Organization constraints, or another authority source that cannot be represented without pervasive exceptions. Do not generalize persistence before that evidence exists.
