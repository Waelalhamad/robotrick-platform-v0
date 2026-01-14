import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, LoginRequest, RegisterRequest } from '../shared/types/auth.types';
import type { AuthState } from '../shared/types/auth.types';
import { UserRole } from '../shared/types/auth.types';
import { ROUTES } from '../shared/constants/routes.constants';
import { api } from '../lib/api';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that manages authentication state and provides
 * authentication methods to child components via context.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const navigate = useNavigate();

  // useEffect moved below after refreshUser is declared

  /**
   * Refresh the current user's data
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem('token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to refresh user session',
      });
    }
  }, []);

  // On app load, fetch user from cookie-backed session
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Handle user login
   */
  const login = async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await api.post('/auth/login', credentials);
      await refreshUser();

      // Redirect based on user role
      const userRole = response.data?.user?.role || response.data?.role;
      if (userRole === UserRole.STUDENT || userRole === 'student') {
        navigate('/student');
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Handle user registration
   */
  const register = async (userData: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await api.post('/auth/register', userData);
      
      // After successful registration, log the user in
      await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Handle user logout
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    navigate(ROUTES.HOME);
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

