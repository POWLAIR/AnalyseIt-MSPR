'use client';

import { ReactNode, useRef, useEffect } from 'react';

interface ChartContainerProps {
  children: ReactNode;
}

export default function ChartContainer({ children }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container) {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          // Force une hauteur maximale et un ratio d'aspect 16:9
          const width = container.clientWidth;
          const height = Math.min(width * 0.5625, 400); // ratio 16:9 avec max 400px
          canvas.style.height = `${height}px`;
          canvas.style.width = `${width}px`;
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        maxHeight: '400px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {children}
    </div>
  );
} 