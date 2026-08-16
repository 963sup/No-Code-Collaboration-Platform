alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.repositories enable row level security;
alter table public.repository_user_grants enable row level security;
alter table public.resources enable row level security;
alter table public.repository_labels enable row level security;
alter table public.issues enable row level security;
alter table public.issue_assignees enable row level security;
alter table public.issue_labels enable row level security;
alter table public.issue_comments enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_comments enable row level security;
alter table public.activity_events enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_threads enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.repositories from anon, authenticated;
revoke all on table public.repository_user_grants from anon, authenticated;
revoke all on table public.resources from anon, authenticated;
revoke all on table public.repository_artifact_counters from anon, authenticated;
revoke all on table public.repository_labels from anon, authenticated;
revoke all on table public.issues from anon, authenticated;
revoke all on table public.issue_assignees from anon, authenticated;
revoke all on table public.issue_labels from anon, authenticated;
revoke all on table public.issue_comments from anon, authenticated;
revoke all on table public.discussions from anon, authenticated;
revoke all on table public.discussion_comments from anon, authenticated;
revoke all on table public.activity_events from anon, authenticated;
revoke all on table public.notification_preferences from anon, authenticated;
revoke all on table public.notification_threads from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, updated_at) on table public.profiles to authenticated;

grant select, insert on table public.organizations to authenticated;
grant update (slug, name, updated_at) on table public.organizations to authenticated;

grant select, insert, delete on table public.organization_memberships to authenticated;
grant update (role) on table public.organization_memberships to authenticated;

grant select on table public.repositories to anon, authenticated;
grant insert on table public.repositories to authenticated;
grant update (slug, name, description, visibility, updated_at) on table public.repositories to authenticated;

grant select, insert, delete on table public.repository_user_grants to authenticated;
grant update (role) on table public.repository_user_grants to authenticated;

grant select on table public.resources to anon, authenticated;
grant insert on table public.resources to authenticated;
grant update (title, content) on table public.resources to authenticated;

grant select on table public.repository_labels to anon, authenticated;
grant select on table public.issues to anon, authenticated;
grant insert on table public.issues to authenticated;
grant update (
  title,
  body,
  status,
  close_reason,
  version,
  updated_at,
  closed_by,
  closed_at
) on table public.issues to authenticated;
grant select, insert, delete on table public.issue_assignees to authenticated;
grant select, insert, delete on table public.issue_labels to authenticated;
grant select on table public.issue_assignees to anon;
grant select on table public.issue_labels to anon;
grant select on table public.issue_comments to anon, authenticated;
grant insert on table public.issue_comments to authenticated;

grant select on table public.discussions to anon, authenticated;
grant insert on table public.discussions to authenticated;
grant update (
  title,
  body,
  status,
  is_locked,
  answer_comment_id,
  version,
  updated_at,
  closed_by,
  closed_at
) on table public.discussions to authenticated;
grant select on table public.discussion_comments to anon, authenticated;
grant insert on table public.discussion_comments to authenticated;

grant select on table public.activity_events to authenticated;

grant select, insert, delete on table public.notification_preferences to authenticated;
grant update (is_watched, is_muted, updated_at)
  on table public.notification_preferences to authenticated;
grant select on table public.notification_threads to authenticated;
grant update (state, updated_at) on table public.notification_threads to authenticated;

-- Organization, Repository, and Resource hard deletion deliberately have no end-user DELETE grant
-- or RLS policy until an accepted lifecycle defines retention, restore, and historical continuity.
-- Resource INSERT/UPDATE table privileges support SECURITY INVOKER Page command RPCs. Raw Data API
-- mutations fail closed because the policies below require transaction-local command context set by
-- those RPCs in addition to the ordinary Actor and Capability checks.

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

create policy organization_memberships_select_member
on public.organization_memberships
for select
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy organization_memberships_insert_delegated
on public.organization_memberships
for insert
to authenticated
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy organization_memberships_update_delegated
on public.organization_memberships
for update
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
)
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy organization_memberships_delete_delegated
on public.organization_memberships
for delete
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy repositories_select_visible
on public.repositories
for select
to anon, authenticated
using ((select private.can_view_repository(id)));

create policy repositories_insert_access_policy
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and (
    select private.can_create_repository_for_owner(
      owner_user_id,
      owner_organization_id
    )
  )
);

create policy repositories_update_admin
on public.repositories
for update
to authenticated
using ((select private.has_repository_capability(id, 'repository.manage')))
with check ((select private.has_repository_capability(id, 'repository.manage')));

create policy repository_user_grants_select_admin
on public.repository_user_grants
for select
to authenticated
using ((select private.has_repository_capability(repository_id, 'repository.access.manage')));

create policy repository_user_grants_insert_delegated
on public.repository_user_grants
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and (select auth.uid()) = granted_by
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
  and (select private.is_repository_grant_role_allowed(repository_id, role))
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
  and (select private.is_repository_grant_role_allowed(repository_id, role))
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

create policy resources_select_visible
on public.resources
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy resources_insert_write
on public.resources
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.page_command', true)) = 'create'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'page.create'))
);

