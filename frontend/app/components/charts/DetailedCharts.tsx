'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ChartContainer from './ChartContainer';
import { DetailedPandemic } from '../../lib/api';

interface DataPoint {
  date: string;
  cases: number;
  deaths: number;
  recovered: number;
}

interface DetailedChartsProps {
  pandemic: DetailedPandemic;
}

export default function DetailedCharts({ pandemic }: DetailedChartsProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/stats/daily/${pandemic.id}`);
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pandemic.id]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartContainer title="Évolution des cas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="#8884d8"
              name="Cas"
            />
            <Line
              type="monotone"
              dataKey="deaths"
              stroke="#ff7300"
              name="Décès"
            />
            <Line
              type="monotone"
              dataKey="recovered"
              stroke="#82ca9d"
              name="Guérisons"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Taux de mortalité">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="mortalityRate"
              stroke="#ff7300"
              name="Taux de mortalité (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
} 