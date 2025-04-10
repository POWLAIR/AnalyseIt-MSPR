'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { memo } from 'react';
import ChartContainer from './ChartContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.77, // ratio 16:9
  animation: false,
  layout: {
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        usePointStyle: true,
        padding: 10
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
      borderWidth: 1,
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          const value = context.parsed.y;
          if (value !== null) {
            if (context.dataset.label?.includes('%')) {
              label += value.toFixed(1) + '%';
            } else if (value >= 1000000) {
              label += (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              label += (value / 1000).toFixed(1) + 'k';
            } else {
              label += value.toFixed(1);
            }
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        maxTicksLimit: 6,
        padding: 10,
        callback: function (value) {
          if (typeof value === 'number') {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
          }
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
        minRotation: 45,
        padding: 10,
        autoSkip: true,
        autoSkipPadding: 10
      },
      border: {
        display: false
      }
    }
  }
};

function BarChartComponent({ data, options }: BarChartProps) {
  return (
    <ChartContainer>
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          ...options
        }}
      />
    </ChartContainer>
  );
}

export default memo(BarChartComponent); 