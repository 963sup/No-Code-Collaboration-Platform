create type public.discussion_category as enum ('general', 'question', 'announcement');
create type public.discussion_status as enum ('open', 'closed');

create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  discussion_number bigint not null,
  category public.discussion_category not null,
  title text not null,
  body text not null default '',
  status public.discussion_status not null default 'open',
  is_locked boolean not null default false,
  answer_comment_id uuid,
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
  constraint discussions_repository_number_unique unique (repository_id, discussion_number),
  constraint discussions_number_positive check (discussion_number > 0),
  constraint discussions_version_positive check (version > 0),
  constraint discussions_title_length check (
    char_length(title) between 1 and 240 and title ~ '[^[:space:]]'
  ),
  constraint discussions_closed_state_consistent check (
    (status = 'open' and closed_by is null and closed_at is null)
    or (status = 'closed' and closed_by is not null and closed_at is not null)
  ),
  constraint discussions_answer_category check (
    answer_comment_id is null or category = 'question'
  ),
  constraint discussions_repository_id_unique unique (repository_id, id)
);

create table public.discussion_comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  body text not null,
  version bigint not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint discussion_comments_body_nonempty check (body ~ '[^[:space:]]'),
  constraint discussion_comments_version_positive check (version > 0),
  constraint discussion_comments_discussion_repository_fk
    foreign key (repository_id, discussion_id)
    references public.discussions (repository_id, id)
    on delete cascade,
  constraint discussion_comments_discussion_id_unique unique (discussion_id, id)
);

alter table public.discussions
  add constraint discussions_answer_comment_fk
  foreign key (id, answer_comment_id)
  references public.discussion_comments (discussion_id, id)
  on delete restrict;

create index discussions_repository_status_updated_idx
  on public.discussions (repository_id, status, updated_at desc, discussion_number desc);
create index discussions_search_vector_idx on public.discussions using gin (search_vector);
create index discussion_comments_discussion_created_idx
  on public.discussion_comments (discussion_id, created_at, id);

comment on table public.discussions is
  'Repository-contained shared-understanding Artifacts; not a Forum Container or Issue alias.';
comment on column public.discussions.is_locked is
  'Moderation state independent from the open/closed lifecycle.';
