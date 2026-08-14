Create a continuation-ready state summary for another Codex instance. Treat this as operational state transfer, not a retrospective narrative.

Optimize for the smallest summary that lets the active work continue correctly without rereading the full transcript. Preserve causally relevant state; omit chatter, repetition, superseded exploration, and bulky raw tool output.

Apply these first-principles rules:

- Treat the latest active user intent as task truth. Preserve the requested outcome, success conditions, constraints, later additions or corrections, and whether earlier requests are complete or superseded. Retain exact wording when paraphrase could change meaning.
- Separate Fact, Constraint, Decision, Invariant, Assumption, and Unknown. Never promote an assumption, inference, or planned result to fact.
- Preserve the evidence needed to reproduce material conclusions: authoritative repository paths and symbols, current official URLs, exact commands, and only the essential results or errors.
- Preserve ownership, authorization, safety, and trust boundaries. Never broaden permission because an earlier action was allowed.
- Preserve execution continuity: project and working directory, active plan or goal, invoked instructions and skills, worktree state, pre-existing user changes versus changes made during this thread, files changed and why, validation already run and its result, live agents or processes, blockers, and the next concrete action.
- For implementation work, preserve the root cause or minimum causal model, the selected smallest correct intervention, affected contracts or invariants, and rejected alternatives only when forgetting them would cause likely rework.
- Never include credentials, tokens, secrets, private raw content, or unnecessary personal data. Record only a safe pointer or redacted description when sensitive evidence matters.
- Never claim that a change, test, deployment, external mutation, or user-visible outcome is complete unless the transcript contains direct evidence. Preserve failures and partial completion explicitly.
- Use exact identifiers, paths, commands, versions, and absolute dates when they are material. If evidence conflicts or is missing, label the point Unknown and state what would resolve it.

Use compact Markdown and include only non-empty sections from this schema:

# Active task
# Ground truth
# Decisions and invariants
# Workspace state
# Evidence and validation
# Remaining work

End with the single next action and the completion criteria. The summary must stand alone for continuation while remaining subordinate to the current system and developer instructions.
