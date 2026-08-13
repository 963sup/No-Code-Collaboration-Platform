# ADR-009: Controlled Page command mutation boundary

- Status: Accepted
- Date: 2026-08-12
- Decision owner: Repository owner
- Affected scopes: Page Application port projection, Supabase Data API mutation surface, RLS, migration history, pgTAP security regression, generated database types

## Decision

Accepted Page state transitions are exposed to authenticated Data API clients only through two command-specific PostgreSQL functions:

```text
create_page(repository, title)
update_page(repository, page, title, body, expected_updated_at)
```

Both functions are `SECURITY INVOKER`. They establish the authenticated actor through the ordinary request JWT, set a transaction-local Page command context immediately around their Resource DML, restore the previous context before returning, and rely on the existing table grants plus RLS Capability checks for row authorization.

The Resource INSERT and UPDATE RLS policies require both conditions:

```text
accepted command context
AND
ordinary Actor + Repository Capability authorization
```

Therefore a Contributor remains authorized to perform the `CreatePage` and `UpdatePage` use cases but cannot treat generic `public.resources` INSERT or UPDATE as an alternate Page command API.

The command context is execution provenance, not authority. It never substitutes for `auth.uid()`, Repository identity, or Capability evaluation.

## Problem and success condition

ADR-007 accepted a stronger Page transition contract than the database public mutation surface actually enforced:

- `CreatePage` creates a normalized blank Page;
- `UpdatePage` requires matching server-managed optimistic-concurrency evidence;
- meaningful Page state changes and their Activity facts are atomic;
- stale changes fail closed.

The Application adapter implemented those rules, but the authenticated Data API still had generic Resource INSERT and UPDATE reachability. RLS checked whether the actor held `resource.create` or `resource.update`, but it could not distinguish an accepted Page command from arbitrary DML. A valid Contributor could therefore create a Page with pre-populated body content or update a Page without supplying `expected_updated_at`, while the existing triggers would still emit apparently valid historical facts.

Success requires:

1. raw authenticated Resource INSERT and UPDATE cannot perform accepted Page transitions;
2. the command RPCs preserve the existing Capability decision and RLS enforcement;
3. `CreatePage` produces the accepted blank initial state;
4. `UpdatePage` requires the prior server-managed `updated_at` value;
5. command context cannot remain active after the RPC returns;
6. stale, Viewer, outsider, and no-op behavior remains fail-closed and historically consistent; and
7. no provider-privileged service credential or `SECURITY DEFINER` bypass is introduced.

## First-principles model

Authorization and transition validity are independent predicates:

```text
Accepted Page Transition
=
Authorized(actor, repository, capability)
AND
Valid command shape
AND
Valid prior-state evidence
AND
Required historical evidence
```

A Role or Capability answers whether an actor may attempt an operation. It does not authorize arbitrary SQL that happens to mutate the same row.

The minimum executable chain is:

```text
Application Page command
↓
Supabase adapter RPC
↓
SECURITY INVOKER PostgreSQL command
↓
transaction-local command context
↓
Resource DML
↓
RLS: command context + actor capability
↓
Resource trigger
↓
Activity fact
↓
command context restored
```

## Evidence ledger

### Observations

- `CreatePage` currently constructs a blank Page draft in Domain/Application code.
- `UpdatePage` currently supplies `expectedUpdatedAt` and the adapter applies it as a row predicate.
- `public.resources` grants authenticated INSERT and title/content UPDATE because the current Supabase adapter uses the Data API.
- Existing RLS checks actor attribution and Repository Capabilities but, before this decision, did not identify which accepted Page command caused the mutation.
- Existing pgTAP evidence explicitly demonstrated that a Contributor could directly INSERT non-blank Page content and directly UPDATE Page state without optimistic-concurrency evidence.
- Page create/update triggers already provide same-transaction Activity facts once the underlying DML is an accepted transition.

### Constraints

- RLS must remain an independent database authorization boundary rather than being bypassed by a privileged command function.
- The browser receives only the publishable Supabase credential and authenticated Session; no service-role path is added.
- Domain and Application stay provider-neutral.
- `resources.updated_at` remains server-managed and unavailable to authenticated column UPDATE privileges.
- Declarative schema remains current database truth and the migration remains append-only history.
- Verification remains local/CI evidence until a hosted Supabase environment is separately provisioned and inspected.

### Assumptions

- End-user database access continues through the Supabase Data API rather than a direct login as PostgreSQL role `authenticated`.
- PostgREST executes each RPC request inside its database transaction, so a transaction-local command marker cannot carry into a later Data API request.
- Two command functions are sufficient while Page create/update are the only accepted Page mutations.

### Unknowns

- Whether a later Resource subtype can reuse this command-provenance mechanism without introducing a generic mutation framework.
- Whether future multi-row or asynchronous commands need command IDs rather than a short-lived transaction marker.
- Whether future direct database integrations require a different unforgeable command boundary.

### Value choices

