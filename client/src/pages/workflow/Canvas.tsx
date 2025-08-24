import { cn } from '@/lib/utils';
import type { DataFlowConnection, DataFlowNode } from '@/types';
import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  Database,
  HelpCircle,
  Settings,
  Zap,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Edge, Node, NodeTypes } from 'reactflow';
import ReactFlow, { Background, Controls, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

interface CanvasProps {
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
}

// Custom Node Component
const WorkflowNode = ({ data }: { data: DataFlowNode }) => {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'source':
        return <Database className="w-3 h-3 text-white" />;
      case 'transform':
        return <Zap className="w-3 h-3 text-white" />;
      case 'destination':
        return <Brain className="w-3 h-3 text-white" />;
      default:
        return <Settings className="w-3 h-3 text-white" />;
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
        return <Settings className="size-2" />;
      case 'partial':
        return <Clock className="size-2" />;
      case 'error':
        return <Settings className="size-2" />;
      default:
        return <HelpCircle className="size-2" />;
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
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <p className="text-[10px] font-medium text-foreground capitalize">
          {data.type}
        </p>
      </div>

      {/* Node Content */}
      <div className="w-32 rounded-lg shadow-md bg-background border border-border overflow-hidden">
        {/* Colored Header with Icon+Title and Status Pill */}
        <motion.div
          className={cn(
            'h-12 flex flex-col justify-center px-2',
            getNodeColor(data.type)
          )}
          layout
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Icon and Name - Line 1 */}
          <motion.div
            className="flex items-center gap-1 mb-1"
            layout
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {getNodeIcon(data.type)}
            <motion.p
              className="text-[8px] font-medium text-white whitespace-nowrap leading-none"
              layout
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {data.name}
            </motion.p>
          </motion.div>

          {/* Status Pill - Line 2 */}
          <motion.div
            className="flex justify-start"
            layout
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              className={cn(
                'px-1 py-0.5 rounded-full text-[6px] flex items-center gap-0.5 w-fit',
                getStatusPillColor(data.status)
              )}
              layout
              animate={{
                backgroundColor:
                  data.status === 'complete'
                    ? 'rgba(22, 163, 74, 0.8)'
                    : data.status === 'partial'
                      ? 'rgba(249, 115, 22, 0.8)'
                      : data.status === 'error'
                        ? 'rgba(239, 68, 68, 0.8)'
                        : 'rgba(75, 85, 99, 0.8)',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {getStatusIcon(data.status)}
              <motion.span
                layout
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {getStatusText(data.status)}
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* White Content Area - Data Requirements */}
        <motion.div
          className="h-24 bg-background p-2"
          layout
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <motion.div
            className="space-y-1"
            layout
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Data Requirements List */}
            {data.data_requirements?.required_fields &&
            data.data_requirements.required_fields.length > 0 ? (
              data.data_requirements.required_fields.map((field: string) => {
                const isProvided =
                  data.data_requirements?.provided_fields.includes(field);
                return (
                  <motion.div
                    key={field}
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <motion.span
                      className={cn(
                        'text-[8px] truncate max-w-20',
                        isProvided
                          ? 'text-green-400 line-through'
                          : 'text-muted-foreground'
                      )}
                      animate={{
                        color: isProvided ? '#4ade80' : '#6b7280',
                        textDecoration: isProvided ? 'line-through' : 'none',
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      {field}
                    </motion.span>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <HelpCircle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-[8px] text-muted-foreground">
                    No data required
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Output Handle - Hidden */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white opacity-0"
      />
    </div>
  );
};

// Node types configuration
const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

export default function Canvas({ currentWorkflow }: CanvasProps) {
  const reactFlowRef = useRef<any>(null);

  // Effect to fit view when nodes change
  useEffect(() => {
    if (reactFlowRef.current && currentWorkflow.nodes.length > 0) {
      setTimeout(() => {
        reactFlowRef.current?.fitView({ padding: 0.3 });
      }, 100);
    }
  }, [currentWorkflow.nodes, currentWorkflow.connections]);

  // Convert workflow nodes to React Flow nodes
  const nodes: Node[] = currentWorkflow.nodes.map((node, index) => ({
    id: node.id,
    type: 'workflowNode',
    position: { x: index * 200, y: 0 },
    data: {
      type: node.type,
      name: node.name,
      status: node.status,
      config: node.config,
      data_requirements: node.data_requirements,
    },
  }));

  // Convert workflow connections to React Flow edges
  const edges: Edge[] = currentWorkflow.connections.map(connection => ({
    id: connection.id,
    source: connection.source,
    target: connection.target,
    type: 'smoothstep',
    style: {
      stroke:
        connection.status === 'complete'
          ? '#10b981'
          : connection.status === 'error'
            ? '#ef4444'
            : '#6b7280',
      strokeWidth: 1.5,
    },
    animated: connection.status === 'complete',
    markerEnd: 'url(#arrowhead)',
  }));

  const isComplete = currentWorkflow.nodes.every(
    node => node.status === 'complete'
  );

  return (
    <div className="w-2/3 bg-background/30">
      <div className="h-full">
        {currentWorkflow.nodes.length > 0 ? (
          <div className="h-full">
            {/* React Flow Canvas - Full Height */}
            <div className="h-full bg-background rounded-lg border border-border">
              <ReactFlow
                ref={reactFlowRef}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                  padding: 0.3,
                  includeHiddenNodes: false,
                  minZoom: 0.5,
                  maxZoom: 1.5,
                }}
                attributionPosition="bottom-left"
                className="bg-background"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="12"
                    markerHeight="8"
                    refX="10"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <polygon
                      points="0 0, 12 4, 0 8"
                      fill="hsl(var(--muted-foreground))"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="1"
                    />
                  </marker>
                </defs>
                <Background
                  color="hsl(var(--muted-foreground))"
                  gap={20}
                  size={1}
                  className="opacity-20"
                />
                <Controls />
              </ReactFlow>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Workflow Yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Start a conversation to see your workflow here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
