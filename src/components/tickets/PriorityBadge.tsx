import { cn } from '@/lib/utils';

const priorityConfig = {
  Critical: { color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  High:     { color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  Medium:   { color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  Low:      { color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority as keyof typeof priorityConfig]
    ?? priorityConfig.Low;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {priority}
    </span>
  );
}
