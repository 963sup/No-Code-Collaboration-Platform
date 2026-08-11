# ADR-005: Defer destructive container deletion until lifecycle semantics are accepted

- Status: Accepted
- Date: 2026-08-12
- Decision owner: Repository owner
- Affected scopes: Product lifecycle, Repository Collaboration, PostgreSQL grants, RLS, migrations, database tests, operations

## Decision

Remove end-user hard deletion of Organizations and Repositories from the executable product. The `authenticated` database role receives no `DELETE` privilege for either table, and no RLS DELETE policy exists for either boundary. Destructive deletion may be introduced only by a later accepted lifecycle contract that defines authority, confirmation, idempotency, containment fate, historical continuity, retention or lawful redaction, restore behavior, recovery objectives, concurrency, and user-visible consequences.

This decision does not add soft deletion, archive state, tombstones, or restore behavior. Those are separate product semantics and remain deferred until demonstrated collaboration requirements justify them.

## Problem and success condition

The current schema permits authenticated Organization owners and Repository administrators to hard-delete their collaboration boundaries. Foreign-key cascades then erase memberships, grants, Resources, and Activity Events even though the Product Contract treats Activity Events as durable historical facts and the Repository contract requires deletion semantics to be accepted before they become a public capability.

The decision succeeds when:

- an authenticated actor cannot delete an Organization or Repository through the Data API, regardless of Organization or Repository authority;
- legitimate non-destructive administration remains available;
- a denied Repository deletion preserves the Repository, contained Resources, and historical facts;
- a denied Organization deletion preserves the Organization ownership boundary;
- declarative schema, append-only migration, pgTAP behavior, and documentation agree; and
- no UI or Application delete use case is required to enforce the boundary.

## Evidence ledger

### Observations

- `organizations` and `repositories` currently grant `DELETE` to `authenticated`.
- `organizations_delete_owner` and `repositories_delete_manager` project destructive authority through RLS.
- Repository, Resource, grant, membership, and Activity Event relationships use cascading deletion.
- No Domain or Application command defines Organization or Repository deletion.
- No accepted contract defines archive, restore, retention, redaction, tombstones, recovery, or user communication for destructive container lifecycle.
- GitHub treats repository deletion as a distinct, high-consequence lifecycle with restoration limits and incomplete restoration of relationships such as team permissions. This is benchmark evidence that deletion is not equivalent to ordinary administration, not a contract to copy.

### Constraints

- Product behavior must fail closed when lifecycle semantics are unknown.
- Database grants and RLS are independent enforcement layers.
- `supabase/schemas` owns current database truth; migrations remain append-only deployment history.
- Activity and audit history cannot be described as durable while an ordinary product command can erase it transitively.
- Domain semantics remain provider-neutral.
- Remote Supabase projects are outside this change; verification uses local or CI database stacks.

### Assumptions

- No currently supported user journey requires Organization or Repository hard deletion.
- Retaining rows is safer than inventing an incomplete soft-delete state.
- Database operators retain out-of-band administrative ability, but direct privileged DML is not a supported product lifecycle and remains subject to operational controls.

### Unknowns

- Whether the first accepted lifecycle should use archive, tombstone, delayed purge, reversible deletion, or another mechanism.
- Required retention periods, legal hold behavior, export requirements, restore objectives, and redaction rules.
- Whether Organization deletion should ever be a single-actor operation.
- Whether Resource deletion needs the same lifecycle model or a subtype-specific policy.

### Value choices

- Prefer removal of an unjustified capability over speculative lifecycle complexity.
- Prefer fail-closed database enforcement over UI hiding.
- Preserve historical continuity until explicit evidence justifies destruction.
- Keep future lifecycle choices reversible by avoiding premature state columns and generic policy engines.

## Minimum sufficient model

```text
Organization
  └─ owns Repository
       ├─ contains Resource
       ├─ scopes Grant
       └─ scopes Activity Event

Current accepted transitions
=
create
+
read
+
non-destructive update
+
authority management within delegation rules

Unaccepted transitions
=
Organization hard delete
+
Repository hard delete
```

Enforcement is deliberately redundant:

```text
No authenticated DELETE privilege
AND
No Organization/Repository DELETE policy
```

The table privilege prevents the operation from entering RLS. Removing the policy prevents a later accidental privilege grant from silently reactivating the old authority path.

## Alternatives and counterfactuals

### Do nothing

Prediction: an authorized actor can erase an entire collaboration boundary and its historical evidence even though the product cannot explain retention, recovery, or consequences. The Implementation Gap remains open and production validation stays blocked.

### Keep DELETE but hide it in the UI

Prediction: direct Data API requests or another delivery adapter can still invoke deletion. This is not containment.

### Keep owner/admin-only DELETE

Prediction: least privilege narrows who can trigger the failure but does not make the lifecycle coherent. Authority answers “who may act,” not “whether the transition is a valid product capability.”

### Add `deleted_at` immediately

Prediction: the system gains an undefined state without accepted rules for access, uniqueness, grants, events, restoration, purge, or cross-Repository references. This moves ambiguity into every query.

### Implement full archive/restore now

Prediction: substantial irreversible semantics and test burden are introduced before a demonstrated user journey establishes requirements. This is deferred, not rejected.

### Remove the product capability

Prediction: current valuable create/read/update collaboration continues, destructive ambiguity fails closed, and a future lifecycle can be designed from evidence. This is the accepted alternative.

## Consequences

### Benefits

- Cascading deletion is unreachable through ordinary authenticated product access.
- Activity Event durability and Repository containment claims no longer conflict with an exposed hard-delete path.
- Future lifecycle design starts from explicit requirements rather than legacy behavior.
- The enforcement change is small, reversible, and independently testable.

### Costs

- Users cannot self-delete Organizations or Repositories.
- Test fixtures and operators must continue using privileged setup/rollback paths rather than product DELETE.
- A later lifecycle implementation must add new Domain, Application, database, UI, recovery, and operational contracts instead of merely restoring the old policies.

### Risks

- Privileged operator credentials can still bypass the end-user boundary.
- External code that relied on undocumented DELETE behavior will fail with insufficient privilege.
- Removing DELETE does not by itself define long-term retention or legal deletion obligations.

### Migration implications

The migration revokes `DELETE` from `authenticated` and drops the two existing DELETE policies. No table shape or generated TypeScript type changes.

## Falsification conditions

Reopen this decision when a real user or governance workflow cannot be satisfied without ending an Organization or Repository lifecycle, and the workflow supplies enough evidence to define:

- who may initiate and approve it;
- whether it is reversible;
- what happens to Resources, grants, references, and historical facts;
- retention, redaction, legal hold, restore, and purge behavior;
- concurrency and idempotency guarantees; and
- measurable recovery and communication requirements.

Do not reopen merely because GitHub or another mature product exposes a delete button.

## Minimum discriminating test

As an authenticated Organization owner with Repository administrator authority:

1. update the Organization and Repository successfully;
2. attempt to delete the Repository and receive SQLSTATE `42501`;
3. verify the Repository, contained Page Resource, and creation Activity Events remain;
4. attempt to delete the Organization and receive SQLSTATE `42501`; and
5. verify the Organization remains.

Any successful authenticated DELETE, missing positive control, or loss of contained state rejects the implementation.

## Follow-up contract changes

- Remove authenticated Organization and Repository DELETE grants and policies from `supabase/schemas/99_rls.sql`.
- Add an append-only migration revoking privileges and dropping policies.
- Add pgTAP regression coverage through the authenticated database role.
- Record the decision in the architecture catalog.
- Update `GAP-LIFECYCLE-001` only after exact-head verification proves the control.
