# Domain Contract: Issue Resource

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-15

## Problem owned and success condition

A Repository needs a durable way to identify and review actionable collaborative work without introducing software-development or code-review semantics.

This contract owns Issue identity, current read state, and the minimum invariants required to project an Issue list and one Issue detail consistently. The current slice succeeds when every visible Issue is scoped to one authorized Repository, list and detail resolve the same stable identity, full-page and intercepted-dialog presentation use one canonical URL, and every undefined mutation fails closed.

## Evidence ledger

### Observations

- GitHub uses Repository-local positive Issue numbers as stable human identities in list, detail, search, filter, refresh, and navigation flows.
- The sanitized evidence in `.playwright-mcp/github/` shows that Issue list state is expressed through query parameters while Issue identity remains in the path.
- The target already resolves Repository ownership, visibility, and effective read authority independently from the UI.
- Issue title, body, status, creator, creation time, and optional closed attribution have a lifecycle and query shape distinct from the accepted Page content envelope.
- The executable target now exposes a read-only Issue list, full-page detail, and soft-navigation dialog through provider-neutral Application queries and Repository-aware RLS.

### Constraints

- Repository remains the only collaboration Container and primary authorization target.
- An Issue belongs to exactly one Repository and cannot establish ownership, visibility, Membership, Grant, or another collaboration boundary.
- Source Code, Commit content, Branch, Diff, code review, Actions, CI/CD, and executable payload semantics are absent.
- Full-page and dialog presentation cannot change Issue identity or authorization.
- Undefined create, edit, close, reopen, assign, label, milestone, comment, reaction, transfer, archive, and delete operations must fail closed at every executable boundary.

### Assumptions

- A Repository-local positive integer is sufficient human-facing stable identity while an internal UUID remains persistence identity.
- `open | closed` is the minimum useful status vocabulary for the read projection.
- A title of at most 240 characters and optional plain-text body are sufficient for the first read slice.

### Unknowns

- Issue-number allocation and concurrency rules for a future create command.
- Assignment, mention, label, milestone, comment, reaction, subscription, and notification lifecycles.
- Valid close/reopen transition reasons, actor attribution, optimistic concurrency, and required historical evidence.
- Editing, transfer, lock, pin, archive, retention, redaction, and deletion behavior.
- Whether richer body structure is ever justified by a no-code collaboration use case.

### Value choices

- Prefer one honest read projection over simulated React-owned mutations.
- Prefer a dedicated Issue persistence lifecycle over weakening the exact Page envelope into a generic JSON bucket.
- Prefer one canonical resource URL with two presentation modes over dialog-specific identity.
- Prefer Repository authorization equivalence over route- or context-derived access.

## Boundary and owner

This contract currently owns:

- Repository-scoped Issue identity;
- `open | closed` read state and closed-state consistency;
- title and body read invariants;
- list filtering, search, sorting, and pagination input semantics; and
- the Issue projections consumed by Repository delivery.

It does not yet own executable Issue commands, conversation, classification, assignment, notification, historical-evidence, or destructive lifecycle. It does not own Repository identity, authority resolution, provider mechanics, routing mechanics, or visual presentation.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Issue | Repository-scoped actionable collaborative Resource |
| Issue ID | Internal stable UUID used by persistence and relationships |
| Issue number | Positive Repository-local human identity used by canonical routing |
| Issue status | Current `open` or `closed` read state |
| Issue summary | List projection without conversation or mutation semantics |
| Issue detail | Authorized title, body, status, creator, and timestamp projection |

## Entities, relationships, and derived concepts

```text
Repository 1 -- contains --> * Issue
Issue      1 -- identified within Repository by --> issueNumber
Actor        -- may read through --> Repository authorization
```

The stable public identity is `(Repository ID, issue number)`. The internal Issue UUID does not replace that human identity. `All issues`, status tabs, search results, pagination, and intercepted dialogs are projections or UI state, not new entities.

## States and transitions

The current executable state model is observational only:

```text
open
closed + closedAt + closedBy
```

Database constraints reject non-positive numbers, blank or oversized titles, and inconsistent closed attribution. No end-user transition into or out of these states is currently accepted. Seed and trusted migration data may establish deterministic examples; that is not an Issue command contract.

