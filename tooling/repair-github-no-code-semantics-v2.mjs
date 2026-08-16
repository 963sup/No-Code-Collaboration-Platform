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
  if (first === -1) throw new Error(`${path}: expected source block not found`);
  if (content.indexOf(before, first + before.length) !== -1) {
    throw new Error(`${path}: expected source block is not unique`);
  }
  write(path, `${content.slice(0, first)}${after}${content.slice(first + before.length)}`);
}

function replaceLiteralRoles(path) {
  const content = read(path);
  write(
    path,
    content
      .replaceAll("'viewer'", "'read'")
      .replaceAll("'contributor'", "'write'")
      .replaceAll("'manager'", "'maintain'")
  );
}

const rls = 'supabase/schemas/99_rls.sql';
replaceOnce(rls, 'create policy repositories_update_manager', 'create policy repositories_update_admin');
replaceOnce(
  rls,
  `create policy repository_user_grants_select_viewer\non public.repository_user_grants\nfor select\nto authenticated\nusing ((select private.has_repository_capability(repository_id, 'repository.view')));`,
  `create policy repository_user_grants_select_admin\non public.repository_user_grants\nfor select\nto authenticated\nusing ((select private.has_repository_capability(repository_id, 'repository.access.manage')));`
);
replaceOnce(
  rls,
  `create policy resources_insert_contributor\non public.resources\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.page_command', true)) = 'create'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'resource.create'))\n);`,
  `create policy resources_insert_write\non public.resources\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.page_command', true)) = 'create'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'page.create'))\n);`
);
replaceOnce(
  rls,
  `create policy resources_update_contributor\non public.resources\nfor update\nto authenticated\nusing (\n  (select pg_catalog.current_setting('app.page_command', true)) = 'update'\n  and (select private.has_repository_capability(repository_id, 'resource.update'))\n)\nwith check (\n  (select pg_catalog.current_setting('app.page_command', true)) = 'update'\n  and (select private.has_repository_capability(repository_id, 'resource.update'))\n);`,
  `create policy resources_update_write\non public.resources\nfor update\nto authenticated\nusing (\n  (select pg_catalog.current_setting('app.page_command', true)) = 'update'\n  and (select private.has_repository_capability(repository_id, 'page.update'))\n)\nwith check (\n  (select pg_catalog.current_setting('app.page_command', true)) = 'update'\n  and (select private.has_repository_capability(repository_id, 'page.update'))\n);`
);
replaceOnce(
  rls,
  `create policy issues_insert_command\non public.issues\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'create'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'resource.create'))\n);`,
  `create policy issues_insert_command\non public.issues\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'create'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'issue.create'))\n);`
);
replaceOnce(
  rls,
  `create policy issues_update_command\non public.issues\nfor update\nto authenticated\nusing (\n  case (select pg_catalog.current_setting('app.issue_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'assign' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'label' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    else false\n  end\n)\nwith check (\n  case (select pg_catalog.current_setting('app.issue_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'assign' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'label' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    else false\n  end\n);`,
  `create policy issues_update_command\non public.issues\nfor update\nto authenticated\nusing (\n  case (select pg_catalog.current_setting('app.issue_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'issue.comment'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'issue.edit'))\n    when 'assign' then (select private.has_repository_capability(repository_id, 'issue.manage'))\n    when 'label' then (select private.has_repository_capability(repository_id, 'issue.manage'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'issue.manage'))\n    else false\n  end\n)\nwith check (\n  case (select pg_catalog.current_setting('app.issue_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'issue.comment'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'issue.edit'))\n    when 'assign' then (select private.has_repository_capability(repository_id, 'issue.manage'))\n    when 'label' then (select private.has_repository_capability(repository_id, 'issue.manage'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'issue.manage'))\n    else false\n  end\n);`
);
replaceOnce(
  rls,
  `create policy issue_assignees_insert_command\non public.issue_assignees\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'\n  and (select auth.uid()) = assigned_by\n  and (select private.has_repository_capability(repository_id, 'resource.update'))\n  and (select private.user_can_view_repository(user_id, repository_id))\n);`,
  `create policy issue_assignees_insert_command\non public.issue_assignees\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'\n  and (select auth.uid()) = assigned_by\n  and (select private.has_repository_capability(repository_id, 'issue.manage'))\n  and (select private.user_can_view_repository(user_id, repository_id))\n);`
);
replaceOnce(
  rls,
  `create policy issue_assignees_delete_command\non public.issue_assignees\nfor delete\nto authenticated\nusing (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'\n  and (select private.has_repository_capability(repository_id, 'resource.update'))\n);`,
  `create policy issue_assignees_delete_command\non public.issue_assignees\nfor delete\nto authenticated\nusing (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'\n  and (select private.has_repository_capability(repository_id, 'issue.manage'))\n);`
);
replaceOnce(
  rls,
  `create policy issue_labels_insert_command\non public.issue_labels\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'\n  and (select auth.uid()) = applied_by\n  and (select private.has_repository_capability(repository_id, 'resource.update'))\n);`,
  `create policy issue_labels_insert_command\non public.issue_labels\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'\n  and (select auth.uid()) = applied_by\n  and (select private.has_repository_capability(repository_id, 'issue.manage'))\n);`
);
replaceOnce(
  rls,
  `create policy issue_labels_delete_command\non public.issue_labels\nfor delete\nto authenticated\nusing (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'\n  and (select private.has_repository_capability(repository_id, 'resource.update'))\n);`,
  `create policy issue_labels_delete_command\non public.issue_labels\nfor delete\nto authenticated\nusing (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'\n  and (select private.has_repository_capability(repository_id, 'issue.manage'))\n);`
);
replaceOnce(
  rls,
  `create policy issue_comments_insert_command\non public.issue_comments\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'comment'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'resource.create'))\n);`,
  `create policy issue_comments_insert_command\non public.issue_comments\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.issue_command', true)) = 'comment'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'issue.comment'))\n);`
);
replaceOnce(
  rls,
  `create policy discussions_insert_command\non public.discussions\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.discussion_command', true)) = 'create'\n  and (select auth.uid()) = created_by\n  and (\n    (category <> 'announcement' and (select private.has_repository_capability(repository_id, 'resource.create')))\n    or (category = 'announcement' and (select private.has_repository_capability(repository_id, 'repository.manage')))\n  )\n);`,
  `create policy discussions_insert_command\non public.discussions\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.discussion_command', true)) = 'create'\n  and (select auth.uid()) = created_by\n  and (\n    (category <> 'announcement' and (select private.has_repository_capability(repository_id, 'discussion.create')))\n    or (category = 'announcement' and (select private.has_repository_capability(repository_id, 'discussion.announce')))\n  )\n);`
);
replaceOnce(
  rls,
  `create policy discussions_update_command\non public.discussions\nfor update\nto authenticated\nusing (\n  case (select pg_catalog.current_setting('app.discussion_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))\n    when 'moderate' then (select private.has_repository_capability(repository_id, 'repository.manage'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'answer' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    else false\n  end\n)\nwith check (\n  case (select pg_catalog.current_setting('app.discussion_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))\n    when 'moderate' then (select private.has_repository_capability(repository_id, 'repository.manage'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    when 'answer' then (select private.has_repository_capability(repository_id, 'resource.update'))\n    else false\n  end\n);`,
  `create policy discussions_update_command\non public.discussions\nfor update\nto authenticated\nusing (\n  case (select pg_catalog.current_setting('app.discussion_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'discussion.comment'))\n    when 'moderate' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'discussion.edit'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))\n    when 'answer' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))\n    else false\n  end\n)\nwith check (\n  case (select pg_catalog.current_setting('app.discussion_command', true))\n    when 'comment' then (select private.has_repository_capability(repository_id, 'discussion.comment'))\n    when 'moderate' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))\n    when 'edit' then (select private.has_repository_capability(repository_id, 'discussion.edit'))\n    when 'transition' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))\n    when 'answer' then (select private.has_repository_capability(repository_id, 'discussion.moderate'))\n    else false\n  end\n);`
);
replaceOnce(
  rls,
  `create policy discussion_comments_insert_command\non public.discussion_comments\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.discussion_command', true)) = 'comment'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'resource.create'))\n  and exists (\n    select 1\n    from public.discussions as discussion\n    where discussion.id = discussion_id\n      and discussion.status = 'open'\n      and not discussion.is_locked\n  )\n);`,
  `create policy discussion_comments_insert_command\non public.discussion_comments\nfor insert\nto authenticated\nwith check (\n  (select pg_catalog.current_setting('app.discussion_command', true)) = 'comment'\n  and (select auth.uid()) = created_by\n  and (select private.has_repository_capability(repository_id, 'discussion.comment'))\n  and exists (\n    select 1\n    from public.discussions as discussion\n    where discussion.id = discussion_id\n      and discussion.status = 'open'\n      and (\n        not discussion.is_locked\n        or (select private.has_repository_capability(repository_id, 'discussion.comment.locked'))\n      )\n  )\n);`
);

