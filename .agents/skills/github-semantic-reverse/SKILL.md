---
name: github-semantic-reverse
description: Use whenever reverse-engineering, adapting, naming, designing, reviewing, auditing, or repairing GitHub-derived Product semantics for this no-code platform under a locked evidence snapshot and canonical glossary.
---

# GitHub Semantic Reverse

## Role boundary

This is the single task workflow for GitHub-derived Product semantics. It owns both one-concept admission decisions and repository-wide semantic audits or repairs. Do not create a second overlapping Skill for the same responsibility.

Apply the root `AGENTS.md` Absolute Product axiom without reinterpretation. Read `docs/PRODUCT.md` and `docs/ONTOLOGY.md` for current admission outcomes, semantic boundaries, and exclusions; this Skill routes the decision workflow and never replaces those contracts.

This workflow embeds the necessary first-principles method; do not also invoke `first-principles` unless the task contains a separate broader or non-GitHub decision.

## Mandatory evidence files

For a one-concept decision, read the narrowest relevant canonical contract and current official GitHub evidence.

For a repository-wide audit or repair, read in this order before changing Product semantics:

1. `REFERENCE_SNAPSHOT.md`
2. `GLOSSARY.md`
3. `BENCHMARK_CONCEPT_MATRIX.md`
4. the latest file in `audit-reports/`
5. `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, the narrowest Domain contract, and `docs/architecture/README.md`
6. executable evidence and `docs/IMPLEMENTATION_GAPS.md`

If the snapshot file is absent, overwritten, unlocked, or omits a required concept, repair it first and pause all other semantic edits.

## Mandatory no-code boundary

Reject a candidate entirely when its value depends on code, source-control, arbitrary execution, CI/CD, build, test, deployment, or a second Repository-equivalent Container. Do not preserve a rejected capability through renaming, metaphor, analogy, a Data-prefixed alias, or a generic wrapper.

The exclusion boundary is semantic rather than a raw string ban:

- Product, Domain, Application, API, persistence, URL/IA, and user-facing UI may not admit excluded source-control concepts as target capabilities or mental models.
- Benchmark evidence, exclusion rules, repair specifications, audit reports, and Git/GitHub engineering workflow may name external concepts only to identify, reject, or operate the engineering repository.
- Historical Evidence remains `Activity Event`; it must not be turned into a disguised version-control object or used as the Product description of a normal save.
- Legitimate current-state revisioning is permitted only as a scalar concurrency precondition with no history identity, ancestry, alternate state line, or user-visible source-control semantics.

Use `GLOSSARY.md` as the only excluded-concept mapping authority. Individual files may not invent local aliases or verification answers.

## Admission workflow

1. State the exact GitHub-derived concept and target decision.
2. Identify the underlying collaboration or organizational problem. Separate locked GitHub evidence from inference.
3. Remove every software-development, code, source-control, and execution assumption. If the problem disappears, reject the candidate.
4. Restate the surviving problem for an arbitrary no-code Repository and classify it with Actor, Scope, Principal, Container, Relationship, Artifact, or Process. Keep Authorization, Presentation, and Evidence cross-cutting.
5. Map the candidate back to Repository as the only primary collaboration and authorization boundary. Prove ownership, authority, lifecycle, URL/IA, and visibility without creating a second boundary or authority source.
6. Check the locked benchmark matrix and canonical Product, Ontology, Domain, and Architecture contracts. Current repository contracts decide target acceptance until formally corrected.
7. Reject generic semantic-role persistence, taxonomy-driven packages/tables, speculative capability frameworks, or source-control-shaped data models.
8. Define the smallest discriminating test that could falsify the adaptation before persistence or architecture is introduced.

## Verification-scenario rule

For every excluded concept, use the exact `Verification question`, `Required answer`, and `Forbidden answer shape` from `GLOSSARY.md`.

The answer fails when it still depends on:

- who changed something, when, or with what history message to explain a normal save;
- a private/default state line and later convergence;
- line/file/patch comparison;
- conflict markers or side selection;
- history rewriting or history-node selection;
- a movable current-state pointer; or
- continuing upstream authority or automatic synchronization.

`Activity Event` may satisfy a separate Evidence question. It cannot be used to make the `commit` mapping pass.

## Repository-wide repair workflow

1. Lock one `github/docs` reference commit for the whole repair cycle.
2. Audit semantic contexts, not raw word counts.
3. Record every finding in the dated audit report before repair.
4. Treat code and repository documentation as authority. Linear and Notion are mirrors and must follow authority, never reverse it.
5. Fix the earliest incorrect truth boundary first: Product/Ontology before architecture, implementation, UI, tests, and mirrors.
6. Classify each audited item as `newly_passed`, `maintained_passed`, `revoked`, or `not_passed`.
7. If `revoked` is empty, iterate only over `not_passed`. If an item is revoked, correct its verification scenario before changing implementation, record the revocation, and revalidate the item in the next audit round.
8. Stop automatic redefinition after two consecutive revocations of the same item and request an explicit Product decision.
9. The cycle passes only when every audited concept is traceable to the locked snapshot and both `revoked` and `not_passed` are empty.

## Required output

- Target decision and underlying GitHub collaboration problem
- Locked GitHub evidence versus inference
- No-code/source-control exclusion result
- Canonical target semantics or explicit rejection
- Repository ownership, authorization, containment, and non-confusion checks
- Exact verification question, required answer, forbidden answer shape, and remaining unknowns
- Audit classification and source-of-truth synchronization record when repository-wide work is performed
