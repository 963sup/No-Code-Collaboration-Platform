revoke delete on table public.resources from authenticated;

drop policy if exists resources_delete_manager on public.resources;
