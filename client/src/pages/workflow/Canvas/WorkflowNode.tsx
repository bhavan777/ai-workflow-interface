import { cn } from '@/lib/utils';
import type { DataFlowNode } from '@/types';
import {
  CheckCheck,
  Circle,
  Database,
  HelpCircle,
  Settings,
  Zap,
} from 'lucide-react';
import { Handle, Position } from 'reactflow';
import StatusPill from './StatusPill';

interface WorkflowNodeProps {
  data: DataFlowNode & {
    onNodeClick?: (nodeId: string, nodeType: string) => void;
    nodeWidth?: number;
    isVerticalLayout?: boolean;
  };
}

export default function WorkflowNode({ data }: WorkflowNodeProps) {
  const nodeWidth = data.nodeWidth || 320; // Default to 320px if not provided
  const isVerticalLayout = data.isVerticalLayout || false;
  const getNodeIcon = (type: string) => {
    const iconSize =
      nodeWidth < 300 ? 'size-5' : nodeWidth > 340 ? 'size-7' : 'size-6';
    switch (type) {
      case 'source':
        return <Database className={`${iconSize} text-white`} />;
      case 'transform':
        return (
          <Settings
            className={`${iconSize} text-white animate-spin [animation-duration:5s]`}
          />
        );
      case 'destination':
        return <Zap className={`${iconSize} text-white`} />;
      default:
        return <Settings className={`${iconSize} text-white`} />;
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

  return (
    <div className="relative">
      {/* Input Handle - Dynamic based on layout */}
      <Handle
        type="target"
        position={isVerticalLayout ? Position.Top : Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white opacity-0"
      />

      {/* Node Type Label - Dynamic positioning based on layout */}

      <div
        className={`absolute ${
          isVerticalLayout
            ? '-right-20 top-1/2 transform -translate-y-1/2'
            : '-top-7 left-1/2 transform -translate-x-1/2'
        }`}
      >
        <p
          className={`text-[14px] font-light text-muted-foreground capitalize ${
            isVerticalLayout ? 'rotate-90 origin-center' : ''
          }`}
        >
          {data.type}
        </p>
      </div>

      {/* Node Content */}
      <div
        className="rounded-lg shadow-md bg-background border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
        style={{ width: `${nodeWidth}px` }}
        onClick={() => data.onNodeClick?.(data.id, data.type)}
      >
        {/* Colored Header with Icon+Title and Status Pill */}
        <div
          className={cn(
            'flex flex-col justify-center px-3',
            getNodeColor(data.type)
          )}
          style={{
            height:
              nodeWidth < 300 ? '64px' : nodeWidth > 340 ? '88px' : '80px',
          }}
        >
          {/* Icon and Name - Line 1 */}
          <div className="flex items-center gap-2 mb-2">
            {getNodeIcon(data.type)}
            <p
              className="font-medium text-white whitespace-nowrap leading-none"
              style={{
                fontSize:
                  nodeWidth < 300 ? '16px' : nodeWidth > 340 ? '24px' : '20px',
              }}
            >
              {data.name}
            </p>
          </div>

          {/* Status Pill - Line 2 */}
          <div className="flex justify-start">
            <StatusPill status={data.status} />
          </div>
        </div>

        {/* White Content Area - Data Requirements */}
        <div
          className="bg-background px-4 py-2"
          style={{
            height:
              nodeWidth < 300 ? '160px' : nodeWidth > 340 ? '200px' : '192px',
          }}
        >
          <div className="space-y-3">
            {/* Data Requirements List */}
            <div className="flex flex-col items-start gap-3">
              {data.data_requirements?.required_fields &&
              data.data_requirements.required_fields.length > 0 ? (
                data.data_requirements.required_fields.map((field: string) => {
                  const isProvided =
                    data.data_requirements?.provided_fields.includes(field);
                  return (
                    <div
                      key={`field-${data.id}-${field}`}
                      className="flex h-6 items-center justify-start space-x-1"
                    >
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {isProvided ? (
                            <CheckCheck className="size-5 text-green-500 flex-shrink-0 transition-all duration-200 ease-in-out" />
                          ) : (
                            <Circle className="size-4 text-gray-400 flex-shrink-0 mr-1 transition-all duration-200 ease-in-out" />
                          )}
                        </div>
                        <span
                          className={`text-[16px] truncate font-light max-w-full leading-none transition-colors duration-200 ease-in-out ${
                            isProvided ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {field.includes('_')
                            ? field.replace(/_/g, ' ')
                            : field}
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
      </div>

      {/* Output Handle - Dynamic based on layout */}
      <Handle
        type="source"
        position={isVerticalLayout ? Position.Bottom : Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white opacity-0"
      />
    </div>
  );
}
