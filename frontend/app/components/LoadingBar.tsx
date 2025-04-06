'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(20);

    const timeout1 = setTimeout(() => {
      setProgress(60);
    }, 100);

    const timeout2 = setTimeout(() => {
      setProgress(80);
    }, 200);

    const timeout3 = setTimeout(() => {
      setProgress(100);
    }, 400);

    const timeout4 = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 600);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
      <div 
        className="bg-accent-turquoise h-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)' }}
      ></div>
    </div>
  );
} 