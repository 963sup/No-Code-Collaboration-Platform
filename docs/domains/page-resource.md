# Domain Contract: Page Resource

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-14

## Problem owned and success condition

A Repository must contain a real collaborative work unit rather than remain only a navigation and authorization shell.

This contract owns the first Page Resource behavior. It succeeds when an authenticated Actor with the required Repository Capability can create, read, and update a Page through provider-neutral Application use cases; PostgreSQL independently enforces the same Repository boundary; stale updates fail closed; no-op updates preserve concurrency evidence; and every meaningful transition produces immutable historical evidence in the same transaction.

## Evidence ledger

### Observations

- Repository Collaboration defines typed User/Organization ownership, Resource containment, and stable Repository identity.
- Access Authority defines `resource.create`, `resource.view`, and `resource.update` Capabilities.
- PostgreSQL stores one `page` Resource kind and records accepted Page facts.
- The prior Resources workspace advertised speculative Resource kinds without a real read or command model and has been removed.
- Current authority combines personal-owner governance, Organization owner/admin governance, and direct User Grants before Capability evaluation.

### Constraints

- Every Page belongs to exactly one Repository.
- Actor identity, Principal authority, UI Context, Repository ownership, and Page state remain distinct.
- Application commands make explicit Domain authorization decisions; RLS remains an independent enforcement boundary.
- Page state and required Activity Event evidence commit atomically.
- Domain and Application remain independent of Supabase Rows, clients, generated types, and Postgres syntax.
- Page optimistic-concurrency evidence is server-managed and cannot be assigned directly by authenticated clients.
- Page deletion, archive, restore, move, copy, sharing, comments, realtime editing, and rich blocks are not accepted by this slice.
- An unaccepted Page lifecycle operation is absent from current Capability vocabulary rather than carried as an unusable permission.

### Assumptions

- A title and plain-text body are sufficient to discriminate the first useful Page lifecycle.
- One exact Page content shape in the existing Resource row is sufficient while Page is the only accepted Resource kind.
- The prior `updated_at` value is sufficient optimistic concurrency evidence for the current single-row transition when only meaningful state changes advance it.
- Personal-owner governance, Organization owner/admin governance, and direct User authority are sufficient for this slice.

### Unknowns

- Rich block structure, attachments, comments, search, and simultaneous editing.
- Whether a second Resource kind can share the Resource envelope without subtype rules leaking into generic code.
- Whether Page needs a dedicated table for size, indexing, query, or lifecycle behavior.
- Whether numeric versions, command identifiers, or idempotency keys must replace timestamp evidence.
- Resource archive, retention, restore, redaction, and lawful deletion semantics.

### Value choices

- Prefer one complete vertical slice over several speculative Resource kinds.
- Prefer an exact content shape over an opaque generic JSON bucket.
- Prefer explicit Capability checks over Role-name checks in Application code.
- Prefer actor-attributed immutable facts over inferring history from current state.
- Prefer no-op semantic stability: no state change means no version change and no historical fact.
- Prefer reversible persistence until a second subtype supplies comparative evidence.

## Boundary and owner

This contract owns:

- Page title and body invariants;
- Page create and update transitions;
- optimistic concurrency evidence;
- Page-to-Repository containment;
- Page transition fact meaning; and
- Page read projections used by Repository presentation.

This contract does not own:

- Repository identity, ownership, visibility, or lifecycle;
- authentication credential lifecycle;
- Principal membership, Grants, Role bundles, or delegation;
- generic document/plugin runtimes;
- Activity-feed presentation beyond Page event meaning; or
- Supabase, PostgreSQL, Next.js, and UI mechanics.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Page | Repository-scoped Resource whose accepted content is a title and plain-text body |
| Page ID | Stable Resource identity |
| Page content | Exact object containing one string field named `body` |
| Page draft | Validated state required to create a blank Page |
| Page update | Validated title/body transition plus expected prior update timestamp |
| Concurrency evidence | Server-managed `updated_at` value identifying the most recently accepted meaningful Page state |
| Changed state | Update rejected because Page state or effective authority no longer matches the command evidence |
| Page fact | Immutable `resource.created` or `resource.updated` Activity Event caused by an accepted transition |

## Entities, relationships, and derived concepts

```text
Repository 1 ── contains ── * Page
Actor      ── performs ────> Page transition
Page transition ── emits ──> Activity Event
```

Page uses the shared Resource identity and containment envelope. It never creates a second ownership or authorization boundary.

Current content is deliberately exact:

```json
{
  "body": "plain text"
}
```

Additional keys are rejected so the first slice cannot silently become a generic `type + json` runtime.

## States and transitions

```text
Absent
  └── CreatePage ──> Active blank Page

Active Page
  ├── UpdatePage (meaningful change) ──> Active updated Page + new concurrency evidence
  └── UpdatePage (no-op) ──────────────> same Active Page + same concurrency evidence
```

