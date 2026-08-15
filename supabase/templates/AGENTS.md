# Supabase Auth Template Scope

- These templates own provider-rendered authentication presentation only. They do not decide Repository access, membership, ownership, role, or capability.
- Treat confirmation, recovery, and redirect tokens as secrets. Do not log them, persist them in content, or include them in third-party requests.
- Use only provider-supported placeholders and known same-application routes. Prevent open redirects and avoid executable or remote-loaded content.
- Keep copy accessible and deliberately non-enumerating; do not reveal whether an unrelated account or Repository exists.
- Never include real credentials, private Repository content, or environment-specific secret values.
