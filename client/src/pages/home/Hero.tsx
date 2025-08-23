import { Button } from '@/components/ui/button';
import { ArrowDown, Brain } from 'lucide-react';
import Features from './Features';

export default function Hero() {
  const scrollToInput = () => {
    const inputElement = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        inputElement.focus();
      }, 500);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 py-6">
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent dark:from-black/30 dark:to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left Column - Hero Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6">
              <div className="w-20 h-20 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-xl border border-white/30 dark:border-white/20">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Build Data Pipelines with AI
              </h1>
              <p className="text-lg text-white/90 dark:text-white/80 max-w-3xl lg:max-w-none mx-auto lg:mx-0 leading-relaxed">
                Create complex data workflows using natural language. Connect
                databases, transform data, and build powerful integrations with
                the help of AI.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center lg:items-start">
              <Button
                onClick={scrollToInput}
                size="lg"
                className="text-base px-6 py-3 bg-white text-orange-600 hover:bg-white/90 dark:bg-white dark:text-slate-800 dark:hover:bg-white/90 shadow-xl border-0 font-semibold"
              >
                Try Building Your Workflow
                <ArrowDown className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Column - Features Component */}
          <div className="flex-1 w-full max-w-lg">
            <Features variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
