import { Brain } from 'lucide-react';

interface ThoughtProps {
  thought: string;
}

export default function Thought({ thought }: ThoughtProps) {
  return (
    <div className="flex items-start space-x-3 justify-start animate-pulse duration-1000">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Brain className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex flex-col max-w-xs">
        <div className="text-xs opacity-70 mb-1 text-left">Nexla</div>
        <div className="w-full px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-r-lg rounded-bl-lg">
          <p className="text-sm whitespace-pre-wrap">{thought}</p>
        </div>
      </div>
    </div>
  );
}