replaceOnce(
  'supabase/schemas/93_collaboration_commands.sql',
  `    and discussion.status = 'open'\n    and not discussion.is_locked`,
  `    and discussion.status = 'open'\n    and (\n      not discussion.is_locked\n      or private.has_repository_capability(\n        target_repository_id,\n        'discussion.comment.locked'\n      )\n    )`
);

for (const path of [
  'packages/application/tests/can-read-repository-activity.test.ts',
  'packages/application/tests/collaboration-commands.test.ts',
  'packages/application/tests/explain-current-repository-access.test.ts',
  'packages/domain/tests/authority.test.ts',
  'supabase/tests/authorization.test.sql',
  'supabase/tests/collaboration-lifecycle.test.sql',
  'supabase/tests/issue-read-projection.test.sql',
  'supabase/tests/page-resource.test.sql',
  'supabase/tests/repository-grant-lifecycle.test.sql',
  'supabase/tests/repository-owner-authority.test.sql',
  'supabase/tests/role-delegation.test.sql',
  'apps/web/e2e/repository-grant-lifecycle.spec.ts'
]) replaceLiteralRoles(path);

replaceOnce(
  'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/discussions/page.tsx',
  'Announcement (Repository manager only)',
  'Announcement (Maintain or Admin only)'
);

const e2ePath = 'apps/web/e2e/repository-grant-lifecycle.spec.ts';
replaceOnce(
  e2ePath,
  "const repositoryPath = '/demo-organization/demo-repository';",
  "test.describe.configure({ retries: 0 });\n\nconst repositoryPath = '/demo-organization/demo-repository';"
);

process.stdout.write(JSON.stringify({ ok: true }) + '\n');
