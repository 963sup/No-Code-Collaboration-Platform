# Domain Contract: Page Resource

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-12

## Problem owned and success condition

A Repository must contain a real collaborative work unit rather than remain only a navigation and authorization shell.

This contract owns the first Page Resource behavior. It succeeds when an authenticated actor with the required Repository Capability can create, read, and update a Page through provider-neutral Application use cases; PostgreSQL independently enforces the same Repository boundary; stale updates fail closed; and every meaningful transition produces immutable historical evidence in the same transaction.

## Evidence ledger

### Observations

- Repository Collaboration defines Resource containment and stable Repository identity.
- Access Authority defines `resource.create`, `resource.view`, and `resource.update` Capabilities.
- PostgreSQL already stores one `page` Resource kind and records `resource.created`.
- The current Resources workspace advertises speculative Resource kinds without a real read or command model.
- Organization owner/admin authority and direct Repository grants are combined in SQL, but that effective-role rule was not executable Domain truth.

### Constraints

- Every Page belongs to exactly one Repository.
- Actor identity, Principal authority, UI context, Repository ownership, and Page state remain distinct.
- Application commands make explicit Domain authorization decisions; RLS remains an independent enforcement boundary.
- Page state and required Activity Event evidence commit atomically.
- Domain and Application remain independent of Supabase Rows, clients, generated types, and Postgres syntax.
- Page deletion, archive, restore, move, copy, sharing, comments, realtime editing, and rich blocks are not accepted by this slice.

### Assumptions

- A title and plain-text body are sufficient to discriminate the first useful Page lifecycle.
- One exact Page content shape in the existing Resource row is sufficient while Page is the only accepted Resource kind.
- The prior `updated_at` value is sufficient optimistic concurrency evidence for the current single-row transition.
- Additive direct User authority plus Organization owner/admin governance authority is sufficient for this slice.

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
- Prefer reversible persistence until a second subtype supplies comparative evidence.

## Boundary and owner

This contract owns:

- Page title and body invariants;
- Page create and update transitions;
- optimistic concurrency evidence;
- Page-to-Repository containment;
- Page transition fact meaning; and
- Page read projections used by the Repository workspace.

This contract does not own:

- Repository identity, ownership, visibility, or lifecycle;
- authentication credential lifecycle;
- Principal membership, grants, Role bundles, or delegation;
- generic document/plugin runtimes;
- Activity feed presentation beyond Page event meaning; or
- Supabase, PostgreSQL, Next.js, and UI mechanics.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Page | Repository-scoped Resource whose accepted content is a title and plain-text body |
| Page ID | Stable Resource identity |
| Page content | Exact object containing one string field named `body` |
| Page draft | Validated state required to create a blank Page |
| Page update | Validated title/body transition plus expected prior update timestamp |
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
  └── UpdatePage ──> Active updated Page
```

Create requires an authenticated actor, accessible Repository, effective Role containing `resource.create`, valid title, and creator attribution equal to the actor.

Update requires an authenticated actor, accessible Repository, effective Role containing `resource.update`, valid Page identity/title/body, matching expected `updated_at`, and Page identity scoped to the same Repository.

No delete, archive, restore, move, copy, publish, sharing, or merge transition is accepted.

## Invariants

1. Every Page belongs to exactly one Repository.
2. Page ID and Repository ID, not route labels or selected context, determine the authorization target.
3. Page title contains 1 to 240 characters after trimming.
4. Page content is exactly one object with one string field named `body`.
5. Create and update require their explicit Repository Capabilities.
6. Organization owner/admin authority and direct Repository grants combine through Domain policy before capability evaluation.
7. Application authorization and RLS agree; either being more permissive is a defect.
8. Creator attribution equals the authenticated actor.
9. Stale optimistic concurrency evidence cannot overwrite newer state.
10. A meaningful create or update and its required fact commit atomically.
11. A no-op update does not fabricate `resource.updated`.
12. Activity facts do not copy Page body content.
13. Page deletion is not exposed merely because a generic Resource delete Capability exists.

## Events and workflows

Accepted immutable facts:

- `resource.created` with Page kind and title;
- `resource.updated` with Page kind, current title, and booleans identifying title/content change.

Page body is excluded from event payloads to avoid duplicating potentially sensitive content into historical projections.

The Activity surface is a projection of facts. It does not own Page state or authorization.

## Dependencies and failure behavior

- **Identity Provider**: missing actor fails closed.
- **Repository Collaboration**: inaccessible Repository creates or changes nothing.
- **Access Authority**: unresolved or insufficient authority fails before persistence; a concurrent revocation is still rejected by RLS.
- **Page persistence**: malformed content is rejected by a database constraint even if another adapter bypasses Application validation.
- **Activity recording**: required fact failure aborts the Page transition.
- **Concurrency**: stale timestamp returns changed state rather than silently overwriting content.
- **Delivery**: validates transport input, invokes Application, revalidates projections, and exposes stable errors without direct database access.

## Alternatives and removal test

### Keep the workspace as a Resource catalog

This avoids implementation but never proves Repository is a useful collaboration container.

### Implement several Resource kinds together

This creates breadth while hiding whether the shared model is valid and predicts speculative fields and switches.

### Store arbitrary Page JSON

This is initially flexible but creates an unbounded schema before user-defined content behavior is justified.

### Add a dedicated Page table immediately

This may later be correct, but one single-row subtype does not yet prove an independent storage lifecycle.

Removing this contract leaves Repository with navigation and authorization but no accepted collaborative work unit.

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
2. Organization owner/admin resolves to Repository admin without a fabricated direct grant.
3. Contributor updates title/body with matching concurrency evidence.
4. Stale update changes nothing.
5. Database rejects malformed content and forged creator attribution.
6. Create and meaningful update each emit exactly one actor-attributed fact.
7. No-op update emits no fact.
8. Resources and Activity surfaces render real projections.
9. Hard navigation to one Page preserves full Repository workspace and authentication destination.
10. Domain, Application, pgTAP, build, and browser checks pass on the exact head.
