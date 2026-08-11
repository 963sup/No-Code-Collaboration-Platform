import type { ActivityEventSummary } from '@no-code-collaboration-platform/domain';

import type { Database, Json } from '../generated/database.types';

type ActivityEventRow = Database['public']['Tables']['activity_events']['Row'];

type ActivityEventProjectionRow = Pick<
  ActivityEventRow,
  'actor_id' | 'created_at' | 'event_type' | 'id' | 'payload' | 'subject_id' | 'subject_type'
>;

function mapPayload(payload: Json): Readonly<Record<string, unknown>> {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return {};
  return payload;
}

export function mapSupabaseActivityEventRow(
  row: ActivityEventProjectionRow
): ActivityEventSummary {
  return {
    actorId: row.actor_id,
    eventType: row.event_type,
    id: row.id,
    occurredAt: row.created_at,
    payload: mapPayload(row.payload),
    subjectId: row.subject_id,
    subjectType: row.subject_type
  };
}
