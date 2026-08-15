# ADR-012: Collaboration lifecycle and projection boundaries

- Status: Accepted
- Date: 2026-08-15

## Partial supersession

ADR-013 supersedes only Decision item 10's rejection or deferral of the no-code Data semantic envelope. Source Code, Git mechanics, code review, arbitrary execution, and CI/CD remain rejected; all other decisions below remain current. The original item is retained as historical decision context.

## Context

The GitHub evidence inventory proves that mature collaboration needs cross-surface navigation, actionable work, shared-understanding conversations, planning, notifications, search, public discovery, and integration discovery. The Product axiom rejects Source Code and every software-development-specific capability. The previous executable baseline proved Page writes and Issue reads but left Issue commands, Discussion lifecycle, notification recipients, search ranking, and Project identity open.

The current task explicitly supplies complete v1 Product choices. Leaving those choices to adapters or UI would create competing Product truth.

## Decision

1. Issue and Discussion are dedicated Repository-contained Resource lifecycles with Repository-local atomic numbers, subtype invariants, expected-version mutation, Repository Capability decisions, and same-transaction Activity Evidence.
2. Issue relationships use dedicated Repository-scoped labels, access-eligible User assignees, and flat comments. Assignment never grants authority.
3. Discussion uses fixed categories, independent closed/locked state, flat comments, and question-only Answer selection.
4. Provider-neutral Application Ports are implemented by Supabase adapters. PostgreSQL command functions and RLS independently enforce authenticated Actor, Repository scope, Capability, transition, and command provenance.
5. Project-style planning is derived only. No Project entity, table, owner, command, saved view, or detail identity exists.
6. Notification is Actor-specific delivery state derived from source Evidence and explicit recipient relationships. Source Evidence is immutable and every read revalidates Repository access.
7. Search is a PostgreSQL full-text projection. Repository authorization filters candidates before ranking, count, or snippet. Explore reads public Repository metadata only.
8. Integrations is a reviewed metadata catalog. Team, Enterprise, App/Installation, OAuth, credentials, binding, and connector execution are absent in this milestone.
9. Web presentation uses a static `live | preview | deferred` Surface manifest for navigation and honest capability labeling. It is never authorization input.
10. GitHub code-product surfaces are rejected. Future typed data proposals/capsules require new target vocabulary and a new decision.

## Evidence and assumptions

- Evidence: the dated, manifest-indexed responsive GitHub observations under `.playwright-mcp/github`, existing Page command/RLS tests, owner-neutral Repository authorization, and the executable Issue read slice.
- Assumption: PostgreSQL full-text search satisfies v1 measured scale. This may change infrastructure, not authorization or ranking contracts.
- Assumption: flat comments and fixed Discussion categories satisfy v1. Contrary real workflows must falsify the relevant Domain contract before expansion.

## Invariants

- Repository remains the only collaboration Container and authority boundary for contained work.
- Presentation Context, planning rows, ranking, delivery state, and catalog metadata never create authority.
- Raw table DML is not a command API; UI visibility is not enforcement.
- Source Evidence and Artifact state cannot be rewritten by delivery/projection changes.
- Private Repository existence cannot influence public Explore results or unauthorized Search/Notification output.
- No implemented route or schema introduces Source Code, Git, arbitrary execution, or code review.

## Alternatives rejected

- Vertical-slice-only navigation hides cross-surface IA and responsive composition until too late.
- Fake data or success controls conflate presentation readiness with capability.
- A generic Resource JSON table weakens subtype invariants and query/concurrency lifecycles.
- Project, Team, Enterprise, or App supertypes create ownership and authority before proven lifecycle needs.
- Client-side ranking or authorization risks unauthorized count/snippet influence and provider leakage.

## Consequences

- Schema work expands only for Issue, Discussion, Notification delivery, and search/index projections after target contracts are updated.
- Breadth-first preview routes add no schema and label availability honestly.
- Tests cover stale writes, command/RLS denial, access revocation, authorization-before-ranking, question-only Answer, projection non-mutation, responsive navigation, and absence of code capability.

## Falsification and removal

Revisit only with direct evidence of durable group authority, cross-Organization constraint, machine Principal action, PostgreSQL search scale failure, or a no-code workflow that falsifies the locked subtype lifecycle. Removing any projection must leave Repository Artifacts, authority, and Evidence unchanged.
