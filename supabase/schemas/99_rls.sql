alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.repositories enable row level security;
alter table public.repository_user_grants enable row level security;
alter table public.resources enable row level security;
alter table public.activity_events enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.repositories from anon, authenticated;
revoke all on table public.repository_user_grants from anon, authenticated;
revoke all on table public.resources from anon, authenticated;
revoke all on table public.activity_events from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, updated_at) on table public.profiles to authenticated;

grant select, insert, delete on table public.organizations to authenticated;
grant update (slug, name, updated_at) on table public.organizations to authenticated;

grant select, insert, delete on table public.organization_memberships to authenticated;
grant update (role) on table public.organization_memberships to authenticated;

grant select on table public.repositories to anon, authenticated;
grant insert, delete on table public.repositories to authenticated;
grant update (slug, name, description, visibility, updated_at) on table public.repositories to authenticated;

grant select, insert, delete on table public.repository_user_grants to authenticated;
grant update (role) on table public.repository_user_grants to authenticated;

grant select on table public.resources to anon, authenticated;
grant insert, delete on table public.resources to authenticated;
grant update (title, content, updated_at) on table public.resources to authenticated;

grant select on table public.activity_events to authenticated;

create policy profiles_select_self
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_self
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy organizations_select_member
on public.organizations
for select
to authenticated
using ((select private.is_organization_member(id)));

create policy organizations_insert_actor
on public.organizations
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy organizations_update_admin
on public.organizations
for update
to authenticated
using ((select private.is_organization_admin(id)))
with check ((select private.is_organization_admin(id)));

create policy organizations_delete_admin
on public.organizations
for delete
to authenticated
using ((select private.is_organization_admin(id)));

create policy organization_memberships_select_member
on public.organization_memberships
for select
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy organization_memberships_insert_admin
on public.organization_memberships
for insert
to authenticated
with check ((select private.is_organization_admin(organization_id)));

create policy organization_memberships_update_admin
on public.organization_memberships
for update
to authenticated
using ((select private.is_organization_admin(organization_id)))
with check ((select private.is_organization_admin(organization_id)));

create policy organization_memberships_delete_admin
on public.organization_memberships
for delete
to authenticated
using ((select private.is_organization_admin(organization_id)));

create policy repositories_select_visible
on public.repositories
for select
to anon, authenticated
using ((select private.can_view_repository(id)));

create policy repositories_insert_admin
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and (select private.is_organization_admin(organization_id))
);

create policy repositories_update_manager
on public.repositories
for update
to authenticated
using ((select private.has_repository_capability(id, 'repository.manage')))
with check ((select private.has_repository_capability(id, 'repository.manage')));

create policy repositories_delete_manager
on public.repositories
for delete
to authenticated
using ((select private.has_repository_capability(id, 'repository.manage')));

create policy repository_user_grants_select_viewer
on public.repository_user_grants
for select
to authenticated
using ((select private.has_repository_capability(repository_id, 'repository.view')));

create policy repository_user_grants_insert_manager
on public.repository_user_grants
for insert
to authenticated
with check ((select private.has_repository_capability(repository_id, 'member.manage')));

create policy repository_user_grants_update_manager
on public.repository_user_grants
for update
to authenticated
using ((select private.has_repository_capability(repository_id, 'member.manage')))
with check ((select private.has_repository_capability(repository_id, 'member.manage')));

create policy repository_user_grants_delete_manager
on public.repository_user_grants
for delete
to authenticated
using ((select private.has_repository_capability(repository_id, 'member.manage')));

create policy resources_select_visible
on public.resources
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy resources_insert_contributor
on public.resources
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'resource.create'))
);

create policy resources_update_contributor
on public.resources
for update
to authenticated
using ((select private.has_repository_capability(repository_id, 'resource.update')))
with check ((select private.has_repository_capability(repository_id, 'resource.update')));

create policy resources_delete_manager
on public.resources
for delete
to authenticated
using ((select private.has_repository_capability(repository_id, 'resource.delete')));

create policy activity_events_select_viewer
on public.activity_events
for select
to authenticated
using ((select private.has_repository_capability(repository_id, 'repository.view')));
