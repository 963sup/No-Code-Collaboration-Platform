import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';

import { RecoveryConfirmationForm } from './recovery-confirmation-form';

export const metadata: Metadata = {
  title: 'Continue password recovery'
};

export default function RecoverPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue password recovery</CardTitle>
        <CardDescription>
          Continue only if you requested this password reset. Opening the email link does not
          consume the recovery proof; the provider verifies it only after you confirm below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecoveryConfirmationForm />
      </CardContent>
    </Card>
  );
}
