'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { memo } from 'react';
import ChartContainer from './ChartContainer';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
}

const options: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: true,
  animation: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        boxWidth: 12,
        usePointStyle: true
      }
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: true,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#000',
      bodyColor: '#666',
      borderColor: '#ddd',
      borderWidth: 1,
      callbacks: {
        label: function (context) {
          const value = context.raw as number;
          if (value >= 1000000) {
            return ` ${(value / 1000000).toFixed(1)}M`;
          }
          if (value >= 1000) {
            return ` ${(value / 1000).toFixed(1)}k`;
          }
          return ` ${value}`;
        }
      }
    }
  }
};

function PieChartComponent({ data }: PieChartProps) {
  return (
    <ChartContainer>
      <Pie data={data} options={options} />
    </ChartContainer>
  );
}

export default memo(PieChartComponent); 