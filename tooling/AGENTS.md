# Tooling Scope

- Prefer Node.js built-ins; add a dependency only when deterministic behavior cannot be implemented simply without it.
- Tooling must have explicit inputs, bounded machine-readable output, stable exit codes, and no hidden network or repository mutations.
- Validate the narrowest contract first and fail on the earliest actionable error.
- Never print secrets, full environment variables, complete lockfiles, or unbounded recursive output.
- Repository-writing scripts must require explicit user intent and preserve existing files by default.
