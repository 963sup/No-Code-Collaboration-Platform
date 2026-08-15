# UI Source Scope

- `components` owns reusable presentation primitives, `styles` owns tokens and global visual foundations, and `lib` owns presentation-only helpers.
- Components must remain accessible, composable, and independent from routes, provider clients, generated database types, and business authorization.
- Prefer semantic HTML, keyboard behavior, visible focus, and explicit labels. Do not encode access decisions by hiding controls alone.
- Keep variants and tokens finite and intentional. Add a primitive only for a current consumer and export supported public surfaces through `src/index.ts`.
