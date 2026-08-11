# Web

The web app is the platform's single initial deployment boundary and Next.js composition root.

Route groups clarify delivery context without changing URLs:

- `(public)` renders public product surfaces at routes such as `/`.
- `(auth)` renders identity flows at routes such as `/sign-in`.
- `(app)` renders authenticated collaboration surfaces under the real `/app` segment.

There is one root layout. Domain truth remains in `packages/domain`, use-case orchestration remains in `packages/application`, database adaptation remains in `packages/supabase`, and source-owned shadcn/ui primitives remain in `packages/ui`.
