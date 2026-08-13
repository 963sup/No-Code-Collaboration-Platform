# ADR-003: Repository workspace parallel composition

## Status

Accepted for Repository Parallel Route composition.

The route identity and user-facing child-route vocabulary in this ADR are **partially superseded by [ADR-008](./ADR-008-repository-semantic-routing.md)**. The current canonical namespace is `/app/{organizationSlug}/{repositorySlug}`, and the first concrete child surface is `/pages`. Historical `/app/repositories/[repositoryId]` and `/resources` examples below remain decision evidence, not current route truth.

## Current interpretation

The decision that remains current is the composition mechanism:

```text
Repository semantic URL identity
        ↓
shared Next.js layout
        ↓
children + @navigation + @workspace + @context + @activity
```

Parallel Route slots remain presentation responsibilities. ADR-008 changes how the Repository is addressed and how the Page surface is named; it does not flatten or replace this Parallel Route architecture.

## Decision

Represent the first Repository workspace at `/app/repositories/[repositoryId]` with one Next.js App Router layout, the implicit `children` header, and four named Parallel Route slots: `@navigation`, `@workspace`, `@context`, and `@activity`.

Add `GetAccessibleRepository` and `RepositoryReader.findAccessibleRepositoryById` as a provider-neutral Application read capability. The Supabase adapter implements it with an explicit Repository identifier filter and `maybeSingle()`. Existing PostgreSQL grants and RLS determine whether the row is visible; absent and unauthorized Repositories both resolve to the same not-found delivery result.

Use a request-scoped React cache around the Application query so independently rendered Server Component slots share one read result without sharing state across requests. Do not introduce a Parallel-Route domain model, slot-specific aggregate, client-side global store, database view, or schema change.

The workspace slot may expose independently addressable nested routes. The first such route is `@workspace/resources/page.tsx`, reached at `/app/repositories/[repositoryId]/resources`. Selecting that URL replaces only the workspace surface.

The implicit `children` slot and every persistent named slot must define `default.tsx`. Those defaults render the corresponding base surface rather than returning `null`, so a direct request or full reload of a nested workspace URL reconstructs the complete Repository shell.

## First-principles basis

The user decision is not “which Next.js feature should be used?” It is “how can one Repository collaboration context expose independent product surfaces without making presentation structure own business truth?”

The minimum sufficient model is:

```text
Repository URL identity
        ↓
Application read capability
        ↓
Authorization-aware Repository projection
        ↓
Parallel presentation surfaces
        ↓
One independently addressable active workspace surface
```

The Repository remains the collaboration and authorization boundary. Navigation, workspace, context, and activity are simultaneous views of that boundary. They do not become new entities merely because Next.js gives them named slots.

Parallel routing has two distinct navigation modes that must preserve the same product model:

```text
Soft navigation
→ Next.js retains active slot state

Hard navigation / refresh
→ default.tsx reconstructs every unmatched persistent slot
```

## Alternatives rejected

- One large `page.tsx`: initially shorter, but couples independent surfaces and contradicts the declared composite-workspace delivery model.
- Hash fragments for independently addressable workspace surfaces: cannot represent server-rendered route identity or exercise Parallel Route recovery on hard navigation.
- `default.tsx` files that return `null`: satisfy file presence but silently discard persistent product responsibilities during hard navigation.
- A client-side dashboard store: duplicates server truth, adds hydration and synchronization cost, and risks treating UI selection as authorization state.
- Direct Supabase queries in each slot: leaks provider details into delivery code and repeats request-scoped work.
- New database tables or placeholder activity rows: creates false domain facts solely to make the UI appear complete.
- Slot names based on position such as `@left` or `@right`: encode layout accidents rather than product responsibility.

## Consequences

- Each surface can later gain its own Application read model, loading state, and error boundary without changing Repository identity.
- Hard navigation has explicit, meaningful `default.tsx` recovery for every named slot and the implicit `children` slot.
- A nested workspace route can be bookmarked or refreshed while navigation, header, context, and activity remain present.
- Unauthorized and nonexistent Repository identities are not distinguishable through the delivery response.
- The first workspace truthfully renders empty resource and activity states until real vertical slices justify additional capabilities.
- The parent `/app` overview remains a simple Repository list and links into the composite workspace.

## Falsification conditions

Revisit this decision if the surfaces no longer share a Repository URL identity, require independent navigation histories that cannot be represented by slots, or measurements show that Parallel Route complexity exceeds the value of independent rendering and failure isolation.

Reopen the default-recovery rule if Next.js changes the hard-navigation contract so unmatched persistent slots no longer require explicit defaults, and production-build plus browser evidence confirms equivalent recovery without them.

## Validation

- Application unit tests prove found and unavailable Repository outcomes through the neutral port.
- Architecture checks require the implicit and named slot defaults, reject `null` persistent fallbacks, and require a real nested workspace route.
- Next.js production build validates the slot contract, async params, nested route, and default fallbacks.
- Playwright proves nested Repository URLs, including the resources surface, preserve the requested destination through authentication.
- Supabase verification continues to prove Repository RLS and generated database type consistency without a schema change.
