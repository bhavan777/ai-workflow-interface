import type { Message } from '@/store/types';

interface ThoughtsPanelProps {
  thoughts: Message[];
}

export default function ThoughtsPanel({ thoughts }: ThoughtsPanelProps) {
  if (thoughts.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        AI Thoughts
      </h3>
      <div className="space-y-2 overflow-y-auto h-full pr-2">
        {thoughts.map(thought => (
          <div key={thought.id} className="flex items-start space-x-2 text-sm">
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground">{thought.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
