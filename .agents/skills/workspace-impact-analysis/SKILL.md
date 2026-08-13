---
name: workspace-impact-analysis
description: Use when a change adds, moves, removes, or connects pnpm workspace packages, edits package manifests or turbo.json, or may affect more than one package; map ownership and dependency impact before editing or verifying.
---

# Workspace Impact Analysis

1. Read the root `AGENTS.md` and the nearest scoped `AGENTS.md` for every affected package.
2. Treat workspace package manifests as architecture nodes and declared `workspace:` dependencies as directed edges. Treat `turbo.json` as the task graph over those nodes, not as product truth.
3. Identify the owning package, direct dependencies, direct dependents, changed public contracts, generated outputs, and trust boundaries.
4. Use `pnpm turbo:graph` for bounded package discovery before cross-package edits. Inspect specific manifests instead of dumping the whole repository graph.
5. Reject accidental cycles, undeclared cross-package imports, duplicated ownership, and internal dependencies that resolve through the registry instead of `workspace:`.
6. Choose the narrowest real package task or test for each affected contract. Do not invent placeholder scripts or run every workspace task by default.
7. Report affected packages, dependency direction, required checks, and unresolved impact. Separate verified edges from inferred edges.
