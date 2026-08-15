# Supabase Infrastructure Package

- This package owns Supabase implementations of Application ports. It may depend on Application and Domain; neither may depend on this package.
- Supabase clients, queries, row DTOs, generated database types, and provider errors stay inside this Infrastructure boundary.
- Convert rows to Domain values through explicit mappers. A database row is not a Domain entity, and provider metadata is not business authority.
- Keep browser, request-scoped server, and administrative clients distinct. Administrative/service credentials are server-only and never enter browser bundles, logs, or telemetry.
- Use `@supabase/ssr` for cookie-backed Next.js sessions. Authentication establishes actor identity only; Application/Domain authorization and RLS remain separate controls.
- Adapters implement the port contract and translate expected provider failures into explicit results. They must not invent business rules to compensate for missing Domain behavior.
- Construct adapters and clients in the Web composition root; do not hide provider construction inside use cases.
