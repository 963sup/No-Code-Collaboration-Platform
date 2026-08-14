# Domain Contract: Controlled Data Exchange

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-15

## Problem owned and success condition

Repository collaborators may need to package bounded structured data and deliver it to an approved destination without copying secrets, granting new authority, or introducing an automation runtime.

This contract owns the meaning and safety boundary of Data Transfer and Data Capsule. It succeeds only when a transfer moves schema-validated Repository data between allowlisted endpoints, performs no user-defined computation, preserves source authorization, exposes deterministic delivery evidence, and cannot become CI/CD or arbitrary automation.

## Evidence ledger

### Observations

- GitHub exposes Actions and Gist names, but their code execution, workflow, and snippet meanings are not admissible Product authority.
- The Product already recognizes Integration, GitHub App, OAuth App, Webhook, and token/programmatic-access management semantics while excluding secret values.
- The user explicitly permits Actions and Gist only as strictly limited data transfer with no code.

### Constraints

- `Repository = No-Code Collaboration Container` remains absolute.
- Data exchange cannot execute Source Code, shell, scripts, expressions, templates with executable semantics, arbitrary transforms, CI/CD, build, test, or deploy steps.
- Connector credentials remain Infrastructure-owned references; their values never enter Domain payloads, logs, screenshots, Diff, or Capsule content.
- Source read authorization and destination delivery authorization are independently revalidated server-side.
- Data Capsule cannot become a standalone workspace, public paste service, or second visibility boundary.

### Assumptions

- A fixed mapping between a typed source schema and a typed destination schema can satisfy a useful exchange case without a general transformation engine.
- Retry and idempotency evidence will be required for at least one external delivery.
- A bounded Data Capsule is useful as an intermediate Artifact for import, export, or migration.

### Unknowns

- The first approved source and destination Resource kinds.
- Endpoint ownership, connector consent, delivery retention, retry schedule, quotas, cancellation, and dead-letter behavior.
- Whether Data Capsule needs stable identity, expiry, single-use semantics, or human sharing.
- Whether import, export, migration, and webhook delivery share one lifecycle or require separate contracts.
- Exact Capabilities for configuring, requesting, reading, downloading, and revoking exchange artifacts.

### Value choices

- Prefer a closed catalog of typed mappings over a user-programmable workflow builder.
- Prefer secret references over secret material in Product state.
- Prefer explicit one-way delivery contracts over a generic event bus exposed as a Product feature.
- Prefer absence over a placeholder integration that cannot prove authorization and delivery semantics.

## Boundary and owner

This contract owns:

- one Data Transfer request and its delivery outcome;
- one typed Data Capsule payload envelope;
- source/destination schema compatibility;
- transfer idempotency and delivery evidence; and
- the prohibition on executable transformation.

It does not own connector authentication, secret storage, Repository or Resource lifecycles, Access Authority policy, external provider semantics, billing, persistence technology, routes, or UI components.

## Vocabulary

| Canonical term | External alias | Meaning |
| --- | --- | --- |
| Data Transfer | Actions / Action | Declarative delivery of typed data between two approved endpoints |
| Data Capsule | Gist | Repository-contained typed payload prepared for controlled sharing or transfer |
| Endpoint | — | Allowlisted typed source or destination contract, never an arbitrary URL plus code |
| Mapping | — | Predefined schema-to-schema field mapping maintained as Product configuration, not user code |
| Delivery attempt | — | Idempotent Infrastructure operation with redacted outcome evidence |
| Secret reference | — | Opaque identifier resolved only by authorized Infrastructure; never the credential value |

## Entities, relationships, and derived concepts

```text
Repository 1 ── contains ── * Data Capsule
Repository 1 ── authorizes ── * Data Transfer
Data Transfer 1 ── reads ── 1 typed source
Data Transfer 1 ── delivers ── 1 allowlisted destination
Data Transfer 1 ── may reference ── 1 Data Capsule
```

Data Transfer is a candidate Process identity. Data Capsule is a candidate Repository-contained Artifact. Endpoint availability and delivery status are projections of owned contracts and evidence; they are not Principals, Containers, or authority sources.

## States and transitions

Only the minimum candidate delivery lifecycle is admitted:

```text
Requested
  ├── Deliver ──> Delivered
  ├── Deliver ──> Failed (redacted reason)
  └── Cancel ───> Cancelled, only before external delivery begins
```

Retry may create another idempotent delivery attempt for the same transfer, but exact retry ownership and limits remain unknown. No transition may run user-supplied code or alter unrelated Repository data.

## Invariants

