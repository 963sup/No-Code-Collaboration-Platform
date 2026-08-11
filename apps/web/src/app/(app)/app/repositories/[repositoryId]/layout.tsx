import type { ReactNode } from 'react';

interface RepositoryWorkspaceLayoutProps {
  readonly activity: ReactNode;
  readonly children: ReactNode;
  readonly context: ReactNode;
  readonly navigation: ReactNode;
  readonly workspace: ReactNode;
}

export default function RepositoryWorkspaceLayout({
  activity,
  children,
  context,
  navigation,
  workspace
}: RepositoryWorkspaceLayoutProps) {
  return (
    <section className='-m-6 min-h-[calc(100dvh-4rem)] bg-muted/15 lg:-m-10'>
      <header className='border-b bg-background px-6 py-5 lg:px-10'>{children}</header>
      <div className='grid min-h-[calc(100dvh-10.5rem)] xl:grid-cols-[15rem_minmax(0,1fr)_21rem]'>
        <aside className='border-b bg-background p-5 xl:border-r xl:border-b-0'>{navigation}</aside>
        <div className='min-w-0 p-6 lg:p-8' id='workspace'>
          {workspace}
        </div>
        <aside className='space-y-6 border-t bg-background p-6 xl:border-t-0 xl:border-l'>
          {context}
          {activity}
        </aside>
      </div>
    </section>
  );
}
