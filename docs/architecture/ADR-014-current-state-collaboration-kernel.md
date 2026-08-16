# ADR-014: Current-state collaboration kernel

- Status: Accepted
- Date: 2026-08-16
- Decision owner: Product, Domain, and Architecture
- Supersedes: ADR-013; clarifies ADR-012 decision item 10

## Context

Repository collaborators need to mutate structured work safely, resolve concurrent edits, explain who changed what, and sometimes inspect retained prior state. Those are real no-code collaboration problems.

The previous model inferred source-control-shaped Product concepts from those needs. That inference was unnecessary. The platform already has a smaller model:

- concrete Resource commands own valid mutations;
- Repository authorization decides whether the Actor may issue a command;
- expected revision or transaction serialization resolves concurrency;
- current Resource state is authoritative;
- Activity Event records accepted action Evidence.

## Decision

The collaboration mutation kernel is:

```text
Actor + Repository Authority + Concrete Resource Command + Expected Revision
↓
Accepted State Transition
↓
Authoritative Current State + Activity Event
```

Rules:

1. A failed command changes no state and records no success event.
2. Expected Revision is a concurrency precondition, not Product history identity.
3. Activity Event is immutable Evidence, not current state or a user-authored change object.
4. Real-time coauthoring or transaction serialization may replace explicit revision checks for a proven Resource; neither creates alternate state lines.
5. Retained prior states require an independent retention, recovery, audit, or regulatory contract.
6. State Comparison is derived read presentation only after both states are independently justified and authorized.
7. No generic history graph, alternate state line, convergence operation, movable current-state pointer, or source-control-shaped Product primitive is admitted.
8. Future typed transfer and Repository duplication are separate Product candidates. They are not admitted by this decision.

## Concurrency law

```text
read revision r
→ issue command expecting r
→ accept only if current revision still equals r
→ write next state and Activity Event atomically
```

A stale command fails closed and must be re-evaluated against current state. The Product does not expose a later merge-like operation to repair concurrent state lines.

## Evidence law

Activity Event may record actor, action, target, time, command identity, and safe explanatory metadata required by the accepted contract.

It must not become:

- the authoritative Resource state;
- a generic snapshot store by implication;
- a user-editable history node;
- a Notification or Feed item;
- an authority source; or
- a container for secrets or unrestricted Resource content.

Feed, Notification, Audit, and Analytics remain projections over sufficient Evidence.

## Optional State Comparison

Comparison is admitted only after a concrete use case proves why two states are retained.

If admitted:

```text
State Comparison
= authorized projection(state A, state B)
```

It owns no identity, lifecycle, mutation, authority, or patch language. It must redact anything unavailable in either input state.

## Future typed transfer gate

A typed transfer requires a separate decision proving explicit endpoints, source and destination authority, schema validation, idempotency, redacted Evidence, secret references, and no executable transformation.

No connector, endpoint, payload, retry, credential, route, API, or UI follows from this ADR.

## Future Repository duplication gate

A duplication use case must create an independent Repository with an explicit destination Owner and independent authority.

It may copy only allowlisted safe state. It must exclude Grants, credentials, Sessions, secrets, installation tokens, and continuing upstream authority or synchronization.

Origin Evidence, if retained, explains creation only.

## Supersession

- ADR-013 is fully superseded as current Product/Architecture truth.
- ADR-012 decision item 10 is current again in substance: source-control-shaped Product surfaces are rejected; any future typed movement or copying capability requires new target vocabulary and a separate decision.
- ADR-011 remains current for URL/IA and responsive presentation only; it admits no data-history model.

## Alternatives rejected

### Preserve the previous envelope but defer implementation

Rejected. A deferred implementation can still poison canonical language, entity discovery, authorization reasoning, and future UI architecture.

### Keep generic names but remove external aliases

Rejected. Renaming preserves the same hidden ancestry, alternate-line, convergence, and upstream-relationship assumptions.

### Store every mutation as a Product history object

Rejected. Accountability belongs to Activity Event; recovery/retention must be independently proven. A universal Product history graph is not necessary.

### Allow last-write-wins everywhere

Rejected. It silently loses concurrent work and cannot explain stale-command failure. Each Resource must declare serialization, real-time, or Expected Revision behavior.

## Minimum discriminating tests

1. An authorized command at the expected revision changes current state and records required Activity Event atomically.
2. A stale command changes neither state nor success Evidence.
3. Changing selected Context or comparison input does not change authority.
4. Activity Event cannot be edited into current Resource truth.
5. A two-user edit scenario resolves through serialization, real-time coauthoring, or stale-command rejection without creating alternate Product state lines.
6. A comparison Projection owns no data or authority and reveals only mutually authorized fields.
7. A future duplication fixture excludes Grants, credentials, Sessions, secrets, installation tokens, and synchronization.
8. A future typed transfer fixture rejects arbitrary endpoints, executable transformation, secret material, and source/destination authority bypass.

## Falsification

Revisit only when a demonstrated no-code workflow cannot be expressed safely through concrete commands, current state, concurrency preconditions, Activity Event Evidence, and independently justified retained states without pervasive special cases.
