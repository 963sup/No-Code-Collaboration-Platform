# Domain Contract: Repository Collaboration

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-11

## Problem owned and success condition

Collaborative work needs one stable boundary that owns its identity, contained work, visibility, lifecycle, authorization target, and history.

This contract succeeds when a Repository can contain multiple Resource kinds while every Resource, permission decision, navigation surface, and historical event still has an unambiguous collaboration boundary.

## Evidence ledger

### Observations

- The root product invariant already defines `Repository` as a no-code collaboration container.
- The current database gives each Repository one Organization owner and one visibility state.
- The current Resource model requires every Resource to reference one Repository.
- Repository-scoped authorization queries and activity history already use `repository_id` as their boundary key.
- The first web workspace presents navigation, context, work, and activity simultaneously for one Repository.

### Constraints

- Repository must not inherit Git concepts or source-code semantics.
- Organization ownership, Repository identity, Resource containment, and access grants remain distinct.
- Domain semantics cannot depend on Next.js routes, Supabase DTOs, generated database types, or a specific UI composition.
- Cross-Repository behavior cannot bypass authorization or historical evidence.

### Assumptions

- One owning Organization is sufficient for the current product horizon.
- A Resource belongs to exactly one Repository at a time.
- Repository visibility can remain a small explicit state set while authority is evaluated separately.
- A shared Resource envelope plus explicit subtype behavior is sufficient for the first resource families.

### Unknowns

- Whether personal ownership is required.
- Whether Repository transfer, archive, restore, templates, or cloning require explicit lifecycle states.
- Which Resource kinds need independent identity and storage contracts.
- Whether any normal use case requires one Resource to belong to multiple Repositories.
- Whether public discovery and public access should be separate concepts.

### Value choices

- Prefer one explicit collaboration boundary over feature-specific containers.
- Prefer relational identity and ownership over an opaque generic JSON store.
- Prefer deferred lifecycle states over speculative completeness.
- Prefer explicit cross-Repository references over hidden containment exceptions.

## Boundary and owner

This contract owns:

- Repository identity and canonical naming within an owning Organization;
- the Repository-to-Organization ownership relationship;
- Repository visibility state;
- the Repository-to-Resource containment relationship;
- rules for entering, leaving, transferring, or deleting that boundary when those transitions are accepted; and
- the semantic requirement that Repository-scoped history and authority target the same Repository identity.

This contract does not own:

- authentication or User lifecycle;
- Organization membership lifecycle;
- grant evaluation, Role bundles, or capability delegation;
- the internal content model of each Resource subtype;
- feed, notification, or analytics projections;
- Next.js route composition; or
- PostgreSQL persistence mechanics.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Repository | Persistent no-code collaboration container |
| Repository ID | Stable identity used by relationships and authorization |
| Repository slug | Human-readable name unique within one owning Organization |
| Visibility | Repository discovery/access baseline state; currently `private`, `organization`, or `public` |
| Resource | Persistent Repository-scoped unit of collaborative work |
| Resource kind | Explicit discriminator selecting subtype behavior |
| Workspace | Presentation projection of one Repository; not a separate entity |
| Owner | Organization that owns the Repository; not the authenticated actor |

## Entities, relationships, and derived concepts

### Repository

A Repository has stable identity, one owning Organization, slug, name, optional description, visibility, creator attribution, and timestamps.

### Resource

A Resource has stable identity, exactly one Repository, explicit kind, title, creator attribution, and timestamps. Shared fields form an envelope; subtype-specific rules remain explicit.

### Relationships

```text
Organization 1 ── owns ── * Repository
Repository   1 ── contains ── * Resource
Repository   1 ── scopes ── * Activity Event
Repository   1 ── receives ── * Access Grant
```

`Workspace`, `repository collaborator`, and navigation sections are derived views. They do not gain independent lifecycle ownership through presentation alone.

## States and transitions

### Current Repository states

The accepted implementation currently models only active Repositories with visibility states:

- `private`
- `organization`
- `public`

Archive, soft-delete, transfer, template, and restore states remain unaccepted until a real lifecycle requires them.

### Current Resource states

The minimum model has persistent Resources with an explicit kind. Resource-specific workflow states belong to the subtype contract rather than the shared envelope.

