create type public.repository_visibility as enum ('private', 'public');

create table public.repositories (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users (id) on delete restrict,
  owner_organization_id uuid references public.organizations (id) on delete restrict,
  slug text not null,
  name text not null,
  description text,
  visibility public.repository_visibility not null default 'private',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored,
  constraint repositories_exactly_one_owner check (
    (owner_user_id is not null and owner_organization_id is null)
    or (owner_user_id is null and owner_organization_id is not null)
  ),
  constraint repositories_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint repositories_name_length check (char_length(name) between 1 and 160)
);

create unique index repositories_user_owner_slug_unique
  on public.repositories (owner_user_id, slug)
  where owner_user_id is not null;

create unique index repositories_organization_owner_slug_unique
  on public.repositories (owner_organization_id, slug)
  where owner_organization_id is not null;

create index repositories_owner_user_id_idx
  on public.repositories (owner_user_id, id)
  where owner_user_id is not null;

create index repositories_owner_organization_id_idx
  on public.repositories (owner_organization_id, id)
  where owner_organization_id is not null;

create index repositories_search_vector_idx on public.repositories using gin (search_vector);

comment on table public.repositories is
  'No-code collaboration containers and the primary Resource/authorization/history boundary; each Repository is owned by exactly one User or Organization.';
