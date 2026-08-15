# Repository Route Scope

- The canonical Repository URL is `/{ownerSlug}/{repositorySlug}`; the owner namespace resolves a User or Organization and never implies mandatory Organization ownership.
- `/app` is authenticated discovery/dashboard, not Repository identity. Repository reads evaluate visibility/authority and must not inherit an authenticated-only wrapper.
- One Repository shell owns one Owner/Repository header, primary navigation, and one active child Resource surface. Framework layouts never create another Product boundary.
- Route-specific `@sidebar`, `@activity`, or `@modal` regions require independent navigation, data, loading/recovery, or canonical soft-navigation responsibility.
- Every Parallel Route slot defines `default.tsx` and explicit unmatched soft-navigation behavior. An intercepted Resource preserves the same canonical URL as its full page.
- `/app/repositories/[repositoryId]/**` is access-aware, redirect-only compatibility resolution. It must not own a second Repository UI or leak inaccessible names.
- Organization-only `/app/[organizationSlug]/[repositorySlug]/**` Repository routing is invalid as canonical or compatibility UI.
- Presentation Context and slot state never become authorization inputs. Public reads and authenticated mutations independently evaluate their accepted capabilities.
- Use `docs/IMPLEMENTATION_GAPS.md` plus executable routes/tests for current surface status. Undefined Resource commands and routes fail closed; do not maintain a duplicated status list here.
