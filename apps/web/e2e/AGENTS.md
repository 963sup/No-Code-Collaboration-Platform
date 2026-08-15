# Browser Contract Test Scope

- Playwright tests prove observable user journeys through public Web boundaries; they do not redefine Product, Domain, database, or implementation status.
- Cover `/app` discovery to canonical Owner/Repository navigation and every implemented accepted surface required by the current gap closure evidence.
- Test hard navigation, soft navigation, refresh, Back/Forward, authorization denial, and responsive behavior when the affected journey depends on them.
- Prefer roles, labels, and stable user-visible outcomes over implementation selectors, internal IDs, timing sleeps, or framework markup.
- Tests may use deterministic disposable local identities/data only. Never depend on production accounts, remote mutations, private benchmark credentials, or execution order.
- A green browser suite proves only the journeys it exercises; pair security/database claims with their owning deterministic tests.
