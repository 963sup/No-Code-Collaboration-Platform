# Target Issue detail

The target Issue is identified by `(Repository, issue number)`. Dialog and full-page presentation therefore retain exactly the same canonical URL and authorized server projection.

Verified behavior on 2026-08-15:

- selecting the Issue from the list performs soft navigation and opens a Radix Dialog;
- Back returns to the list and clears the modal slot;
- Forward restores the canonical Issue URL and intercepted dialog;
- Refresh at that URL renders the full page with no dialog;
- direct URL navigation renders the same full page;
- desktop/laptop show route-specific metadata in the right `@sidebar` rail;
- tablet/mobile render metadata inside the main Issue flow; and
- the conversation region honestly reports that mutation commands remain unavailable.

No cookie, token, authorization header, private request material, or credential was stored in this evidence directory.
