import React from 'react';
import { UI_CONFIG } from './config';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered';
}

export function Card({ className = '', variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={`${UI_CONFIG.card.base} ${className}`}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`${UI_CONFIG.card.header} ${className}`}
      {...props}
    />
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className = '', ...props }: CardTitleProps) {
  return (
    <h3
      className={`${UI_CONFIG.card.title} ${className}`}
      {...props}
    />
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className = '', ...props }: CardDescriptionProps) {
  return (
    <p
      className={`${UI_CONFIG.card.description} ${className}`}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className = '', ...props }: CardContentProps) {
  return (
    <div
      className={`${UI_CONFIG.card.content} ${className}`}
      {...props}
    />
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className = '', ...props }: CardFooterProps) {
  return (
    <div
      className={`${UI_CONFIG.card.footer} ${className}`}
      {...props}
    />
  );
}

interface StatCardProps extends CardProps {
  title: string;
  value: number | string;
  description: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, description, icon, className = '', ...props }: StatCardProps) {
  return (
    <Card className={`p-6 ${className}`} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {icon && <div className="text-gray-500 dark:text-gray-400">{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </Card>
  );
} 