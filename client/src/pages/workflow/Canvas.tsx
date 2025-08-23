import { cn } from '@/lib/utils';
import type { DataFlowResponse } from '@/types';
import { ArrowRight, Brain, Database, Settings, Zap } from 'lucide-react';

interface CanvasProps {
  currentResponse: DataFlowResponse | null;
}

export default function Canvas({ currentResponse }: CanvasProps) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'source':
        return <Database className="w-5 h-5 text-blue-500" />;
      case 'transform':
        return <Zap className="w-5 h-5 text-purple-500" />;
      case 'destination':
        return <Brain className="w-5 h-5 text-green-500" />;
      default:
        return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="w-1/2 bg-background/30">
      <div className="p-6 h-full">
        {currentResponse ? (
          <div className="h-full flex flex-col">
            {/* Workflow Status */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Workflow Canvas
              </h2>
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  currentResponse.isComplete
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                )}
              >
                {currentResponse.isComplete ? 'Complete' : 'In Progress'}
              </div>
            </div>

            {/* Nodes Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {currentResponse.nodes.map((node, index) => (
                <div key={node.id} className="relative">
                  <div className="card p-4 hover:shadow-md transition-shadow duration-200 h-full">
                    <div className="flex items-center space-x-3 mb-3">
                      {getNodeIcon(node.type)}
                      <div>
                        <h3 className="font-medium text-foreground capitalize">
                          {node.type}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {node.name}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                        getStatusColor(node.status)
                      )}
                    >
                      {node.status}
                    </div>
                  </div>

                  {/* Connection Arrow */}
                  {index < currentResponse.nodes.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Message */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{currentResponse.message}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start Your Workflow
              </h3>
              <p className="text-muted-foreground">
                Describe your data workflow in the chat panel to begin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
