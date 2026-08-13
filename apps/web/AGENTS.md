# Web Delivery Scope

`apps/web` is the Next.js delivery and composition boundary. The fixed dependency direction is `Web -> Application -> Domain`; Supabase implementations enter Web only through `src/composition`.

## Invariants

- Use the App Router. URL structure, Route Groups, Dynamic Segments, and Parallel Route `@slots` are presentation concerns; they are not Domain entities or bounded-context evidence.
- Prefer Server Components. Add Client Components only at the smallest boundary that needs browser APIs, local interactive state, effects, or event handlers.
- Keep `page.tsx`, `layout.tsx`, Server Actions, and Route Handlers thin. Business rules and use-case orchestration belong to Domain/Application.
- Server Actions and Route Handlers treat transport input as untrusted, validate it, invoke Application use cases, and map results back to the delivery protocol.
- Dynamic route parameters provide identifiers only. Application/domain authorization determines whether a resource exists for the actor and which operations are allowed.
- Routes, layouts, actions, handlers, and components must not query Supabase directly. Supabase SDKs, DTOs, Rows, generated database types, and provider-specific behavior stay in `packages/infrastructure/supabase` and `apps/web/src/composition`.
- Web session integration uses `@supabase/ssr`; do not reintroduce `@supabase/auth-helpers-*`.
- Authentication is not Authorization. A valid Session never implies Repository, Organization, Page, or other resource authority.
- Parallel Routes are UI composition only. Follow `src/app/AGENTS.md` for persistent-slot and hard-navigation fallback invariants.
- The canonical Repository workspace is `/app/[organizationSlug]/[repositorySlug]`. `/app/repositories/[repositoryId]/**` is a compatibility redirect namespace only; never add a second Repository UI, business flow, or provider query tree there.
- Route-local UI may be colocated under private folders. Promote logic only when its ownership is clear; do not create a generic shared layer to hide uncertainty.
- Do not use import-specifier `as` aliases to mask ownership or naming problems. Fix the exported name or introduce an explicit adapter/facade instead.

## Placement test

Before adding Web code, classify it:

```text
business invariant or decision -> Domain
use case or provider-neutral Port -> Application
provider implementation -> Infrastructure
routing/rendering/interaction/composition -> Web
```

If it is not the last category, do not place it under `apps/web` merely because a page currently calls it.

## Verification

Use current framework documentation through Context7 when Next.js behavior is version-sensitive instead of expanding this file with framework reference material. Run the narrow affected checks first; use `pnpm verify:fast` after normal Web changes and `pnpm verify:full` before merge when build, exports, dependencies, or reachability can change.
