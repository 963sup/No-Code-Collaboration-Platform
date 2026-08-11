# Repository Workspace Route Scope

This route projects one Repository collaboration boundary into simultaneous presentation surfaces.

## Inviolable invariants

- `[repositoryId]` is URL identity only. Repository existence and accessibility are resolved through the cached Application query.
- The implicit `children` slot owns the Repository header. `@navigation`, `@workspace`, `@context`, and `@activity` own only their named presentation responsibilities.
- Every persistent slot, including `children`, MUST provide a meaningful `default.tsx` so hard navigation or refresh of a nested workspace route can reconstruct the complete shell.
- Nested routes under `@workspace` may replace only the workspace surface. Navigation, header, context, and activity must remain recoverable from their defaults.
- Slot defaults MUST reuse the same authorization-aware Repository read path; they may not fabricate state or create a second authorization model.
- Repository navigation MUST use real route segments for independently addressable surfaces. Hash fragments are reserved for locations within the currently active surface.
- No slot, route parameter, selected tab, or presentation context may grant, revoke, or reinterpret Repository authority.
- Page Server Actions MUST validate untrusted input, establish the current Actor, invoke an Application command, and revalidate projections only after success.
- Page create/update MUST use the provider-neutral authority-source and Capability decision before persistence; UI visibility and RLS alone are not the Application decision.
- Page routes MUST bind stable Page identity to the current Repository identity and preserve the complete nested destination through authentication.
- The Activity slot MUST render immutable facts from an Application read port and must not infer history from current Page state.
- A Parallel Route implementation change is incomplete until production build validation and a hard-navigation behavioral or structural regression check pass.
