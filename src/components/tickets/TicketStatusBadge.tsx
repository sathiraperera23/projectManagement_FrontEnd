import { cn } from '@/lib/utils';

interface Props {
  status: string;
  colour?: string;
}

export function TicketStatusBadge({ status, colour }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      )}
      style={{ backgroundColor: colour ? `${colour}20` : undefined,
               color: colour ?? '#6b7280' }}
    >
      {status}
    </span>
  );
}
