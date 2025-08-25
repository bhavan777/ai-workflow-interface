import { cn } from '@/lib/utils';
import { Clock, HelpCircle, Settings } from 'lucide-react';
import { memo } from 'react';

interface StatusPillProps {
  status: string;
}

const getStatusPillColor = (status: string) => {
  switch (status) {
    case 'complete':
      return 'bg-green-600/80 text-white';
    case 'partial':
      return 'bg-orange-600/80 text-white';
    case 'error':
      return 'bg-red-600/80 text-white';
    default:
      return 'bg-gray-600/80 text-white';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return <Settings className="size-4" />;
    case 'partial':
      return <Clock className="size-4" />;
    case 'error':
      return <Settings className="size-4" />;
    default:
      return <HelpCircle className="size-4" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'partial':
      return 'In Progress';
    case 'error':
      return 'Error';
    default:
      return 'Pending';
  }
};

// Custom comparison function to only re-render when status changes
const areEqual = (prevProps: StatusPillProps, nextProps: StatusPillProps) => {
  return prevProps.status === nextProps.status;
};

const StatusPill = memo(({ status }: StatusPillProps) => {
  return (
    <div
      className={cn(
        'px-3 py-1 rounded-full text-[14px] flex items-center gap-1.5 w-fit transition-all duration-300 ease-in-out',
        getStatusPillColor(status)
      )}
    >
      <span className="flex items-center gap-1.5">
        {getStatusIcon(status)}
        <span>{getStatusText(status)}</span>
      </span>
    </div>
  );
}, areEqual);

StatusPill.displayName = 'StatusPill';

export default StatusPill;
