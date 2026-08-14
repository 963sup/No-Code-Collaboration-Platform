# Next.js App Router Scope

This directory owns URL identity, rendering, route composition, and delivery-specific recovery. Domain and authorization truth remain outside the App Router.

## Inviolable invariants

- Route special files are delivery adapters. They may orchestrate Application use cases but may not own business decisions or provider queries.
- Route Groups are presentation/access composition only. Their names never become Product URL semantics.
- The canonical Repository workspace URL is `/{ownerSlug}/{repositorySlug}`. The owner segment resolves a User or Organization owner namespace; it never implies Organization ownership.
- `/app` is an authenticated Repository discovery/dashboard surface, not part of Repository identity.
- Canonical Repository routes must not inherit an authenticated-only layout because `public` Repository visibility is an accepted anonymous read baseline. Repository read access is decided from Repository visibility/authority, not from Route Group membership.
- The canonical Repository shell follows the mature owner/repository interaction model: one owner/Repository header, horizontal primary navigation, and one active content surface. Do not require persistent navigation/context/activity panes merely because Parallel Routes are available.
- Current accepted Repository child surfaces are `/pages`, `/pages/[pageId]`, and `/activity`. Future GitHub-inspired surfaces enter the same namespace only after Product/Domain acceptance.
- `Context` is a presentation concept; it does not require a permanent screen region and must never become authorization input.
- `Activity` is a Repository-scoped projection and may be a normal navigation surface rather than a permanently visible side panel.
- The only accepted Repository compatibility namespace is `/app/repositories/[repositoryId]/**`. It must be access-aware and redirect-only; it must not own a second Repository business-flow/UI implementation.
- Organization-only `/app/[organizationSlug]/[repositorySlug]/**` Repository routing must not exist as canonical or compatibility UI because it encodes a false mandatory-owner assumption.
- Soft navigation and direct hard navigation to the same canonical URL must resolve the same Repository stable identity and authorization result.
- URL state may select a presentation surface, but it must never alter authenticated identity, ownership, Membership, Principal resolution, or server-side authorization facts.
- `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`, Server Actions, and Route Handlers remain thin and must not import Supabase adapters outside the composition boundary.
- Public Repository reads must not be converted into authenticated-only behavior by delivery wrappers. Authenticated mutations still establish Actor identity and evaluate Application/Domain Capability independently.

## Canonical Repository route shape

```text
src/app/(repository)/
└─ [ownerSlug]/
   └─ [repositorySlug]/
      ├─ layout.tsx
      ├─ page.tsx
      ├─ pages/
      │  ├─ page.tsx
      │  └─ [pageId]/page.tsx
      └─ activity/page.tsx
```

The canonical layout renders:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Pages   Activity
----------------------------------
active content
```

This is a presentation projection of one Repository, not a new Domain hierarchy.
