import { getStatusColor, getStatusDot } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(status)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`} />
      {status}
    </span>
  );
}
