import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function Card({ title, value, description, icon, trend }: CardProps) {
  return (
    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h5>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {trend && (
          <p className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
} 