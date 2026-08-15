import type { ActivityEventReader } from '@no-code-collaboration-platform/application';
import type { ActivityEventSummary } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import { mapSupabaseActivityEventRow } from './supabase-activity-event-mapper';

const activityProjection =
  'id, actor_id, event_type, subject_type, subject_id, payload, created_at';

export class SupabaseActivityEventReader implements ActivityEventReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async listAccessibleRepositoryActivity(
    repositoryId: string,
    limit: number
  ): Promise<readonly ActivityEventSummary[]> {
    const { data, error } = await this.client
      .from('activity_events')
      .select(activityProjection)
      .eq('repository_id', repositoryId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

    if (error) throw new Error('Unable to load Repository activity.', { cause: error });
    return data.map(mapSupabaseActivityEventRow);
  }
}
