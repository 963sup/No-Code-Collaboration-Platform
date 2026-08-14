create policy repositories_insert_personal_owner
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and owner_user_id = (select auth.uid())
  and owner_organization_id is null
  and organization_id is null
);
