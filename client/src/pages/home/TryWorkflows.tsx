import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Cloud, Database, Send, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TryWorkflows() {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const startWorkflowWithMessage = (message: string) => {
    if (!message.trim()) return;

    // Navigate to workflow page - the workflow page will handle the message
    navigate('/workflow', {
      state: {
        initialMessage: message,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startWorkflowWithMessage(inputValue.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      startWorkflowWithMessage(inputValue.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    startWorkflowWithMessage(example);
  };

  const examples = [
    {
      icon: <Database className="w-4 h-4" />,
      text: 'Shopify to Snowflake',
      description: 'Connect store data to data warehouse',
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: 'Salesforce to Mailchimp',
      description: 'Sync contacts for email marketing',
    },
    {
      icon: <Cloud className="w-4 h-4" />,
      text: 'API to Database',
      description: 'Extract and store API data',
    },
    {
      icon: <Brain className="w-4 h-4" />,
      text: 'Data Transformation',
      description: 'Clean and transform data',
    },
  ];

  return (
    <div className="max-w-4xl py-16 mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Start Building Your Workflow
        </h2>
        <p className="text-lg text-muted-foreground">
          Describe what you want to build in natural language
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder="e.g., Connect my Shopify store to Snowflake for analytics..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-16 text-lg px-6 pr-16 rounded-2xl border border-border focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.25)] focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 shadow-lg"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>

      {/* Example Workflows */}
      <div className="mt-8">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Or try one of these examples:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.text)}
              className="flex flex-col items-center p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                {example.icon}
              </div>
              <span className="text-sm font-medium text-foreground mb-1">
                {example.text}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {example.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Press Enter or click the send button to start building your workflow
        </p>
      </div>
    </div>
  );
}
