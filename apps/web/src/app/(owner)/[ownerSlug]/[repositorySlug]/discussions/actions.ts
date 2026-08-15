'use server';

import { ExecuteDiscussionCommand } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import {
  repositoryDiscussionPath,
  repositoryDiscussionsPath,
  repositoryPath
} from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';

type DiscussionCommand = Parameters<ExecuteDiscussionCommand['execute']>[0];

const createDiscussionSchema = z.object({
  body: z.string(),
  category: z.enum(['general', 'question', 'announcement']),
  title: z.string().trim().min(1).max(240)
});

const updateDiscussionSchema = z.object({
  body: z.string().optional(),
  commentId: z.string().uuid().optional(),
  expectedVersion: z.coerce.number().int().positive(),
  intent: z.enum([
    'clear-answer',
    'close',
    'comment',
    'edit',
    'lock',
    'reopen',
    'select-answer',
    'unlock'
  ]),
  title: z.string().trim().min(1).max(240).optional()
});

async function execute(command: DiscussionCommand) {
  const services = await createRequestServices();
  return new ExecuteDiscussionCommand(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAccessReader,
    services.discussionWriter
  )
    .execute(command)
    .catch(() => null);
}

function errorDestination(destination: string, reason: string) {
  return `${destination}?command=${encodeURIComponent(reason)}`;
}

export async function createDiscussionAction(
  ownerSlug: string,
  repositorySlug: string,
  formData: FormData
) {
  const parsed = createDiscussionSchema.safeParse({
    body: String(formData.get('body') ?? ''),
    category: formData.get('category'),
    title: String(formData.get('title') ?? '')
  });
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const collectionPath = repositoryDiscussionsPath(route);
  if (!parsed.success) redirect(errorDestination(collectionPath, 'invalid-command'));

  const result = await execute({
    body: parsed.data.body,
    category: parsed.data.category,
    repositoryId: route.repository.id,
    title: parsed.data.title,
    type: 'create'
  });
  if (result === null) redirect(errorDestination(collectionPath, 'provider-unavailable'));
  if (!result.ok) redirect(errorDestination(collectionPath, result.reason));

  revalidatePath(repositoryPath(route));
  revalidatePath(collectionPath);
  redirect(repositoryDiscussionPath(route, result.discussion.discussionNumber));
}

export async function updateDiscussionAction(
  ownerSlug: string,
  repositorySlug: string,
  discussionNumberValue: string,
  formData: FormData
) {
  const discussionNumber = Number(discussionNumberValue);
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const services = await createRequestServices();
  const discussion = await services.discussionReader.findAccessibleDiscussion({
    discussionNumber,
    repositoryId: route.repository.id
  });
  const collectionPath = repositoryDiscussionsPath(route);
  if (!discussion) redirect(collectionPath);
  const destination = repositoryDiscussionPath(route, discussion.discussionNumber);
  const parsed = updateDiscussionSchema.safeParse({
    body: formData.get('body') ?? undefined,
    commentId: formData.get('commentId') || undefined,
    expectedVersion: formData.get('expectedVersion'),
    intent: formData.get('intent'),
    title: formData.get('title') || undefined
  });
  if (!parsed.success) redirect(errorDestination(destination, 'invalid-command'));

  const common = {
    discussionId: discussion.id,
    expectedVersion: parsed.data.expectedVersion,
    repositoryId: route.repository.id
  } as const;
  let command: DiscussionCommand;
  switch (parsed.data.intent) {
    case 'edit':
      if (parsed.data.title === undefined || parsed.data.body === undefined) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, body: parsed.data.body, title: parsed.data.title, type: 'edit' };
      break;
    case 'comment':
      if (parsed.data.body === undefined || parsed.data.body.trim().length === 0) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, body: parsed.data.body, type: 'comment' };
      break;
    case 'select-answer':
      if (parsed.data.commentId === undefined) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, commentId: parsed.data.commentId, type: 'select-answer' };
      break;
    case 'clear-answer':
    case 'close':
    case 'lock':
    case 'reopen':
    case 'unlock':
      command = { ...common, type: parsed.data.intent };
      break;
  }

  const result = await execute(command);
  if (result === null) redirect(errorDestination(destination, 'provider-unavailable'));
  if (!result.ok) redirect(errorDestination(destination, result.reason));

  revalidatePath(repositoryPath(route));
  revalidatePath(collectionPath);
  revalidatePath(destination);
  redirect(`${destination}?command=saved`);
}
