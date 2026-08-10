# Documentation Map

This directory separates operating instructions, target design, domain semantics, and implementation evidence.

- [`DEVELOPMENT_ENVIRONMENT.md`](./DEVELOPMENT_ENVIRONMENT.md): workstation bootstrap and deterministic verification entry points.
- [`architecture/`](./architecture/README.md): target architecture, invariants, and ADRs.
- [`domains/`](./domains/README.md): bounded-context vocabulary and ownership contracts once they are justified.

Authority order for repository work:

1. Current explicit task and applicable `AGENTS.md` chain
2. Accepted target contracts and ADRs
3. Executable code, schema, and tests for current implementation behavior
4. Generated diagrams, snapshots, and agent context as non-authoritative projections

External product documentation is evidence about the outside world; it does not silently redefine this platform's target model.
