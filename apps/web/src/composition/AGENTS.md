# Web Composition Scope

- This directory is the only Web-owned provider construction boundary. It wires request/session state to Infrastructure adapters implementing Application Ports.
- Keep composition request-scoped where identity or cookies are involved; do not retain one user's client/session across requests.
- Provider SDKs and generated database types may be imported here, but provider rows and branching must not escape into routes or components.
- Composition selects implementations; it must not reimplement Domain policy, authorization, or use-case orchestration.
- Required server configuration fails closed with bounded diagnostics. Never print secrets, service credentials, token-bearing URLs, or full environment values.
- Service-role or admin credentials, if ever admitted by an explicit boundary, remain server-only and must not be used to bypass end-user authorization.
