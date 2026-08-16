# Domain Contract: Page Resource

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

A Repository must contain a real collaborative knowledge unit rather than remain only a navigation and authorization shell.

This contract owns the first Page Resource behavior. It succeeds when an authenticated Actor with the GitHub-derived Page Capability can create, read, and update a Page through provider-neutral Application use cases; PostgreSQL independently enforces the same Repository boundary; stale updates fail closed; no-op updates preserve concurrency evidence; and every meaningful transition produces immutable historical Evidence in the same transaction.

## First-principles benchmark mapping

GitHub Wiki is a Repository knowledge surface. Removing Git-backed storage/history leaves the durable no-code problem:

```text
Repository
→ durable collaborative Page/knowledge
→ read according to Repository visibility/access
→ edit with Repository Write-or-greater authority
```

The target therefore keeps Domain vocabulary `Page / Knowledge` while preserving GitHub's `/wiki` presentation URL. It does not import Git-backed Wiki repositories, Git history, or source files.

Current Page mutation Capabilities are explicit:

```text
page.create
page.update
```

They are present in Write, Maintain, and Admin. Read and Triage do not mutate Page state.

## Evidence ledger

### Observations

- Repository Collaboration defines typed User/Organization ownership, Resource containment, and stable Repository identity.
- Access Authority defines GitHub-derived `read | triage | write | maintain | admin` Repository Roles.
- PostgreSQL stores one `page` Resource kind and records accepted Page facts.
- Current authority combines personal-owner governance, Organization owner/admin governance, and Direct User Grants before Capability evaluation.
- GitHub's private Repository Wiki editing boundary is Write-or-greater; the target's Page write boundary follows that surviving no-code semantic.

### Constraints

- Every Page belongs to exactly one Repository.
- Actor identity, Principal authority, UI Context, Repository ownership, and Page state remain distinct.
- Application commands make explicit `page.create` / `page.update` authorization decisions; RLS remains independent enforcement.
- Page state and required Activity Evidence commit atomically.
- Domain/Application remain independent of Supabase Rows, clients, generated database types, and PostgreSQL syntax.
- Page optimistic-concurrency evidence is server-managed and cannot be assigned directly by authenticated clients.
- Page deletion, archive, restore, move, copy, sharing, comments, realtime editing, and rich blocks are not accepted by this slice.
- An unaccepted Page lifecycle operation is absent from current Capability vocabulary.

### Assumptions

- A title and plain-text body are sufficient to discriminate the first useful Page lifecycle.
- One exact Page content shape in the existing Resource row is sufficient while Page is the only implemented generic Resource-envelope kind.
- The prior `updated_at` value is sufficient optimistic concurrency evidence for the current single-row transition when only meaningful state changes advance it.
- Write-or-greater Page mutation remains sufficient until a real Page-specific moderation or review workflow proves otherwise.

### Unknowns

- Rich block structure, attachments, comments, search, and simultaneous editing.
- Whether Page needs a dedicated table for size, indexing, query, or lifecycle behavior.
- Whether numeric versions, command identifiers, or idempotency keys must replace timestamp evidence.
- Resource archive, retention, restore, redaction, and lawful deletion semantics.

### Value choices

- Prefer one complete Page lifecycle over speculative knowledge features.
- Prefer an exact content shape over opaque generic JSON.
- Prefer explicit Page Capabilities over generic Resource mutation permissions.
- Prefer actor-attributed immutable facts over inferring history from current state.
- Prefer no-op semantic stability: no state change means no version change and no historical fact.

## Boundary and owner

This contract owns Page title/body invariants, Page create/update transitions, optimistic concurrency evidence, Page-to-Repository containment, Page transition fact meaning, and Page read projections.

It does not own Repository identity/ownership/visibility/lifecycle, authentication, Grants/Role bundles, other Artifact subtypes, generic document/plugin runtimes, feed presentation, or provider/framework mechanics.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Page | Repository-scoped knowledge Resource whose accepted content is a title and plain-text body |
| Page ID | Stable Resource identity |
| Page content | Exact object containing one string field named `body` |
| Page draft | Validated state required to create a blank Page |
| Page update | Validated title/body transition plus expected prior update timestamp |
| Concurrency evidence | Server-managed `updated_at` identifying the most recently accepted meaningful Page state |
| Changed state | Update rejected because Page state no longer matches command evidence |
| Page fact | Immutable `resource.created` or `resource.updated` Activity Event caused by an accepted transition |

