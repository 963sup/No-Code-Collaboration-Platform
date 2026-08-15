# Workspace Package Scope

- Each package must have one coherent owner and a public boundary. Import another package through its public exports rather than reaching into its internals.
- Preserve the dependency direction `Web -> Application -> Domain`, with Infrastructure implementing Application ports. UI remains a presentation primitive package.
- Domain and Application must remain framework- and provider-neutral. Generated provider types stay inside their Infrastructure owner.
- Internal dependencies use the `workspace:` protocol. Do not add cycles, duplicate ownership, empty package shells, or speculative shared abstractions.
- Package manifests, exports, and Turbo tasks must describe real reachable code and checks. Change the workspace graph only when the requested behavior requires it.
