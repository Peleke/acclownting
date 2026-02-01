import { cn } from '@/lib/utils';
import { getStatusColor, getStatusDot } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize',
        getStatusColor(status),
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', getStatusDot(status))} />
      {status}
    </span>
  );
}
