# Web Application Instructions

- This app is the Next.js composition root and delivery mechanism for the platform.
- Use one root layout. Route groups `(public)`, `(auth)`, and `(app)` organize layout and access context without becoming URL segments or domain boundaries.
- Keep `(public)` for unauthenticated product surfaces, `(auth)` for identity flows, and `(app)` for authenticated collaboration surfaces. Protected routes require a real URL segment such as `/app` to avoid route collisions.
- Prefer Server Components. Add Client Components only for browser APIs, local interaction state, or event handlers.
- Use Server Actions for UI-originated mutations and Route Handlers only for real HTTP boundaries such as webhooks, callbacks, downloads, or public APIs.
- `proxy.ts` refreshes auth cookies and performs coarse redirects only. Application authorization and PostgreSQL RLS remain authoritative.
- Compose application use cases and infrastructure adapters here. Do not move business rules into layouts, pages, actions, or React components.
