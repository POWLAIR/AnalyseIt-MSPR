'use client';

import { Suspense } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      {children}
    </Suspense>
  );
} 