Create requires an authenticated Actor, accessible Repository, effective Role containing `resource.create`, valid title, and creator attribution equal to the Actor.

Update requires an authenticated Actor, accessible Repository, effective Role containing `resource.update`, valid Page identity/title/body, matching expected `updated_at`, and Page identity scoped to the same Repository.

No delete, archive, restore, move, copy, publish, sharing, or other lifecycle transition is accepted.

## Invariants

1. Every Page belongs to exactly one Repository.
2. Page ID and Repository ID, not route labels or selected Context, determine the authorization target.
3. Page title contains 1 to 240 non-whitespace characters after trimming; a whitespace-only title is invalid.
4. Page content is exactly one object with one string field named `body`.
5. Create and update require their explicit Repository Capabilities.
6. Personal-owner governance, Organization owner/admin governance, and direct Repository Grants combine through Access Authority before Capability evaluation; ordinary Organization Membership contributes no Repository Role.
7. Application authorization and RLS agree; either being more permissive is a defect.
8. Creator attribution equals the authenticated Actor.
9. `updated_at` is server-managed concurrency evidence and cannot be directly assigned by an authenticated client.
10. Stale optimistic concurrency evidence cannot overwrite newer state.
11. A meaningful title/content change advances `updated_at` and its required fact atomically.
12. A no-op update advances neither `updated_at` nor `resource.updated`.
13. Activity facts do not copy Page body content.
14. Page deletion is not an accepted operation and therefore has no current Capability, UI command, table DELETE privilege, or RLS delete policy.

## Historical evidence

Accepted immutable facts:

- `resource.created` with Page kind and title;
- `resource.updated` with Page kind, current title, and booleans identifying title/content change.

Page body is excluded from event payloads to avoid duplicating potentially sensitive content into historical projections.

The Activity surface is a projection of facts. It does not own Page state or authorization. Raw historical Activity requires authenticated Repository read authority; public Repository visibility does not automatically publish raw evidence payloads.

## Dependencies and failure behavior

- **Identity Provider**: missing Actor fails closed.
- **Repository Collaboration**: inaccessible Repository creates or changes nothing.
- **Access Authority**: unresolved or insufficient authority fails before persistence; a concurrent revocation is still rejected by RLS.
- **Page persistence**: malformed content and whitespace-only titles are rejected by database constraints even if another adapter bypasses Application validation.
- **Activity recording**: required fact failure aborts the Page transition.
- **Concurrency**: stale timestamp returns changed state rather than silently overwriting content; direct client timestamp mutation is denied; no-op saves keep the prior evidence.
- **Delivery**: validates transport input, invokes Application, revalidates projections, and exposes stable errors without direct database access.

## Alternatives and removal test

### Keep Repository presentation as a Resource catalog

This avoids implementation but never proves Repository is a useful collaboration Container.

### Implement several Resource kinds together

This creates breadth while hiding whether the shared model is valid and predicts speculative fields and switches.

### Store arbitrary Page JSON

This is initially flexible but creates an unbounded schema before user-defined content behavior is justified.

### Add a dedicated Page table immediately

This may later be correct, but one single-row subtype does not yet prove an independent storage lifecycle.

### Advance `updated_at` for every SQL UPDATE

This makes a transport-level no-op look like a new Domain version, creating false concurrency conflicts without a matching historical fact.

Removing this contract leaves Repository with ownership, navigation, and authorization but no accepted collaborative work unit.

## Falsification conditions

Reopen when:

- rich Page behavior cannot be expressed without weakly validated JSON;
- timestamp concurrency collides or cannot explain conflicts;
- Page content size/query requirements need independent storage;
- a second Resource kind forces Page-specific conditionals into generic Repository behavior;
- Page transitions require multi-row atomic state; or
- Activity Event semantics cannot meet required audit completeness, privacy, retention, or recovery.

## Minimum discriminating tests

1. Contributor creates a typed Page; Viewer and outsider cannot.
2. Personal Owner and Organization owner/admin resolve to Repository admin without fabricated direct Grants; ordinary Organization member does not.
3. Contributor updates title/body with matching concurrency evidence.
4. A no-op save preserves the same `updated_at` and emits no update fact.
5. Stale update changes nothing.
6. Database rejects malformed content, whitespace-only titles, forged creator attribution, and authenticated mutation of `updated_at`.
7. Create and meaningful update each emit exactly one actor-attributed fact.
8. Pages and authorized Activity surfaces render real projections through the canonical Repository route.
9. Hard navigation to one Page preserves canonical Owner/Repository identity and the correct authentication/authorization result.
10. Domain, Application, pgTAP, build, and browser checks pass on the exact head.
