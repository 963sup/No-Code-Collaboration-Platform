# Web

The web app is the platform's single initial deployment boundary and Next.js composition root.

Route groups clarify delivery context without changing URLs:

- `(public)` renders public product surfaces at routes such as `/`.
- `(auth)` renders identity flows at routes such as `/sign-in`.
- `(app)` renders authenticated collaboration surfaces under the real `/app` segment.
- `(repository)` renders canonical `/{ownerSlug}/{repositorySlug}` Repository surfaces with visibility- and authority-aware access.

There is one root layout. Domain truth remains in `packages/domain`, use-case orchestration and neutral ports remain in `packages/application`, Supabase implementation details remain in `packages/infrastructure/supabase`, and source-owned shadcn/ui primitives remain in `packages/ui`.

Next.js routes and components call Application use cases. Provider wiring is localized in `src/composition`; no route, layout, Server Action, or component receives a Supabase client or generated database type.

## Repository delivery

The canonical Repository URL is `/{ownerSlug}/{repositorySlug}`. The owner namespace resolves a User or Organization, while stable Repository identity and server-side authorization remain independent of the human-readable path.

Repository presentation has one owner/Repository header, primary navigation, and one active child-resource surface. Route-specific `@sidebar`, `@activity`, or `@modal` regions are used only when independent data, navigation, loading, recovery, or canonical soft-navigation behavior justifies them. Every named slot defines an explicit default and clearing behavior.

`/app/repositories/[repositoryId]/**` is access-aware, redirect-only compatibility resolution. It never owns a second Repository UI. Parallel and Intercepting Routes are presentation mechanics, not Containers, Domain boundaries, or authorization inputs.
