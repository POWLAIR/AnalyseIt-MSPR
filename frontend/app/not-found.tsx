'use client';

import { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page non trouvée</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <NotFoundContent />
    </Suspense>
  );
} 