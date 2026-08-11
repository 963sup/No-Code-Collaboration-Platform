# UI Package Instructions

- This package owns source-controlled design tokens and reusable presentation primitives.
- shadcn/ui is a source generator and design-system accelerator, not an external product model or opaque runtime framework.
- Keep primitives accessible, composable, and independent from Next.js routes, Supabase, generated database types, and business authorization.
- Business-specific feature components stay in the consuming app until a second real consumer justifies extraction.
- Add only the shadcn components required by a current user flow; do not import the full registry or a dashboard template wholesale.
