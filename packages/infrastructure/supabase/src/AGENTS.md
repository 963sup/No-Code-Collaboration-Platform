# Supabase Adapter Source Scope

- Group code by the Application port or provider capability it implements, not by arbitrary shared utility layers.
- Accept request-scoped clients explicitly or through a narrow factory. Do not create ambient singleton clients that can leak identity across requests.
- Keep query selection, provider DTOs, error translation, and row-to-Domain mapping explicit and reviewable.
- Generated types may describe database rows inside this package; they must not escape through public Application-facing results.
- RLS is independent enforcement, not a reason to omit Application/Domain authorization explanation. Service-role access must never become a general bypass.
- Export only adapters and factories required by the composition root through `src/index.ts`.
