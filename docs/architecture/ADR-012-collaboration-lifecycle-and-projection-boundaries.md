# ADR-012: Collaboration lifecycle and projection boundaries

- Status: Accepted
- Date: 2026-08-15
- Last reviewed: 2026-08-16

## Clarification

ADR-014 clarifies mutation semantics: concrete Resource commands, Expected Revision, accepted State Transition, authoritative Current State, and separate Activity Event Evidence are the current kernel. No source-control-shaped data envelope is admitted.

## Context

Mature collaboration needs actionable work, shared-understanding conversations, planning, notifications, search, public discovery, and integration discovery. The Repository axiom rejects Source Code and software-development-specific Product capabilities.

## Decision

1. Issue and Discussion are dedicated Repository-contained Resource lifecycles with Repository-local atomic numbers, subtype invariants, revision-aware commands, Repository Capability decisions, and same-transaction Activity Event Evidence.
2. Issue relationships use Repository-scoped labels, access-eligible User assignees, and flat comments. Assignment grants no authority.
3. Discussion uses fixed categories, independent closed/locked state, flat comments, and question-only Answer selection.
4. Application Ports remain provider-neutral. Supabase adapters, command functions, constraints, and RLS independently enforce concrete transitions.
5. Project-style planning is derived only. No Project owner, collaboration Container, or authority boundary exists.
6. Notification is Actor-specific delivery state derived from source Evidence and explicit recipient relationships. Reads revalidate Repository access.
7. Search authorizes before ranking, count, or snippet. Explore reads public Repository metadata only.
8. Marketplace is a reviewed metadata catalog. App/Installation, credentials, binding, and connector execution remain absent.
9. Web presentation uses `live | preview | deferred` availability for honest capability labeling. Availability is never authorization input.
10. Source-control-shaped Product surfaces, arbitrary execution, code review, and generic version-control or automation engines are rejected. Any future typed movement or Repository copying capability requires new target vocabulary, a separate Product decision, and discriminating tests.

## Invariants

- Repository remains the only primary collaboration and authorization Container.
- Context, planning rows, ranking, delivery state, comparison selection, and catalog metadata create no authority.
- Raw table mutation is not a command API; UI visibility is not enforcement.
- Projection changes cannot rewrite Artifact state or source Evidence.
- Private Repository existence cannot influence public Explore or unauthorized Search/Notification output.
- No implemented route or schema introduces Source Code, arbitrary execution, or source-control-shaped Product semantics.

## Consequences

Schema and executable work expand only for accepted Resource and Projection contracts. Preview routes add no fabricated records or success. Tests cover stale commands, command/RLS denial, access revocation, authorization-before-ranking, question-only Answer, Projection non-mutation, responsive navigation, and absence of code capability.

## Falsification

Revisit only with direct evidence of durable group authority, cross-Organization constraint, machine Principal action, search scale failure, or a no-code workflow that falsifies an accepted Resource or Projection lifecycle.
