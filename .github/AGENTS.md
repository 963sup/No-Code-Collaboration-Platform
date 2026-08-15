# GitHub Automation Scope

- This subtree owns repository-hosted automation and GitHub integration configuration, not Product or Domain behavior.
- Workflows must use least-privilege permissions, explicit timeouts, pinned action revisions, and the repository-pinned Node and pnpm toolchain.
- Install dependencies from the lockfile and invoke repository scripts instead of reimplementing their checks in YAML.
- Pull-request workflows must not receive or expose unnecessary secrets and must not mutate persistent external environments.
- Treat local or CI success as evidence only for the environment actually exercised; it is not deployment evidence.
- Keep logs bounded and free of credentials, tokens, environment dumps, and private Repository content.
