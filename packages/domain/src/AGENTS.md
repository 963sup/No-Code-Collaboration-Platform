# Domain Source Scope

- Model only stable business concepts, invariants, decisions, and transitions. Keep all results deterministic and provider-neutral.
- Repository is the collaboration Container. Its Owner is exactly a typed User or Organization relationship; Organization is not a mandatory parent and ownership is not a synthetic Grant.
- Repository-contained resources share containment and authorization semantics without erasing their distinct vocabulary, lifecycle, or discriminating invariants.
- Actor, Scope, Principal, Container, Relationship, Artifact, and Process are reasoning roles, not a generic superclass or folder taxonomy.
- Reject invalid states and undefined transitions explicitly. Do not invent default authority, lifecycle behavior, or compatibility semantics.
- Export public Domain contracts through `src/index.ts`; keep helpers private until a real cross-module contract requires them.
