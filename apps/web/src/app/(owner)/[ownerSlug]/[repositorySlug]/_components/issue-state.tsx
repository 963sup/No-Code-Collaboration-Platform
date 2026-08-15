import type { IssueStatus } from '@no-code-collaboration-platform/application';
import { CheckCircle2, CircleDot } from 'lucide-react';

interface IssueStateProps {
  readonly status: IssueStatus;
}

export function IssueState({ status }: IssueStateProps) {
  return status === 'open' ? (
    <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white'>
      <CircleDot aria-hidden='true' className='size-3.5' />
      Open
    </span>
  ) : (
    <span className='inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white'>
      <CheckCircle2 aria-hidden='true' className='size-3.5' />
      Closed
    </span>
  );
}
