# Next.js App Router Scope

This directory owns URL identity, rendering, route composition, and delivery-specific recovery. Domain and authorization truth remain outside the App Router.

## Inviolable invariants

- Route special files are delivery adapters. They may orchestrate Application use cases but may not own business decisions or provider queries.
- Parallel Route slots are presentation responsibilities, not Domain entities, principals, capabilities, or authorization contexts.
- The canonical Repository workspace is `/app/[organizationSlug]/[repositorySlug]` and MUST remain one shared Parallel Route layout with the implicit `children` slot plus `@navigation`, `@workspace`, `@context`, and `@activity`.
- The named `@slot` folders do not create URL segments. Concrete child URLs such as `/pages`, `/pages/[pageId]`, and `/activity` select product surfaces inside the same Repository namespace.
- A layout using named slots MUST declare and render the implicit `children` slot and every named slot explicitly.
- Soft navigation may replace the active workspace surface while persistent sibling slots remain part of the same Repository shell and authorization target.
- Every persistent named slot and the implicit `children` slot MUST have a `default.tsx` wherever a hard navigation can leave that slot unmatched.
- A persistent surface default MUST render a safe base surface or an explicit failure state; it MUST NOT silently return `null`.
- Hard navigation or refresh of a nested Repository URL must reconstruct the same persistent Repository shell through those meaningful defaults.
- Soft navigation and direct hard navigation to the same URL MUST preserve the same Repository identity and product responsibilities.
- URL state may select a presentation surface, but it must never alter authenticated identity or server-side authorization facts.
- `page.tsx`, `layout.tsx`, `default.tsx`, `loading.tsx`, and `not-found.tsx` must remain thin and must not import Supabase adapters outside the composition boundary.
