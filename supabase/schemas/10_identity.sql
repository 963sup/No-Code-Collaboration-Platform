create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format check (
    username is null
    or (
      char_length(username) between 2 and 64
      and username ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    )
  ),
  constraint profiles_username_unique unique (username)
);

comment on table public.profiles is
  'Application profile projection for an authenticated User; username becomes the personal Repository owner namespace once established.';