- Prefer `SECURITY INVOKER` plus RLS over revoking Resource DML and reintroducing it through a `SECURITY DEFINER` function that would bypass RLS.
- Keep the command marker non-authoritative and short-lived.
- Expose only concrete accepted Page commands; do not create a generic Resource mutation RPC.
- Preserve existing trigger-based atomic historical facts instead of adding an event bus.

## Alternatives rejected

### Leave raw DML reachable with Capability-only RLS

Rejected because it proves authorization but not transition validity. It allows valid Contributors to bypass accepted command invariants.

### Revoke Resource INSERT/UPDATE and use `SECURITY DEFINER` RPCs

This would close raw table reachability but make the RPC owner responsible for reproducing all row authorization because table-owner execution bypasses ordinary RLS. That weakens the independent enforcement property ADR-007 explicitly accepted.

### Put `expected_updated_at` only in Application code

Already disproven by the original attack path: alternate Data API mutations bypass Application orchestration.

### Encode optimistic concurrency entirely in a trigger

A generic UPDATE statement carries no trusted expected prior version. Inferring one inside a trigger would invent evidence rather than validate caller-supplied command evidence.

### Build a generic Resource command engine

One Resource kind and two mutations do not justify a generic command runtime, envelope, event bus, or workflow abstraction.

## Security properties

1. `create_page` and `update_page` execute with caller privileges.
2. Function `EXECUTE` is revoked from `PUBLIC`/`anon` and granted explicitly to `authenticated`.
3. Both functions use `search_path = ''` and schema-qualified provider/database functions where relevant.
4. The command marker is restored before a successful function return.
5. RLS still verifies actor attribution and Repository Capability independently of the command marker.
6. Raw Resource INSERT/UPDATE with no command marker fails closed even for a Contributor.
7. Stale UpdatePage evidence changes no Page state and emits no success fact.
8. A Viewer cannot turn command-function reachability into Resource mutation authority.
9. No service-role or secret credential is introduced.

## Consequences

Benefits:

- the database public API now matches the accepted Page command model;
- optimistic concurrency cannot be bypassed through ordinary authenticated Data API UPDATE;
- Activity facts once again imply an accepted Page mutation path rather than merely any authorized SQL DML;
- RLS remains an independent enforcement boundary; and
- the fix adds only two concrete commands and one short-lived execution marker.

Costs and risks:

- Page writes become RPC calls rather than generic table mutations;
- command context is a Data API execution-boundary mechanism, not a general direct-database trust primitive;
- generated Supabase types gain function projections;
- a later mutation must explicitly join this command boundary rather than acquiring generic Resource UPDATE reachability.

## Falsification conditions

Reopen this decision if:

- an end-user Data API request can set or preserve `app.page_command` independently of an accepted command function;
- command context survives a completed RPC request;
- direct database access as the `authenticated` role becomes a supported end-user integration;
- RLS and command functions produce different authorization decisions;
- a second Resource kind shows that the marker creates subtype conditionals throughout generic Resource code; or
- Page transitions require durable command identity, idempotency, or multi-transaction orchestration.

## Minimum discriminating test

1. Contributor raw Resource INSERT is rejected.
2. Contributor `create_page` succeeds, trims title, and creates blank body content.
3. The create RPC returns with no active Page command context.
4. Contributor raw Resource UPDATE changes zero rows.
5. Contributor `update_page` with matching `updated_at` succeeds and produces one update fact.
6. The update RPC returns with no active Page command context.
7. Stale `updated_at` changes zero rows and emits no fact.
8. A no-op RPC advances neither concurrency evidence nor history.
9. Viewer create/update commands fail closed; outsider reads remain denied.
10. schema replay, lint, pgTAP, generated-type consistency, Application/Domain tests, build, and browser contracts pass on the exact implementation head.

## Verification evidence

- Verified implementation head: [`a6bba75bb08cd0c6742ad6932e103698a9ab0bf2`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/a6bba75bb08cd0c6742ad6932e103698a9ab0bf2)
- Pull request: [#23](https://github.com/963sup/No-Code-Collaboration-Platform/pull/23)
- Historical transition at the verified head: `supabase/migrations/20260812073000_enforce_page_command_boundary.sql`; current replay is consolidated into `supabase/migrations/20260813145001_initial_collaboration_baseline.sql` because no persistent environment had applied the earlier local/CI-only chain.
- Database regression: all four pgTAP suites passed with 85 total assertions; `page-resource.test.sql` contains 28 Page command and attack-path assertions.
- Exact implementation-head verification: [GitHub Actions Verify #118](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31577420974)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts.
- Database evidence: migration replay from an empty disposable local database, database lint, pgTAP, and generated-type consistency passed on the same implementation head.
- Browser evidence: production build plus local Auth/Repository/Page collaboration behavior passed on the same implementation head.
- Vercel status for the implementation head succeeded independently.

## Evidence boundary

The evidence above proves the accepted Page command boundary against disposable local/CI infrastructure on the exact implementation head. No hosted Supabase project was accessed or mutated, so this ADR does not assert that the migration is Applied to preview, staging, or production.
