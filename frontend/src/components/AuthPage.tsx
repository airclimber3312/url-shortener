import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  mode: AuthMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, { email, password });

      if (response.data.data?.attributes?.token) {
        login(response.data.data.attributes.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.[0]?.detail ||
        'Authentication failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="auth-container">
      <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link to="/register">Sign up here</Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
}