# Migration History Scope

This directory is append-only accepted replayable database transition history derived from reviewed declarative schema changes.

## Inviolable invariants

- Never edit an already accepted migration to redefine current truth.
- Every migration MUST move an empty or previously applied database toward the state declared in `supabase/schemas`.
- A migration file proves that a transition is versioned. It does not prove that any persistent environment applied it.
- Accepted migrations MUST pass local/CI replay. Applied status MUST be established separately for each environment through its migration ledger and direct provider evidence.
- Security-sensitive migrations MUST include all policy, function privilege, trigger, and grant changes needed to close the boundary; partial deployment states are not acceptable.
- `SECURITY DEFINER` functions introduced by a migration MUST have public execution revoked before selective grants are applied.
- Migration SQL MUST be reviewed as code and replayed by local/CI `supabase db reset --local`.
- No migration workflow may invoke, bind to, or mutate a linked or remote Supabase project without explicit separate user intent and an accepted deployment boundary.
- The existing migrations remain Accepted local replay and security evidence even while no Supabase Cloud project is provisioned.

## State model

```text
Draft
→ generated or written, still under review

Accepted
→ committed and verified through local/CI replay

Applied
→ recorded in one identified environment's migration ledger
```

Applied state is environment-specific and cannot be inferred from Git history.
