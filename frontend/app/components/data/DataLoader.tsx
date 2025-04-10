'use client';

import { useEffect, useState } from 'react';

interface DataLoaderProps {
  url: string;
  children: (data: any, loading: boolean, error: Error | null) => React.ReactNode;
}

export default function DataLoader({ url, children }: DataLoaderProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return children(data, loading, error);
} 