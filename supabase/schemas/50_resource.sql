create type public.resource_kind as enum ('page');

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  kind public.resource_kind not null,
  title text not null,
  content jsonb not null default '{"body": ""}'::jsonb,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint resources_title_length check (char_length(btrim(title)) between 1 and 240),
  constraint resources_page_content_shape check (
    kind <> 'page'
    or (
      jsonb_typeof(content) = 'object'
      and jsonb_typeof(content -> 'body') = 'string'
      and content = jsonb_build_object('body', content ->> 'body')
    )
  )
);

create index resources_repository_id_idx
  on public.resources (repository_id, created_at desc);

comment on table public.resources is
  'Repository-scoped work units. The shared envelope is relational; subtype content remains explicit.';
