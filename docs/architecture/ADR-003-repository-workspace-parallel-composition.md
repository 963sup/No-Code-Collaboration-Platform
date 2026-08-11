# ADR-003: Repository workspace parallel composition

## Status

Accepted

## Decision

Represent the first Repository workspace at `/app/repositories/[repositoryId]` with one Next.js App Router layout, the implicit `children` header, and four named Parallel Route slots: `@navigation`, `@workspace`, `@context`, and `@activity`.

Add `GetAccessibleRepository` and `RepositoryReader.findAccessibleRepositoryById` as a provider-neutral Application read capability. The Supabase adapter implements it with an explicit Repository identifier filter and `maybeSingle()`. Existing PostgreSQL grants and RLS determine whether the row is visible; absent and unauthorized Repositories both resolve to the same not-found delivery result.

Use a request-scoped React cache around the Application query so independently rendered Server Component slots share one read result without sharing state across requests. Do not introduce a Parallel-Route domain model, slot-specific aggregate, client-side global store, database view, or schema change.

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
```

The Repository remains the collaboration and authorization boundary. Navigation, workspace, context, and activity are simultaneous views of that boundary. They do not become new entities merely because Next.js gives them named slots.

## Alternatives rejected

- One large `page.tsx`: initially shorter, but couples independent surfaces and contradicts the declared composite-workspace delivery model.
- A client-side dashboard store: duplicates server truth, adds hydration and synchronization cost, and risks treating UI selection as authorization state.
- Direct Supabase queries in each slot: leaks provider details into delivery code and repeats request-scoped work.
- New database tables or placeholder activity rows: creates false domain facts solely to make the UI appear complete.
- Slot names based on position such as `@left` or `@right`: encode layout accidents rather than product responsibility.

## Consequences

- Each surface can later gain its own Application read model, loading state, and error boundary without changing Repository identity.
- Hard navigation has explicit `default.tsx` fallbacks for every named slot.
- Unauthorized and nonexistent Repository identities are not distinguishable through the delivery response.
- The first workspace truthfully renders empty resource and activity states until real vertical slices justify additional capabilities.
- The parent `/app` overview remains a simple Repository list and links into the composite workspace.

## Falsification conditions

Revisit this decision if the surfaces no longer share a Repository URL identity, require independent navigation histories that cannot be represented by slots, or measurements show that Parallel Route complexity exceeds the value of independent rendering and failure isolation.

## Validation

- Application unit tests prove found and unavailable Repository outcomes through the neutral port.
- Architecture checks continue to prohibit Supabase imports outside the Infrastructure adapter and web composition root.
- Next.js production build validates the slot contract, async params, and default fallbacks.
- Playwright proves nested Repository URLs preserve the requested destination through authentication.
- Supabase verification continues to prove Repository RLS and generated database type consistency without a schema change.
