# ADR-013: Core no-code data semantic envelope

- Status: Accepted
- Date: 2026-08-15

## Context

The Product Contract simultaneously named Data Commit, Data Branch, Data Diff, Change Proposal, Data Transfer, and Data Capsule while later prose rejected their benchmark aliases as if the underlying no-code problems were also rejected. ADR-011 treated the same concepts as conditional candidates, and ADR-012 required a future decision. Those statements allowed evidence, target semantics, and implementation status to be read as competing truth.

The problems survive removal of Source Code and Git: grouping typed changes, isolating data state, comparing authorized states, reviewing a bounded change set, transferring typed data, packaging finite typed data, and deriving a new Repository with provenance. Accepting those meanings does not prove a concrete lifecycle or authorize implementation.

## Decision

The Product accepts this semantic envelope:

1. Data Commit is an immutable, Actor-attributed batch of typed structured-data changes inside one Repository.
2. Data Branch is an isolated data-state line inside one Repository and never an authority Scope.
3. Data Diff is a derived comparison filtered by current read authority.
4. Change Proposal is a Process for proposing, reviewing, deciding, and applying typed data changes; participation and approval create no Capability.
5. Data Transfer moves typed data through allowlisted connectors/endpoints and never executes arbitrary code.
6. Data Capsule is a finite typed-data Artifact contained by one Repository.
7. Repository Derivation creates a distinct Repository with provenance, independent Owner and authority, and no default copy of secrets, Sessions, or Grants.

`Commit`, `Branch`, `Diff`, `Pull Request`, `Actions`, `Gist`, `Fork`, `Pull`, and `Push` remain external benchmark aliases only. Canonical target vocabulary uses the names above. `Pull` and `Push` may describe transfer direction, not Product entities.

This decision authorizes no Domain entity, schema, migration, Capability, API, route, UI, generic version-control engine, or automation runtime. Concrete lifecycles remain Candidate in the narrow Domain contracts.

## Non-confusion invariants

- Structural containment does not create another collaboration Container.
- Branch selection, Proposal participation or approval, Project filters, Notification state, Context, and Projection do not change effective authority.
- Each typed operation reuses the target Resource's validation, concurrency, authorization, and Evidence requirements.
- Script, shell, expression, Git ref/merge, source file, executable payload, secret value, and cross-Repository authority bypass are rejected.
- Governance constrains future action; Audit and Activity Evidence explain or prove past action.

## Supersession

- ADR-011 is refined: its conditional Data-semantics admission is now an accepted Product envelope, while its presentation decision and requirement for independent concrete Domain proof remain current.
- ADR-012 Decision item 10 is superseded only where it rejected or deferred the no-code Data semantic envelope. Its rejection of Source Code, Git mechanics, code review, arbitrary execution, and CI/CD remains current. All other ADR-012 decisions remain current.

## Alternatives rejected

- Reject all benchmark-named concepts: loses valid no-code collaboration problems and leaves contradictory canonical vocabulary.
- Admit GitHub mechanics through renamed wrappers: imports Source Code, Git, execution, and authority assumptions that fail the Product axiom.
- Implement a generic version-control or automation engine now: conflates distinct semantics before identity, lifecycle, and Capability evidence exists.
- Treat semantic acceptance as executable acceptance: erases the target-to-executable gap and bypasses Domain discrimination.

## Consequences and verification

Current contracts must distinguish accepted meaning from unavailable implementation. The gap register records the intentional executable absence. Documentation checks verify the envelope, aliases, supersession, relative links, and benchmark manifest consistency.

The minimum discriminating fixtures reject script, expression, Git ref, code payload, secret material, and cross-Repository authority bypass. They also prove that Branch selection, Proposal approval, Project filtering, and Notification state leave effective authority unchanged.

## Falsification

Revisit this decision only if direct no-code workflows show that one accepted meaning has no independent value, requires a second primary collaboration Container, cannot preserve Resource-level authorization and validation, or necessarily executes user-provided code. Rejection of one concrete lifecycle does not by itself reject the semantic envelope.
