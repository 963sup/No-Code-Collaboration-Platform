# Application Delivery Scopes

- Directories under `apps/` own deployable delivery/composition surfaces, not Product or Domain truth.
- Consume workspace behavior through declared package exports and `workspace:` dependencies; do not reach into another package's private source tree.
- App-local routing, rendering, transport, runtime configuration, and provider composition must preserve `Web -> Application -> Domain` with Infrastructure implementing Application Ports.
- Keep secrets and server credentials outside browser bundles, rendered markup, logs, snapshots, and client-visible environment variables.
- Put reusable presentation primitives in `packages/ui` only after ownership and a real reuse boundary are proven.
- Each app's nested `AGENTS.md` contains only the delta for that delivery runtime.
