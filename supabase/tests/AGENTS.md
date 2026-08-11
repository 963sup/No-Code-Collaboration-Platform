# Database Authorization Test Scope

This directory proves PostgreSQL grants, RLS, functions, triggers, and cross-row invariants through the real database boundary.

## Inviolable invariants

- Security fixes MUST include a regression test that represents the original attack path and fails without the enforcement change.
- Tests MUST run mutations as realistic `authenticated` actors with explicit JWT subjects rather than calling helper functions alone.
- Authorization matrices MUST cover INSERT, UPDATE, and DELETE where applicable, including both the existing role and proposed role.
- Self-escalation, mutation of peer or higher roles, forged actor attribution, cross-scope access, and last-owner removal are mandatory negative cases when affected.
- Every denied attack path requires at least one legitimate positive control through the same boundary.
- Cross-row ownership continuity MUST be tested for both rejection of the last-owner mutation and allowance when another owner remains.
- Tests MUST use transactions and rollback; they must not require or mutate any linked or remote Supabase project.
