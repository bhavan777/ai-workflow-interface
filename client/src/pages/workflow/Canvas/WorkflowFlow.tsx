import type { DataFlowConnection, DataFlowNode } from '@/types';
import { useEffect, useRef } from 'react';
import type { Edge, EdgeMarkerType, Node, NodeTypes } from 'reactflow';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import WorkflowNode from './WorkflowNode';

interface WorkflowFlowProps {
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
  onNodeClick?: (nodeId: string) => void;
}

// Node types configuration
const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

export default function WorkflowFlow({
  currentWorkflow,
  onNodeClick,
}: WorkflowFlowProps) {
  const reactFlowRef = useRef<any>(null);

  // Effect to fit view when nodes change
  useEffect(() => {
    if (reactFlowRef.current && currentWorkflow.nodes.length > 0) {
      setTimeout(() => {
        reactFlowRef.current?.fitView({
          padding: 0.05,
          includeHiddenNodes: false,
          minZoom: 0.9,
          maxZoom: 1.0,
        });
      }, 100);
    }
  }, [currentWorkflow.nodes.length]); // Only trigger on node count change, not content

  // Convert workflow nodes to React Flow nodes
  const nodes: Node[] = currentWorkflow.nodes.map((node, index) => ({
    id: node.id,
    type: 'workflowNode',
    position: { x: index * 360 - 200, y: 0 },
    data: {
      id: node.id,
      type: node.type,
      name: node.name,
      status: node.status,
      config: node.config,
      data_requirements: node.data_requirements,
      onNodeClick,
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
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed',
      width: 20,
      height: 20,
      color:
        connection.status === 'complete'
          ? '#10b981'
          : connection.status === 'error'
            ? '#ef4444'
            : '#6b7280',
    } as EdgeMarkerType,
  }));

  // Create a stable key for React Flow to prevent unnecessary re-renders
  const workflowKey =
    currentWorkflow.nodes.length > 0
      ? `nodes-${currentWorkflow.nodes.length}`
      : 'empty';

  return (
    <div className="h-full bg-background rounded-lg border border-border">
      <ReactFlow
        key={workflowKey}
        ref={reactFlowRef}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.05,
          includeHiddenNodes: false,
          minZoom: 0.9,
          maxZoom: 1.0,
        }}
        attributionPosition="bottom-left"
        className="bg-background"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="16"
            markerHeight="12"
            refX="12"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 16 6, 0 12"
              fill="#6b7280"
              stroke="#6b7280"
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
  );
}
