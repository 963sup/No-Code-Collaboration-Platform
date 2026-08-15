# Authentication Route Scope

- These routes establish or recover authenticated identity; they never grant Organization Membership, Repository ownership, Role, Capability, or Resource authority.
- Validate form, callback, and recovery input before invoking Application identity use cases. Provider token mechanics stay behind the Identity Port/adapter boundary.
- Auth codes, token hashes, cookies, and recovery proofs are secrets: never log them, persist them in client state, include them in telemetry, or expose them in error prose.
- Redirect targets must be known same-application routes. Do not accept an untrusted destination that creates an open redirect.
- Error responses distinguish actionable user state without revealing account existence or provider internals beyond the accepted contract.
- Session establishment is authentication evidence only; every protected operation still performs independent authorization.
