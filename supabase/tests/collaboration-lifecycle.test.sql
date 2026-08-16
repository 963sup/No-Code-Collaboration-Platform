begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(55);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000501', 'collaboration-owner@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000502', 'collaboration-contributor@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000503', 'collaboration-outsider@example.com', '{}'::jsonb);

update public.profiles set username = 'collaboration-owner'
where id = '00000000-0000-0000-0000-000000000501';

insert into public.repositories (
  id,
  owner_user_id,
  slug,
  name,
  visibility,
  created_by
)
values
  (
    '20000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000501',
    'private-collaboration',
    'Private Collaboration',
    'private',
    '00000000-0000-0000-0000-000000000501'
  ),
  (
    '20000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000501',
    'public-collaboration',
    'Public Collaboration',
    'public',
    '00000000-0000-0000-0000-000000000501'
  );

insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
values (
  '20000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000502',
  'write',
  '00000000-0000-0000-0000-000000000501'
);

insert into public.repository_labels (id, repository_id, name, color)
values
  (
    '30000000-0000-0000-0000-000000000501',
    '20000000-0000-0000-0000-000000000501',
    'security-reviewed',
    '1f883d'
  ),
  (
    '30000000-0000-0000-0000-000000000502',
    '20000000-0000-0000-0000-000000000501',
    'not-applied',
    '8250df'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select results_eq(
  $$
    select issue_number
    from public.create_issue(
      '20000000-0000-0000-0000-000000000501',
      'Shared private phrase',
      'Private body'
    )
  $$,
  $$ values (1::bigint) $$,
  'Issue identity begins at one inside its Repository'
);

select results_eq(
  $$
    select issue_number
    from public.create_issue(
      '20000000-0000-0000-0000-000000000501',
      'Other private work',
      'Another body'
    )
  $$,
  $$ values (2::bigint) $$,
  'Issue numbering increments atomically inside the same Repository'
);

select is(
  (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
  1::bigint,
  'a created Issue begins at version one'
);

select lives_ok(
  $$
    select * from public.add_issue_comment(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
      'First chronological comment',
      1
    )
  $$,
  'an authorized Issue comment command succeeds'
);

select is(
  (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
  2::bigint,
  'Issue conversation changes advance aggregate version'
);

select is(
  (select count(*) from public.issue_comments where issue_id = (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)),
  1::bigint,
  'Issue comments are stored as a flat chronological relationship'
);

select ok(
  exists (
    select 1 from public.activity_events
    where event_type = 'issue.commented'
      and subject_id = (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)
  ),
  'Issue mutation records immutable Activity Evidence in the same command'
);

select is(
  (select count(*) from public.add_issue_comment(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
    'Stale comment',
    1
  )),
  0::bigint,
  'a stale expected version produces no Issue mutation result'
);

select is(
  (select count(*) from public.issue_comments where issue_id = (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)),
  1::bigint,
  'a stale Issue command creates no partial comment'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000503', true);

select lives_ok(
  $$
    select * from public.set_issue_assignee(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
      '00000000-0000-0000-0000-000000000503',
      true,
      2
    )
  $$,
  'an outsider receives no assignee-access oracle for an inaccessible Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select throws_ok(
  $$
    select * from public.set_issue_assignee(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
      '00000000-0000-0000-0000-000000000503',
      true,
      2
    )
  $$,
  'P0002',
  'Assignee cannot access the Repository',
  'an authorized Actor still rejects an ineligible assignee'
);

select results_eq(
  $$
    select discussion_number from public.create_discussion(
      '20000000-0000-0000-0000-000000000501',
      'question',
      'Question Discussion',
      'What is the accepted answer?'
    )
  $$,
  $$ values (1::bigint) $$,
  'Discussion numbering is Repository-local and independent from Issue numbering'
);

select lives_ok(
  $$
    select * from public.add_discussion_comment(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1),
      'The selected answer',
      1
    )
  $$,
  'an open unlocked Discussion accepts a flat comment'
);

select is(
  (select count(*) from public.edit_discussion(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1),
    'Question Discussion',
    'What is the accepted answer?',
    2
  )),
  0::bigint,
  'an identical Discussion edit returns no mutation result'
);

select is(
  (select version from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1),
  2::bigint,
  'an identical Discussion edit does not advance version'
);

select is(
  (select count(*) from public.activity_events where event_type = 'discussion.edited' and subject_id = (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1)),
  0::bigint,
  'an identical Discussion edit fabricates no Activity Evidence'
);

select lives_ok(
  $$
    select * from public.set_discussion_answer(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1),
      (select id from public.discussion_comments where discussion_id = (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1)),
      (select version from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1)
    )
  $$,
  'a question Discussion can select one of its own comments as Answer'
);

select ok(
  (select answer_comment_id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1) is not null,
  'the question stores at most one selected Answer identity'
);

select results_eq(
  $$
    select discussion_number from public.create_discussion(
      '20000000-0000-0000-0000-000000000501',
      'general',
      'General Discussion',
      'Shared understanding'
    )
  $$,
  $$ values (2::bigint) $$,
  'a general Discussion uses the next Repository-local Discussion number'
);

select lives_ok(
  $$
    select * from public.add_discussion_comment(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
      'General comment',
      1
    )
  $$,
  'a general Discussion accepts a comment while open and unlocked'
);

select is(
  (select count(*) from public.set_discussion_answer(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
    (select id from public.discussion_comments where discussion_id = (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2)),
    2
  )),
  0::bigint,
  'a non-question Discussion rejects Answer selection'
);

select ok(
  (select answer_comment_id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2) is null,
  'a rejected non-question Answer command changes no Discussion state'
);

select lives_ok(
  $$
    select * from public.transition_discussion(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1),
      'closed',
      (select version from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1)
    )
  $$,
  'a question Discussion can close with expected version'
);

