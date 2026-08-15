# Tech stack

- Runtime/toolchain pins are authoritative in root `package.json` and `docs/DEVELOPMENT_ENVIRONMENT.md`: Node.js 24.x, pnpm 11.20.0 through Corepack, TypeScript strict mode, Turborepo.
- Web delivery: Next.js App Router and React; exact versions live in `apps/web/package.json`.
- Database/auth: pinned workspace Supabase CLI with disposable local Auth/PostgreSQL/RLS; provider clients live only in Infrastructure. No Supabase Cloud environment is implied by local files or tests.
- Verification stack: Vitest, pgTAP, Playwright; formatting/lint/dead-code gates use oxfmt, oxlint, and Knip.
- Workspace members are rooted at `apps/*`, `packages/*`, and `packages/infrastructure/*`; cycles and unmatched filters fail by contract.
