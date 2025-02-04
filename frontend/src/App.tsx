import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  if (initialLoad) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage mode="login" />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage mode="register" />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;