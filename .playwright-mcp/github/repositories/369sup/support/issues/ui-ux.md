# Repository issues

The page is a stable collection owned by the Repository. Search/filter text, open/closed state, sort and pagination are projection state and belong in query parameters. New Issue is a command; an Issue receives a canonical child URL only after creation.

## Target comparison verified 2026-08-15

- Target canonical collection: `/demo-organization/demo-repository/issues`.
- Desktop/laptop/tablet use an independent 256px Issue navigation rail; mobile moves the same navigation before main content and collapses it into a native disclosure.
- Search, `open | closed | all`, and page are query state. A no-match search renders an explicit empty state.
- `New issue` is visibly disabled because creation, number allocation, command authorization, and historical evidence are not executable.
- The list link soft-navigates to the Issue canonical URL through the `@modal` intercepting route. Direct navigation and refresh use the full-page resource.
- Target screenshots are prefixed `target-`; sanitized GitHub reference screenshots remain unchanged.
