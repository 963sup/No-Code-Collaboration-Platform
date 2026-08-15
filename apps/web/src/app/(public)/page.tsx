import {
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn
} from '@no-code-collaboration-platform/ui';
import { Boxes, ShieldCheck, Workflow } from 'lucide-react';
import Link from 'next/link';

const principles = [
  {
    title: 'Repository is the collaboration boundary',
    description:
      'Data, pages, workflows, documents, tasks, permissions, and activity share one coherent no-code container.',
    icon: Boxes
  },
  {
    title: 'Capability is the authorization language',
    description:
      'Roles are convenience bundles; effective access remains explicit, testable, and enforced by PostgreSQL RLS.',
    icon: ShieldCheck
  },
  {
    title: 'Events are historical facts',
    description:
      'Activity, notifications, audit views, and later projections derive from recorded state changes instead of duplicated history.',
    icon: Workflow
  }
] as const;

export default function PublicHomePage() {
  return (
    <main>
      <section className='mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.3fr_0.7fr] lg:items-center'>
        <div className='space-y-8'>
          <p className='text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground'>
            First-principles collaboration
          </p>
          <div className='space-y-5'>
            <h1 className='max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl'>
              Reverse-engineer mature collaboration semantics, then rebuild only what the product
              needs.
            </h1>
            <p className='max-w-2xl text-lg leading-8 text-muted-foreground'>
              GitHub is the semantic benchmark. Repository is rebuilt as a no-code collaboration
              container rather than a Git code store.
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Link className={cn(buttonVariants({ size: 'lg' }))} href='/dashboard'>
              Open dashboard
            </Link>
            <Link
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
              href='/sign-in'
            >
              Sign in
            </Link>
          </div>
        </div>
        <Card className='bg-card/80'>
          <CardHeader>
            <CardTitle>Minimum sufficient model</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 text-sm leading-6 text-muted-foreground'>
            <p>User is the actor.</p>
            <p>Repository Owner is one User or Organization relationship.</p>
            <p>Team is absent until a real group-authority need proves it.</p>
            <p>Repository is the collaboration boundary.</p>
            <p>Resource is the work unit.</p>
            <p>Event is the historical fact.</p>
          </CardContent>
        </Card>
      </section>

      <section className='border-y bg-muted/35'>
        <div className='mx-auto grid max-w-6xl gap-5 px-6 py-16 md:grid-cols-3'>
          {principles.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <Icon aria-hidden='true' className='size-5 text-muted-foreground' />
                <CardTitle className='pt-3 text-lg'>{title}</CardTitle>
              </CardHeader>
              <CardContent className='text-sm leading-6 text-muted-foreground'>
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