## Invariants

1. Every Issue belongs to exactly one Repository.
2. `(repositoryId, issueNumber)` is unique and stable.
3. Issue number is a positive safe integer.
4. A trimmed title contains 1 to 240 characters.
5. Status is exactly `open` or `closed`.
6. An open Issue has no closed attribution; a closed Issue has both `closedAt` and `closedBy`.
7. Repository visibility and effective authority decide Issue reachability; UI Context, query state, and presentation mode do not.
8. List and detail queries expose only Issues from the already resolved Repository.
9. Full-page and intercepted-dialog views share `/{ownerSlug}/{repositorySlug}/issues/{issueNumber}` as canonical identity.
10. Query parameters express search, status, and pagination; they never become Issue identity.
11. Issue mutation privileges and policies remain absent until command contracts and historical evidence are accepted.
12. Issue is no-code actionable work; it carries no source-code, git, review, automation, or executable-payload semantics.

## Actors, principals, contexts, and permissions

- The authenticated User may be the Actor; an anonymous reader has no Actor identity.
- Repository Owner/governance and explicit User Grants remain the authority sources defined by Access Authority.
- `resource.view` and the public Repository visibility baseline govern current Issue reads through the Repository boundary.
- Selected issue status, search text, page, sidebar state, or dialog state is Context only.
- Future create/update/conversation permissions require separate Application commands and database enforcement; authentication or a visible control cannot authorize them.

## Events and workflows

No Issue event is accepted by the current read slice. Future `issue.created`, `issue.closed`, `issue.reopened`, assignment, label, comment, and reaction facts require a separate contract proving trigger, actor attribution, payload minimization, transactionality, idempotency, and privacy before any command is enabled.

## Dependencies and failure behavior

- **Repository Collaboration**: unresolved, inaccessible, or mismatched Repository identity returns no Issue.
- **Access Authority/RLS**: public visibility or effective Repository authority must independently permit the row; denial fails closed.
- **Issue reader**: invalid number, status, search, page, or page size is rejected or normalized within documented bounds before a provider query.
- **Persistence**: constraints reject invalid identity, title, status, and closed-state combinations.
- **Delivery**: Server Components invoke Application queries; the minimal dialog Client Component owns only browser history close behavior.

## Known implementation gaps

`GAP-COLLABORATION-SURFACES-001` remains Open. The Issue read projection, canonical routes, RLS, full-page view, and intercepted dialog are executable. Issue creation, allocation, state changes, comments, relationships, historical evidence, and all Discussion/Project/Security/Settings slices listed by that gap remain unsupported and fail closed.

## Alternatives and removal test

- Storing Issue in the Page content envelope would destroy Page's exact subtype invariant and hide a distinct number/status lifecycle.
- Modeling Issue as React state would make refresh, sharing, authorization, and database enforcement false.
- Giving dialogs a separate URL would split one resource identity by presentation implementation.
- Implementing commands now would invent allocation, concurrency, evidence, and permission rules without proof.

Removing this contract leaves the executable table, queries, and routes without an authoritative identity and fail-closed lifecycle boundary.

## Falsification conditions

Reopen this model if Repository-local numbers cannot remain stable, Issue requires an independent owner or visibility boundary, `open | closed` cannot express the accepted no-code lifecycle, or a real second actionable-work use case proves that Issue is only a projection rather than a distinct Resource.

## Minimum discriminating tests

1. A public Repository Issue is readable anonymously; a private Repository Issue is not.
2. An authorized viewer reads private Issue list and detail; an outsider reads neither.
3. Invalid number, title, and closed-state combinations are rejected.
4. End-user INSERT, UPDATE, and DELETE privileges remain absent.
5. Search, status, and page state do not escape the resolved Repository.
6. Soft navigation opens the Issue in a dialog at its canonical URL; Back closes it and Forward restores it.
7. Direct navigation or refresh at the same URL renders the full page with the same authorized data.
8. Desktop, laptop, tablet, and mobile preserve usable navigation and content order.
9. Domain, Application, adapter, pgTAP, Next runtime, browser logs, and Playwright checks pass on the exact head.
