# ADR-008: Repository semantic routing

- Status: Accepted
- Date: 2026-08-12
- Decision owner: Repository owner
- Affected scopes: Web information architecture, Repository read projection, Supabase route resolution, browser contracts

## Decision

Repository URLs use the human-readable Organization and Repository namespace while authorization continues to target the stable Repository UUID.

```text
/app/{organizationSlug}/{repositorySlug}
↓ access-aware route resolution
Repository UUID
↓
Application authorization + PostgreSQL RLS
```

The first concrete collaborative child surface is named `pages` in the URL. `Resource` remains the Domain abstraction and is not exposed as the primary user-facing route vocabulary.

Legacy UUID URLs remain temporary compatibility aliases. They must establish Repository access before revealing or redirecting to the canonical Organization/Repository slug path.

## Evidence

- Repository Collaboration already defines Repository ID as stable relationship/authorization identity and Repository slug as the human-readable name unique inside one owning Organization.
- At adoption, the first Page vertical slice proved the only executable Resource kind. ADR-011 and the current Product/Ontology contract later admitted Issue and Discussion Product identity; their executable routes remain registered gaps.
- Existing `/app/repositories/{uuid}/resources/{pageId}` routes expose persistence and ontology vocabulary rather than the product namespace people navigate.
- Direct Repository grants can make a User a collaborator without Organization membership, so route resolution cannot require broad Organization row access first.
- GitHub is benchmark evidence for a durable owner/repository namespace mechanism, not a requirement to copy its source-code semantics or root URL shape.

## Constraints

- Slug lookup must never replace stable Repository identity in authorization decisions.
- An inaccessible private Repository must resolve like an absent Repository and must not leak its canonical slug through redirects.
- Outside collaborators with an accepted direct Repository grant must be able to resolve the Repository namespace without gaining broad Organization table visibility.
- Next.js route groups and parallel slots remain presentation composition only.
- Public Repository delivery remains a separate product decision; the canonical authenticated namespace stays under `/app` for this slice.

## Alternatives rejected

### Keep UUID as the primary URL

This is technically simple but makes database identity the product navigation model and weakens the Organization-owned Repository namespace already accepted by the Domain contract.

### Resolve Organization through ordinary Organization RLS first

This breaks direct outside collaborators because Organization membership and Repository access are intentionally different relationships.

### Expose a generic `/resources/{id}` surface

This leaks the shared Domain envelope into user navigation. Concrete Resource kinds should earn their own product surface when accepted.

### Move immediately to `/{organization}/{repository}`

At the time of this decision, anonymous/public Repository delivery had not been accepted or verified, so copying GitHub's public URL shape was not justified by the then-current Product contract.

## Consequences

Benefits:

- URLs reflect ownership and collaboration semantics instead of database implementation.
- Stable UUIDs remain internal authorization targets.
- Outside collaborator access remains explainable and least-privilege.
- Page becomes the first concrete child surface without forcing future Resource kinds into a generic URL.
- Future Repository rename behavior now has an explicit URL-lifecycle question rather than silently breaking links.

Costs:

- Route resolution requires a dedicated access-aware projection.
- Legacy UUID routes need temporary compatibility handling.
- Slug mutation must remain constrained until alias/redirect lifecycle is explicitly accepted.

## Falsification conditions

Reopen this decision if Organization ownership stops being the normal Repository namespace, personal Repository ownership becomes a demonstrated requirement, public delivery requires a different canonical route model, or stable slugs cannot provide acceptable navigation without exposing inaccessible resource existence.

## Minimum discriminating tests

1. An authenticated direct Repository collaborator who is not an Organization member resolves `/app/{organizationSlug}/{repositorySlug}`.
2. The same actor still cannot broadly read the Organization row through ordinary Organization RLS.
3. An unrelated actor receives no route projection for the private Repository.
4. Legacy `/app/repositories/{uuid}` redirects only after access-aware resolution.
5. `/pages` and `/pages/{pageId}` preserve the same Repository UUID authorization target used by Application and RLS.
6. Anonymous navigation to semantic `/app/**` paths preserves the exact path through sign-in.
