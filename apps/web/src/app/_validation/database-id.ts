import { z } from 'zod';

// PostgreSQL serializes uuid values as canonical 8-4-4-4-12 strings without requiring
// RFC version/variant bits. z.uuid() is therefore too strict for database identities.
export const databaseUuidSchema = z.guid();
