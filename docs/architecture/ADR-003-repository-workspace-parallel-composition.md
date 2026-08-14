# ADR-003: Repository workspace parallel composition

## Status

**Superseded.**

This ADR no longer defines current Repository Web architecture.

## Former decision

The earlier implementation treated Repository presentation as one shared framework layout with several persistent sibling surfaces rendered simultaneously.

That decision was useful while testing framework composition and hard-navigation recovery, but later product evidence showed that it had turned a framework capability into an unnecessary Product UI invariant.

Repository semantics never required permanent navigation, context, workspace, and activity panes. The Product axiom requires one Repository collaboration Container; it does not require one particular screen decomposition.

## Why it was superseded

The immediate replacement interaction model was one Owner/Repository header, primary navigation, and one active content surface. It removed the unproven four persistent panes:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Pages   Activity
----------------------------------
active content
```

This model has stronger alignment with the actual user relationship:

- the URL identifies one Owner and one Repository;
- primary navigation selects one Repository surface;
- Context remains view/filter state rather than a permanent screen region;
- Activity remains a Repository-scoped Projection rather than a required side pane; and
- public Repository reads must not be trapped inside an authenticated dashboard layout.

The previous multi-surface composition added presentation complexity without proving a distinct collaboration requirement. ADR-011 later refined the blanket single-surface constraint: admitted routes may compose narrowly scoped supporting regions when independent recovery, loading, responsive behavior, or canonical soft-navigation behavior is proven. ADR-003 remains superseded and does not authorize those slots itself.

## Current architecture

Current canonical route identity is owned by ADR-010; current route-specific supporting composition is owned by ADR-011 and `docs/architecture/README.md`:

```text
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/pages
/{ownerSlug}/{repositorySlug}/pages/{pageId}
/{ownerSlug}/{repositorySlug}/activity
```

Current Next.js projection:

```text
apps/web/src/app/(repository)/[ownerSlug]/[repositorySlug]/
├─ layout.tsx
├─ page.tsx
├─ pages/
└─ activity/
```

`/app` remains the authenticated Repository discovery/dashboard surface and is not part of Repository identity.

A stable-ID compatibility namespace may redirect to canonical routes after access-aware resolution; it may not host a second Repository UI.

## Durable lessons retained

The following lessons remain valid even though the former composition is superseded:

1. Framework route composition is presentation, not Domain truth.
2. Soft navigation and direct hard navigation to the same URL must resolve the same stable Repository identity and authorization result.
3. Unauthorized and nonexistent private Repository identities must not be distinguishable through route-resolution leakage.
4. Delivery code cannot own provider queries or business authorization decisions.
5. A framework capability becomes architecture only when it solves a demonstrated Product problem.

## Validation of the replacement

The replacement is valid when:

- `/app` Repository cards navigate to `/{owner}/{repository}`;
- direct refresh of canonical Overview, Pages, Page detail, and Activity routes succeeds;
- public Repository reads do not require authenticated dashboard layout state;
- Page mutations still establish Actor identity and evaluate Capability independently; and
- only one Repository UI/business-flow tree exists.
