# Web

The web app is the platform's single initial deployment boundary and Next.js composition root. Its App Router tree is the executable projection of admitted GitHub URL/IA semantics.

Route groups clarify delivery/access composition without changing URLs:

- `(public)` renders public product/discovery surfaces such as `/`, `/search`, `/explore`, and `/marketplace`.
- `(auth)` renders identity flows such as `/sign-in`.
- `(authenticated)` groups authenticated global surfaces such as `/dashboard`, `/repos`, and `/issues/assigned`.
- `(owner)` renders the shared public `/{ownerSlug}` User/Organization identity grammar and nested canonical `/{ownerSlug}/{repositorySlug}` Repository routes.

There is one root layout. Domain truth remains in `packages/domain`; use-case orchestration and neutral ports remain in `packages/application`; Supabase implementation details remain in `packages/infrastructure/supabase`; source-owned shadcn/ui primitives remain in `packages/ui`.

`src/routing` owns URL construction/parsing. `src/navigation` owns IA/navigation metadata. `src/composition` owns request-scoped provider wiring. No route, layout, Server Action, or component receives a Supabase client or generated database type.

## Owner delivery

`/{ownerSlug}` is the shared User/Organization profile identity path. The server resolves the slug through one Owner namespace projection and obtains `kind: user | organization`; URL shape never determines the kind.

The bare path is Overview. `?tab=repositories`, `?tab=stars`, and `?tab=projects` are Presentation Context only. Repository projection is visibility/authority filtered independently from profile existence.

## Repository delivery

The canonical Repository URL is `/{ownerSlug}/{repositorySlug}`. Stable Repository UUIDs remain internal authorization/data identities and are not public human navigation aliases.

Repository presentation has one owner/Repository header, primary navigation, and one active child-resource surface. GitHub `/wiki` presentation maps to the Page/Knowledge Domain family; current Page detail identity is `/{ownerSlug}/{repositorySlug}/wiki/{pageId}`.

Route-specific `@sidebar`, `@activity`, or `@modal` regions are used only when independent data, navigation, loading, recovery, or canonical soft-navigation behavior justifies them. Parallel and Intercepting Routes are presentation mechanics, not Containers, Domain boundaries, or authorization inputs.
