import Layout from '@/components/Layout';
import Home from '@/pages/home';
import Workflow from '@/pages/workflow';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function App() {
  // Initialize theme from localStorage at app level
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/workflow"
          element={
            <Layout>
              <Workflow />
            </Layout>
          }
        />
        <Route
          path="/workflow/:templateId"
          element={
            <Layout>
              <Workflow />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
