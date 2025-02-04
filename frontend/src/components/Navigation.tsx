import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">URL Shortener</Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}