import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-[13px] font-medium text-stone-600 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-shadow ${
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-stone-200 hover:border-stone-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-[13px] text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
