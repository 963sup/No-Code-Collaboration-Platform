# Next.js App Router Scope

This directory owns URL identity, rendering, route composition, and delivery-specific recovery. Domain and authorization truth remain outside the App Router.

## Inviolable invariants

- Route special files are delivery adapters. They may orchestrate Application use cases but may not own business decisions or provider queries.
- Route Groups are presentation/access composition only. Their names never become Product URL semantics.
- The canonical Repository workspace URL is `/{ownerSlug}/{repositorySlug}`. The owner segment resolves a User or Organization owner namespace; it never implies Organization ownership.
- `/app` is an authenticated Repository discovery/dashboard surface, not part of Repository identity.
- Canonical Repository routes must not inherit an authenticated-only layout because `public` Repository visibility is an accepted anonymous read baseline. Repository read access is decided from Repository visibility/authority, not from Route Group membership.
- For GitHub-derived surfaces that pass Product admission, sanitized public and read-only authenticated GitHub URL hierarchy, information architecture, navigation, responsive composition, and interaction evidence is the constitutional presentation baseline. Deviations require an explicit target Product reason and a discriminating test.
- The canonical Repository shell has one owner/Repository header, horizontal primary navigation, and one active child resource surface. Route-specific supporting regions may use `@sidebar`, `@activity`, or `@modal` only when they have independent data/navigation/loading or canonical soft-navigation behavior. They never become Product regions, authority inputs, or URL segments.
- Every Parallel Route slot must define `default.tsx` and explicit unmatched soft-navigation behavior. Intercepting Routes preserve the same canonical URL as their full-page resource; closing a route modal uses history navigation.
- Accepted target Repository child surfaces are `/issues`, `/issues/[issueNumber]`, `/projects` (attachment/list Projection), `/discussions`, `/discussions/[discussionNumber]`, `/pages`, `/pages/[pageId]`, `/activity`, `/security`, and `/settings`. Pages and Activity are executable; Issues has an executable read-only list/detail/intercepted-dialog slice. Issue commands/conversation and every Discussion route remain unsupported and fail closed.
- `Context` is a presentation concept; it does not require a permanent screen region and must never become authorization input.
- `Activity` is a Repository-scoped projection. A summary may support Repository Overview only when it has independent loading/failure behavior and a privacy-safe projection; the full Activity route remains canonical.
- The only accepted Repository compatibility namespace is `/app/repositories/[repositoryId]/**`. It must be access-aware and redirect-only; it must not own a second Repository business-flow/UI implementation.
- Organization-only `/app/[organizationSlug]/[repositorySlug]/**` Repository routing must not exist as canonical or compatibility UI because it encodes a false mandatory-owner assumption.
- Soft navigation and direct hard navigation to the same canonical URL must resolve the same Repository stable identity and authorization result.
- URL state may select a presentation surface, but it must never alter authenticated identity, ownership, Membership, Principal resolution, or server-side authorization facts.
- `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`, Server Actions, and Route Handlers remain thin and must not import Supabase adapters outside the composition boundary.
- Public Repository reads must not be converted into authenticated-only behavior by delivery wrappers. Authenticated mutations still establish Actor identity and evaluate Application/Domain Capability independently.

## Current executable Repository route shape

```text
src/app/(repository)/
└─ [ownerSlug]/
   └─ [repositorySlug]/
      ├─ layout.tsx
      ├─ page.tsx
      ├─ issues/
      │  ├─ page.tsx
      │  └─ [issueNumber]/page.tsx
      ├─ pages/
      │  ├─ page.tsx
      │  └─ [pageId]/page.tsx
      ├─ activity/page.tsx
      ├─ @sidebar/
      │  ├─ default.tsx
      │  └─ issues/**
      └─ @modal/
         ├─ default.tsx
         └─ (.)issues/[issueNumber]/page.tsx
```

The canonical layout renders:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Issues   Projects   Discussions   Pages   Activity   Security   Settings
----------------------------------
active content
```

This is a presentation projection of one Repository, not a new Domain hierarchy.
