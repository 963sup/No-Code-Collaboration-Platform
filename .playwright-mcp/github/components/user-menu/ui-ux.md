# User navigation menu

- Trigger: avatar icon button with `aria-haspopup="menu"`; GitHub renders an anchored dialog rather than a route.
- Header: avatar, login/display name, plus a compact Create-new action and account-context switch action.
- Body: status command followed by identity projections, governance settings, presentation/accessibility preferences, plan prompt, and session command.
- Items are grouped with separators, icons, and optional badges (`New`, `Free`).
- Mobile preserves the same information hierarchy; nested Create-new is reached from this dialog because the separate header action is hidden.
- Sign out was identified by href but never activated.
