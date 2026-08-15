drop policy if exists repository_user_grants_insert_delegated
on public.repository_user_grants;
drop policy if exists repository_user_grants_update_delegated
on public.repository_user_grants;
drop policy if exists repository_user_grants_delete_delegated
on public.repository_user_grants;

create policy repository_user_grants_insert_delegated
on public.repository_user_grants
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and (select auth.uid()) = granted_by
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_update_delegated
on public.repository_user_grants
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
)
with check (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_delete_delegated
on public.repository_user_grants
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
);
