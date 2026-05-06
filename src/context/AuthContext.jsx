import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('jobmatch_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthReady(true);
  }, []);

  const login = async (email, password, expectedRole) => {
    try {
      const { user: apiUser, token } = await loginUser({ email, password });
      const actualRole = apiUser?.role || '';

      if (expectedRole && actualRole && actualRole !== expectedRole && actualRole !== 'admin') {
        return {
          ok: false,
          message: `This account is registered as ${actualRole}. Please choose the ${actualRole} role to continue.`,
          actualRole,
        };
      }

      const userData = apiUser;
      localStorage.setItem('jobmatch_token', token);
      localStorage.setItem('jobmatch_user', JSON.stringify(userData));
      setUser(userData);
      return {
        ok: true,
        message: '',
        actualRole,
      };
    } catch (error) {
      console.error('Login failed', error);
      return { ok: false, message: error?.response?.data?.message || 'Login failed. Please check your credentials.' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      await registerUser({ name, email, password, role });
      return { ok: true, message: '' };
    } catch (error) {
      console.error('Register failed', error);
      return { ok: false, message: error?.response?.data?.message || 'Register failed. Try another email.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('jobmatch_token');
    localStorage.removeItem('jobmatch_user');
    setUser(null);
  };

  const updateUserProfile = (updates = {}) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('jobmatch_user', JSON.stringify(next));
      return next;
    });
  };

  return <AuthContext.Provider value={{ user, isAuthReady, login, logout, register, updateUserProfile }}>{children}</AuthContext.Provider>;
};
