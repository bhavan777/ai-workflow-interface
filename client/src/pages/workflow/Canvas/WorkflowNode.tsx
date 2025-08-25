import { cn } from '@/lib/utils';
import type { DataFlowNode } from '@/types';
import {
  CheckCheck,
  Circle,
  Clock,
  Database,
  HelpCircle,
  Settings,
  Zap,
} from 'lucide-react';
import { Handle, Position } from 'reactflow';

interface WorkflowNodeProps {
  data: DataFlowNode & {
    onNodeClick?: (nodeId: string) => void;
  };
}

export default function WorkflowNode({ data, onNodeClick }: WorkflowNodeProps) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'source':
        return <Database className="size-6 text-white" />;
      case 'transform':
        return (
          <Settings className="size-6 text-white animate-spin [animation-duration:5s]" />
        );
      case 'destination':
        return <Zap className="size-6 text-white" />;
      default:
        return <Settings className="size-6 text-white" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'source':
        return 'bg-blue-500';
      case 'transform':
        return 'bg-purple-500';
      case 'destination':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

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

  return (
    <div className="relative">
      {/* Input Handle - Hidden */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white opacity-0"
      />

      {/* Node Type Label - Above Card */}
      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
        <p className="text-[14px] font-light text-muted-foreground capitalize">
          {data.type}
        </p>
      </div>

      {/* Node Content */}
      <div
        className="w-80 rounded-lg shadow-md bg-background border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => data.onNodeClick?.(data.id)}
      >
        {/* Colored Header with Icon+Title and Status Pill */}
        <div
          className={cn(
            'h-20 flex flex-col justify-center px-3',
            getNodeColor(data.type)
          )}
        >
          {/* Icon and Name - Line 1 */}
          <div className="flex items-center gap-2 mb-2">
            {getNodeIcon(data.type)}
            <p className="text-[20px] font-medium text-white whitespace-nowrap leading-none">
              {data.name}
            </p>
          </div>

          {/* Status Pill - Line 2 */}
          <div className="flex justify-start">
            <div
              className={cn(
                'px-3 py-1 rounded-full text-[14px] flex items-center gap-1.5 w-fit transition-all duration-300',
                getStatusPillColor(data.status)
              )}
            >
              {getStatusIcon(data.status)}
              <span>{getStatusText(data.status)}</span>
            </div>
          </div>
        </div>

        {/* White Content Area - Data Requirements */}
        <div className="h-48 bg-background px-4 py-2">
          <div className="space-y-3">
            {/* Data Requirements List */}
            {data.data_requirements?.required_fields &&
            data.data_requirements.required_fields.length > 0 ? (
              data.data_requirements.required_fields.map((field: string) => {
                const isProvided =
                  data.data_requirements?.provided_fields.includes(field);
                return (
                  <div
                    key={field}
                    className="flex items-center justify-start space-x-1"
                  >
                    <div
                      key={`${data.id}-${field}-${isProvided}`}
                      className="flex items-center space-x-1"
                    >
                      {isProvided ? (
                        <CheckCheck className="size-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="size-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={`text-[16px] truncate font-light max-w-full leading-none ${
                          isProvided ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {field.includes('_') ? field.replace(/_/g, ' ') : field}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <HelpCircle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-[9px] text-muted-foreground">
                    No data required
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output Handle - Hidden */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white opacity-0"
      />
    </div>
  );
}
