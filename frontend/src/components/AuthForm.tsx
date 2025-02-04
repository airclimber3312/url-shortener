import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

type AuthMode = 'login' | 'register';

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = mode === 'register' ? '/api/signup' : '/api/login';
      await api.post(endpoint, { email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>{mode === 'register' ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">
          {mode === 'register' ? 'Create Account' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}