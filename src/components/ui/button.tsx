import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary:
    'bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950 shadow-soft hover:shadow-elevated',
  secondary:
    'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 active:bg-stone-100 shadow-soft',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-soft',
  ghost:
    'bg-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-150',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
  md: 'px-4 py-2 text-sm font-medium gap-2',
  lg: 'px-5 py-2.5 text-sm font-medium gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg tracking-[-0.01em] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-150 ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