## States and transitions

```text
Absent
  └── CreatePage ──> Active blank Page

Active Page
  ├── UpdatePage (meaningful change) ──> Active updated Page + new concurrency evidence
  └── UpdatePage (no-op) ──────────────> same Page + same concurrency evidence
```

Create requires authenticated Actor, accessible Repository, `page.create`, valid title, and creator attribution equal to Actor.

Update requires authenticated Actor, accessible Repository, `page.update`, valid Page identity/title/body, matching expected `updated_at`, and Page identity scoped to the same Repository.

No delete, archive, restore, move, copy, publish, sharing, or other lifecycle transition is accepted.

## Invariants

1. Every Page belongs to exactly one Repository.
2. Page ID and Repository ID, not route labels or selected Context, determine the authorization target.
3. Page title contains 1 to 240 non-whitespace characters after trimming.
4. Page content is exactly one object with one string `body` field.
5. Create requires `page.create`; update requires `page.update`.
6. Write, Maintain, and Admin carry current Page mutation authority; Read and Triage do not.
7. Personal-owner governance, Organization owner/admin governance, and Direct Repository Grants resolve before Capability evaluation; ordinary Organization Membership contributes no Repository Role.
8. Application authorization and RLS agree; either being more permissive is a defect.
9. Creator attribution equals the authenticated Actor.
10. `updated_at` is server-managed concurrency Evidence and cannot be directly assigned by authenticated client.
11. Stale optimistic concurrency Evidence cannot overwrite newer state.
12. Meaningful title/content change advances `updated_at` and required fact atomically.
13. No-op update advances neither `updated_at` nor `resource.updated`.
14. Activity facts do not copy Page body content.
15. Page deletion is not accepted and therefore has no Capability, UI command, table DELETE privilege, or RLS delete policy.

## Historical Evidence

Accepted immutable facts:

- `resource.created` with Page kind and title;
- `resource.updated` with Page kind, current title, and booleans identifying title/content change.

Page body is excluded from event payloads to avoid duplicating potentially sensitive content into historical projections.

## Dependencies and failure behavior

- Missing authenticated Actor fails closed.
- Inaccessible Repository creates/changes nothing.
- Insufficient Page Capability fails before persistence; concurrent authority revocation is independently rejected by RLS.
- Malformed content and whitespace-only titles are rejected by database constraints.
- Required Activity Evidence failure aborts transition.
- Stale timestamp returns changed state rather than overwriting; no-op keeps prior Evidence.
- Delivery validates transport input using the shared PostgreSQL database-ID lexical contract, invokes Application, revalidates projections, and exposes stable errors without direct database access.

## Rejected alternatives

### Generic `resource.create` / `resource.update`

Rejected for authorization because Issue and Discussion already prove different no-code permission semantics. Page mutation follows the surviving GitHub Wiki Write boundary directly.

### Separate Wiki aggregate

Rejected while Page already owns durable knowledge content. `/wiki` is presentation vocabulary, not a second Domain identity.

### Store arbitrary Page JSON

Rejected because it creates an unbounded schema before product behavior requires it.

### Dedicated Page table immediately

Deferred until Page-specific persistence/query/lifecycle requirements prove it necessary.

## Falsification conditions

Reopen when rich Page behavior cannot be expressed safely in current storage; timestamp concurrency becomes insufficient; Page needs multi-row atomic state; or a real GitHub-derived/no-code Page permission requires a distinction not expressible by current Role matrix.

## Minimum discriminating tests

1. Write creates and updates a typed Page; Read and Triage cannot.
2. Maintain/Admin retain Page mutation because their bundles include Write semantics.
3. Personal Owner and Organization owner/admin resolve to Admin without fabricated Direct Grants; ordinary Organization member does not.
4. No-op save preserves `updated_at` and emits no update fact.
5. Stale update changes nothing.
6. Database rejects malformed content, whitespace-only titles, forged creator attribution, and authenticated mutation of `updated_at`.
7. Create and meaningful update each emit exactly one actor-attributed fact.
8. Pages and authorized Activity render through canonical `/{ownerSlug}/{repositorySlug}/wiki` presentation.
9. Database stable IDs accepted by PostgreSQL are not rejected by a stricter RFC-version-only Web validator.
10. Domain, Application, pgTAP, production build, and browser checks pass on the exact head.
