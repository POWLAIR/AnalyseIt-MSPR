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
      },
      title: {
        display: true,
        text: title,
      },
    },
    ...options,
  };

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {type === 'line' ? (
        <Line options={defaultOptions} data={data} />
      ) : (
        <Bar options={defaultOptions} data={data} />
      )}
    </div>
  );
} 