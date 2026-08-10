# Domain Package Instructions

- This package is the sole owner of business truth: canonical concepts, invariants, state transitions, and domain decisions.
- Do not import Supabase clients or generated database types, application orchestration, delivery frameworks, UI code, or infrastructure adapters into this package.
- Add a domain concept only when a coherent business problem, vocabulary, owner, lifecycle, invariant, and falsification condition justify it.
- Keep state transitions explicit and deterministic. Side effects and persistence belong outside the domain boundary.
- Internal workspace dependencies must use the `workspace:` protocol and must preserve the dependency direction declared by the architecture model.
- Add package-local Turbo task scripts only when they execute a real check or build. Do not create placeholder scripts to make the task graph appear complete.
- Validate domain changes with the narrowest package-level test that can falsify the affected invariant, then broaden only when an actual dependent package is affected.
