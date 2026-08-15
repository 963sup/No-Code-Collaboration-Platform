# Supabase Adapter Test Scope

- Test that each adapter satisfies its Application port: query inputs, row mapping, result semantics, and expected provider-error translation.
- Use deterministic provider doubles for adapter behavior. Database grants, RLS, triggers, and SQL transitions are proved by `supabase/tests` instead.
- Include malformed, missing, denied, and cross-scope responses when the adapter contract distinguishes them.
- Never use production credentials, remote projects, or private Repository content in this suite.
- Avoid asserting incidental SDK call order unless ordering is part of the port contract.
