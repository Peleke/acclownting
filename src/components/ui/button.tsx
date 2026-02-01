import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-soft hover:shadow-elevated',
        secondary:
          'bg-card text-foreground border border-border hover:bg-muted hover:border-border/80 active:bg-muted/80 shadow-soft',
        danger:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 shadow-soft',
        ghost:
          'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
        md: 'px-4 py-2 text-sm font-medium gap-2',
        lg: 'px-5 py-2.5 text-sm font-medium gap-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
