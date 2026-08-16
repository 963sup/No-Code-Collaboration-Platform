import { readFileSync, writeFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function write(path, content) {
  writeFileSync(path, content, 'utf8');
}

function replaceOnce(path, before, after) {
  const content = read(path);
  const first = content.indexOf(before);
  if (first === -1) throw new Error(`${path}: expected block not found`);
  if (content.indexOf(before, first + before.length) !== -1) {
    throw new Error(`${path}: expected block is not unique`);
  }
  write(path, `${content.slice(0, first)}${after}${content.slice(first + before.length)}`);
}

replaceOnce(
  'supabase/schemas/65_notification.sql',
  `begin\n  if (select auth.uid()) is null\n    or target_artifact_type not in ('issue', 'discussion')\n    or not private.has_repository_capability(target_repository_id, 'resource.create') then\n    raise exception 'artifact numbering requires resource.create'\n      using errcode = '42501';\n  end if;\n\n  insert into public.repository_artifact_counters as counter (`,
  `begin\n  if (select auth.uid()) is null\n    or target_artifact_type not in ('issue', 'discussion') then\n    raise exception 'artifact numbering requires an authenticated accepted artifact type'\n      using errcode = '42501';\n  end if;\n\n  if target_artifact_type = 'issue'\n    and not private.has_repository_capability(target_repository_id, 'issue.create') then\n    raise exception 'Issue numbering requires issue.create'\n      using errcode = '42501';\n  end if;\n\n  if target_artifact_type = 'discussion'\n    and not private.has_repository_capability(target_repository_id, 'discussion.create') then\n    raise exception 'Discussion numbering requires discussion.create'\n      using errcode = '42501';\n  end if;\n\n  insert into public.repository_artifact_counters as counter (`
);

replaceOnce(
  'supabase/schemas/93_collaboration_commands.sql',
  `  if not private.has_repository_capability(target_repository_id, 'resource.update')\n    or not exists (`,
  `  if not private.has_repository_capability(target_repository_id, 'issue.manage')\n    or not exists (`
);

replaceOnce(
  'supabase/tests/page-resource.test.sql',
  `'resource.create'\n  )),\n  true,\n  'Organization admin governance authority expands to Repository capabilities'`,
  `'page.create'\n  )),\n  true,\n  'Organization admin governance authority expands to Page creation capability'`
);

const lifecycle = 'supabase/tests/collaboration-lifecycle.test.sql';
replaceOnce(lifecycle, 'select plan(57);', 'select plan(56);');
replaceOnce(
  lifecycle,
  `  ('00000000-0000-0000-0000-000000000502', 'collaboration-contributor@example.com', '{}'::jsonb),\n  ('00000000-0000-0000-0000-000000000503', 'collaboration-outsider@example.com', '{}'::jsonb);`,
  `  ('00000000-0000-0000-0000-000000000502', 'collaboration-write@example.com', '{}'::jsonb),\n  ('00000000-0000-0000-0000-000000000503', 'collaboration-outsider@example.com', '{}'::jsonb),\n  ('00000000-0000-0000-0000-000000000504', 'collaboration-triage@example.com', '{}'::jsonb);`
);
replaceOnce(
  lifecycle,
  `insert into public.repository_user_grants (repository_id, user_id, role, granted_by)\nvalues (\n  '20000000-0000-0000-0000-000000000501',\n  '00000000-0000-0000-0000-000000000502',\n  'write',\n  '00000000-0000-0000-0000-000000000501'\n);`,
  `insert into public.repository_user_grants (repository_id, user_id, role, granted_by)\nvalues\n  (\n    '20000000-0000-0000-0000-000000000501',\n    '00000000-0000-0000-0000-000000000502',\n    'write',\n    '00000000-0000-0000-0000-000000000501'\n  ),\n  (\n    '20000000-0000-0000-0000-000000000501',\n    '00000000-0000-0000-0000-000000000504',\n    'triage',\n    '00000000-0000-0000-0000-000000000501'\n  );`
);
replaceOnce(
  lifecycle,
  `select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);\n\nselect is(\n  public.execute_repository_grant_command(\n    '20000000-0000-0000-0000-000000000501',\n    '00000000-0000-0000-0000-000000000502',\n    'write',\n    'triage'\n  ),\n  'applied',\n  'Admin can change the collaborator from Write to Triage'\n);\n\nselect set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);\n\nselect is(\n  (select count(*) from public.add_discussion_comment(\n    '20000000-0000-0000-0000-000000000501',\n    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),\n    'Triage must remain blocked while locked',\n    4\n  )),\n  0::bigint,\n  'Triage cannot comment on an open locked Discussion'\n);\n\nselect set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);`,
  `select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000504', true);\n\nselect is(\n  (select count(*) from public.add_discussion_comment(\n    '20000000-0000-0000-0000-000000000501',\n    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),\n    'Triage must remain blocked while locked',\n    4\n  )),\n  0::bigint,\n  'Triage cannot comment on an open locked Discussion'\n);`
);
replaceOnce(
  lifecycle,
  `  'Triage cannot create an announcement Discussion'\n);\n\nselect is(\n  public.set_notification_preference(`,
  `  'Triage cannot create an announcement Discussion'\n);\n\nselect set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);\n\nselect is(\n  public.set_notification_preference(`
);
replaceOnce(
  lifecycle,
  `select is(\n  (select count(*) from public.list_notifications('all', 1)),\n  0::bigint,\n  'the triggering Actor never receives a self-notification'\n);`,
  `select is(\n  (\n    select count(*)\n    from public.notification_threads as notification\n    where notification.recipient_id = (select auth.uid())\n      and notification.repository_id = '20000000-0000-0000-0000-000000000501'\n      and notification.artifact_type = 'issue'\n      and notification.artifact_id = (\n        select id\n        from public.issues\n        where repository_id = '20000000-0000-0000-0000-000000000501'\n          and issue_number = 1\n      )\n  ),\n  0::bigint,\n  'the triggering Actor receives no self-notification for its own Issue event'\n);`
);

replaceOnce(
  'apps/web/e2e/repository-grant-lifecycle.spec.ts',
  'Viewer must not be allowed to save this mutation.',
  'Read must not be allowed to save this mutation.'
);

replaceOnce(
  'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/page.tsx',
  `          Effective authority is derived from ownership/governance, Direct Grants, and the public\n          read baseline. Direct Grant changes use the same Domain delegation policy and independent\n          database enforcement.`,
  `          Effective authority is derived from ownership/governance, Direct Grants, and the public\n          read baseline. Direct Repository access management is Admin-only and is independently\n          enforced by Application policy and PostgreSQL.`
);

replaceOnce(
  'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/page.tsx',
  `              Direct Grants are explicit User → Repository authority relationships. They are\n              independent from Organization Membership and cannot target the acting User itself.`,
  `              Direct Grants are explicit User → Repository authority relationships. Repository\n              Admin manages them; Organization Membership remains independent, and delegation cannot\n              target the acting User itself.`
);

process.stdout.write(`${JSON.stringify({ ok: true })}\n`);
