import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface HelpIconProps {
  content: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HelpIcon({
  content,
  className = '',
  size = 'sm',
}: HelpIconProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle
            className={`${sizeClasses[size]} text-muted-foreground hover:text-foreground transition-colors cursor-help ${className}`}
            aria-label="Help information"
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
