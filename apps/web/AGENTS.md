# Web Delivery Scope

`apps/web` is the Next.js delivery and composition boundary. The fixed dependency direction is `Web -> Application -> Domain`; Supabase implementations enter Web only through `src/composition`.

## Invariants

- Use the App Router. URL structure, Route Groups, Dynamic Segments, and rendering composition are presentation concerns; they are not Domain entities or bounded-context evidence.
- Prefer Server Components. Add Client Components only at the smallest boundary that needs browser APIs, local interactive state, effects, or event handlers.
- Keep `page.tsx`, `layout.tsx`, Server Actions, and Route Handlers thin. Business rules and use-case orchestration belong to Domain/Application.
- Server Actions and Route Handlers treat transport input as untrusted, validate it, invoke Application use cases, and map results back to the delivery protocol.
- Dynamic route parameters provide human identifiers only. Application/Domain authorization resolves the stable Repository target and determines whether a resource exists for the Actor and which operations are allowed.
- Routes, layouts, actions, handlers, and components must not query Supabase directly. Provider SDKs, DTOs, rows, generated database types, and provider-specific behavior stay in `packages/infrastructure/supabase` and `apps/web/src/composition`.
- Web session integration uses `@supabase/ssr`; do not reintroduce deprecated provider helpers.
- Authentication is not Authorization. A valid Session never implies Repository, Organization, Page, or other Resource authority.
- The canonical Repository workspace is `/{ownerSlug}/{repositorySlug}`. The Owner segment resolves either a User or Organization Owner namespace and never implies Organization ownership.
- `/app` is an authenticated discovery/dashboard surface. It is not part of Repository identity.
- Canonical Repository reads must not inherit an authenticated-only wrapper because public Repository visibility is an accepted anonymous read baseline. Authenticated mutations establish Actor identity and independently evaluate Capability.
- For GitHub-derived surfaces that pass Product admission, sanitized public and read-only authenticated GitHub URL/IA, navigation, responsive composition, and interaction evidence is the constitutional presentation baseline; deviations require an explicit Product reason and discriminating test.
- Canonical Repository presentation is one Owner/Repository header, primary navigation, one active child resource surface, and only proven route-specific supporting regions. Framework composition features never create Product boundaries, permanent panes, or URL identity.
- Parallel Route slots require `default.tsx` plus explicit unmatched soft-navigation behavior. Intercepting Routes preserve the full-page resource's canonical URL and authorization result.
- Accepted target Repository child surfaces are `/issues`, `/issues/[issueNumber]`, `/projects` (attachment/list Projection), `/discussions`, `/discussions/[discussionNumber]`, `/pages`, `/pages/[pageId]`, `/activity`, `/security`, and `/settings`. Only Pages and Activity are currently executable; other surfaces must not be represented as implemented until their registered gaps close.
- `Context` may change navigation/filtering/presentation but never persisted authorization facts.
- Activity is a Repository-scoped projection with a canonical navigation surface. An independently loaded Overview summary is allowed only when its privacy-safe projection and removal test are proven.
- `/app/repositories/[repositoryId]/**` is compatibility-only. It must perform access-aware resolution and redirect to the canonical Owner/Repository URL; it must never own a second Repository UI/business-flow tree.
- Do not keep an Organization-only Repository route tree as a compatibility UI. It encodes a false ownership invariant and must not coexist with canonical Owner routing.
- Soft navigation and direct hard navigation to the same canonical URL must resolve the same stable Repository identity and authorization result.
- Route-local UI may be colocated under private folders. Promote logic only when ownership is clear; do not create a generic shared layer to hide uncertainty.
- Do not use import aliases or compatibility facades indefinitely to mask obsolete ownership/routing contracts. Once consumers are migrated, remove the obsolete seam.

## Canonical route shape

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

Route Groups do not become Product URL segments.

The Repository layout presents:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Issues   Projects   Discussions   Pages   Activity   Security   Settings
----------------------------------
route-specific support | active child resource | route-specific support
```

Supporting regions are absent unless the active route proves independent navigation, metadata, loading, recovery, or responsive behavior. This is one Repository presentation, not a second collaboration hierarchy.

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

Use current framework documentation through Context7 when framework behavior is version-sensitive. Run the narrow affected checks first; use `pnpm verify:fast` after normal Web changes and `pnpm verify:full` before integration when build, exports, dependencies, or reachability can change.

Browser verification must explicitly cover `/app` → Repository card → `/{owner}/{repository}` → Pages → Page create/open/update → Activity. A green suite does not prove a journey it does not exercise.
