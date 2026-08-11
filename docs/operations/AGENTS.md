# Operations Documentation Scope

- This subtree owns production release, verification, recovery, data-protection, environment provisioning, and incident procedures; it does not replace product, domain, architecture, or development-environment contracts.
- Distinguish target procedure, currently verified procedure, and unresolved production gate. Never present an untested command or provider assumption as operational truth.
- A selected adapter is not a provisioned environment; record environment identity and provisioning status separately.
- A migration file is not an applied deployment; only an identified environment's migration ledger and provider evidence prove applied state.
- Local or CI verification proves reproducibility against disposable infrastructure, not preview or production validation.
- Every mutating procedure must state authority, preconditions, expected evidence, stop conditions, rollback or forward-recovery behavior, and blast radius.
- Never commit secrets, credentials, project references, private production data, incident personal data, or copied provider configuration.
- Prefer reproducible commands and provider deployment identifiers over screenshots or memory.
- Preserve database history. Do not rewrite an applied migration or recommend destructive recovery when a forward fix or isolated restore is safer.
- Treat authentication, authorization, data integrity, backups, and external providers as explicit trust boundaries.
- Ordinary verification must not link to or mutate a remote Supabase project. A remote deployment boundary requires a separately accepted workflow and explicit user intent.
- Direct production mutation requires explicit user intent even when the technical tool has permission.
