import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Brain,
  Database,
  MessageSquare,
  Moon,
  Pause,
  Play,
  Settings,
  Sun,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DataFlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  name: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  config?: any;
}

interface DataFlowConnection {
  source: string;
  target: string;
  status: 'pending' | 'complete' | 'error';
}

interface Question {
  id: string;
  text: string;
  node_id: string;
  field: string;
  type: 'text' | 'password' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  required?: boolean;
}

interface DataFlowResponse {
  message: string;
  message_type: 'text' | 'markdown' | 'code';
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
  questions: Question[];
  isComplete: boolean;
}

function App() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] =
    useState<DataFlowResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode toggle
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

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

  const startConversation = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setThoughts(['🤖 Initializing AI workflow...']);

    try {
      const response = await fetch('/api/ai/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) throw new Error('Failed to start conversation');

      const data = await response.json();
      setConversationId(data.conversationId);
      setCurrentResponse(data.response);
      setThoughts(prev => [...prev, '✅ Workflow initialized successfully']);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setThoughts(prev => [...prev, '❌ Failed to start conversation']);
    } finally {
      setIsLoading(false);
    }
  };

  const continueConversation = async (answer: string) => {
    if (!conversationId) return;

    setIsLoading(true);
    setThoughts(prev => [...prev, '🔄 Processing your answer...']);

    try {
      const response = await fetch('/api/ai/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, answer }),
      });

      if (!response.ok) throw new Error('Failed to continue conversation');

      const data = await response.json();
      setCurrentResponse(data.response);
      setAnswers(prev => ({ ...prev, [answer]: answer }));
      setThoughts(prev => [...prev, '✅ Answer processed successfully']);
    } catch (error) {
      console.error('Error continuing conversation:', error);
      setThoughts(prev => [...prev, '❌ Failed to process answer']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI Workflow Interface
                </h1>
                <p className="text-sm text-muted-foreground">
                  Build data pipelines with natural language
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <div
                className={cn(
                  'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
                  isLoading
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                )}
              >
                {isLoading ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Processing...' : 'Ready'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Your Workflow
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Describe your data workflow
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., Connect Shopify to Snowflake with data transformation"
                    className="input h-32 resize-none"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={startConversation}
                  disabled={isLoading || !description.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Starting...' : 'Start Workflow'}
                </Button>
              </div>
            </div>

            {/* Questions Panel */}
            {currentResponse?.questions &&
              currentResponse.questions.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Configuration Questions
                  </h3>
                  <div className="space-y-4">
                    {currentResponse.questions.map(question => (
                      <div key={question.id} className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                          {question.text}
                        </label>
                        <Input
                          type={
                            question.type === 'password' ? 'password' : 'text'
                          }
                          value={answers[question.id] || ''}
                          onChange={e =>
                            setAnswers(prev => ({
                              ...prev,
                              [question.id]: e.target.value,
                            }))
                          }
                          placeholder="Enter your answer..."
                          disabled={isLoading}
                        />
                        <Button
                          onClick={() =>
                            continueConversation(answers[question.id])
                          }
                          disabled={isLoading || !answers[question.id]}
                          variant="secondary"
                          className="w-full"
                        >
                          Submit Answer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Center Panel - Workflow Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workflow Status */}
            {currentResponse && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Workflow Status
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

                {/* Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {currentResponse.nodes.map((node, index) => (
                    <div key={node.id} className="relative">
                      <div className="card p-4 hover:shadow-md transition-shadow duration-200">
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
                      <p className="text-foreground">
                        {currentResponse.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thoughts Panel */}
            {thoughts.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  AI Thoughts
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {thoughts.map((thought, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 text-sm"
                    >
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">{thought}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
