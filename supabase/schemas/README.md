# Database schemas

This directory owns the declarative SQL model for the current database shape. Schema files implement persistence and database enforcement without redefining business truth from `packages/domain`.

Reviewed schema changes produce append-only files in `../migrations/` for deployment history. Generated `types/database.types.ts` is a projection of the applied schema. Tables exposed through the Data API require explicit grants and RLS policies appropriate to their resource and ownership model.
