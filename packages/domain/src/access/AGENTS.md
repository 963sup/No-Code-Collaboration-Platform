# Access Domain Scope

This directory owns the canonical business decisions for authorization, role delegation, and authority-preserving transitions. It does not own persistence, RLS syntax, framework delivery, or provider behavior.

## Inviolable invariants

- A capability authorizes an operation category; it never implies unlimited authority to delegate roles.
- Every role mutation MUST evaluate the actor role, the target's current role, and the proposed role.
- No principal may create, modify, or remove authority outside its explicit delegation scope.
- Organization `owner` is a protected governance role. An Organization `admin` may manage only `member` and `admin` relationships.
- A Repository `manager` may manage only `viewer` and `contributor` grants. A manager may not create, modify, or remove `manager` or `admin` grants.
- An Organization that still exists MUST retain at least one owner.
- Domain delegation decisions MUST remain deterministic, provider-neutral, and independent of Next.js, Supabase, generated database types, and user-interface state.
- Role bundles, delegation ceilings, and ownership continuity are separate concepts and MUST not be collapsed into one rank comparison.

## Change contract

Any change to a role, capability, or delegation rule must update the positive and negative transition matrix in Domain tests and the corresponding database enforcement tests. A database policy may project these rules, but it may not redefine them.
