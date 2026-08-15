# Next.js App Router Scope

- Route special files are delivery adapters. They may validate transport input and invoke Application use cases but may not own business decisions or provider queries.
- Route Groups organize presentation/access composition; their names never become Product URL semantics.
- URL and query state may select a presentation surface but must never alter authenticated identity, ownership, Membership, Principal resolution, or authorization facts.
- Prefer Server Components. Keep Client Components at the smallest interaction boundary and keep Server Actions explicit about input, result, and failure mapping.
- `not-found`, redirects, and error states must avoid leaking inaccessible private resource identity.
- Hard navigation and soft navigation to one canonical URL must preserve the same stable identity and authorization outcome.
- Scope-specific Repository and authentication rules live in their nearest Route Group instructions; do not copy their feature-status inventory here.
