import '@no-code-collaboration-platform/ui/styles.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'No-Code Collaboration Platform',
    template: '%s · No-Code Collaboration Platform'
  },
  description:
    'A first-principles enterprise collaboration platform where Repository is a no-code collaboration container.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='zh-Hant'>
      <body>{children}</body>
    </html>
  );
}
