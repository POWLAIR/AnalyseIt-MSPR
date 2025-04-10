import React from 'react';
import { UI_CONFIG } from './config';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}, ref) => {
  const baseStyles = UI_CONFIG.button.base;
  const variantStyles = UI_CONFIG.button.variants[variant];
  const sizeStyles = UI_CONFIG.button.sizes[size];

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button }; 