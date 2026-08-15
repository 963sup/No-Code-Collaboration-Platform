create type public.issue_status as enum ('open', 'closed');
create type public.issue_close_reason as enum ('completed', 'cancelled');

create table public.repository_artifact_counters (
  repository_id uuid not null references public.repositories (id) on delete cascade,
  artifact_type text not null,
  last_number bigint not null default 0,
  primary key (repository_id, artifact_type),
  constraint repository_artifact_counters_type check (
    artifact_type in ('issue', 'discussion')
  ),
  constraint repository_artifact_counters_number check (last_number >= 0)
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  issue_number bigint not null,
  title text not null,
  body text not null default '',
  status public.issue_status not null default 'open',
  close_reason public.issue_close_reason,
  version bigint not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  closed_by uuid references auth.users (id),
  closed_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(body, '')), 'B')
  ) stored,
  constraint issues_repository_number_unique unique (repository_id, issue_number),
  constraint issues_repository_id_unique unique (repository_id, id),
  constraint issues_number_positive check (issue_number > 0),
  constraint issues_version_positive check (version > 0),
  constraint issues_title_length check (
    char_length(title) between 1 and 240
    and title ~ '[^[:space:]]'
  ),
  constraint issues_closed_state_consistent check (
    (
      status = 'open'
      and close_reason is null
      and closed_by is null
      and closed_at is null
    )
    or (
      status = 'closed'
      and close_reason is not null
      and closed_by is not null
      and closed_at is not null
    )
  )
);

create table public.repository_labels (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint repository_labels_name_length check (
    char_length(name) between 1 and 64 and name ~ '[^[:space:]]'
  ),
  constraint repository_labels_color_format check (color ~ '^[0-9a-fA-F]{6}$'),
  constraint repository_labels_repository_name_unique unique (repository_id, name),
  constraint repository_labels_repository_id_unique unique (repository_id, id)
);

create table public.issue_assignees (
  issue_id uuid not null references public.issues (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid not null references auth.users (id),
  assigned_at timestamptz not null default timezone('utc', now()),
  primary key (issue_id, user_id),
  constraint issue_assignees_issue_repository_fk
    foreign key (repository_id, issue_id)
    references public.issues (repository_id, id)
    on delete cascade
);

create table public.issue_labels (
  issue_id uuid not null references public.issues (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  label_id uuid not null references public.repository_labels (id) on delete cascade,
  applied_by uuid not null references auth.users (id),
  applied_at timestamptz not null default timezone('utc', now()),
  primary key (issue_id, label_id),
  constraint issue_labels_issue_repository_fk
    foreign key (repository_id, issue_id)
    references public.issues (repository_id, id)
    on delete cascade,
  constraint issue_labels_label_repository_fk
    foreign key (repository_id, label_id)
    references public.repository_labels (repository_id, id)
    on delete cascade
);

create table public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  body text not null,
  version bigint not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint issue_comments_body_nonempty check (body ~ '[^[:space:]]'),
  constraint issue_comments_version_positive check (version > 0),
  constraint issue_comments_issue_repository_fk
    foreign key (repository_id, issue_id)
    references public.issues (repository_id, id)
    on delete cascade
);

create index issues_repository_status_updated_idx
  on public.issues (repository_id, status, updated_at desc, issue_number desc);
create index issues_search_vector_idx on public.issues using gin (search_vector);
create index issue_assignees_user_repository_idx
  on public.issue_assignees (user_id, repository_id, issue_id);
create index issue_labels_label_repository_idx
  on public.issue_labels (label_id, repository_id, issue_id);
create index issue_comments_issue_created_idx
  on public.issue_comments (issue_id, created_at, id);

comment on table public.issues is
  'Repository-contained actionable Artifacts with optimistic concurrency and no hard-delete lifecycle.';
comment on table public.issue_assignees is
  'Responsibility Relationships only; assignment never grants Repository access.';
comment on table public.repository_artifact_counters is
  'Atomic Repository-local numbering state for accepted numbered Artifact kinds.';
