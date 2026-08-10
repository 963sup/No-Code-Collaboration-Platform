# Documentation Map

This directory separates operating instructions, target design, domain semantics, and implementation evidence.

- [`CODEX_DESKTOP.md`](./CODEX_DESKTOP.md): Codex Desktop project configuration, MCP context routing, trust boundaries, and verification.
- [`DEVELOPMENT_ENVIRONMENT.md`](./DEVELOPMENT_ENVIRONMENT.md): workstation bootstrap and deterministic verification entry points.
- [`architecture/`](./architecture/README.md): target architecture, invariants, and ADRs.
- [`domains/`](./domains/README.md): bounded-context vocabulary and ownership contracts once they are justified.

Authority order for repository work:

1. Current explicit task and applicable `AGENTS.md` chain
2. Accepted target contracts and ADRs
3. Executable code, schema, migrations, and tests for current implementation behavior
4. External official documentation as evidence about external systems
5. Generated diagrams, snapshots, agent output, and session context as non-authoritative projections

OpenAI Developer Docs, Context7, and Supabase Docs answer questions about their respective external systems. They do not silently redefine this platform's target model.
