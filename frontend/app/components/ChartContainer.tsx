'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartContainerProps {
  type: 'line' | 'bar';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      tension?: number;
    }[];
  };
  options?: ChartOptions<'line' | 'bar'>;
}

export default function ChartContainer({ type, title, data, options }: ChartContainerProps) {
  const defaultOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: '#1f2937',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: '#1f2937',
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(241, 245, 249, 0.5)', 
        borderWidth: 1,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
    },
    ...options,
  };

  return (
    <div className="glass-card p-6 animate-fadeIn">
      {type === 'line' ? (
        <Line options={defaultOptions} data={data} />
      ) : (
        <Bar options={defaultOptions} data={data} />
      )}
    </div>
  );
} 