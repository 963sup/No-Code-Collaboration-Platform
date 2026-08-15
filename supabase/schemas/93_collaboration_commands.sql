create function public.create_issue(
  target_repository_id uuid,
  issue_title text,
  issue_body text default '',
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  created_issue public.issues%rowtype;
  normalized_title text;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue creation requires an authenticated Actor' using errcode = '42501';
  end if;
  normalized_title := pg_catalog.btrim(issue_title);
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'create', true);

  insert into public.issues (
    repository_id,
    issue_number,
    title,
    body,
    created_by
  )
  values (
    target_repository_id,
    private.next_artifact_number(target_repository_id, 'issue'),
    normalized_title,
    coalesce(issue_body, ''),
    actor_id
  )
  returning * into created_issue;

  perform private.record_collaboration_event(
    created_issue.repository_id,
    actor_id,
    'issue.created',
    'issue',
    created_issue.id,
    jsonb_build_object('issue_number', created_issue.issue_number, 'title', created_issue.title),
    'issue',
    created_issue.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next created_issue;
end;
$$;

create function public.edit_issue(
  target_repository_id uuid,
  issue_id uuid,
  issue_title text,
  issue_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue edit requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'edit', true);
  update public.issues as issue
  set title = pg_catalog.btrim(issue_title),
      body = coalesce(issue_body, ''),
      version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and (
      issue.title is distinct from pg_catalog.btrim(issue_title)
      or issue.body is distinct from coalesce(issue_body, '')
    )
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    'issue.edited',
    'issue',
    changed_issue.id,
    jsonb_build_object('version', changed_issue.version, 'title', changed_issue.title),
    'issue',
    changed_issue.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.add_issue_comment(
  target_repository_id uuid,
  issue_id uuid,
  comment_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  comment_id uuid;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue comment requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'comment', true);
  update public.issues as issue
  set version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  insert into public.issue_comments (issue_id, repository_id, body, created_by)
  values (changed_issue.id, changed_issue.repository_id, comment_body, actor_id)
  returning id into comment_id;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    'issue.commented',
    'issue',
    changed_issue.id,
    jsonb_build_object('comment_id', comment_id, 'version', changed_issue.version),
    'issue',
    changed_issue.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.set_issue_assignee(
  target_repository_id uuid,
  target_issue_id uuid,
  assignee_id uuid,
  should_assign boolean,
  expected_version bigint
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue assignment requires an authenticated Actor' using errcode = '42501';
  end if;
  if not private.has_repository_capability(target_repository_id, 'resource.update')
    or not exists (
      select 1
      from public.issues as issue
      where issue.id = target_issue_id
        and issue.repository_id = target_repository_id
        and issue.version = expected_version
    ) then
    return;
  end if;
  if should_assign and not private.user_can_view_repository(assignee_id, target_repository_id) then
    raise exception 'Assignee cannot access the Repository' using errcode = 'P0002';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'assign', true);
  update public.issues as issue
  set version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = target_issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and (
      (should_assign and not exists (
        select 1
        from public.issue_assignees as assignment
        where assignment.issue_id = target_issue_id
          and assignment.user_id = assignee_id
      ))
      or (not should_assign and exists (
        select 1
        from public.issue_assignees as assignment
        where assignment.issue_id = target_issue_id
          and assignment.user_id = assignee_id
      ))
    )
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  if should_assign then
    insert into public.issue_assignees (issue_id, repository_id, user_id, assigned_by)
    values (changed_issue.id, changed_issue.repository_id, assignee_id, actor_id)
    on conflict (issue_id, user_id) do nothing;
  else
    delete from public.issue_assignees as assignment
    where assignment.issue_id = changed_issue.id and assignment.user_id = assignee_id;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    case when should_assign then 'issue.assigned' else 'issue.unassigned' end,
    'issue',
    changed_issue.id,
    jsonb_build_object('assignee_id', assignee_id, 'version', changed_issue.version),
    'issue',
    changed_issue.title
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.set_issue_label(
  target_repository_id uuid,
  issue_id uuid,
  label_id uuid,
  should_apply boolean,
  expected_version bigint
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue labeling requires an authenticated Actor' using errcode = '42501';
  end if;
  if should_apply and not exists (
    select 1 from public.repository_labels as label
    where label.id = set_issue_label.label_id and label.repository_id = target_repository_id
  ) then
    raise exception 'Label is unavailable in this Repository' using errcode = 'P0002';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'label', true);
  update public.issues as issue
  set version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = set_issue_label.issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and (
      (should_apply and not exists (
        select 1
        from public.issue_labels as applied
        where applied.issue_id = set_issue_label.issue_id
          and applied.label_id = set_issue_label.label_id
      ))
      or (not should_apply and exists (
        select 1
        from public.issue_labels as applied
        where applied.issue_id = set_issue_label.issue_id
          and applied.label_id = set_issue_label.label_id
      ))
    )
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  if should_apply then
    insert into public.issue_labels (issue_id, repository_id, label_id, applied_by)
    values (changed_issue.id, changed_issue.repository_id, set_issue_label.label_id, actor_id)
    on conflict on constraint issue_labels_pkey do nothing;
  else
    delete from public.issue_labels as applied
    where applied.issue_id = changed_issue.id and applied.label_id = set_issue_label.label_id;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    case when should_apply then 'issue.labeled' else 'issue.unlabeled' end,
    'issue',
    changed_issue.id,
    jsonb_build_object('label_id', set_issue_label.label_id, 'version', changed_issue.version),
    'issue',
    changed_issue.title
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.transition_issue(
  target_repository_id uuid,
  issue_id uuid,
  target_status public.issue_status,
  expected_version bigint,
  target_close_reason public.issue_close_reason default null
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue transition requires an authenticated Actor' using errcode = '42501';
  end if;
  if (target_status = 'closed' and target_close_reason is null)
    or (target_status = 'open' and target_close_reason is not null) then
    raise exception 'Issue close reason is inconsistent with target status' using errcode = '22023';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'transition', true);
  update public.issues as issue
  set status = target_status,
      close_reason = target_close_reason,
      closed_by = case when target_status = 'closed' then actor_id else null end,
      closed_at = case when target_status = 'closed' then timezone('utc', statement_timestamp()) else null end,
      version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and issue.status <> target_status
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    case when target_status = 'closed' then 'issue.closed' else 'issue.reopened' end,
    'issue',
    changed_issue.id,
    jsonb_build_object('close_reason', changed_issue.close_reason, 'version', changed_issue.version),
    'issue',
    changed_issue.title
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.create_discussion(
  target_repository_id uuid,
  discussion_category public.discussion_category,
  discussion_title text,
  discussion_body text default '',
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  created_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion creation requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'create', true);
  insert into public.discussions (
    repository_id,
    discussion_number,
    category,
    title,
    body,
    created_by
  )
  values (
    target_repository_id,
    private.next_artifact_number(target_repository_id, 'discussion'),
    discussion_category,
    pg_catalog.btrim(discussion_title),
    coalesce(discussion_body, ''),
    actor_id
  )
  returning * into created_discussion;
  perform private.record_collaboration_event(
    created_discussion.repository_id,
    actor_id,
    'discussion.created',
    'discussion',
    created_discussion.id,
    jsonb_build_object(
      'category', created_discussion.category,
      'discussion_number', created_discussion.discussion_number,
      'title', created_discussion.title
    ),
    'discussion',
    created_discussion.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next created_discussion;
end;
$$;

create function public.edit_discussion(
  target_repository_id uuid,
  discussion_id uuid,
  discussion_title text,
  discussion_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion edit requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'edit', true);
  update public.discussions as discussion
  set title = pg_catalog.btrim(discussion_title),
      body = coalesce(discussion_body, ''),
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and (
      discussion.title is distinct from pg_catalog.btrim(discussion_title)
      or discussion.body is distinct from coalesce(discussion_body, '')
    )
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    'discussion.edited',
    'discussion',
    changed_discussion.id,
    jsonb_build_object('version', changed_discussion.version, 'title', changed_discussion.title),
    'discussion',
    changed_discussion.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.add_discussion_comment(
  target_repository_id uuid,
  discussion_id uuid,
  comment_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  comment_id uuid;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion comment requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'comment', true);
  update public.discussions as discussion
  set version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.status = 'open'
    and not discussion.is_locked
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  insert into public.discussion_comments (discussion_id, repository_id, body, created_by)
  values (changed_discussion.id, changed_discussion.repository_id, comment_body, actor_id)
  returning id into comment_id;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    'discussion.commented',
    'discussion',
    changed_discussion.id,
    jsonb_build_object('comment_id', comment_id, 'version', changed_discussion.version),
    'discussion',
    changed_discussion.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.transition_discussion(
  target_repository_id uuid,
  discussion_id uuid,
  target_status public.discussion_status,
  expected_version bigint
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion transition requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'transition', true);
  update public.discussions as discussion
  set status = target_status,
      closed_by = case when target_status = 'closed' then actor_id else null end,
      closed_at = case when target_status = 'closed' then timezone('utc', statement_timestamp()) else null end,
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.status <> target_status
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    case when target_status = 'closed' then 'discussion.closed' else 'discussion.reopened' end,
    'discussion',
    changed_discussion.id,
    jsonb_build_object('version', changed_discussion.version),
    'discussion',
    changed_discussion.title
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.set_discussion_lock(
  target_repository_id uuid,
  discussion_id uuid,
  should_lock boolean,
  expected_version bigint
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion moderation requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'moderate', true);
  update public.discussions as discussion
  set is_locked = should_lock,
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.is_locked <> should_lock
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    case when should_lock then 'discussion.locked' else 'discussion.unlocked' end,
    'discussion',
    changed_discussion.id,
    jsonb_build_object('version', changed_discussion.version),
    'discussion',
    changed_discussion.title
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.set_discussion_answer(
  target_repository_id uuid,
  target_discussion_id uuid,
  target_answer_comment_id uuid,
  expected_version bigint
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion answer selection requires an authenticated Actor'
      using errcode = '42501';
  end if;
  if target_answer_comment_id is not null and not exists (
    select 1
    from public.discussion_comments as comment
    where comment.id = target_answer_comment_id
      and comment.discussion_id = target_discussion_id
  ) then
    raise exception 'Answer comment is unavailable in this Discussion' using errcode = 'P0002';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'answer', true);
  update public.discussions as discussion
  set answer_comment_id = target_answer_comment_id,
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = target_discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.category = 'question'
    and discussion.answer_comment_id is distinct from target_answer_comment_id
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    case when target_answer_comment_id is null then 'discussion.answer_cleared'
      else 'discussion.answer_selected' end,
    'discussion',
    changed_discussion.id,
    jsonb_build_object('answer_comment_id', target_answer_comment_id, 'version', changed_discussion.version),
    'discussion',
    changed_discussion.title
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.clear_discussion_answer(
  target_repository_id uuid,
  discussion_id uuid,
  expected_version bigint
)
returns setof public.discussions
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from public.set_discussion_answer(
    target_repository_id,
    discussion_id,
    null::uuid,
    expected_version
  );
$$;

revoke all on function public.create_issue(uuid, text, text, uuid[]) from public, anon, authenticated;
revoke all on function public.edit_issue(uuid, uuid, text, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.add_issue_comment(uuid, uuid, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.set_issue_assignee(uuid, uuid, uuid, boolean, bigint) from public, anon, authenticated;
revoke all on function public.set_issue_label(uuid, uuid, uuid, boolean, bigint) from public, anon, authenticated;
revoke all on function public.transition_issue(uuid, uuid, public.issue_status, bigint, public.issue_close_reason) from public, anon, authenticated;
revoke all on function public.create_discussion(uuid, public.discussion_category, text, text, uuid[]) from public, anon, authenticated;
revoke all on function public.edit_discussion(uuid, uuid, text, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.add_discussion_comment(uuid, uuid, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.transition_discussion(uuid, uuid, public.discussion_status, bigint) from public, anon, authenticated;
revoke all on function public.set_discussion_lock(uuid, uuid, boolean, bigint) from public, anon, authenticated;
revoke all on function public.set_discussion_answer(uuid, uuid, uuid, bigint) from public, anon, authenticated;
revoke all on function public.clear_discussion_answer(uuid, uuid, bigint) from public, anon, authenticated;

grant execute on function public.create_issue(uuid, text, text, uuid[]) to authenticated;
grant execute on function public.edit_issue(uuid, uuid, text, text, bigint, uuid[]) to authenticated;
grant execute on function public.add_issue_comment(uuid, uuid, text, bigint, uuid[]) to authenticated;
grant execute on function public.set_issue_assignee(uuid, uuid, uuid, boolean, bigint) to authenticated;
grant execute on function public.set_issue_label(uuid, uuid, uuid, boolean, bigint) to authenticated;
grant execute on function public.transition_issue(uuid, uuid, public.issue_status, bigint, public.issue_close_reason) to authenticated;
grant execute on function public.create_discussion(uuid, public.discussion_category, text, text, uuid[]) to authenticated;
grant execute on function public.edit_discussion(uuid, uuid, text, text, bigint, uuid[]) to authenticated;
grant execute on function public.add_discussion_comment(uuid, uuid, text, bigint, uuid[]) to authenticated;
grant execute on function public.transition_discussion(uuid, uuid, public.discussion_status, bigint) to authenticated;
grant execute on function public.set_discussion_lock(uuid, uuid, boolean, bigint) to authenticated;
grant execute on function public.set_discussion_answer(uuid, uuid, uuid, bigint) to authenticated;
grant execute on function public.clear_discussion_answer(uuid, uuid, bigint) to authenticated;
