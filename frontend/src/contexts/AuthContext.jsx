import { createContext, useState, useMemo, useCallback, useContext } from 'react';
import { authAPI } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user');
  });

  const login = useCallback(async (username, password) => {
    const data = await authAPI.login(username, password);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading: false,
    login,
    logout,
  }), [user, isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