create policy resources_update_write
on public.resources
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.page_command', true)) = 'update'
  and (select private.has_repository_capability(repository_id, 'page.update'))
)
with check (
  (select pg_catalog.current_setting('app.page_command', true)) = 'update'
  and (select private.has_repository_capability(repository_id, 'page.update'))
);

create policy repository_labels_select_visible
on public.repository_labels
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issues_select_visible
on public.issues
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issues_insert_command
on public.issues
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'create'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'issue.create'))
);

create policy issues_update_command
on public.issues
for update
to authenticated
using (
  case (select pg_catalog.current_setting('app.issue_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'issue.comment'))
    when 'edit' then (
      (select private.has_repository_capability(repository_id, 'issue.edit'))
      or created_by = (select auth.uid())
    )
    when 'assign' then (select private.has_repository_capability(repository_id, 'issue.manage'))
    when 'label' then (select private.has_repository_capability(repository_id, 'issue.manage'))
    when 'transition' then (
      (select private.has_repository_capability(repository_id, 'issue.manage'))
      or created_by = (select auth.uid())
    )
    else false
  end
)
with check (
  case (select pg_catalog.current_setting('app.issue_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'issue.comment'))
    when 'edit' then (
      (select private.has_repository_capability(repository_id, 'issue.edit'))
      or created_by = (select auth.uid())
    )
    when 'assign' then (select private.has_repository_capability(repository_id, 'issue.manage'))
    when 'label' then (select private.has_repository_capability(repository_id, 'issue.manage'))
    when 'transition' then (
      (select private.has_repository_capability(repository_id, 'issue.manage'))
      or created_by = (select auth.uid())
    )
    else false
  end
);

create policy issue_assignees_select_visible
on public.issue_assignees
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issue_assignees_insert_command
on public.issue_assignees
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'
  and (select auth.uid()) = assigned_by
  and (select private.has_repository_capability(repository_id, 'issue.manage'))
  and (select private.user_can_view_repository(user_id, repository_id))
);

create policy issue_assignees_delete_command
on public.issue_assignees
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'
  and (select private.has_repository_capability(repository_id, 'issue.manage'))
);

create policy issue_labels_select_visible
on public.issue_labels
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issue_labels_insert_command
on public.issue_labels
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'
  and (select auth.uid()) = applied_by
  and (select private.has_repository_capability(repository_id, 'issue.manage'))
);

create policy issue_labels_delete_command
on public.issue_labels
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'
  and (select private.has_repository_capability(repository_id, 'issue.manage'))
);

create policy issue_comments_select_visible
on public.issue_comments
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issue_comments_insert_command
on public.issue_comments
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'comment'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'issue.comment'))
);

create policy discussions_select_visible
on public.discussions
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy discussions_insert_command
on public.discussions
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.discussion_command', true)) = 'create'
  and (select auth.uid()) = created_by
  and (
    (category <> 'announcement' and (select private.has_repository_capability(repository_id, 'discussion.create')))
    or (category = 'announcement' and (select private.has_repository_capability(repository_id, 'discussion.announce')))
  )
);

create policy discussions_update_command
on public.discussions
for update
to authenticated
using (
  case (select pg_catalog.current_setting('app.discussion_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'discussion.comment'))
    when 'moderate' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))
    when 'edit' then (select private.has_repository_capability(repository_id, 'discussion.edit'))
    when 'transition' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))
    when 'answer' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))
    else false
  end
)
with check (
  case (select pg_catalog.current_setting('app.discussion_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'discussion.comment'))
    when 'moderate' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))
    when 'edit' then (select private.has_repository_capability(repository_id, 'discussion.edit'))
    when 'transition' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))
    when 'answer' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))
    else false
  end
);

create policy discussion_comments_select_visible
on public.discussion_comments
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy discussion_comments_insert_command
on public.discussion_comments
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.discussion_command', true)) = 'comment'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'discussion.comment'))
  and exists (
    select 1
    from public.discussions as discussion
    where discussion.id = discussion_id
      and discussion.status = 'open'
      and (
        not discussion.is_locked
        or (select private.has_repository_capability(repository_id, 'discussion.comment.locked'))
      )
  )
);

create policy notification_preferences_select_self
on public.notification_preferences
for select
to authenticated
using (
  (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_preferences_insert_command
on public.notification_preferences
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_preferences_update_command
on public.notification_preferences
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
)
with check (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_preferences_delete_command
on public.notification_preferences
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
);

create policy notification_threads_select_self_with_current_access
on public.notification_threads
for select
to authenticated
using (
  (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_threads_update_command
on public.notification_threads
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'state'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
)
with check (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'state'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

-- Activity Event payload is historical Evidence, not part of the anonymous/authenticated public
-- participation baseline. Public Repository visibility never exposes raw evidence without an
-- independently assigned/derived Repository Role.
create policy activity_events_select_authorized_viewer
on public.activity_events
for select
to authenticated
using ((select private.current_repository_role(repository_id)) is not null);
