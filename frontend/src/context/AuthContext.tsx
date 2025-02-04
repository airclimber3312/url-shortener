import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

interface User {
  id: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('jwtToken');
      
      if (token) {
        try {
          const decoded = jwtDecode(token) as { userId: string };
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser({ id: decoded.userId, token });
        } catch (error) {
          console.error('Invalid token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('jwtToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const decoded = jwtDecode(token) as { userId: string };
    setUser({ id: decoded.userId, token });
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);