select is(
  (select count(*) from public.add_discussion_comment(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 1),
    'Rejected closed comment',
    4
  )),
  0::bigint,
  'a closed Discussion rejects new comments'
);

select lives_ok(
  $$
    select * from public.set_discussion_lock(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
      true,
      2
    )
  $$,
  'Repository manager can apply independent Discussion moderation lock state'
);

select is(
  (select count(*) from public.add_discussion_comment(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
    'Rejected locked comment',
    3
  )),
  0::bigint,
  'a locked Discussion rejects new comments independently of open status'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);

select throws_ok(
  $$
    select * from public.create_discussion(
      '20000000-0000-0000-0000-000000000501',
      'announcement',
      'Unauthorized announcement',
      'Should fail closed'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "discussions"',
  'a Contributor cannot create an announcement Discussion'
);

select is(
  public.set_notification_preference(
    '20000000-0000-0000-0000-000000000501',
    'repository',
    '20000000-0000-0000-0000-000000000501',
    'watch'
  ),
  true,
  'an Actor can explicitly watch an accessible Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select lives_ok(
  $$
    select * from public.edit_issue(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
      'Shared private phrase updated',
      'Private body updated',
      2
    )
  $$,
  'Issue edit emits a new notification-producing Evidence event'
);

select is(
  (select count(*) from public.edit_issue(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
    'Shared private phrase updated',
    'Private body updated',
    (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)
  )),
  0::bigint,
  'an identical Issue edit returns no mutation result'
);

select is(
  (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
  3::bigint,
  'an identical Issue edit does not advance version'
);

select is(
  (select count(*) from public.activity_events where event_type = 'issue.edited' and subject_id = (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)),
  1::bigint,
  'an identical Issue edit fabricates no additional Activity Evidence'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);

select is(
  (select count(*) from public.list_notifications('all', 1)),
  1::bigint,
  'a Repository watcher receives one aggregated notification thread'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select is(
  (select count(*) from public.list_notifications('all', 1)),
  0::bigint,
  'the triggering Actor never receives a self-notification'
);

select lives_ok(
  $$
    select * from public.set_issue_assignee(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
      '00000000-0000-0000-0000-000000000502',
      true,
      (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)
    )
  $$,
  'an accessible User can be assigned without receiving authority from assignment'
);

select is(
  (select count(*) from public.set_issue_assignee(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
    '00000000-0000-0000-0000-000000000502',
    true,
    (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)
  )),
  0::bigint,
  'assigning an existing assignee returns no mutation result'
);

select is(
  (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
  4::bigint,
  'assigning an existing assignee does not advance version'
);

select is(
  (select count(*) from public.activity_events where event_type = 'issue.assigned' and subject_id = (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)),
  1::bigint,
  'assigning an existing assignee fabricates no additional Activity Evidence'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);

select results_eq(
  $$ select reason::text, event_count from public.list_notifications('all', 1) $$,
  $$ values ('assigned'::text, 2::bigint) $$,
  'new Evidence updates the same recipient-Repository-Artifact thread and marks assignment reason'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select lives_ok(
  $$
    select * from public.set_issue_label(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
      '30000000-0000-0000-0000-000000000501',
      true,
      (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)
    )
  $$,
  'applying a new Repository label remains a meaningful Issue mutation'
);

select is(
  (select count(*) from public.set_issue_label(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
    '30000000-0000-0000-0000-000000000501',
    true,
    (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)
  )),
  0::bigint,
  'applying an existing label returns no mutation result'
);

select is(
  (select count(*) from public.set_issue_label(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
    '30000000-0000-0000-0000-000000000502',
    false,
    (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)
  )),
  0::bigint,
  'removing an absent label returns no mutation result'
);

select is(
  (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
  5::bigint,
  'label no-ops do not advance Issue version'
);

select is(
  (select count(*) from public.activity_events where event_type = 'issue.labeled' and subject_id = (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)),
  1::bigint,
  'applying an existing label fabricates no additional Activity Evidence'
);

select is(
  (select count(*) from public.activity_events where event_type = 'issue.unlabeled' and subject_id = (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1)),
  0::bigint,
  'removing an absent label fabricates no Activity Evidence'
);

reset role;
delete from public.repository_user_grants
where repository_id = '20000000-0000-0000-0000-000000000501'
  and user_id = '00000000-0000-0000-0000-000000000502';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);

select is(
  (select count(*) from public.list_notifications('all', 1)),
  0::bigint,
  'Notification reads revalidate Repository access after revocation'
);

select is(
  (select count(*) from public.notification_threads),
  0::bigint,
  'revoked access leaks no Notification title, count, source, or identity through table RLS'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select results_eq(
  $$
    select issue_number from public.create_issue(
      '20000000-0000-0000-0000-000000000502',
      'Shared public phrase',
      'Public body'
    )
  $$,
  $$ values (1::bigint) $$,
  'a second Repository owns an independent Issue number sequence'
);

select is(
  (select max(total_count) from public.search_collaboration('shared', 'issue', '', '', '', 'relevance', 1)),
  2::bigint,
  'an authorized owner sees private and public matching Issues'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000503', true);

select is(
  (select max(total_count) from public.search_collaboration('shared', 'issue', '', '', '', 'relevance', 1)),
  1::bigint,
  'Search authorization filters private candidates before result count'
);

select results_eq(
  $$ select title from public.search_collaboration('shared', 'issue', '', '', '', 'relevance', 1) $$,
  $$ values ('Shared public phrase'::text) $$,
  'Search produces no private title or snippet after authorization filtering'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select is(
  (
    select count(*)
    from public.list_project_items(
      '20000000-0000-0000-0000-000000000501',
      'issue',
      '',
      null,
      null,
      'updated',
      1
    )
  ),
  2::bigint,
  'Repository Projects is a derived view over existing Issues'
);

select is(
  (select version from public.issues where repository_id = '20000000-0000-0000-0000-000000000501' and issue_number = 1),
  5::bigint,
  'reading or filtering the planning Projection does not mutate its underlying Issue'
);

select is(
  (select max(total_count) from public.explore_public_repositories('recent', 'all', 'all', 1)),
  1::bigint,
  'Explore counts only public Repositories and excludes private existence from statistics'
);

select throws_ok(
  $$
    insert into public.issues (repository_id, issue_number, title, body, created_by)
    values (
      '20000000-0000-0000-0000-000000000502',
      99,
      'Raw bypass',
      'Raw mutation',
      '00000000-0000-0000-0000-000000000501'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "issues"',
  'raw Issue INSERT cannot bypass the typed command context'
);

select * from finish();
rollback;
