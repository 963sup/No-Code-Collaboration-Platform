create table public.activity_events (
  id bigint generated always as identity primary key,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  actor_id uuid not null references auth.users (id),
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint activity_events_event_type_format check (
    event_type ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
  )
);

create index activity_events_repository_created_at_idx
  on public.activity_events (repository_id, created_at desc, id desc);

comment on table public.activity_events is
  'Immutable historical facts from which activity, audit, notification, and analytics projections may derive.';
