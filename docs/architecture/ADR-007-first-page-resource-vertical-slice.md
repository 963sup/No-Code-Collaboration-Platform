# ADR-007: First Page Resource vertical slice

- Status: Accepted
- Date: 2026-08-12
- Decision owner: Repository owner
- Affected scopes: Domain Resource and authority policy, Application commands and ports, Supabase adapter, declarative schema, RLS-backed persistence, Activity projection, Repository workspace, tests

## Decision

Implement Page as the first complete Repository-scoped Resource vertical slice.

```text
Authenticated Actor
↓
Accessible Repository
↓
Repository Authority Sources
↓
Domain Effective Role + Capability Decision
↓
CreatePage / UpdatePage
↓
User-scoped Supabase Adapter
↓
Resource row + RLS
↓ same transaction
resource.created / resource.updated fact
↓
Resources and Activity projections
```

Page has a title and an exact plain-text content shape:

```json
{ "body": "..." }
```

The existing `resources` row remains the persistence boundary while Page is the only accepted Resource kind. JSON is constrained to exactly one string `body` field. This is reversible and does not approve a generic Resource JSON runtime.

Create/update authorization is an explicit Application decision using provider-neutral authority-source facts and Domain Capability policy. RLS independently enforces the database boundary. Updates use the previous `updated_at` timestamp as optimistic concurrency evidence. Meaningful updates emit actor-attributed immutable facts in the same PostgreSQL transaction; no-op updates emit none.

## Problem and success condition

The platform has Repository navigation, Roles, Capabilities, RLS, Resource rows, and creation-event storage, but no user-visible work unit can be created, loaded, edited, and historically explained through the full architecture. The Resources UI lists speculative kinds rather than executable state.

Success requires:

- Page is the only presented Resource kind;
- Contributor creates and updates; Viewer and outsider cannot;
- Application and RLS return the same decision;
- Organization governance authority and direct grants combine through Domain truth;
- malformed content fails at PostgreSQL;
- stale evidence cannot overwrite newer state;
- create/update facts are atomic; and
- Resources and Activity surfaces render real projections.

## Evidence ledger

### Observations

- `resource_kind` contains only `page`.
- Existing UI advertises Document, Collection, Task, and Workflow without executable models.
- `resources` already has identity, Repository containment, title, content, creator, and timestamps.
- RLS already enforces Resource create/read/update.
- `resource.created` already uses a same-database trigger.
- The Organization owner/admin to Repository-admin rule previously existed in SQL but not executable Domain policy.

### Constraints

- This stacked change depends on ADR-006 fail-closed Organization/Repository lifecycle behavior until its prerequisite PR is merged.
- No Supabase Cloud project is provisioned; verification is local/CI only.
- Generated DB types are not hand-edited and should not change because columns do not change.
- Web cannot import Domain or Supabase directly.
- Server Actions are public mutation boundaries and recheck identity/authority independently of UI visibility.

### Assumptions

- Plain text is enough to prove the collaboration causal chain.
- One Resource row is sufficient for one subtype.
- Timestamp equality is sufficient initial optimistic concurrency evidence.
- Request-scoped Supabase cookies provide actor context for RLS and event attribution.

### Unknowns

- Rich blocks, comments, files, search, realtime editing, and workflow integration.
- Command IDs, durable idempotency, numeric versions, and merge behavior.
- Archive, restore, move, copy, and deletion.
- Whether Activity Event later becomes the more general Collaboration Fact term.

### Value choices

- Depth of one loop over breadth of placeholders.
- Explicit Capability decisions over RLS-only business semantics.
- Database constraints and same-transaction facts as defense in depth.
- Visible Activity projection rather than unexplained stored events.
- Reversible persistence until a second subtype provides comparative evidence.

## Minimum sufficient model

```text
Page
├─ stable Resource ID
├─ one Repository
├─ title
├─ exact body content
├─ creator
├─ created_at
└─ updated_at concurrency evidence

Authority Sources
├─ Organization Role
└─ Direct Repository Role

Effective Repository Role
↓
Explicit Capability Check
↓
Accepted Page Transition
↓
Resource row + Activity Event
```

## Enforcement projection

### Domain

- validates Page title/content;
- combines Organization governance authority with direct Repository Role;
- evaluates `resource.create` and `resource.update`.

### Application

- establishes Actor;
- resolves accessible Repository;
- reads provider-neutral authority facts;
- makes Domain decision;
- validates transition;
- requests persistence through Page ports.

### Supabase adapter

- maps Rows to Page and Activity projections;
- reads Organization membership and direct grant facts;
- performs Repository-filtered reads and timestamp-guarded update;
- uses request actor session, never service-role bypass.

### PostgreSQL

- constrains Page JSON to one string `body`;
- enforces creator attribution and Capabilities through RLS;
- updates timestamps;
- records meaningful update facts with `auth.uid()` atomically;
- excludes Page body from facts.

### Delivery

- validates form input and rechecks authorization;
- lists real Pages and exposes only accepted transitions;
- presents changed-state/authority failures;
- renders immutable activity facts;
- never treats selected context as authority.

## Alternatives rejected

- **Team Principal first**: expands authority before Repository contains useful work.
- **Enterprise policy first**: proves governance but not no-code collaboration value.
- **Multiple Resource kinds**: hides whether the shared model is valid.
- **RLS-only authorization**: protects rows but cannot own/explain business decisions.
- **Application-only authorization**: alternate Data API paths bypass it.
- **Dedicated Page table now**: adds multi-row state without comparative subtype evidence.
- **Unconstrained JSON**: creates an opaque bucket.
- **Realtime/CRDT**: adds distributed synchronization before demand.
- **Generic event bus**: adds infrastructure before same-database facts prove insufficient.

## Consequences

Benefits:

- Repository becomes an executable no-code collaboration container.
- Effective authority semantics move into Domain truth.
- Mutations have two independent authorization boundaries.
- State/history cannot diverge through ordinary writes.
- Placeholder kinds disappear.
- A second subtype now has a concrete comparison model.

Costs and risks:

- mutations perform several authority reads;
- Page JSON remains in the shared row;
- timestamp concurrency reports conflict but does not merge;
- authority reads may need optimization as sources grow;
- event payloads may need versioning;
- a future subtype may require storage migration.

## Falsification conditions

Reopen if Domain/RLS disagree, a second subtype leaks Page conditions into generic code, timestamp concurrency fails measured workloads, one row cannot satisfy Page requirements, same-database facts cause unacceptable contention, or facts cannot meet privacy/audit/recovery requirements.

## Minimum discriminating test

1. Contributor creates a Page and receives its stable route.
2. Viewer direct mutation is denied.
3. Contributor edits title/body with matching evidence.
4. Stale update changes nothing.
5. Database rejects malformed content and forged creator.
6. Create/update each emit one actor fact; no-op emits none.
7. Page and Activity projections render.
8. Anonymous hard navigation preserves complete `next` URL.
9. Domain, Application, pgTAP, production build, and browser checks pass on exact head.
