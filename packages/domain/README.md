# Domain

This package owns business truth for the no-code collaboration platform. It contains framework-independent concepts, invariants, policies, and deterministic state transitions.

Current executable baseline:

- Repository roles are convenience bundles.
- Capabilities are the authorization vocabulary.
- Role precedence and capability evaluation are deterministic and independently tested.

Persistence rows, generated database types, HTTP concerns, React, Next.js, and Supabase clients do not belong here.