### Transition rules

- Creating a Repository requires an existing owning Organization and a slug valid within that Organization.
- Renaming a Repository may change display name without changing stable identity.
- Changing visibility must not rewrite membership or grant facts.
- Creating a Resource requires an existing accessible Repository.
- Moving or copying a Resource across Repositories is not implicit; it requires an accepted transition with source and target authorization, history, and failure behavior.
- Deleting a Repository must define the fate of contained Resources, grants, and events before the operation becomes a public capability.

## Invariants

1. A Repository is never a Git code store by implication.
2. Every Repository has exactly one owning Organization in the current model.
3. A Repository slug is unique only within its owning Organization.
4. Every Resource belongs to exactly one Repository at a time.
5. A Resource cannot be read or mutated by bypassing its Repository authorization boundary.
6. Visibility does not change actor identity, Organization membership, or explicit grant facts.
7. The Workspace is a presentation of a Repository, not a second collaboration container.
8. Resource subtype content cannot redefine Repository ownership or authority.
9. Repository-scoped Activity Events reference the same stable Repository identity.
10. Provider-specific IDs or routes cannot become the canonical Repository model.

## Actors, principals, contexts, and permissions

- The authenticated User is the actor.
- The owning Organization is not the actor.
- A Principal may receive authority to the Repository.
- A selected Organization, Team, tab, or Workspace section is context only.
- The [Access Authority contract](./access-authority.md) determines effective Capabilities.
- Repository and Resource commands must be authorized server-side even when the UI hides unavailable actions.

## Events and workflows

Candidate event names include:

- `repository.created`
- `repository.renamed`
- `repository.visibility_changed`
- `repository.transferred`
- `repository.archived`
- `repository.deleted`
- `resource.created`
- `resource.updated`
- `resource.moved`
- `resource.deleted`

Only events tied to accepted commands and immutable facts should be emitted. A feed label is not sufficient reason to create an event.

Cross-Repository moves, transfer, archive, and deletion require explicit idempotency, partial-failure, and audit behavior before acceptance.

## Dependencies and failure behavior

- **Organization ownership**: Repository creation fails closed when the owning Organization does not exist or the actor lacks authority.
- **Access Authority**: Repository and Resource operations fail closed when effective Capabilities cannot be established.
- **Activity recording**: an operation that requires audit evidence must not report success unless its required event is durably recorded; lower-value feed projections may recover asynchronously.
- **Persistence adapter**: maps provider records to Domain contracts and cannot decide business ownership or visibility semantics.
- **Delivery layer**: resolves request input and presents output; it cannot create alternate Repository identity or permission rules.

## Alternatives and removal test

### Organization as the work container

This removes Repository but predicts that unrelated work, permissions, settings, and histories become coupled at Organization scope. It fails when teams need multiple independently governed collaboration spaces.

### Feature-specific containers

Separate page spaces, workflow spaces, task spaces, and data spaces reduce shared modeling initially but duplicate ownership, permissions, navigation, activity, and lifecycle rules.

### Generic `type + json` bucket

A single opaque resource table maximizes short-term flexibility but predicts weak invariants, provider-shaped Domain logic, difficult migrations, and subtype behavior hidden in application conditionals.

Removing this contract would force each feature to invent its own collaboration and authorization boundary.

## Falsification conditions

Reopen the boundary when:

- normal work requires Resources to have independent multi-Repository ownership;
- Repository visibility cannot be separated from authority without pervasive exceptions;
- multiple Repository types require contradictory identity or lifecycle invariants;
- Organization ownership cannot support demonstrated transfer or governance needs; or
- two real Resource vertical slices cannot share the envelope without leaking subtype rules into Repository behavior.

## Minimum discriminating tests

1. Create two Repositories with the same slug under different Organizations; both should be valid.
2. Attempt the same slug twice under one Organization; the second should fail.
3. Create a Resource without a Repository; the operation should fail.
4. Attempt to access a Resource through a different Repository ID; authorization should fail.
5. Change UI context while holding actor and Repository constant; effective access must remain unchanged.
6. Add a second real Resource kind; Repository behavior should remain stable while subtype rules remain isolated.
7. Delete or transfer in a controlled test only after the required containment, history, and recovery behavior is explicitly defined.
