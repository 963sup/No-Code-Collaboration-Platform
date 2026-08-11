import type { ActorIdentity } from '@no-code-collaboration-platform/application';

interface SupabaseIdentitySource {
  readonly email?: string | null;
  readonly id: string;
}

export function mapSupabaseIdentity(source: SupabaseIdentitySource): ActorIdentity {
  return {
    email: source.email ?? null,
    id: source.id
  };
}
