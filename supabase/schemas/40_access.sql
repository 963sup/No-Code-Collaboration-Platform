create type public.repository_role as enum ('read', 'triage', 'write', 'maintain', 'admin');

create table public.repository_user_grants (
  repository_id uuid not null references public.repositories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.repository_role not null,
  granted_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (repository_id, user_id)
);

create index repository_user_grants_user_id_idx
  on public.repository_user_grants (user_id, repository_id);

comment on table public.repository_user_grants is
  'Direct User-to-Repository access grants using the accepted GitHub-derived Repository Role vocabulary.';
