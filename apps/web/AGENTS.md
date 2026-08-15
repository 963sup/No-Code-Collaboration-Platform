# Web Delivery Scope

`apps/web` owns Next.js delivery and composition. The dependency direction is `Web -> Application -> Domain`; Supabase implementations enter Web only through `src/composition`.

## Invariants

- Use the App Router and prefer Server Components. Add Client Components only at the smallest boundary requiring browser APIs, local interaction state, effects, or event handlers.
- Treat route, form, header, cookie, query, and environment input as untrusted. Validate at the delivery boundary before invoking an Application use case.
- Keep `page.tsx`, `layout.tsx`, Server Actions, and Route Handlers thin. Business rules and use-case orchestration belong to Domain/Application.
- Routes, layouts, actions, handlers, and components must not query Supabase directly. Provider SDKs, rows, generated types, and provider behavior stay in `packages/infrastructure/supabase` and `src/composition`.
- Web session integration uses `@supabase/ssr`; do not reintroduce deprecated provider helpers.
- Authentication is not authorization. A valid Session never implies Organization, Repository, or Resource authority.
- Keep route-local UI colocated until a second real consumer proves a reusable ownership boundary.
- Do not use compatibility facades or aliases to preserve obsolete routing or ownership after consumers migrate.

## Placement test

```text
business invariant or transition -> Domain
use case or provider-neutral Port -> Application
provider implementation          -> Infrastructure
routing/rendering/interaction     -> Web
provider construction/wiring      -> Web composition
```

## Verification

Run the narrow affected package or browser check first. Use current official framework documentation when Next.js behavior is version-sensitive; run `pnpm verify:fast` after normal Web changes and `pnpm verify:full` when build, exports, dependencies, or reachability may change.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
