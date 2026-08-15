# Owner Namespace Route Scope

- `/{ownerSlug}` is the canonical public identity projection for exactly one User or Organization resolved from the shared Owner namespace; URL shape never determines Owner kind.
- `/{ownerSlug}?tab=repositories|stars|projects` changes presentation Context only. No `tab` means Overview, and query state never changes identity, ownership, Membership, Principal resolution, or authorization.
- `/{ownerSlug}/{repositorySlug}` is the canonical Repository identity nested under the same resolved Owner namespace; Repository reads remain visibility/authority-aware and do not inherit an authenticated-only wrapper.
- User and Organization profiles share one routing grammar but render from the resolved `kind: user | organization`; Organization operational/admin surfaces remain `/orgs/{slug}/...` and `/organizations/{slug}/settings/...`.
- One Repository shell owns one Owner/Repository header, primary navigation, and one active child Resource surface. Framework layouts never create another Product boundary.
- Route-specific `@sidebar`, `@activity`, or `@modal` regions require independent navigation, data, loading/recovery, or canonical soft-navigation responsibility.
- Every Parallel Route slot defines `default.tsx` and explicit unmatched soft-navigation behavior. An intercepted Resource preserves the same canonical URL as its full page.
- Presentation Context and slot state never become authorization inputs. Public reads and authenticated mutations independently evaluate their accepted capabilities.
- Use `docs/IMPLEMENTATION_GAPS.md` plus executable routes/tests for current surface status. Undefined Resource commands and routes fail closed; do not maintain a duplicated status list here.
