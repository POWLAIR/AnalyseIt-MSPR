import React from 'react';
import { UI_CONFIG } from './config';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  const baseStyles = UI_CONFIG.button.base;
  const variantStyles = UI_CONFIG.button.variants[variant];
  const sizeStyles = UI_CONFIG.button.sizes[size];

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    />
  );
} 