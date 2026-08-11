# Supabase Adapter Package Instructions

- This package adapts Supabase Auth, PostgREST, Storage, and generated database types to application ports and domain values.
- `supabase/schemas` remains current database truth. Generated types in `src/generated/` are read-only projections.
- Database rows must not leak into `packages/domain`, `packages/application`, or `packages/ui`; map them at this boundary.
- Framework-specific cookies, headers, redirects, and request objects remain in the consuming app composition root.
- Create a server client per request. Never share authenticated clients across requests.
- Use RLS-aware user clients by default. Secret/service-role clients are exceptional server-only boundaries and must never enter browser bundles.
