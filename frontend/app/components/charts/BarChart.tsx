'use client';

import { Bar } from 'react-chartjs-2';
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
}

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            if (context.dataset.label?.includes('%')) {
              label += context.parsed.y + '%';
            } else if (context.parsed.y >= 1000000) {
              label += (context.parsed.y / 1000000).toFixed(1) + 'M';
            } else if (context.parsed.y >= 1000) {
              label += (context.parsed.y / 1000).toFixed(1) + 'k';
            } else {
              label += context.parsed.y.toFixed(1);
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
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

export default function BarChart({ data }: BarChartProps) {
  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
} 