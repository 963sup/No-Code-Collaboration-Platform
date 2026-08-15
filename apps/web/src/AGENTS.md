# Web Source Scope

- `app/` owns App Router delivery; `composition/` owns request-scoped provider wiring; `routing/` owns pure URL construction/parsing; `navigation/` owns information-architecture/navigation manifests; `components/` owns genuinely app-wide presentation.
- `app/(authenticated)` groups authenticated-only GitHub-aligned global surfaces without changing their URLs; `app/(owner)` projects the shared `/{ownerSlug}` User/Organization namespace and nested Repository identities without changing their URLs.
- Provider clients and generated database types may appear only in `composition/` or the Infrastructure package, never in route/component modules.
- Server-only configuration must fail closed when required values are absent and must never print secrets or raw environment contents.
- Client boundaries own browser interaction only; authenticated identity, Owner namespace resolution, Repository resolution, and authorization remain server-side decisions.
- Sentry instrumentation must minimize data and must not capture credentials, auth tokens, raw private Repository content, or unrestricted request payloads.
- Import through package public exports; do not bypass workspace boundaries with deep relative paths.
