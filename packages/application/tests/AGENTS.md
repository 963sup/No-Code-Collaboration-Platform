# Application Test Scope

- Test observable use-case contracts with small deterministic fakes at Application ports.
- Cover the authorized path and the nearest meaningful denial, not implementation call order or provider query syntax.
- Assert explicit actor, scope, ownership, capability, result, and error semantics when they affect the contract.
- Keep each fake local to the behavior it proves unless a shared test helper has multiple real consumers.
- Infrastructure availability, browser rendering, and database RLS belong to their own test scopes and must not be simulated as Application proof.
