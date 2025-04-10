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
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { memo } from 'react';
import ChartContainer from './ChartContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
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
}

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  animation: false,
  resizeDelay: 0,
  transitions: {
    active: {
      animation: {
        duration: 0
      }
    }
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 8,
      hoverRadius: 4,
      borderWidth: 1
    },
    line: {
      tension: 0.2,
      borderWidth: 1.5
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        usePointStyle: true
      }
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      animation: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#000',
      bodyColor: '#666',
      borderColor: '#ddd',
      borderWidth: 1
    }
  },
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        maxTicksLimit: 6,
        callback: (value: any) => {
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
          return value;
        }
      },
      border: {
        display: false
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxTicksLimit: 8,
        maxRotation: 45,
        minRotation: 45
      },
      border: {
        display: false
      }
    }
  }
};

function LineChartComponent({ data }: LineChartProps) {
  return (
    <ChartContainer>
      <Line options={options} data={data} />
    </ChartContainer>
  );
}

// Mémoisation du composant pour éviter les re-rendus inutiles
export default memo(LineChartComponent); 