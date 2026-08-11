# Application Package Instructions

- This package owns use-case orchestration, commands, queries, transaction intent, and ports required by business workflows.
- Depend only on `packages/domain` and other explicitly justified pure contracts.
- Do not import Next.js, React, Supabase clients, generated database types, SQL, cookies, or delivery-layer request objects.
- Ports describe what a use case needs; adapters implement those ports outside this package.
- Keep authorization decisions explicit. Authentication state and database enforcement do not replace domain capability checks.
- Test use cases with small in-memory fakes before testing infrastructure adapters.
