# Documentation Scope

- Separate external evidence, target design, implementation status, and decision history; never merge them into one ambiguous source of truth.
- `PRODUCT.md` owns root product meaning; `ONTOLOGY.md` is its canonical semantic expansion for the complete GitHub-to-target ontology, derivations, non-confusion boundaries, and admission rules. Domain/Architecture docs reference these rules instead of copying the full ontology.
- Prefer explicit entities, relationships, states, invariants, ownership, and trust boundaries over feature lists.
- Actor / Scope / Principal / Container / Relationship / Artifact / Process are semantic roles, not an instruction to create generic entities, tables, packages, or bounded contexts.
- Keep Authorization (`Role` / `Capability` / `Policy`), Presentation (`Context` / `Projection`), and Evidence (`Activity Event`) cross-cutting instead of forcing them into the seven semantic roles.
- Link to authoritative evidence instead of copying large external descriptions.
- Do not create task diaries, speculative roadmaps, or generated projections that silently become canonical.
- Keep terminology consistent with the root product invariant: Repository is the primary no-code collaboration container.
- Nested instruction files contain only the delta for their subtree.
