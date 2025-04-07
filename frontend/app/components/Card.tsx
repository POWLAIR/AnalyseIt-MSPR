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
    <div className="glass-card p-6 transition-all duration-300 relative overflow-hidden animate-scaleIn hover:shadow-lg">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          {title}
        </h5>
        {icon && <div className="text-2xl text-accent-turquoise dark:text-accent-turquoise/80">{icon}</div>}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {value}
        </p>
        {trend && (
          <div className={`data-badge ${trend.isPositive ? 'data-badge-success' : 'data-badge-warning'} inline-flex items-center mt-1`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
      </div>
      <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-primary-100/50 dark:bg-primary-700/20 blur-sm -z-10"></div>
    </div>
  );
} 