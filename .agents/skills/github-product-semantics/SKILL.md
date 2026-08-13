---
name: github-product-semantics
description: Use when researching or adapting GitHub product concepts, resource hierarchy, ownership, permissions, navigation, collaboration flows, or naming for this no-code platform.
---

# GitHub Product Semantics

1. Identify the root user or system problem behind the GitHub concept.
2. Gather current official GitHub evidence or direct product observation; label inference separately.
3. Separate GitHub facts from this platform's target contract.
4. Classify the durable mechanism with the Product ontology lens before proposing implementation:
   - Actor — who acts;
   - Scope — which ownership/governance boundary applies;
   - Principal — who may receive authority;
   - Container — where collaboration has one stable boundary;
   - Relationship — how identities/principals/scopes/containers are connected;
   - Artifact — what collaborative work exists inside a Container;
   - Process — how Artifact/Relationship state validly changes.
5. Keep cross-cutting semantics separate instead of forcing them into the seven roles:
   - Authorization — Role / Capability / Policy / Delegation / Effective Authorization;
   - Presentation — Context / Workspace / Project-style Projection;
   - Evidence — Activity Event / stronger historical fact when proven necessary.
6. Decide whether the candidate is actually a concrete Entity, Relationship, derived classification, Process, Projection, Evidence contract, or merely benchmark vocabulary. Semantic classification alone never creates a Domain/package/table.
7. Remove Git-specific assumptions unless the no-code collaboration model independently requires them. In particular, Branch / Commit / Pull Request / Merge are not inherited by default; preserve only the underlying collaboration mechanism.
8. Map every accepted candidate back to the invariant that Repository is the primary no-code collaboration Container. Enterprise/Organization governance, Team/App principals, Project views, and workflow/change surfaces must not silently create a second Repository-equivalent Container.
9. Check non-confusion boundaries in `docs/ONTOLOGY.md`: Actor ≠ Principal ≠ Context; Membership ≠ Grant; Role ≠ Capability; Policy constrains rather than silently grants; Collaborator is derived; Event is Evidence while Feed/Notification/Audit are Projections.
10. Propose the smallest discriminating test that could reject the adaptation before introducing persistence or architecture.

Never use GitHub's existence of a feature as sufficient justification for adding it here. Use `docs/PRODUCT.md` as the root Product Contract and `docs/ONTOLOGY.md` as its canonical semantic expansion.
