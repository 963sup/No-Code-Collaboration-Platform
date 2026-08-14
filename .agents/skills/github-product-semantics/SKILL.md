---
name: github-product-semantics
description: Use when researching or adapting GitHub product concepts, ownership, permissions, navigation, collaboration flows, enterprise organization semantics, or naming for this no-code platform.
---

# GitHub Product Semantics

## Absolute axiom

> **Repository = No-Code Collaboration Container**

No benchmark concept, framework, provider, naming convention, or UI pattern may reinterpret this axiom.

## Admission procedure

1. Identify the root collaboration or organizational problem solved by the GitHub concept.
2. Gather current official GitHub evidence or direct product observation; label inference separately.
3. Separate GitHub facts from this platform's target contract.
4. Ask whether the same problem exists when Repository is an arbitrary no-code collaboration Container.
5. If the candidate's usefulness depends on software-development-specific implementation assumptions rather than the collaboration problem itself, reject the candidate entirely. Do not preserve it through renaming, analogy, metaphor, or a supposedly more generic wrapper.
6. Classify only surviving durable semantics with the Product ontology lens:
   - Actor — who acts;
   - Scope — which ownership/governance boundary applies;
   - Principal — who may receive authority;
   - Container — where collaboration has one stable boundary;
   - Relationship — how identities/principals/scopes/containers connect;
   - Artifact — what collaborative work exists inside a Container;
   - Process — how an accepted Artifact/Relationship state validly changes.
7. Keep cross-cutting semantics separate:
   - Authorization — Role / Capability / Policy / Delegation / Effective Authorization;
   - Presentation — Context / Projection;
   - Evidence — Activity Event / stronger Historical Evidence when independently proven.
8. Decide whether the surviving candidate is a concrete Entity, Relationship, derived classification, Process, Projection, Evidence contract, or benchmark vocabulary only. Semantic classification alone never creates a Domain/package/table.
9. Map every accepted candidate back to Repository as the only primary collaboration Container.
10. Check non-confusion boundaries in `docs/ONTOLOGY.md`: Actor ≠ Principal ≠ Context; Membership ≠ Grant; ownership ≠ Grant; Role ≠ Capability; Policy constrains rather than silently grants; Collaborator is derived; historical Evidence is distinct from presentation Projections.
11. Prefer mature GitHub owner/Repository URL, naming, navigation, and access mental models only when the same target relationship exists after admission.
12. Propose the smallest discriminating test that could reject the adaptation before introducing persistence or architecture.

## Current benchmark outcomes

Currently accepted/durable:

- User and Organization may be Repository Owner types.
- Organization is a Membership/administration Scope and possible Owner, not mandatory Repository parent.
- Team is a future Organization-scoped group Principal pending a real second authority-source test.
- Enterprise is a future cross-Organization governance Scope pending a real governance constraint.
- Issue-style work tracking and Discussion-style conversation are accepted Repository Artifacts because actionable work and shared-understanding conversation remain distinct no-code collaboration problems with stable Repository-scoped identity. Their executable Domain/persistence contracts remain separate Open work.
- Project-style planning is an accepted Projection over Repository-scoped work, not an ownership/authorization Container; Repository `/projects` is an attachment/list projection and detail identity is owner-scoped.
- App/Installation remains a future machine identity/authority Relationship candidate.

Not accepted merely because GitHub exposes them:

- any benchmark capability whose product value disappears when software-development-specific implementation assumptions are removed;
- any generic automation, policy, integration, or plugin engine without an independently demonstrated no-code collaboration problem; and
- any second Repository-equivalent Container.

## Persistence and architecture guardrails

Do not create generic semantic-role persistence such as:

```text
actors
scopes
containers
relationships
artifacts
processes
principals(type,id)
```

Do not create a Collaborator aggregate or identity subtype.

Do not promote Team, Enterprise, Project persistence, App/Installation, or another Resource family from Deferred/Candidate solely because of taxonomy completeness. Do not infer Issue/Discussion persistence or implementation from Product admission; require their Domain identity, lifecycle, authorization, and evidence contracts first.

Use `docs/PRODUCT.md` as the root Product Contract and `docs/ONTOLOGY.md` as its canonical semantic expansion.
