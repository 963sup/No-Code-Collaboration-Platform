# Application Source Scope

- Organize behavior by use case: commands change state, queries read state, policies explain provider-neutral authorization, and ports describe required external capabilities.
- Use cases accept explicit actor, scope, and input values. They must not infer authority from UI context, routes, cookies, provider metadata, or persistence rows.
- Return Domain values or explicit Application results; do not expose provider clients, SQL shapes, framework responses, or generated database types.
- Keep orchestration thin and deterministic. Transactions, clocks, identity, and persistence enter through the narrowest port that the use case actually needs.
- Publicly reachable use cases and ports must be exported through this package's source entry point.
