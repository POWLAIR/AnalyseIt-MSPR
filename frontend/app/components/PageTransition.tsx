'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    // Déclencher l'animation de sortie
    setIsTransitioning(true);
    
    // Après un court délai, mettre à jour le contenu et déclencher l'animation d'entrée
    const timeout = setTimeout(() => {
      setContent(children);
      setIsTransitioning(false);
    }, 200);
    
    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isTransitioning 
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0'
      }`}
    >
      {content}
    </div>
  );
} 