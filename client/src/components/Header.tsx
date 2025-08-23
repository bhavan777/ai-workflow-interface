import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Brain, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                AI Workflow Interface
              </h1>
              <p className="text-xs text-muted-foreground">
                Build data pipelines with natural language
              </p>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="w-8 h-8"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
