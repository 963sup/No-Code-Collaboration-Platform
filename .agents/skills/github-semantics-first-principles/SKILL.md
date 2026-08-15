---
name: github-semantics-first-principles
description: Use whenever adapting, naming, designing, or reviewing a GitHub-derived concept for this no-code platform. This Skill applies first-principles reasoning under the immutable Repository axiom and excludes every code, source-control, arbitrary-execution, CI/CD, build, test, and deployment capability.
---

# GitHub Semantics First Principles

## Role boundary

This is the task workflow for reverse-engineering GitHub Product semantics into this platform. It embeds the necessary first-principles method; do not also invoke `first-principles-architecture` unless the task contains a separate broader or non-GitHub architecture decision. Read `github-product-semantics` as a supporting policy reference for canonical admission outcomes and guardrails, not as a parallel decision workflow.

## Absolute axiom

> **Repository = No-Code Collaboration Container**

GitHub is benchmark evidence for mature Product semantics. It is never implementation authority. No benchmark name, analogy, provider behavior, framework, existing implementation, or convenience may reinterpret Repository or introduce a second collaboration Container.

## Mandatory no-code boundary

Reject a candidate entirely when its value depends on any of the following:

- Source Code, source-control file trees, git refs, merge, checkout, or code-specific branch semantics;
- executable payloads, shell, scripts, expressions, arbitrary runtimes, or user-defined code;
- code parsing, Code Search, line-oriented code diff, or code review;
- CI/CD, build, test runner, deployment, Package, or Release source capabilities; or
- a second Repository-equivalent Container or an independent authorization boundary.

Do not preserve a rejected capability through renaming, metaphor, analogy, or a generic wrapper. Text remains opaque data and is never parsed or executed as code. Structured-data change, comparison, proposal, or transfer semantics may survive only when independently required by no-code collaboration and constrained by accepted schema, Repository authorization, typed operations, and no arbitrary execution.

## Admission workflow

1. State the exact GitHub-derived concept and the target decision.
2. Identify the underlying collaboration or organizational problem. Use current official GitHub evidence or direct observation when the benchmark fact is uncertain; label inference separately.
3. Remove every software-development, code, source-control, and execution assumption. If the problem no longer exists, reject the entire candidate.
4. Restate the surviving problem for an arbitrary no-code Repository and classify it with the ontology lens: Actor, Scope, Principal, Container, Relationship, Artifact, or Process. Keep Authorization, Presentation, and Evidence cross-cutting.
5. Map the candidate back to Repository as the only primary collaboration Container. Prove ownership, authority, lifecycle, URL/IA, and visibility without creating a second Container or authority source.
6. Check `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, the narrowest Domain contract, and `docs/architecture/README.md`. Current repository contracts decide target acceptance; the supporting `github-product-semantics` reference cannot override them.
7. Reject generic semantic-role persistence, taxonomy-driven packages/tables, or speculative capability frameworks. Semantic classification alone creates no entity, package, table, route, or feature.
8. Define the smallest discriminating test that could falsify the adaptation before persistence or architecture is introduced.

## Required output

- Target decision and underlying GitHub collaboration problem
- GitHub evidence versus inference
- No-code and source-control exclusion result
- Surviving target semantics and ontology classification, or explicit rejection
- Repository ownership, authorization, containment, and non-confusion checks
- Smallest discriminating test and remaining unknowns
