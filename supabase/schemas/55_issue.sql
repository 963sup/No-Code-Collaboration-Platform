create type public.issue_status as enum ('open', 'closed');

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  issue_number bigint not null,
  title text not null,
  body text not null default '',
  status public.issue_status not null default 'open',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  closed_by uuid references auth.users (id),
  closed_at timestamptz,
  constraint issues_repository_number_unique unique (repository_id, issue_number),
  constraint issues_number_positive check (issue_number > 0),
  constraint issues_title_length check (
    char_length(title) between 1 and 240
    and title ~ '[^[:space:]]'
  ),
  constraint issues_closed_state_consistent check (
    (status = 'open' and closed_by is null and closed_at is null)
    or (status = 'closed' and closed_by is not null and closed_at is not null)
  )
);

create index issues_repository_status_updated_idx
  on public.issues (repository_id, status, updated_at desc, issue_number desc);

comment on table public.issues is
  'Repository-scoped actionable work. This read projection has no accepted end-user mutation path yet.';
