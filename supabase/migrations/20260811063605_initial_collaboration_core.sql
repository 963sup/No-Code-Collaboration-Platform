-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE SCHEMA private AUTHORIZATION postgres;

GRANT USAGE ON SCHEMA private TO anon;

GRANT USAGE ON SCHEMA private TO authenticated;

CREATE FUNCTION private.add_organization_owner()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.organization_memberships (organization_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (organization_id, user_id) do update set role = 'owner';
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION private.add_organization_owner() FROM PUBLIC;

CREATE FUNCTION private.can_view_repository (
  target_repository_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.repositories as repository
    where repository.id = target_repository_id
      and repository.visibility = 'public'
  ) or private.has_repository_capability(target_repository_id, 'repository.view');
$function$;

REVOKE ALL ON FUNCTION private.can_view_repository(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.can_view_repository(uuid) TO anon;

GRANT ALL ON FUNCTION private.can_view_repository(uuid) TO authenticated;

CREATE FUNCTION private.create_profile_for_auth_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$function$;

CREATE TRIGGER auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.create_profile_for_auth_user();

REVOKE ALL ON FUNCTION private.create_profile_for_auth_user() FROM PUBLIC;

CREATE FUNCTION private.has_repository_capability (
  target_repository_id uuid,
  requested_capability text
)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  effective_role public.repository_role;
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  effective_role := private.current_repository_role(target_repository_id);

  return case effective_role
    when 'viewer' then requested_capability in (
      'repository.view',
      'resource.view'
    )
    when 'contributor' then requested_capability in (
      'repository.view',
      'resource.view',
      'resource.create',
      'resource.update'
    )
    when 'manager' then requested_capability in (
      'repository.view',
      'resource.view',
      'resource.create',
      'resource.update',
      'resource.delete',
      'member.manage'
    )
    when 'admin' then requested_capability in (
      'repository.view',
      'repository.manage',
      'resource.view',
      'resource.create',
      'resource.update',
      'resource.delete',
      'member.manage'
    )
    else false
  end;
end;
$function$;

REVOKE ALL ON FUNCTION private.has_repository_capability(uuid, text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.has_repository_capability(uuid, text) TO authenticated;

CREATE FUNCTION private.is_organization_admin (
  target_organization_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('admin', 'owner')
  );
$function$;

REVOKE ALL ON FUNCTION private.is_organization_admin(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_organization_admin(uuid) TO authenticated;

CREATE FUNCTION private.is_organization_member (
  target_organization_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
  );
$function$;

REVOKE ALL ON FUNCTION private.is_organization_member(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_organization_member(uuid) TO authenticated;

CREATE FUNCTION private.record_repository_created()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.activity_events (
    repository_id,
    actor_id,
    event_type,
    subject_type,
    subject_id,
    payload
  )
  values (
    new.id,
    new.created_by,
    'repository.created',
    'repository',
    new.id,
    jsonb_build_object('name', new.name)
  );
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION private.record_repository_created() FROM PUBLIC;

CREATE FUNCTION private.record_resource_created()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.activity_events (
    repository_id,
    actor_id,
    event_type,
    subject_type,
    subject_id,
    payload
  )
  values (
    new.repository_id,
    new.created_by,
    'resource.created',
    'resource',
    new.id,
    jsonb_build_object('kind', new.kind, 'title', new.title)
  );
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION private.record_resource_created() FROM PUBLIC;

CREATE FUNCTION private.touch_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION private.touch_updated_at() FROM PUBLIC;

CREATE TYPE public.organization_role AS ENUM (
  'member',
  'admin',
  'owner'
);

CREATE TYPE public.repository_role AS ENUM (
  'viewer',
  'contributor',
  'manager',
  'admin'
);

CREATE FUNCTION private.current_repository_role (
  target_repository_id uuid
)
  RETURNS public.repository_role
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select candidate.role
  from (
    select 'admin'::public.repository_role as role
    from public.repositories as repository
    join public.organization_memberships as membership
      on membership.organization_id = repository.organization_id
    where repository.id = target_repository_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('admin', 'owner')

    union all

    select direct_grant.role
    from public.repository_user_grants as direct_grant
    where direct_grant.repository_id = target_repository_id
      and direct_grant.user_id = (select auth.uid())
  ) as candidate
  order by private.repository_role_rank(candidate.role) desc
  limit 1;
$function$;

REVOKE ALL ON FUNCTION private.current_repository_role(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.current_repository_role(uuid) TO authenticated;

CREATE FUNCTION private.repository_role_rank (
  role public.repository_role
)
  RETURNS integer
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO ''
  AS $function$
  select case role
    when 'viewer' then 10
    when 'contributor' then 20
    when 'manager' then 30
    when 'admin' then 40
  end;
$function$;

REVOKE ALL ON FUNCTION private.repository_role_rank(public.repository_role) FROM PUBLIC;

CREATE TYPE public.repository_visibility AS ENUM (
  'private',
  'organization',
  'public'
);

CREATE TYPE public.resource_kind AS ENUM (
  'page'
);

CREATE TABLE public.activity_events (
  id            bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  repository_id uuid                     NOT NULL,
  actor_id      uuid                     NOT NULL,
  event_type    text                     NOT NULL,
  subject_type  text                     NOT NULL,
  subject_id    uuid,
  payload       jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  created_at    timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.activity_events IS 'Immutable historical facts from which activity, audit, notification, and analytics projections may derive.';

ALTER TABLE public.activity_events
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.activity_events
  ADD CONSTRAINT activity_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id);

ALTER TABLE public.activity_events
  ADD CONSTRAINT activity_events_event_type_format CHECK (event_type ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'::text);

ALTER TABLE public.activity_events
  ADD CONSTRAINT activity_events_pkey PRIMARY KEY (id);

GRANT SELECT ON public.activity_events TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.activity_events TO service_role;

CREATE INDEX activity_events_repository_created_at_idx ON public.activity_events (repository_id, created_at DESC, id DESC);

CREATE POLICY activity_events_select_viewer ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (( SELECT private.has_repository_capability(activity_events.repository_id, 'repository.view'::text) AS has_repository_capability));

CREATE TABLE public.organization_memberships (
  organization_id uuid                     NOT NULL,
  user_id         uuid                     NOT NULL,
  role            public.organization_role DEFAULT 'member'::public.organization_role NOT NULL,
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.organization_memberships IS 'Relationship between an actor and an organization; not an actor type.';

ALTER TABLE public.organization_memberships
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organization_memberships
  ADD CONSTRAINT organization_memberships_pkey PRIMARY KEY (organization_id, user_id);

ALTER TABLE public.organization_memberships
  ADD CONSTRAINT organization_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT DELETE, INSERT, SELECT ON public.organization_memberships TO authenticated;

GRANT UPDATE (ROLE) ON public.organization_memberships TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.organization_memberships TO service_role;

CREATE INDEX organization_memberships_user_id_idx ON public.organization_memberships (user_id, organization_id);

CREATE POLICY organization_memberships_delete_admin ON public.organization_memberships
  FOR DELETE
  TO authenticated
  USING (( SELECT private.is_organization_admin(organization_memberships.organization_id) AS is_organization_admin));

CREATE POLICY organization_memberships_insert_admin ON public.organization_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (( SELECT private.is_organization_admin(organization_memberships.organization_id) AS is_organization_admin));

CREATE POLICY organization_memberships_select_member ON public.organization_memberships
  FOR SELECT
  TO authenticated
  USING (( SELECT private.is_organization_member(organization_memberships.organization_id) AS is_organization_member));

CREATE POLICY organization_memberships_update_admin ON public.organization_memberships
  FOR UPDATE
  TO authenticated
  USING (( SELECT private.is_organization_admin(organization_memberships.organization_id) AS is_organization_admin))
  WITH CHECK (( SELECT private.is_organization_admin(organization_memberships.organization_id) AS is_organization_admin));

CREATE TABLE public.organizations (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  slug       text                     NOT NULL,
  name       text                     NOT NULL,
  created_by uuid                     NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.organizations IS 'Ownership and administration boundary for collaboration repositories.';

ALTER TABLE public.organizations
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 120);

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);

ALTER TABLE public.organization_memberships
  ADD CONSTRAINT organization_memberships_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_slug_format CHECK (char_length(slug) >= 2 AND char_length(slug) <= 64 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text);

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);

GRANT DELETE, INSERT, SELECT ON public.organizations TO authenticated;

GRANT UPDATE (name, slug, updated_at) ON public.organizations TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.organizations TO service_role;

CREATE TRIGGER organization_created_owner
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION private.add_organization_owner();

CREATE TRIGGER organizations_touch_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION private.touch_updated_at();

CREATE POLICY organizations_delete_admin ON public.organizations
  FOR DELETE
  TO authenticated
  USING (( SELECT private.is_organization_admin(organizations.id) AS is_organization_admin));

CREATE POLICY organizations_insert_actor ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = created_by));

CREATE POLICY organizations_select_member ON public.organizations
  FOR SELECT
  TO authenticated
  USING (( SELECT private.is_organization_member(organizations.id) AS is_organization_member));

CREATE POLICY organizations_update_admin ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (( SELECT private.is_organization_admin(organizations.id) AS is_organization_admin))
  WITH CHECK (( SELECT private.is_organization_admin(organizations.id) AS is_organization_admin));

CREATE TABLE public.profiles (
  id           uuid                     NOT NULL,
  display_name text,
  avatar_url   text,
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Application profile projection for an authenticated actor.';

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

GRANT SELECT ON public.profiles TO authenticated;

GRANT UPDATE (avatar_url, display_name, updated_at) ON public.profiles TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO service_role;

CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE TABLE public.repositories (
  id              uuid                         DEFAULT gen_random_uuid() NOT NULL,
  organization_id uuid                         NOT NULL,
  slug            text                         NOT NULL,
  name            text                         NOT NULL,
  description     text,
  visibility      public.repository_visibility DEFAULT 'private'::public.repository_visibility NOT NULL,
  created_by      uuid                         NOT NULL,
  created_at      timestamp with time zone     DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      timestamp with time zone     DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.repositories IS 'No-code collaboration containers and the primary resource/authorization boundary.';

ALTER TABLE public.repositories
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.repositories
  ADD CONSTRAINT repositories_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.repositories
  ADD CONSTRAINT repositories_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 160);

ALTER TABLE public.repositories
  ADD CONSTRAINT repositories_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.repositories
  ADD CONSTRAINT repositories_organization_slug_unique UNIQUE (organization_id, slug);

ALTER TABLE public.repositories
  ADD CONSTRAINT repositories_pkey PRIMARY KEY (id);

ALTER TABLE public.activity_events
  ADD CONSTRAINT activity_events_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repositories(id) ON DELETE CASCADE;

ALTER TABLE public.repositories
  ADD CONSTRAINT repositories_slug_format CHECK (char_length(slug) >= 2 AND char_length(slug) <= 64 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text);

GRANT SELECT ON public.repositories TO anon;

GRANT DELETE, INSERT, SELECT ON public.repositories TO authenticated;

GRANT UPDATE (description, name, slug, updated_at, visibility) ON public.repositories TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.repositories TO service_role;

CREATE INDEX repositories_organization_id_idx ON public.repositories (organization_id, id);

CREATE TRIGGER repositories_touch_updated_at
  BEFORE UPDATE ON public.repositories
  FOR EACH ROW
  EXECUTE FUNCTION private.touch_updated_at();

CREATE TRIGGER repository_created_activity
  AFTER INSERT ON public.repositories
  FOR EACH ROW
  EXECUTE FUNCTION private.record_repository_created();

CREATE POLICY repositories_delete_manager ON public.repositories
  FOR DELETE
  TO authenticated
  USING (( SELECT private.has_repository_capability(repositories.id, 'repository.manage'::text) AS has_repository_capability));

CREATE POLICY repositories_insert_admin ON public.repositories
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = created_by) AND ( SELECT private.is_organization_admin(repositories.organization_id) AS is_organization_admin)));

CREATE POLICY repositories_select_visible ON public.repositories
  FOR SELECT
  TO anon, authenticated
  USING (( SELECT private.can_view_repository(repositories.id) AS can_view_repository));

CREATE POLICY repositories_update_manager ON public.repositories
  FOR UPDATE
  TO authenticated
  USING (( SELECT private.has_repository_capability(repositories.id, 'repository.manage'::text) AS has_repository_capability))
  WITH CHECK (( SELECT private.has_repository_capability(repositories.id, 'repository.manage'::text) AS has_repository_capability));

CREATE TABLE public.repository_user_grants (
  repository_id uuid                     NOT NULL,
  user_id       uuid                     NOT NULL,
  role          public.repository_role   NOT NULL,
  granted_by    uuid                     NOT NULL,
  created_at    timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.repository_user_grants IS 'Direct principal-to-repository grants. Collaborator is derived from this relationship.';

ALTER TABLE public.repository_user_grants
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.repository_user_grants
  ADD CONSTRAINT repository_user_grants_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id);

ALTER TABLE public.repository_user_grants
  ADD CONSTRAINT repository_user_grants_pkey PRIMARY KEY (repository_id, user_id);

ALTER TABLE public.repository_user_grants
  ADD CONSTRAINT repository_user_grants_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repositories(id) ON DELETE CASCADE;

ALTER TABLE public.repository_user_grants
  ADD CONSTRAINT repository_user_grants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT DELETE, INSERT, SELECT ON public.repository_user_grants TO authenticated;

GRANT UPDATE (ROLE) ON public.repository_user_grants TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.repository_user_grants TO service_role;

CREATE INDEX repository_user_grants_user_id_idx ON public.repository_user_grants (user_id, repository_id);

CREATE POLICY repository_user_grants_delete_manager ON public.repository_user_grants
  FOR DELETE
  TO authenticated
  USING (( SELECT private.has_repository_capability(repository_user_grants.repository_id, 'member.manage'::text) AS has_repository_capability));

CREATE POLICY repository_user_grants_insert_manager ON public.repository_user_grants
  FOR INSERT
  TO authenticated
  WITH CHECK (( SELECT private.has_repository_capability(repository_user_grants.repository_id, 'member.manage'::text) AS has_repository_capability));

CREATE POLICY repository_user_grants_select_viewer ON public.repository_user_grants
  FOR SELECT
  TO authenticated
  USING (( SELECT private.has_repository_capability(repository_user_grants.repository_id, 'repository.view'::text) AS has_repository_capability));

CREATE POLICY repository_user_grants_update_manager ON public.repository_user_grants
  FOR UPDATE
  TO authenticated
  USING (( SELECT private.has_repository_capability(repository_user_grants.repository_id, 'member.manage'::text) AS has_repository_capability))
  WITH CHECK (( SELECT private.has_repository_capability(repository_user_grants.repository_id, 'member.manage'::text) AS has_repository_capability));

CREATE TABLE public.resources (
  id            uuid                     DEFAULT gen_random_uuid() NOT NULL,
  repository_id uuid                     NOT NULL,
  kind          public.resource_kind     NOT NULL,
  title         text                     NOT NULL,
  content       jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  created_by    uuid                     NOT NULL,
  created_at    timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at    timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.resources IS 'Repository-scoped work units. The shared envelope is relational; subtype content remains explicit.';

ALTER TABLE public.resources
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.resources
  ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.resources
  ADD CONSTRAINT resources_pkey PRIMARY KEY (id);

ALTER TABLE public.resources
  ADD CONSTRAINT resources_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repositories(id) ON DELETE CASCADE;

ALTER TABLE public.resources
  ADD CONSTRAINT resources_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 240);

GRANT SELECT ON public.resources TO anon;

GRANT DELETE, INSERT, SELECT ON public.resources TO authenticated;

GRANT UPDATE (content, title, updated_at) ON public.resources TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.resources TO service_role;

CREATE INDEX resources_repository_id_idx ON public.resources (repository_id, created_at DESC);

CREATE TRIGGER resource_created_activity
  AFTER INSERT ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION private.record_resource_created();

CREATE TRIGGER resources_touch_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION private.touch_updated_at();

CREATE POLICY resources_delete_manager ON public.resources
  FOR DELETE
  TO authenticated
  USING (( SELECT private.has_repository_capability(resources.repository_id, 'resource.delete'::text) AS has_repository_capability));

CREATE POLICY resources_insert_contributor ON public.resources
  FOR INSERT
  TO authenticated
  WITH
    CHECK
    (((( SELECT auth.uid() AS uid) = created_by) AND ( SELECT private.has_repository_capability(resources.repository_id, 'resource.create'::text) AS has_repository_capability)));

CREATE POLICY resources_select_visible ON public.resources
  FOR SELECT
  TO anon, authenticated
  USING (( SELECT private.can_view_repository(resources.repository_id) AS can_view_repository));

CREATE POLICY resources_update_contributor ON public.resources
  FOR UPDATE
  TO authenticated
  USING (( SELECT private.has_repository_capability(resources.repository_id, 'resource.update'::text) AS has_repository_capability))
  WITH CHECK (( SELECT private.has_repository_capability(resources.repository_id, 'resource.update'::text) AS has_repository_capability));