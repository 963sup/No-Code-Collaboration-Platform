# Migration History Scope

This directory is append-only deployment history derived from reviewed declarative schema changes.

## Inviolable invariants

- Never edit an already accepted migration to redefine current truth.
- Every migration MUST move an empty or previously deployed database toward the state declared in `supabase/schemas`.
- Security-sensitive migrations MUST include all policy, function privilege, trigger, and grant changes needed to close the boundary; partial deployment states are not acceptable.
- `SECURITY DEFINER` functions introduced by a migration MUST have public execution revoked before selective grants are applied.
- Migration SQL MUST be reviewed as code and replayed by local/CI `supabase db reset`.
- No migration workflow may invoke, bind to, or mutate a linked or remote Supabase project without explicit separate user intent.
