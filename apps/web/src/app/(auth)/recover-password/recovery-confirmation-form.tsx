'use client';

import { Button, buttonVariants, cn } from '@no-code-collaboration-platform/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { continuePasswordRecovery } from './actions';

const MAX_TOKEN_HASH_LENGTH = 2048;

export function RecoveryConfirmationForm() {
  const [tokenHash, setTokenHash] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const candidate = fragment.get('token_hash')?.trim() ?? '';

    if (candidate && candidate.length <= MAX_TOKEN_HASH_LENGTH) {
      setTokenHash(candidate);
    }

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <Button className='w-full' disabled type='button'>
        Loading recovery proof…
      </Button>
    );
  }

  if (!tokenHash) {
    return (
      <div className='space-y-4'>
        <p className='text-sm text-destructive' role='alert'>
          This password recovery link is missing or invalid.
        </p>
        <Link className={cn(buttonVariants(), 'w-full')} href='/forgot-password'>
          Request a new recovery link
        </Link>
      </div>
    );
  }

  return (
    <form action={continuePasswordRecovery}>
      <input name='tokenHash' type='hidden' value={tokenHash} />
      <Button className='w-full' type='submit'>
        Continue password reset
      </Button>
    </form>
  );
}
