import { Button } from '@/components/ui/button';
import Drawer from '@/components/ui/drawer';
import { useChatStore } from '@/store/useChatStore';
import {
  AlertCircle,
  CheckCheck,
  CheckCircle,
  Circle,
  Clock,
  Copy,
  Settings,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NodeDataDrawerProps {
  onClose: () => void;
}

export default function NodeDataDrawer({ onClose }: NodeDataDrawerProps) {
  const { nodeData, nodeDataLoading, nodeDataError, currentWorkflow } =
    useChatStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Only show drawer when node data is present or there's an error
  const isVisible = !!nodeData || !!nodeDataError;

  // Get node color from current workflow
  const getNodeColorFromWorkflow = (nodeId: string) => {
    const node = currentWorkflow.nodes.find(n => n.id === nodeId);
    if (!node) return 'text-gray-500';

    switch (node.type) {
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

  // Copy value to clipboard
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Calculate overall node status based on filled values
  const getNodeStatus = (filledValues: Record<string, string>) => {
    const totalFields = Object.keys(filledValues).length;
    const filledFields = Object.values(filledValues).filter(
      value => value !== 'Not filled'
    ).length;

    if (filledFields === 0) return 'pending';
    if (filledFields === totalFields) return 'complete';
    return 'partial';
  };

  // Get status pill color and text for node status
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-3 w-3" />;
      case 'partial':
        return <Clock className="h-3 w-3" />;
      case 'error':
        return <Settings className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  return (
    <Drawer isOpen={isVisible} onClose={onClose} position="right">
      {/* Header */}
      <div className="flex items-center justify-between p-3 px-4 border-b border-border">
        <h2 className="text-lg font-semibold text-muted-foreground">
          Node Details
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div
        className={`p-4 space-y-4 ${getNodeColorFromWorkflow(nodeData?.node_id || '')}`}
      >
        {nodeDataLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading node data...</p>
          </div>
        ) : nodeDataError ? (
          <div className="flex items-center space-x-2 p-3 rounded-lg border border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">{nodeDataError}</p>
          </div>
        ) : nodeData ? (
          <>
            {/* Node Title and Status */}
            <div className={`flex pb-5  w-full items-center justify-between`}>
              <div className="space-y-2">
                <p className={`text-lg font-semibold text-background`}>
                  {nodeData.node_title}
                </p>
              </div>

              <div className="flex justify-start">
                <div
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1.5 w-fit transition-all duration-300 ${getStatusPillColor(getNodeStatus(nodeData.filled_values))}`}
                >
                  {getStatusIcon(getNodeStatus(nodeData.filled_values))}
                  <span>
                    {getStatusText(getNodeStatus(nodeData.filled_values))}
                  </span>
                </div>
              </div>

              {/* Node Status Pill */}
            </div>

            {/* Filled Values */}
            <div className="space-y-3">
              <div className="space-y-3">
                {Object.entries(nodeData.filled_values).map(
                  ([field, value]) => (
                    <div
                      key={field}
                      className="relative p-4 rounded-lg border border-border bg-card transition-colors duration-200"
                    >
                      {/* Field Name Label - Top Left */}
                      <div className="absolute top-2 left-3">
                        <span className="text-xs font-medium text-primary bg-background px-1.5 py-0.5 rounded">
                          {field.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Field Content - Below Label */}
                      <div className="pt-6">
                        <div
                          className={`text-sm leading-relaxed ${
                            value === 'Not filled'
                              ? 'text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {value === 'Not filled' ? (
                            <span>Not configured</span>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div className="whitespace-pre-wrap break-words flex-1">
                                {value}
                              </div>
                              <div className="flex items-center gap-1">
                                {copiedField === field ? (
                                  <p className="flex items-center gap-1 h-[24px]">
                                    <span className="text-xs text-green-500 font-light">
                                      Copied
                                    </span>
                                    <CheckCheck className="h-3 w-3 text-green-500" />
                                  </p>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      copyToClipboard(value, field)
                                    }
                                    className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No node data available</p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