1. Every Data Transfer and Data Capsule belongs to exactly one Repository.
2. Source data is read only through an accepted typed Resource projection and current Actor authority.
3. Destination delivery uses an allowlisted Endpoint and a predefined typed Mapping.
4. No payload field is interpreted as source code, shell, script, executable expression, or workflow instruction.
5. Connector credentials are represented only by secret reference; values never enter Domain state, Capsule, event payload, log, screenshot, or user-visible error.
6. Data Capsule visibility cannot exceed effective Repository visibility and explicit Access Authority.
7. Delivery participation never grants Membership, Role, Capability, Repository access, or destination access.
8. A repeated idempotency key cannot create duplicate externally visible delivery.
9. Delivery evidence records actor, endpoint identities, schema version, timestamps, and redacted outcome without copying sensitive payload content.
10. Data Transfer cannot invoke build, test, deploy, package, release, arbitrary HTTP callback, or chained user-defined step semantics.

## Actors, principals, contexts, and permissions

- The authenticated User is the Actor who requests, cancels, or inspects a transfer.
- Repository Principals receive Capabilities through Access Authority; an Endpoint or connector is not a Principal by default.
- Selected source, destination, or Capsule is UI Context and cannot alter authority.
- Infrastructure resolves secret references only after server-side source and destination authorization.
- Configuration authority and execution authority remain distinct; their exact Capability names require a concrete connector use case.

## Events and workflows

Candidate facts include `data_transfer.requested`, `data_transfer.delivered`, `data_transfer.failed`, `data_transfer.cancelled`, and `data_capsule.created`. Exact names and payloads remain unaccepted.

Delivery must be idempotent, time-bounded, independently observable through redacted evidence, and safe under retry. Provider callbacks are untrusted input and must map through an Infrastructure adapter before affecting Application or Domain state.

## Dependencies and failure behavior

- **Repository Collaboration**: missing or inaccessible Repository fails closed.
- **Access Authority**: inability to explain source read and transfer operation authority prevents delivery.
- **Resource projection**: unknown schema or unavailable source produces no transfer payload.
- **Endpoint catalog**: unknown URL, method, schema, or mapping is rejected; callers cannot supply executable behavior.
- **Secret store/connector adapter**: unavailable reference resolution fails closed without revealing whether a secret exists or its value.
- **External destination**: timeout or rejection produces redacted failure evidence and no false success; retry must honor idempotency.
- **Historical Evidence**: required transition evidence failure prevents a success state from being recorded.

## Known implementation gaps

No executable mismatch is registered because Product explicitly defers concrete Data Transfer and Data Capsule lifecycle, identity, Capability, persistence, URL, and delivery contracts. Inspection of `packages/domain`, `packages/application`, Supabase schemas, and Web routes found no claimed Controlled Data Exchange capability. That absence is intentional containment, not an implementation gap.

If a concrete connector or Capsule slice is accepted, any partial implementation must be registered in [`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md) before it is presented as supported.

## Alternatives and removal test

### Manual export and import only

This remains valid until repeated delivery proves a transfer Process is needed.

### General workflow or automation engine

Rejected because user-authored steps, expressions, chaining, and arbitrary endpoints recreate programmable execution and CI/CD risk.

### Treat Gist as a standalone paste/snippet product

Rejected because it creates a second collaboration space, independent visibility, and likely executable-code semantics.

### Put connector credentials in transfer payloads

Rejected because it destroys the secret-management boundary and leaks authority-bearing material into historical or user-visible data.

Removing this candidate contract changes nothing executable today. If future users need controlled exchange, its removal would force authorization, schema, idempotency, and secret rules into provider adapters or React components.

## Falsification conditions

Reopen or split this boundary when:

- import/export/migration and repeated delivery prove different owners or lifecycles;
- the first useful exchange cannot work without arbitrary user-defined transformation;
- Data Capsule needs independent visibility or ownership outside Repository;
- external delivery cannot provide idempotency or redacted evidence; or
- a connector model requires Endpoint to become an authority-bearing Principal.

Any of the last four outcomes rejects the proposed capability rather than weakening the no-code boundary unless Product explicitly changes its absolute axiom.

## Minimum discriminating tests

1. One real no-code use case proves why controlled transfer is needed beyond manual copy.
2. Only allowlisted source/destination schema pairs and predefined mappings are accepted.
3. Unauthorized source read or destination delivery changes nothing and reveals no private metadata.
4. Duplicate idempotency keys produce at most one externally visible delivery.
5. Failed and timed-out deliveries expose redacted evidence without payload or secret leakage.
6. Data Capsule access never exceeds Repository authority and cannot create a standalone public workspace.
7. Script, shell, expression, arbitrary URL, build, test, deploy, source file, and credential-bearing fixtures are rejected.
8. Domain and Application tests remain provider-neutral; adapter tests prove secret resolution and provider translation stay outside them.

