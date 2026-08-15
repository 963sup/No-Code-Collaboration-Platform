# Tech Stack

- Authoritative pins: root `package.json`, package manifests, and `docs/DEVELOPMENT_ENVIRONMENT.md`.
- Runtime/build: Node.js 24.x; pnpm 11.20.0 via Corepack; TypeScript 5.7.2 strict; Turborepo 2.10.9.
- Web delivery: Next.js App Router 16.3.0; React/React DOM 19.2.8.
- Database/auth: workspace Supabase CLI 2.111.0 with disposable local PostgreSQL/Auth/RLS. Local configuration and tests do not imply a Supabase Cloud environment.
- Verification: Vitest 4.1.10, pgTAP, Playwright 1.62.1; oxfmt 0.42.0, oxlint 1.57.0, Knip 6.29.0.
- Workspace members: `apps/*`, `packages/*`, `packages/infrastructure/*`; cycles and unmatched filters fail by contract.
