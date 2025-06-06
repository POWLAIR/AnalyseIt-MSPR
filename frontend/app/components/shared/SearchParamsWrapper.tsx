'use client';

import { Suspense } from 'react';

interface SearchParamsWrapperProps {
  children: React.ReactNode;
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      {children}
    </Suspense>
  );
} 