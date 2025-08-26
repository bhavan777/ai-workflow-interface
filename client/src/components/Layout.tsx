import type { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      {children}
    </div>
  );
}
