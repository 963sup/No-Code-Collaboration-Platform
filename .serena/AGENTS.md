# Serena Workspace Scope

- This subtree owns local repository indexing configuration and durable project memory. It is supporting context, not current truth by itself.
- Store only durable project facts and decisions that are expensive to reconstruct. Ground them in canonical repository contracts and revalidate drift-prone facts before acting.
- Do not store credentials, tokens, private content, transient logs, test output, or speculative conclusions in memory.
- Cache and log directories are generated operational state; do not treat them as source-controlled contracts or edit them to change repository behavior.
- Keep workstation-specific paths and settings minimal, explicit, and non-secret.
