# ADR-007: First Page Resource vertical slice

- Status: Accepted
- Date: 2026-08-12
- Decision owner: Repository owner
- Affected scopes: Product and Domain authority semantics, Domain Resource policy, Application commands and ports, Supabase adapter, declarative schema, RLS-backed persistence, Activity projection, Repository workspace, tests

## Decision

Implement Page as the first complete Repository-scoped Resource vertical slice.

```text
Authenticated Actor
↓
Accessible Repository
↓
Repository Authority Sources
├─ Organization owner/admin governance relationship
└─ Direct User Repository Grant
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

Organization owner/admin governance authority is an accepted Repository authority source for Repositories owned by that Organization. It derives Repository `admin` without fabricating a direct Grant. Ordinary Organization membership contributes no Repository Role. This formalizes existing ownership/administration behavior in Product and Domain truth instead of allowing SQL to own it implicitly.

Page has a title and an exact plain-text content shape:

```json
{ "body": "..." }
```

At the time of this decision, the existing `resources` row remained the persistence boundary while Page was the only accepted Resource kind. JSON is constrained to exactly one string `body` field. This remains the Page persistence decision; later Product admission of Issue and Discussion does not authorize storing either through this generic Resource JSON shape.

Create/update authorization is an explicit Application decision using provider-neutral authority-source facts and Domain Capability policy. RLS independently enforces the database boundary. Updates use the previous server-managed `updated_at` timestamp as optimistic concurrency evidence. Only a meaningful title/content change advances that evidence and emits an actor-attributed immutable fact; a no-op update advances neither. Meaningful state change and its fact commit in the same PostgreSQL transaction.

## Problem and success condition

The platform has Repository navigation, Roles, Capabilities, RLS, Resource rows, and creation-event storage, but no user-visible work unit can be created, loaded, edited, and historically explained through the full architecture. The Resources UI lists speculative kinds rather than executable state.

Success requires:

- Page is the only presented Resource kind;
- Contributor creates and updates; Viewer and outsider cannot;
- Application and RLS return the same decision;
- Organization owner/admin governance authority and direct grants combine through Domain truth;
- ordinary Organization membership does not imply Repository authority;
- malformed content and whitespace-only titles fail at PostgreSQL;
- stale evidence cannot overwrite newer state;
- no-op updates cannot manufacture a new concurrency version or fact;
- create/update facts are atomic; and
- Resources and Activity surfaces render real projections.

## Evidence ledger

### Observations

- `resource_kind` contains only `page`.
- Existing UI advertises Document, Collection, Task, and Workflow without executable models.
- `resources` already has identity, Repository containment, title, content, creator, and timestamps.
- RLS already enforces Resource create/read/update.
- `resource.created` already uses a same-database trigger.
- Organization owner/admin already administer Repository creation and settings, and SQL has historically mapped both to Repository admin; leaving that mapping only in SQL would violate the Product truth boundary.
- ADR-006 is now merged into `main`, so Organization/Repository hard deletion is fail-closed while Resource destructive lifecycle remains separately open.

### Constraints

- No Supabase Cloud project is provisioned; verification is local/CI only.
- Generated DB types are not hand-edited and should not change because columns do not change.
- Web cannot import Domain or Supabase directly.
- Server Actions are public mutation boundaries and recheck identity/authority independently of UI visibility.
- Optimistic concurrency evidence must be server-managed; an authenticated client cannot directly assign `resources.updated_at`.

### Assumptions

- Plain text is enough to prove the collaboration causal chain.
- One Resource row is sufficient for one subtype.
- A server-managed timestamp is sufficient initial optimistic concurrency evidence for the current single-row transition.
- Request-scoped Supabase cookies provide actor context for RLS and event attribution.
- Additive direct User authority plus Organization owner/admin governance authority is sufficient for this slice.

### Unknowns

- Rich blocks, comments, files, search, realtime editing, and workflow integration.
- Command IDs, durable idempotency, numeric versions, and merge behavior.
- Archive, restore, move, copy, and deletion.
- Whether Activity Event later becomes the more general Collaboration Fact term.
- Whether Organization admin remains the correct governance-derived Repository authority when more granular Organization administration appears.

### Value choices

- Depth of one loop over breadth of placeholders.
- Explicit Capability decisions over RLS-only business semantics.
- Organization governance authority remains distinct from direct Principal Grants.
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
└─ server-managed updated_at concurrency evidence

Authority Sources
├─ Organization owner/admin governance relationship
└─ Direct User Repository Grant

Effective Repository Role
↓
Explicit Capability Check
↓
Accepted Page Transition
↓
Resource row + Activity Event
```

## Enforcement projection

### Product / Domain

- Product declares Organization owner/admin governance authority as a distinct accepted authority source, not a fabricated Grant;
- Domain validates Page title/content;
- Domain combines Organization governance authority with direct Repository Role;
- Domain evaluates `resource.create` and `resource.update`.

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
- rejects whitespace-only Page titles;
- enforces creator attribution and Capabilities through RLS;
- owns `updated_at` mutation and advances it only for meaningful title/content changes;
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
- **Fabricated direct Grants for Organization governors**: duplicates the ownership/administration relationship and makes revocation/explanation less coherent.
- **RLS-only authorization**: protects rows but cannot own/explain business decisions.
- **Application-only authorization**: alternate Data API paths bypass it.
- **Dedicated Page table now**: adds multi-row state without comparative subtype evidence.
- **Unconstrained JSON**: creates an opaque bucket.
- **Realtime/CRDT**: adds distributed synchronization before demand.
- **Generic event bus**: adds infrastructure before same-database facts prove insufficient.

## Consequences

Benefits:

- Repository becomes an executable no-code collaboration container.
- Effective authority semantics move into Product/Domain truth.
- Mutations have two independent authorization boundaries.
- Meaningful state/version/history advance together.
- Placeholder kinds disappear.
- A second subtype now has a concrete comparison model.

Costs and risks:

- mutations perform several authority reads;
- Page JSON remains in the shared row;
- timestamp concurrency reports conflict but does not merge;
- authority reads may need optimization as sources grow;
- event payloads may need versioning;
- a future subtype may require storage migration;
- Organization admin governance authority may prove too broad as administrative responsibilities become more granular.

## Falsification conditions

Reopen if Domain/RLS disagree, Organization admin proves too broad as a Repository authority source, a second subtype leaks Page conditions into generic code, timestamp concurrency fails measured workloads, one row cannot satisfy Page requirements, same-database facts cause unacceptable contention, or facts cannot meet privacy/audit/recovery requirements.

## Minimum discriminating test

1. Contributor creates a Page and receives its stable route.
2. Organization owner/admin can perform the same accepted Page transition without a fabricated direct Grant; ordinary member cannot.
3. Viewer direct mutation is denied.
4. Contributor edits title/body with matching evidence.
5. A no-op save preserves `updated_at` and emits no update fact.
6. Stale update changes nothing.
7. Database rejects malformed content, whitespace-only titles, forged creator, and direct client mutation of concurrency evidence.
8. Create/update each emit one actor fact; no-op emits none.
9. Page and Activity projections render through an authenticated browser flow.
10. Anonymous hard navigation preserves complete `next` URL.
11. Domain, Application, pgTAP, production build, and browser checks pass on the exact `main` merge candidate.
