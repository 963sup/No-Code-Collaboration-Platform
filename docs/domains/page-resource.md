# Domain Contract: Page Resource

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

A Repository must contain a real no-code knowledge unit rather than remain only a navigation and authorization shell.

This contract owns the first Page Resource lifecycle and its GitHub-Wiki-derived authority rules. It succeeds when Page create/read/update, optimistic concurrency, Repository containment, and historical Evidence are consistent across Domain, Application, PostgreSQL/RLS, Web, and tests.

## GitHub benchmark derivation

GitHub Wiki is a Repository knowledge surface. Removing Git-backed storage/history leaves:

```text
Repository
→ durable collaborative knowledge
→ Repository-scoped read
→ edit authority that depends on Repository visibility + collaborator relationship
```

The important upstream distinction is not simply `Write+`.

```text
Private Repository Wiki
→ Write | Maintain | Admin edit

Public Repository Wiki
→ Repository collaborator may edit
→ a Read collaborator therefore may edit

Public visibility alone
→ does not create collaborator authority
```

GitHub also supports an optional setting that allows any account to edit a public Wiki. That setting is not admitted by this Product. The target therefore keeps the collaborator-sensitive default rather than inventing a global public-write baseline.

The target uses Domain vocabulary `Page / Knowledge` and presentation path `/wiki`. It does not import Git-backed Wiki repositories or Git history.

## Capabilities and contextual authority

Current Page mutation Capabilities:

```text
page.create
page.update
```

Static private/default Role bundles:

```text
Read      → no Page mutation
Triage    → no Page mutation
Write     → page.create + page.update
Maintain  → inherits Write Page mutation
Admin     → all Page mutation
```

Contextual public-Wiki rule:

```text
Repository.visibility = public
AND Actor has any persisted/derived Repository Role
→ page.create + page.update
```

This contextual rule does not change the Actor's Role. A public Read collaborator remains Read; the specific Page decision is allowed because the Repository visibility/relationship condition applies.

## Boundary and owner

This contract owns:

- Page identity, title, body, and Repository containment;
- `page.create` and `page.update` transitions;
- Page-specific authority conditions;
- optimistic concurrency evidence;
- Page historical Evidence; and
- Page read/write projections.

It does not own Repository ownership/visibility lifecycle, Direct Grant management, selected Context, other Resource kinds, deletion/archive/restore, rich blocks, comments, realtime editing, or provider mechanics.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Page | Repository-scoped durable knowledge Resource |
| Page ID | Stable Resource identity |
| Page content | Exact object containing one string field `body` |
| Page draft | Validated state required for creation |
| Page update | Validated title/body transition plus expected prior `updated_at` |
| Collaborator | Actor with a persisted/derived Repository Role; not a separate identity type |
| Public Page authority | Contextual capability produced by public Repository + collaborator relationship |
| Concurrency evidence | Server-managed `updated_at` for the last meaningful accepted Page state |

## States and transitions

```text
Absent
  └── CreatePage ──> Active Page

Active Page
  ├── UpdatePage (meaningful) ──> updated Page + new concurrency evidence
  └── UpdatePage (no-op) ───────> same Page + same concurrency evidence
```

Create requires authenticated Actor, accessible Repository, effective `page.create`, valid title, and creator attribution equal to Actor.

Update requires authenticated Actor, accessible Repository, effective `page.update`, valid Page identity/title/body, matching expected `updated_at`, and the same Repository containment.

No delete, archive, restore, move, copy, publish, or sharing transition is accepted.

## Invariants

1. Every Page belongs to exactly one Repository.
2. Stable Page/Repository IDs determine the target; route labels and selected Context do not.
3. Title is 1–240 non-whitespace characters after trimming.
4. Content is exactly one object with one string `body` field.
5. Create requires effective `page.create`; update requires effective `page.update`.
6. On a private Repository, Page mutation requires Write, Maintain, or Admin.
7. On a public Repository, any Repository collaborator Role may satisfy Page mutation, including Read.
8. Public Repository visibility without a collaborator relationship never satisfies Page mutation.
9. Contextual Page authority never upgrades or rewrites the Actor's assigned Repository Role.
10. Ordinary Organization Membership contributes no Repository Role by itself.
11. Application authorization and RLS must agree.
12. Creator attribution equals the authenticated Actor.
13. `updated_at` is server-managed and cannot be assigned by end-user clients.
14. Stale optimistic-concurrency evidence cannot overwrite newer state.
15. Meaningful state change and required historical Evidence are atomic.
16. No-op update changes neither `updated_at` nor historical Evidence.
17. Page deletion is unavailable because its lifecycle is not accepted.

## Historical Evidence

Accepted immutable events:

```text
resource.created
resource.updated
```

Evidence records Repository, Actor, Resource identity, kind/title, and change metadata. It does not copy Page body content.

Raw Activity Evidence is not part of anonymous/authenticated public visibility. A future public activity surface requires its own safe projection.

## Failure behavior

- Anonymous Actor cannot create/update Page.
- Authenticated public Actor without Repository collaborator relationship cannot create/update Page.
- Private Read/Triage collaborator cannot mutate Page.
- Public Read collaborator may mutate Page under the public-Wiki contextual rule.
- Concurrent authority revocation is independently enforced by RLS.
- Stale expected state returns changed-state behavior without overwrite or false Evidence.
- Required Evidence failure rolls back the state transition.

## Rejected alternatives

### `Write+` as a universal Wiki rule

Rejected. It describes private/default behavior but contradicts the documented public-Repository collaborator Wiki rule.

### Public visibility grants Page write

Rejected. Visibility is not a collaborator relationship and must not become mutation authority by itself.

### Generic `resource.create` / `resource.update`

Rejected. Page, Issue, and Discussion have different no-code authorization semantics.

### Separate Wiki aggregate

Rejected while Page already owns durable Repository knowledge. `/wiki` is presentation vocabulary.

### Dedicated Page table immediately

Deferred until Page-specific storage/query/lifecycle requirements prove necessity.

## Minimum discriminating tests

1. Private Write can create/update Page.
2. Private Read and Triage cannot update Page.
3. Public Read collaborator can create/update Page.
4. Authenticated public Actor with no collaborator Role cannot mutate Page.
5. Owner/governance-derived Admin can mutate Page without fabricated Direct Grant.
6. No-op preserves `updated_at` and emits no `resource.updated` Evidence.
7. Stale update changes nothing and emits no success Evidence.
8. Database rejects forged creator attribution and direct `updated_at` mutation.
9. Canonical presentation remains `/{ownerSlug}/{repositorySlug}/wiki`.
10. Web accepts PostgreSQL UUID lexical identities through the shared database-ID validator.
