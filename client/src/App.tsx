import Layout from '@/components/Layout';
import Home from '@/pages/home';
import Workflow from '@/pages/workflow';
import { store } from '@/store';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
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
    <Provider store={store}>
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
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
