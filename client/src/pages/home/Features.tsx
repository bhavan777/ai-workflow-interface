import { cn } from '@/lib/utils';
import { Brain, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  detailedExplanation: string;
  color: string;
}

interface FeaturesProps {
  variant?: 'default' | 'hero';
  className?: string;
}

export default function Features({
  variant = 'default',
  className,
}: FeaturesProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isHeroVariant = variant === 'hero';

  const features: Feature[] = [
    {
      id: 1,
      icon: (
        <Brain
          className={`w-8 h-8 ${isHeroVariant ? 'text-blue-600' : 'text-blue-600 dark:text-blue-400'}`}
        />
      ),
      title: 'AI-Powered',
      description:
        'Natural language processing to understand your workflow requirements',
      detailedExplanation: isHeroVariant
        ? 'Our advanced AI understands natural language descriptions and automatically converts them into structured data workflows.'
        : 'Our advanced AI understands natural language descriptions and automatically converts them into structured data workflows. Simply describe what you want to achieve, and our AI will guide you through the setup process with intelligent suggestions and clarifications.',
      color: 'blue',
    },
    {
      id: 2,
      icon: (
        <Zap
          className={`w-8 h-8 ${isHeroVariant ? 'text-purple-600' : 'text-purple-600 dark:text-purple-400'}`}
        />
      ),
      title: 'Visual Workflows',
      description:
        'Interactive canvas to visualize and manage your data pipelines',
      detailedExplanation: isHeroVariant
        ? 'See your data workflows come to life with our interactive visual canvas. Each step is represented as a node with real-time status updates.'
        : 'See your data workflows come to life with our interactive visual canvas. Each step is represented as a node with real-time status updates, making it easy to understand, monitor, and modify your data pipelines at a glance.',
      color: 'purple',
    },
    {
      id: 3,
      icon: (
        <Brain
          className={`w-8 h-8 ${isHeroVariant ? 'text-green-600' : 'text-green-600 dark:text-green-400'}`}
        />
      ),
      title: 'Smart Integration',
      description: 'Connect to databases, APIs, and cloud services seamlessly',
      detailedExplanation: isHeroVariant
        ? 'Connect to hundreds of data sources and destinations with our intelligent integration system.'
        : 'Connect to hundreds of data sources and destinations with our intelligent integration system. From databases and APIs to cloud services and file systems, our platform handles the complexity of data connections automatically.',
      color: 'green',
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [features.length]);

  const nextFeature = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
      setIsTransitioning(false);
    }, 150);
  };

  const prevFeature = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentFeature(prev => (prev - 1 + features.length) % features.length);
      setIsTransitioning(false);
    }, 150);
  };

  const goToFeature = (index: number) => {
    if (isTransitioning || index === currentFeature) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentFeature(index);
      setIsTransitioning(false);
    }, 150);
  };

  const currentFeatureData = features[currentFeature];

  if (isHeroVariant) {
    return (
      <div
        className={cn(
          'relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20',
          className
        )}
      >
        {/* Navigation Arrows */}
        <button
          onClick={prevFeature}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={nextFeature}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* Feature Content */}
        <div className="text-center px-6 min-h-[320px] flex flex-col justify-center overflow-hidden">
          <div
            className={cn(
              'transition-all duration-200 ease-in-out transform',
              isTransitioning
                ? 'opacity-0 scale-95 translate-y-2'
                : 'opacity-100 scale-100 translate-y-0'
            )}
          >
            {/* Icon */}
            <div
              className={`w-16 h-16 bg-${currentFeatureData.color}-100/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500`}
            >
              {currentFeatureData.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-3 transition-all duration-500">
              {currentFeatureData.title}
            </h3>

            {/* Short Description */}
            <p className="text-base text-white/90 mb-4 transition-all duration-500">
              {currentFeatureData.description}
            </p>

            {/* Detailed Explanation */}
            <p className="text-sm text-white/80 leading-relaxed max-w-2xl mx-auto transition-all duration-500">
              {currentFeatureData.detailedExplanation}
            </p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToFeature(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                index === currentFeature
                  ? 'bg-white scale-110'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('mt-16 max-w-4xl mx-auto', className)}>
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        Powerful Features
      </h2>

      {/* Carousel Container */}
      <div className="relative bg-card rounded-2xl p-8 shadow-lg border border-border">
        {/* Navigation Arrows */}
        <button
          onClick={prevFeature}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:bg-background transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextFeature}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:bg-background transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Feature Content */}
        <div className="text-center px-8 min-h-[400px] flex flex-col justify-center overflow-hidden">
          <div
            className={cn(
              'transition-all duration-200 ease-in-out transform',
              isTransitioning
                ? 'opacity-0 scale-95 translate-y-2'
                : 'opacity-100 scale-100 translate-y-0'
            )}
          >
            {/* Icon */}

            <div
              className={`w-20 h-20 bg-${currentFeatureData.color}-100 dark:bg-${currentFeatureData.color}-900/20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500`}
            >
              {currentFeatureData.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-foreground mb-4 transition-all duration-500">
              {currentFeatureData.title}
            </h3>

            {/* Short Description */}
            <p className="text-lg text-muted-foreground mb-6 transition-all duration-500">
              {currentFeatureData.description}
            </p>

            {/* Detailed Explanation */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto transition-all duration-500">
              {currentFeatureData.detailedExplanation}
            </p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToFeature(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out ${
                index === currentFeature
                  ? 'bg-orange-500 scale-110'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
